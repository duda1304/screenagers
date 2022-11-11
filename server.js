var express = require('express');
var path = require('path');
var fs = require('fs');
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const databaseRoutes = require("./backend/databaseRoutes");

const QrScanner = require('qr-scanner'); 


// Require the package
const QRCode = require('qrcode')
 
// Converting the data into String format
function stringdata(data) {
  return JSON.stringify(data)
}

var opts = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 1,
  margin: 1
}


function createQRCodeImage(data, fileName) {
  QRCode.toDataURL(stringdata(data), opts, function (err, code) {
    if(err) return ('error')
    let base64Image = code.split(';base64,').pop();
    fs.writeFile(`${__dirname}/frontend/data/media/QRcodes/${fileName}.png`, base64Image, {encoding: 'base64'}, function(err) {
      return ('success')
  });
    // Printing the code
    console.log(code)
  })
}


var { walkSync, formatDate } = require('./backend/utils.js');
var { boites, setBoite, deepMerge, parseChoix } = require('./frontend/js/iso.js');
var User = require('./backend/User.js');
var Group = require('./backend/Group.js');

var port = fs.readFileSync('port.txt', 'utf8').trim();

var currentLanguage = 'FR';
var languageList = ['FR', 'EN'];

var sendOsc = false;
var lastOscMessage;

var onlineUsers = {};

var defaultStates = {
  users: {},
  oscHost: fs.readFileSync('osc.txt', 'utf8').trim(), // '172.16.0.101'
  step: {
    console: {},
    screen: {},
    emo: {},
    laptop: {},
    boite: { type: 'avertissement' }
  }
};

var buttonSymbols = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  a: 'A',
  b: 'B'
};

var keys = Object.keys(defaultStates.step);

var states = deepMerge({}, defaultStates);

var dataPaths = {
  visual: {'FR' : path.resolve('frontend/data/visual_FR.json'),
           'EN' : path.resolve('frontend/data/visual_EN.json')},
  history: path.resolve('frontend/data/history/'),
  editor : {'FR' : path.resolve('frontend/data/editor_FR.json'),
            'EN' : path.resolve('frontend/data/editor_EN.json')}
};

function getBackupFilename() {
  return dataPaths.history + '/' + formatDate(new Date()) + '.json';
}

/* Web server
============= */
var app = express();
app.use(bodyParser.json());
app.use(databaseRoutes);

var server = app.listen(port, function() {
  var url = 'http://localhost:' + port;
  console.log(`${url}/`);
});

app.use(express.static(path.join(__dirname, '/frontend')));

app.get('/', (req, res) => res.sendFile(path.resolve('frontend/mobile.html')));

app.get('/main', (req, res) => res.sendFile(path.resolve('frontend/main.html')));

app.get('/performer', (req, res) => res.sendFile(path.resolve('frontend/performer.html')));

app.get('/assistant', (req, res) => res.sendFile(path.resolve('frontend/assistant.html')));

app.get('/editor', (req, res) => res.sendFile(path.resolve('frontend/editor.html')));

const auth = require('basic-auth');
const admins = { toto: { password: 'toto' } };
app.get('/master', (req, res, next) => {
  var user = auth(req);
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    return res.status(401).send();
  }
  res.sendFile(path.resolve('frontend/master.html'));
});

app.get('/screen', (req, res) => res.sendFile(path.resolve('frontend/all_screens.html')));
app.get('/emo', (req, res) => res.sendFile(path.resolve('frontend/all_screens.html')));
app.get('/console', (req, res) =>  res.sendFile(path.resolve('frontend/all_screens.html')));
app.get('/laptop', (req, res) => res.sendFile(path.resolve('frontend/all_screens.html')));
app.get('*', (req, res) => res.redirect('/'));

/* Socket server
================ */
var io = require('socket.io').listen(server);

const groups = {
  mobiles: new Group('mobiles', io),
  masters: new Group('masters', io),
  consoles: new Group('consoles', io),
  screens: new Group('screens', io),
  laptops: new Group('laptops', io),
  emos: new Group('emos', io),
  mainScreens: new Group('mainScreens', io),
  performers: new Group('performers', io),
  assistants: new Group('assistants', io),
  editors: new Group('editors', io)
};

var performerConnected = false;

const set = {
  console(socket) {
    groups.consoles.add(socket.id);
    socket.on('disconnect', () => groups.consoles.remove(socket.id));
    if ('console' in states.step) {
      var step = deepMerge({}, states.step.console, { boite: states.step.boite });
      socket.emit('step', step);
    }
    return 'console';
  },

  mainScreen(socket) {
    groups.mainScreens.add(socket.id);
    socket.on('disconnect', () => groups.mainScreens.remove(socket.id));
    return 'mainScreen';
  },
  
  screen(socket) {
    groups.screens.add(socket.id);
    socket.on('disconnect', () => groups.screens.remove(socket.id));
    if ('screen' in states.step) {
      var step = deepMerge({}, states.step.screen, { boite: states.step.boite });
      socket.emit('step', step);
    }
    socket.emit('current language', currentLanguage);
    return 'screen';
  },

  emo(socket) {
    groups.emos.add(socket.id);
    socket.on('disconnect', () => groups.emos.remove(socket.id));
    if ('emo' in states.step) {
      var step = deepMerge({}, states.step.emo, { boite: states.step.boite });
      socket.emit('step', step);
    }
    return 'emo';
  },

  laptop(socket) {
    groups.laptops.add(socket.id);
    socket.on('disconnect', () => groups.laptops.remove(socket.id));
    if ('laptop' in states.step) {
      var step = deepMerge({}, states.step.laptop, { boite: states.step.boite });
      socket.emit('step', step);
    }
    return 'laptop';
  },

  editor(socket) {
    groups.editors.add(socket.id);
    socket.on('disconnect', () => groups.editors.remove(socket.id));
   
    states.media = walkSync('./frontend/data/media');
    states.media = states.media.reduce((acc, item) => {
      acc.push(item.replace('frontend/data/media/', ''));
      return acc;
    }, []);

    socket.emit('init states', states);

    socket.emit('language', {'currentLanguage' : currentLanguage});

    socket.on('refresh media list', () => {
      states.media = walkSync('./frontend/data/media');
      states.media = states.media.reduce((acc, item) => {
        acc.push(item.replace('frontend/data/media/', ''));
        return acc;
      }, []);

      socket.emit('init states', states);
      groups.masters.emit('init states', states);
    });

    socket.on('multimedia decor', (data) => {
      groups.masters.emit('multimedia decor', data);
    })

    socket.on('avatars position', (data) => {
      groups.masters.emit('avatars position', data);
    })
  },

  master(socket) {
    groups.masters.add(socket.id);
    socket.on('disconnect', () => groups.masters.remove(socket.id));

    states.pages = [];
    fs.readdirSync('./frontend/data/pages').forEach(file => {
      states.pages.push(file);
    });

    states.media = walkSync('./frontend/data/media');
    states.media = states.media.reduce((acc, item) => {
      acc.push(item.replace('frontend/data/media/', ''));
      return acc;
    }, []);    

    socket.emit('language', {'currentLanguage' : currentLanguage, 'languageList' : languageList});

    socket.emit('init states', states);

    socket.on('reset all', () => {
      states = deepMerge({}, defaultStates);
      onlineUsers = {};
      Object.values(groups).forEach(group => {
        group.emit('receive', { purge: true });
      });
    });

    socket.on('purge users', () => {
      states.users = {};
      onlineUsers = {};
      groups.mobiles.emit('receive', { purge: true });
    });

    socket.on('set osc host', data => {
      states.oscHost = data;
    });

    socket.on('step', function(data) {
      if (!data) return;

      var needSendEffect = 'effect' in data;
      
      var needSendBoite = 'boite' in data;
      if (
        needSendBoite &&
        states.step &&
        states.step.boite &&
        states.step.boite.type &&
        data.boite.type
      ) {
        if (data.boite.type === states.step.boite.type) {
          if (data.boite.arg === states.step.boite.arg) {
            needSendBoite = false;
          }
        }
      }

      keys.forEach(key => {
        if (key in data) states.step[key] = data[key];
      });

      Object.entries(data).forEach(([key, val]) => {
        if (key !== 'boite' && key !== 'to') {
          val.repet = Object.assign({}, data.repet);
          val.boite = Object.assign({}, data.boite);
          var name = key + 's';
          if (name in groups) {
            groups[name].emit('step', val);
          }
          if (key === 'console') {
            groups['mainScreens'].emit('console', val);
          }
        }
      });

      if (needSendBoite) {
        groups.screens.emit('step', { boite: data.boite });
        groups.mobiles.emit('step', { boite: data.boite });
        setBoite(data.boite);
      }

      if ('osc' in data && 'message' in data.osc && data.osc.message) {
        if (lastOscMessage === data.osc.message) return;
        lastOscMessage = data.osc.message;
        sendOscMessage(data.osc.message);
      }
    });

    socket.on('broadcast', data => {
      broadcast(data.to, 'interaction', data, function(user) {
        if ('karma' in data) user.karma += data.karma;
      });
    });

    socket.on('save', data => {
      try {
        var str = JSON.stringify(data, null, 2) + '\n';
        fs.writeFileSync(dataPaths.visual[currentLanguage], str, 'utf8');
        fs.writeFileSync(getBackupFilename(), str, 'utf8');
      } catch (err) {
        console.log('Save error', err);
        socket.emit('saving', { error: err.stack });
        return;
      }
      socket.emit('saving', { error: false });
    });
   
    socket.on('gamepad', button => {
      groups.screens.emit('receive', {
        gamepad: button
      });
    });

    return 'master';
  },

  performer(socket) {
    groups.performers.add(socket.id);
    socket.on('disconnect', () => {groups.performers.remove(socket.id); performerConnected = false});

    states.pages = [];
    fs.readdirSync('./frontend/data/pages').forEach(file => {
      states.pages.push(file);
    });

    performerConnected = true;

    states.media = walkSync('./frontend/data/media');
    states.media = states.media.reduce((acc, item) => {
      acc.push(item.replace('frontend/data/media/', ''));
      return acc;
    }, []);

    socket.emit('init states', states);

    socket.on('reset all', () => {
      states = deepMerge({}, defaultStates);
      onlineUsers = {};
      Object.values(groups).forEach(group => {
        group.emit('receive', { purge: true });
      });
    });

    socket.on('purge users', () => {
      states.users = {};
      onlineUsers = {};
      groups.mobiles.emit('receive', { purge: true });
    });

    socket.on('step', function(data) {
      if (!data) return;

      var needSendBoite = 'boite' in data;
      if (
        needSendBoite &&
        states.step &&
        states.step.boite &&
        states.step.boite.type &&
        data.boite.type
      ) {
        if (data.boite.type === states.step.boite.type) {
          if (data.boite.arg === states.step.boite.arg) {
            needSendBoite = false;
          }
        }
      }

      keys.forEach(key => {
        if (key in data) states.step[key] = data[key];
      });

      Object.entries(data).forEach(([key, val]) => {
        if (key !== 'boite' && key !== 'to') {
          val.repet = Object.assign({}, data.repet);
          val.boite = Object.assign({}, data.boite);
          var name = key + 's';
          if (name in groups) {
            groups[name].emit('step', val);
          }
        }
      });

      if (needSendBoite) {
        groups.screens.emit('step', { boite: data.boite });
        groups.mobiles.emit('step', { boite: data.boite });
        setBoite(data.boite);
      }

      if ('osc' in data && 'message' in data.osc && data.osc.message) {
        if (lastOscMessage === data.osc.message) return;
        lastOscMessage = data.osc.message;
        sendOscMessage(data.osc.message);
      }
    });
    
    // socket.on('broadcast', data => {
    //   broadcast(data.to, 'interaction', data, function(user) {
    //     if ('karma' in data) user.karma += data.karma;
    //   });
    // });

    return 'performer';
  },

  assistant(socket) {
    groups.assistants.add(socket.id);
    socket.on('disconnect', () => {groups.assistants.remove(socket.id);});

    states.pages = [];
    fs.readdirSync('./frontend/data/pages').forEach(file => {
      states.pages.push(file);
    });

    states.media = walkSync('./frontend/data/media');
    states.media = states.media.reduce((acc, item) => {
      acc.push(item.replace('frontend/data/media/', ''));
      return acc;
    }, []);

    socket.emit('init states', states);
    socket.emit('current language', currentLanguage);
    // socket.on('reset all', () => {
    //   states = deepMerge({}, defaultStates);
    //   onlineUsers = {};
    //   Object.values(groups).forEach(group => {
    //     group.emit('receive', { purge: true });
    //   });
    // });

    socket.on('purge users', () => {
      states.users = {};
      onlineUsers = {};
      groups.mobiles.emit('receive', { purge: true });
    });

    socket.on('broadcast', data => {
      broadcast(data.to, 'interaction', data, function(user) {
        if ('karma' in data) user.karma += data.karma;
      });
    });

    return 'performer';
  },

  mobile(socket) {
    groups.mobiles.add(socket.id);

    socket.on('disconnect', () => {
      if (socket.id in onlineUsers) {
        if (onlineUsers[socket.id] in states.users) {
          states.users[onlineUsers[socket.id]].online = false;
        }
        groups.screens.emit('remove avatar', avatars[onlineUsers[socket.id]]);
        delete avatars[onlineUsers[socket.id]];
        delete onlineUsers[socket.id];
      }
      groups.mobiles.remove(socket.id);
      groups.masters.emit('users change', states.users);
      groups.assistants.emit('users change', states.users);
    });

    socket.on('join', id => {
      var user;

      if (id in states.users) {
        user = states.users[id];
      } else {
        user = new User(id, currentLanguage);
        states.users[user.id] = user;
      }

      user.socket = socket.id;
      user.online = true;
      onlineUsers[socket.id] = user.id;

      socket.emit('step', {
        user: { nick: user.nick, id: user.id, color: user.color },
        boite: states.step.boite,
        language: currentLanguage
      });

      socket.emit('display HTML content', currentLanguage);

      groups.masters.emit('users change', states.users);
      groups.assistants.emit('users change', states.users);
    });

    socket.on('message', data => {
      if (socket.id in onlineUsers) {
        if (onlineUsers[socket.id] in states.users) {
          var user = states.users[onlineUsers[socket.id]];
          data.user = { nick: user.nick, id: user.id };
          groups.masters.emit('receive', { message: data });
          groups.assistants.emit('receive', { message: data });
        }
      }
    });

    socket.on('gamepad', button => {
      con(buttonSymbols[button], onlineUsers[socket.id]);
      groups.screens.emit('receive', {
        gamepad: button
      });
    });

       return 'mobile';
  }
};

var avatars = {};

io.on('connection', socket => {
  const url = new URL(socket.handshake.headers.referer);
  var path = url.pathname;
  var from;

  if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);

  if (path === '/master') from = set.master(socket);
  else if (path === '/console') from = set.console(socket);
  else if (path === '/screen') from = set.screen(socket);
  else if (path === '/emo') from = set.emo(socket);
  else if (path === '/laptop') from = set.laptop(socket);
  else if (path === '/main') from = set.mainScreen(socket);
  else if (path === '/performer') from = set.performer(socket);
  else if (path === '/assistant') from = set.assistant(socket);
  else if (path === '/editor') from = set.editor(socket);
  else if (path === '/') from = set.mobile(socket);
  else return;

  socket.on('boite', data => {
    if (socket.id in onlineUsers) data.id = onlineUsers[socket.id];
    setBoite(data);
  });

  socket.on('console', data => con(data, onlineUsers[socket.id]));

  socket.on('send', function(data) {
    if ('to' in data) {
      var list;
      if (typeof data.to === 'string') {
        if (data.to === '*') list = Object.keys(groups);
        else list = [data.to];
      } else list = data.to;

      if (Array.isArray(list)) {
        list.forEach(function(to) {
          delete data.to;
          if (to.endsWith('s') === false) to = to + 's';
          data.from = from;
          if (to in groups) groups[to].emit('receive', data);
        });
      }
    }
  });

  socket.on('collective song', (data) => {
    var userGroups = chunk(states.users, data.groups, 'user');
    var questionGroups = chunk(data.questions, data.groups, 'question');
    for (element in userGroups) {
      broadcast(userGroups[element], 'collective song question', questionGroups[element])
    }
  })

  socket.on('update-layout', (data) => {
      groups[data.to].emit('layout', data.layout);
  })

  socket.on('start', (data) => {
    groups[data.to].emit('start', data.start);
  })

  socket.on('save-screen', (data) => {  
    var fileName = './frontend/data/media/layouts/' + data.name + '.html'
    fs.writeFile(fileName, data.html, err => {
      if (err) {
        groups['editors'].emit('response', err);
      }
      groups['editors'].emit('response', 'File is saved successfully.');
    });
  })

  socket.on('change current language', (data) => {
    currentLanguage = data.language;
    groups['screens'].emit('language changed', data.language);
    var username = User.nameGenerator(data.language);
    groups['mobiles'].emit('change nickname', username);
    groups['mobiles'].emit('change language', data.language);
    groups['assistants'].emit('change language', data.language);
    groups['editors'].emit('change language', data.language);
  });
 
  socket.on('collective song response', (data) => {
    groups['assistants'].emit('collective song answers', data);
  })

  socket.on('collective song selected', (data) => {
    groups.screens.emit('step', {
      boite: {
        type: 'collective_song',
        action: 'init',
        arg: data
      }
    });
  })

  socket.on('meme', (data) => {
    groups['screens'].emit('meme', data);
  })

  socket.on('new etape', () => {
    groups.masters.emit('new etape')
  })

  socket.on('create qr code', (data) => {
    var file = data.src.split('/');
    var index = file.length;
    var fileName = file[index - 1].split('.')[0];
    createQRCodeImage(data.src, fileName);

    states.media = walkSync('./frontend/data/media');
    states.media = states.media.reduce((acc, item) => {
      acc.push(item.replace('frontend/data/media/', ''));
      return acc;
    }, []);

    socket.emit('init states', states);
    groups.masters.emit('init states', states);
  }) 

  // socket.on('save editor JSON', data => {
  //   try {
  //     var str = JSON.stringify(data, null, 2) + '\n';
  //     fs.writeFileSync(dataPaths.editor[currentLanguage], str, 'utf8');
  //     // fs.writeFileSync(getBackupFilename(), str, 'utf8');
  //   } catch (err) {
  //     console.log('Save error', err);
  //     socket.emit('saving', { error: err.stack });
  //     return;
  //   }
  //   socket.emit('saving', { error: false });
  // });

  // socket.on('scene name', (data) => {
  //   groups.editors.emit('scene name', data)
  // })

  // socket.on('new scene name', (data) => {
  //   groups.editors.emit('new scene name', data)
  // })

  socket.on('avatar created', (data) => {
    avatars[data.userID] = data.avatarID;
    groups.screens.emit('append avatar', data.avatarID);
  })  

  socket.on('step from master', (data) => {
    groups.editors.emit('step from master', data)
  })

  
});

function chunk(object, groups, type) {
  var chunks = {}; 
  for (var i = 1; i < (parseInt(groups) + 1); i ++) {
    chunks[i] = [];
  } 
  var i = 1;
  for (element in object) {
    if (i > parseInt(groups)) {
      i = 1;
    }
    if( type === 'user') {
      chunks[i].push(element);
    } else {
      chunks[i].push({'question_group' : [element], 'question' : object[element]});
    }
    i = i + 1;
  }
  return chunks;
}

function broadcast(to, event, data, cb) {
  to.forEach(id => {
    if (id in states.users) {
      var user = states.users[id];
      if (typeof cb === 'function') cb(user);
      if (user.socket in io.sockets.connected) {
        io.sockets.connected[user.socket].emit(event, data);
      }
    }
  });
}

var i = 0;
function nextOnlineUser() {
  var keys = Object.keys(onlineUsers);
  if (i >= keys.length) i = 0;
  var t = keys[i++];
  return onlineUsers[t];
}

function con(data, id) {
  if (typeof data !== 'string') return;
  var msg = data;
  var user;
  if (id) {
    if (id in states.users) {
      user = states.users[id];
      msg = `<span style="color:${user.color}">${user.nick}</span> ${data}`;
    } else return; // ignore ghost users
  }
  groups.consoles.emit('receive', { console: msg });
  return user;
}

/* XLSX
=======

Write shortcuts from memes.xlsx in memes.json
*/
try {
  var xlsx = require('node-xlsx');
  const memes = xlsx.parse(`${__dirname}/frontend/data/memes.xlsx`);
  var liste = memes[0].data;
  var data = {};
  var isLetter = null;
  for (let i = 2, l = 100; i < l; i++) {
    if (liste[i].length) {
      if (liste[i] != null) {
        liste[i].forEach(function(item) {
          var str = String(item);
          if (str.length === 1) {
            isLetter = str;
          } else {
            data[isLetter] = str
              .split(/\n\n/)
              .map(item =>
                item
                  .replace(/A\s*\:/, '')
                  .trim()
                  .replace(/"$/, '')
                  .replace(/^"/, '')
              )
              .filter(Boolean);
            isLetter = null;
          }
        });
      }
    }
  }
  fs.writeFileSync(
    `${__dirname}/frontend/data/memes.json`,
    JSON.stringify(data, null, 2),
    'utf8'
  );
} catch (err) {
  console.log('Impossible de lire le fichier /frontend/data/memes.xlsx', err);
}

/* OSC Server
============= */
var dgram = require('dgram');
var osc = require('a2r-osc');
const { group } = require('console');

var oscPort = 53000;
var oscClient = dgram.createSocket('udp4');
var oscServer = dgram.createSocket('udp4');

function sendOscMessage(x) {
  if (sendOsc === false) return;
  console.log(`Send osc (${states.oscHost}) - ${x}`);
  var message = new osc.Message(`/cue/${x}/start`, 'i', 1).toBuffer();
  oscClient.send(message, oscPort, states.oscHost, function(err) {
    if (err) throw new Error(err);
  });
}

oscClient.on('error', err => {
  console.log(`oscClient error:\n${err.stack}`);
  oscClient.close();
});

oscClient.on('listening', () => console.log('OSC Client listening'));
oscServer.on('listening', () => console.log('OSC Server listening'));
oscClient.on('close', () => console.log('OSC Client close'));
oscServer.on('close', () => console.log('OSC Server close'));

oscServer.bind(3002);

/* Cleanup
========== */
function exitHandler(options, exitCode) {
  try {
    oscClient.close();
  } catch (err) {}
  try {
    oscServer.close();
  } catch (err) {}
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) {
    setTimeout(() => {
      process.exit();
    }, 1000);
  }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

/* Boites
=========*/
boites.singe_savant = {
  next: function() {
    var id = nextOnlineUser();
    groups.mobiles.emit('step', {
      boite: {
        type: 'singe_savant',
        action: 'next',
        arg: id
      }
    });
  },

  key: function(key, id) {
    con(`a écrit la lettre "${key}"`, id);
    groups.screens.emit('step', {
      boite: {
        type: 'singe_savant',
        action: 'key',
        arg: key
      }
    });
    this.next();
  },

  key_master: function(key, id) {
    var username = User.nameGenerator(currentLanguage);
    var color = User.getUsernameColor(username);
    var msg = `<span style="color:${color}">${username}</span> a écrit la lettre "${key}"`;
    groups.consoles.emit('receive', { console: msg });
    groups.screens.emit('step', {
      boite: {
        type: 'singe_savant',
        action: 'key',
        arg: key
      }
    });
  }
};

boites.image = {
  url: function(url, id) {
    var user = con(`a envoyé une image`, id);
    if (!user) return;
    var data = {
      user: { nick: user.nick, id: user.id },
      text: `<img src="${url}" />`
    };
    groups.masters.emit('receive', { message: data });
    groups.assistants.emit('receive', { message: data });
  }
};

(function() {
  var statsDefault = {
    votants: 0,
    choix: {}
  };

  var stats;
  var parsed;

  boites.choix = {
    init: function(data) {
      stats = deepMerge({}, statsDefault);
      parsed = parseChoix(data);
    },
    vote: function(key, id) {
      var vote = parsed.choix[key];

      if (!vote) return;

      stats.votants++;
      stats.choix[key] = stats.choix[key] || 0;
      stats.choix[key]++;

      voteStr = vote.text;

      var user = con(`a voté pour "${voteStr}"`, id);
      if (!user) return;

      groups.masters.emit('boite', {
        type: 'choix',
        action: 'stats',
        arg: stats
      });
    }
  };
})();

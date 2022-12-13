
  var scenes;
  var reponses;
  
  var states = {
    visual: {
      // current: 'TEST boites'
    }
  };
  
  var currentLanguage;
  var languageList = [];
  var defaultLanguage = 'FR';
  
  
  
  $.getJSON('/data/reponsesBot.json', function(data) {
    reponses = data;
    displayReponses();
  });
  
  socket.on('init states', function(data) {
    states = deepMerge(states, data);
    if ('oscHost' in data) $('#osc_ip').val(data.oscHost);
    displayUsers();
    // displayMedia();
  });
  
  
  // socket.on('language', function(data) {
  //   $('#select_language').empty();
  //   $.each(data.languageList, function(key, language) {
  //     $(`<option value=${language}>${language}</option>`)
  //       .on('mousedown', function() {
  //         setLanguage(language);
  //       })
  //       .appendTo($('#select_language'));
  //   });
  //   $('#select_language').val(data.currentLanguage);
  //   currentLanguage = data.currentLanguage;
  //   languageList = [];
  //   data.languageList.forEach(language => languageList.push(language));
  //   var url = `/data/visual_${currentLanguage}.json`;
  //   $.getJSON(url, function(data) {
  //     scenes = data;
  //     displayVisual();
  //   });
  // });
  
  socket.on('users change', function(users) {
    states.users = users;
    displayUsers(true);
  });
  
  
  // socket.on('new etape', () => {
  //   $('#visual__add_step').click();
  // })
  
  // socket.on('file created', (response) => {
  //   alert(response);
  // })
  
  
  var $main = $('main');
  
  $main
    .on('focus', '.message_moderation textarea', function() {
      this.select();
    })
    .on('click', '.scene__toggle, .box-v > b, .box-h > b', function() {
      var $this = $(this);
      var next = $this.parent();
      if (next) {
        next.toggleClass('closed');
      }
    })
    .on('click', '.toggle', function() {
      $(this).toggleClass('active');
    });
  
  $('#refresh_mobiles').on('click', function() {
    socket.emit('send', {
      to: 'mobiles',
      reload: true
    });
  });
  
  $('#debug').append(
    $(`<div class="box-v"></div>`).append(
      $('<button><span class="icon">⚠️</span> reset everything</button>').on(
        'click',
        function() {
          socket.emit('reset all');
        }
      ),
      '<div class="sep"></div>',
      $('<button><span class="icon">🚿</span> clean every users</button>').on(
        'click',
        function() {
          socket.emit('purge users');
        }
      )
    ),
    '<div class="sep"></div>',
    $(`<div class="box-v"></div>`).append(
      $('<button><span class="icon">♻️</span> reload</button>').on('click', function() {
        socket.emit('send', {
          to: $('#select_reload')
            .val()
            .split(/\s*,\s*/),
          reload: true
        });
      }),
      $(`<select id="select_reload">
        <option value="emos,screen,consoles,laptops,mobiles">all clients</option>
        <option value="emos,screen,consoles,laptops">all screens</option>
        <option value="mobiles">all mobiles</option>
        <option value="emos,screen,consoles,laptops,mobiles,masters">all clients (and masters)</option>
      </select>`)
    )
  );
  
  $('#tools').append(
    $(`<div class="box-v tools"></div>`).append(
      $(`<button class="_icon"><i>🚫</i> clear all screens</button>`).on(
        'click',
        function() {
          socket.emit('step', offStep);
        }
      ),
      $(`<button class="_icon">SCAN QR</button>`).on(
        'click',
        function() {
          document.querySelector('#QR_modal').style.display = 'block';
          getMediaStream();
        }
      ),
      $(`<div></div>`).append(
        $(`<label for='select_language'>Select language</label>`),
        $(`<select class="_icon" id='select_language'></select>`)
        .on(
          'change',
            function() {
              socket.emit('change current language', {language : this.value});
              currentLanguage = this.value;
              var url = `/data/visual_${this.value}.json`;
              $.getJSON(url, function(data) {
                scenes = data;
                displayVisual();
              });
            }
        )
      )
    )
  );
  
  
  
  /* Emojis
  ========= */
  // prettier-ignore
  var emojis = ['📱','😂','❤','😍','🤣','😊','🙏','💕','😭','😘','👍','🤔','🔥','🥰'];
  
  var $emojis = $('#emojis');
  
  $.each(emojis, function(key, val) {
    $(`<span class="emoji">${val}</span>`)
      .on('mousedown', function() {
        setEdit(val);
      })
      .appendTo($emojis);
  });
  
  
  /* Moderation
  ============= */
  $main.on('click', '.message_moderation__text img', function() {
    var image = new Image();
    image.src = this.src;
    var w = window.open('');
    w.document.write(image.outerHTML);
  });
  
  actions.message = function(data) {
    var $msg = $(`<div class="message_moderation">`);
    var $box = $(`<div class="message_moderation__btns box-v"></div>`);
  
    $msg.append(
      `<div class="message_moderation__nick">
      ${typeof data.user === 'string' ? '' : data.user.nick}
      </div>`
    );
  
    $msg.append(
      $(`<div class="message_moderation__close">&times;</div>`).on('click', function() {
        remove();
      })
    );
  
    $msg.append($box);
  
    $msg.append(`<div class="message_moderation__text">${data.text}</div>`);
  
    if (data.user !== 'system') {
      $box.append(
        $('<button class="icon btn_yes"></button')
          .text('👍')
          .on('click', function() {
            socket.emit('send', {
              to: 'screens',
              validated: data
            });
            var responseText;
            if ($('#select_language').val() in reponses['👍'].data) {
              responseText = sample(reponses['👍'].data[$('#select_language').val()])
            } else {
              responseText = sample(reponses['👍'].data[defaultLanguage])
            }
            socket.emit('broadcast', {
              to: [data.user.id],
              type: 'message',
              karma: 1,
              texte: responseText
            });
            var k = $(`#user_${data.user.id}`).find('.user__karma');
            var n = Number(k.text());
            if (Number.isNaN(n) === false) k.text(n + 1);
            remove();
          }),
        $('<button class="icon btn_no"></button')
          .text('👎')
          .on('click', function() {
            var responseText;
            if ($('#select_language').val() in reponses['👎'].data) {
              responseText = sample(reponses['👎'].data[$('#select_language').val()])
            } else {
              responseText = sample(reponses['👎'].data[defaultLanguage])
            }
            socket.emit('broadcast', {
              to: [data.user.id],
              type: 'message',
              karma: -1,
              texte: responseText
            });
            var k = $(`#user_${data.user.id}`).find('.user__karma');
            var n = Number(k.text());
            if (Number.isNaN(n) === false) k.text(n - 1);
            remove();
          })
      );
    }
  
    $('#monitoring').append($msg);
  
    function remove() {
      $msg.slideUp('fast', function() {
        $msg.remove();
      });
    }
  
    return remove;
  };
  
  /* Boites
  ========= */
  $boites_types = $('#boites_types');
  
  $.each(boites_mobiles, function(key, val) {
    if ('radio' in val && val.radio === false) return;
    $boites_types.append(
      $(`<div class="button_radio">
          <label class="boite_label" title="${key}">
          <input class="boite_radio boite_radio--${key}" value="${key}" type="radio" name="type" />
          <span>${key}</span>
        </label>
      </div>`)
    );
  });
  
  $('.boite_radio--no_phone').prop('checked', true);
  
  $boites_types.on('dblclick', '.boite_label', function() {
    $(this.form).submit();
  });
  
  /* Media
  ======== */
  // var datalists = {
  //   decors: {
  //     el: $('<datalist id="list_decors"></datalist>'),
  //     data: []
  //   },
  //   musics: {
  //     el: $('<datalist id="list_musics"></datalist>'),
  //     data: []
  //   },
  //   styles: {
  //     el: $('<datalist id="list_styles"></datalist>'),
  //     data: []
  //   },
  //   modes: {
  //     el: $('<datalist id="list_modes"></datalist>'),
  //     data: []
  //   }
  // };
  
  // function datalistsWrite() {
  //   $.each(datalists, function(key, val) {
  //     val.el.empty();
  //     val.data.forEach(item => {
  //       val.el.append(`<option value="${item}" />`);
  //     });
  //   });
  // }
  
  // $.each(datalists, function(key, val) {
  //   $main.append(val.el);
  // });
  
  // var $media = $('#media');
  
  // $media.on('mousedown', '.file', function() {
  //   setEdit($(this).attr('title'));
  // });
  
  // var medias = {
  //   styles: $('.media_styles'),
  //   decors: $('.media_decors'),
  //   pages: $('.media_pages'),
  //   layouts: $('.media_layouts'),
  //   video: $('.media_video'),
  //   audio: $('.media_audio'),
  //   gifs: $('.media_gifs'),
  //   images: $('.media_images')
  // };
  
  // function displayMedia() {
  //   medias.styles.empty();
  //   medias.decors.empty();
  //   medias.pages.empty();
  //   medias.layouts.empty();
  //   medias.video.empty();
  //   medias.audio.empty();
  //   medias.gifs.empty();
  //   medias.images.empty();
  
  //   $.each(datalists, function(key, val) {
  //     val.el.empty();
  //     val.data.length = 0;
  //   });
  
    // datalists.modes.data = Object.keys(modes);
  
    /* Pages
    ======== */
    // $.each(states.pages, function(key, val) {
    //   var path = `@${val}`;
    //   var file = `<div title="${path}" class="file">${path}</div>`;
    //   medias.pages.append(file);
    //   datalists.decors.data.push(path);
    // });
  
  
    /* Css
    ====== */
    // var decorsStyleSheet = document.styleSheets[1].cssRules;
    // [...decorsStyleSheet].forEach(val => {
    //   var styles = [...val.style];
    //   val = val.selectorText;
    //   if (val) {
    //     var file = `<div title="${val}" class="file">${val}</div>`;
    //     if (styles.includes('background-color') || styles.includes('background-image')) {
    //       medias.decors.append(file);
    //       datalists.decors.data.push(val);
    //     } else {
    //       medias.styles.append(file);
    //       datalists.styles.data.push(val);
    //     }
    //   }
    // });
  
    /* Media
======== */
// $.each(states.media, function(key, val) {
//   var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;
  
//   // if (
//   // val.endsWith('.wav') ||
//   // val.endsWith('.flac') ||
//   // val.endsWith('.mp3') ||
//   // val.endsWith('.ogg')
//   // ) {
//   // medias.audio.append(file);
//   // datalists.musics.data.push(val);
//   if (
//   val.toLowerCase().endsWith('.jpeg') ||
//   val.toLowerCase().endsWith('.jpg') ||
//   val.toLowerCase().endsWith('.png') ||
//   val.toLowerCase().endsWith('.svg') ||
//   val.toLowerCase().endsWith('.webp') ||
//   val.toLowerCase().endsWith('.jfif')
//   ) {
//   medias.images.append(file);
//   datalists.decors.data.push(val);
//   } else if (
//       val.toLowerCase().endsWith('.html')
//   ) {
//   medias.layouts.append(file);
//   datalists.decors.data.push(val);
//   } else if (
//   val.toLowerCase().endsWith('.gif') //
//   ) {
//   medias.gifs.append(file);
//   datalists.decors.data.push(val);
//   } else if (
//   val.toLowerCase().endsWith('.webm') ||
//   val.toLowerCase().endsWith('.mp4') ||
//   val.toLowerCase().endsWith('.mov') ||
//   val.toLowerCase().endsWith('.wmv') ||
//   val.toLowerCase().endsWith('.avi') ||
//   val.toLowerCase().endsWith('.ogv')
//   ) {
//   medias.video.append(file);
//   datalists.decors.data.push(val);
//   }
// });
// datalistsWrite();
// $(".media_cat p").click(function(){
//   $(".media_cat p").not(this).next().hide();
//   $(this).next().toggle();
// })
// }
  


  $('.radio_fit').on('input', function() {
    $(this.form)
      .find('.sp-preview-inner')
      .css(
        'background-size',
        $(this.form)
          .find('.radio_fit:checked')
          .val()
      );
  });
  
  
  $('.repet__pause').on('click', function() {
    setTimeout(function() {
      socket.emit('send', {
        to: ['screens', 'consoles', 'emos', 'laptops'],
        repet: addRepetData({}).repet
      });
    }, 0);
  });
  $('.repet__rewind').on('click', function() {
    socket.emit('send', {
      to: ['screens', 'consoles', 'emos', 'laptops'],
      rewind: true
    });
  });
  $('.repet__forward').on('click', function() {
    socket.emit('send', {
      to: ['screens', 'consoles', 'emos', 'laptops'],
      forward: true
    });
  });
  
  /* Visual Novel
  =============== */
  
  
  
  
  
  
  /* Users
  ======== */
  var $users = $('#users');
  var $interactions = $('#interactions');
  var $reponses = $('#reponses');
  
  function displayUser(user) {
    return $(`<tr class="user" data-id="${user.id}" id="user_${user.id}">`).append(
      $('<td><input checked type="checkbox" class="user_check"></td>'),
      $(`<td><span class="user__online user__online--${user.online ? 'yes' : 'no'}"></td>`),
      $(`<td><span class="user__nick">${user.nick}</span></td>`),
      $(`<td><span class="user__karma">${user.karma}</span></td>`)
    );
  }
  
  $nb_users_inscrits = $('#nb_users_inscrits');
  $nb_users_connectes = $('#nb_users_connectes');
  
  function displayUsers(recheck) {
    // var checked = [];
    // $users.find(':checked').each(function() {
    //   checked.push(
    //     $(this)
    //       .parent()
    //       .parent()[0].id
    //   );
    // });
    $users.empty();
    var inscrits = 0;
    var connected = 0;
    $.each(states.users, function(key, val) {
      inscrits++;
      if (val.online) connected++;
      $users.append(displayUser(val));
    });
    $nb_users_inscrits.text(inscrits);
    $nb_users_connectes.text(connected);
    // if (recheck) {
    //   $users.find(':checked').prop('checked', false);
    //   checked.forEach(function(id) {
    //     $('#' + id)
    //       .find('input')
    //       .prop('checked', true);
    //   });
    // }
  }
  
  function addSelectedUsersData(data) {
    data.to = [];
    $('.user_check:checked')
      .parent()
      .parent()
      .each(function() {
        data.to.push($(this).data('id'));
      });
  }
  
  function sendToSelectedUsers(data) {
    addSelectedUsersData(data);
    socket.emit('broadcast', data);
  }
  
  function displayReponses() {
    $reponses.empty();
    $.each(reponses, function(key, val) {
      var $btn = $(`<button title="${val.title}" class="icon">${key}</button>`);
      $reponses.append(
        $btn.on('click', function(e) {
          e.preventDefault();
          var responseText;
          if ($('#select_language').val() in val.data) {
            responseText = sample(val.data[$('#select_language').val()])
          } else {
            responseText = sample(val.data[defaultLanguage])
          }
          sendToSelectedUsers({
            type: val.type,
            texte: responseText
          });
        })
      );
    });
    var $btn = $(`<button title="image" class="icon">IMAGE</button>`);
    var $imageInput = $(`<input type="file" style="visibility:hidden" id="image-file"></input>`);
    $reponses.append(
      $btn.on('click', function(e) {
        e.preventDefault();
        $('#image-file').click();
      }),
      $imageInput.on('change', function (e) {
        var data = e.originalEvent.target.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
          var msg = {};
          msg.file = evt.target.result;
          msg.fileName = data.name;
          socket.emit("image", msg);
          console.log(msg)
          $('#image-msg')[0].src = '';
          $('#one_shot__message').val(`<img src=${msg.file} style="width:200px; height: auto;"></img>`)
          $('#image-msg')[0].src = msg.file;
        };
        reader.readAsDataURL(data);
      })
    );
  }
  
  $('#users_check_all').on('change', function() {
    $('.user_check').prop('checked', this.checked);
  });
  
  $('#select_random_users').on('click', function() {
    $('#users_check_all').prop('checked', false);
    var $u = $('.user_check');
    $u.prop('checked', false);
    var n = Number($('#number_random_users').val());
    if (Number.isNaN(n)) n = 1;
  
    var subarr = getRandomSubarray($u, n);
    subarr.each(function() {
      $(this).prop('checked', true);
    });
  });
  
  /* Main
  ======= */
  var $one_shot__message = $('#one_shot__message');
  
  $main
    .on('input', 'form', function() {
      // if (this.id === 'form_osc_ip') return;
      // var data = getScreens();
      // if (this.id === 'boite' && 'boite' in data) {
      //   if (data.boite.type === 'gifs') {
      //     $('#boite').find('textarea').val($('#avatars_area').val());
      //   }
      //   setBoite(data.boite);
      // }
      if (this.id === 'boite') {
        // if (data.boite.type === 'gifs') {
        //   $('#boite').find('textarea').val($('#avatars_area').val());
        // }
        setBoite(data.boite);
      }

      // var $step = $('.scene__step.active');
      // if ($step.length) {
      //   var val = serialiseStep(data);
      //   $step
      //     .data('val', val)
      //     .find('.scene__step__json')
      //     .text(stringifyStep(val));
      // }
    })
    .on('submit', 'form', function(e) {
      e.preventDefault();
      if (this.id === 'interactions') {
        sendToSelectedUsers({
          type: 'message',
          texte: $one_shot__message.val()
        });
        $one_shot__message.val('');
        $('#image-msg')[0].src = '';
      } else if (this.id === 'form_osc_ip') {
        socket.emit('set osc host', $('#osc_ip').val());
      } else {
        sendScreen(this.id);
      }
    });
  
  socket.open();
  
  actions.next_step = function() {
    $('#visual__next').click();
  };
  actions.prev_step = function() {
    $('#visual__prev').click();
  };
  
  
  // MODAL
  
  
  

  
  // QR code reader
  function getMediaStream() {
    const controls = document.querySelector('.controls');
    const cameraOptions = document.querySelector('.video-options>select');
    const video = document.querySelector('#stream');
    const buttons = [...controls.querySelectorAll('.streamControl')];
    let streamStarted = false;
  
    const [play, pause] = buttons;
  
    const constraints = {
    video: {
        deviceId: ''
    }
    };
  
    cameraOptions.onchange = () => {
        constraints.video.deviceId = cameraOptions.value;
    startStream(constraints);
    };
  
    play.onclick = () => {
    if (streamStarted) {
        video.play();
        play.classList.add('d-none');
        pause.classList.remove('d-none');
        return;
    }
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        constraints.video.deviceId = cameraOptions.value;
        startStream(constraints);
    }
    };
  
    const pauseStream = () => {
    video.pause();
    play.classList.remove('d-none');
    pause.classList.add('d-none');
    };
  
    pause.onclick = pauseStream;
  
  
    const startStream = async (constraints) => {
        controls.classList.add('d-none');
        navigator.mediaDevices.getUserMedia( constraints )
        .then( MediaStream => {
            handleStream(MediaStream);
        }).catch( error => {
            console.log(error)
        });
    };
  
  
    const handleStream = (stream) => {
    video.srcObject = stream;
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    controls.classList.remove('d-none');
    };
  
  
    const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
    });
    cameraOptions.innerHTML = cameraOptions.innerHTML + options.join('');
    };
  
    getCameraSelection();
  }
  
  function readCode() {
    import('./lib/qr-scanner/qr-scanner.min.js').then((module) => {
      const QrScanner = module.default;
      // do something with QrScanner
      new QrScanner(document.getElementById('stream'), result => 
      console.log('decoded qr code:', result));
      qrScanner.start();
  });
  }
  
  function closeQRmodal() {
    document.getElementById('QR_modal').style.display = 'none';
  }
  
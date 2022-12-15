var $main = $('main');
var $step = $('<div class="step"></div>');
// var $decor = $('<div class="step__decor"></div>');
// var $texte = $('<div class="step__texte"></div>');
var $boite = $('<div id="boite"></div>');
// var $boiteAvatars = $('<div id="avatars"></div>');
$boite.hide();

$step.append($boite);
$main.append($step);

var audio = new Audio();
var img = new Image();
var dataFolder = '/data/media/';

var screenTypes = {
  screen: '📽️ SCREEN',
  // emo: '📺 EMO',
  laptop: '💻 LAPTOP',
  console: '🖥️ CONSOLE'
};

window.onload = (event) => {
  if (cat === 'console') {
    $('body').css('background-color', 'transparent');
  } else {
    $('body').css('background-color', 'black');
  }
}

if (cat in screenTypes) {
  document.title = screenTypes[cat];
  $main[0].id = cat;
}

// function afterFirstClick(cb) {
//   if (firstClick) cb();
//   else $(window).one('click', cb);
// }

/* Sounds
========= */
var sounds = {
  bot: new Howl({
    src: ['data/media/Sons/Jer.wav'],
    volume: 0.16
  })
};

function s(sound) {
  if (sound in sounds) sounds[sound].play();
}

actions.console = function(params) {
  if (mode.type === 'console') mode.write(params);
};

actions.validated = function(params) {
  if (boite && 'validated' in boite) {
    boite.validated(params);
  }
};

var gamepad_paused = false;
var tid;
actions.gamepad_master = function(key) {
  if (boite && 'gamepad' in boite) {
    boite.gamepad(key);
    clearTimeout(tid);
    tid = setTimeout(() => {
      gamepad_paused = false;
      socket.emit('send', {
        to: 'screen',
        pause_gamepad: false
      });
    }, 2000);
    gamepad_paused = true;
  }
};
actions.gamepad = function(key) {
  if (boite && 'gamepad' in boite && gamepad_paused === false) {
    boite.gamepad(key);
  }
};

/* Emoji
======== */
function emojify(data) {
  return twemoji.parse(data, {
    base: '/fonts/',
    folder: 'emoji',
    ext: '.svg'
  });
}

/* Steps
======== */
var repetDefault = {
  time: 0,
  pause: false
};

var repet = {};

function stop(media) {
  document.querySelectorAll('video').forEach(element => {
    element.pause();
    element.removeAttribute('src');
    delete element.src;
    element.load();
  })
  document.querySelectorAll('audio').forEach(element => {
    element.pause();
    element.removeAttribute('src');
    delete element.src;
    element.load();
  })
  // if (media.src) {
  //   media.pause();
  //   media.removeAttribute('src');
  //   delete media.src;
  //   media.load();
  // }
}

function playPause(media) {
  document.querySelectorAll('video').forEach(element => {
    if (repet.pause) element.pause();
    else if (element.paused) {
      element.play().catch(() => {});
    }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (repet.pause) element.pause();
    else if (element.paused) {
      element.play().catch(() => {});
    }
  })
  // if (media.src) {
  //   if (repet.pause) media.pause();
  //   else if (media.paused) {
  //     media.play().catch(() => {});
  //   }
  // }
}

function rewind(media) {
  document.querySelectorAll('video').forEach(element => {
    if (element.src) {
      var t = element.currentTime - 5;
      if (t < 0) t = 0;
      element.currentTime = t;
    }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (element.src) {
      var t = element.currentTime - 5;
      if (t < 0) t = 0;
      element.currentTime = t;
    }
  })
}

function forward(media) {
  document.querySelectorAll('video').forEach(element => {
    if (element.src) {
      var t = element.currentTime + 5;
      element.currentTime = t;
    }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (element.src) {
      var t = element.currentTime + 5;
      element.currentTime = t;
    }
  })
}

var video = $('video')[0]
actions.repet = function(data) {
  repet = Object.assign(repetDefault, data);
  playPause(audio);
  playPause(video);
};

actions.rewind = function() {
  rewind(audio);
  rewind(video);
};

actions.forward = function() {
  forward(audio);
  forward(video);
};

var containCSS = {'width' : '100%', 'height' : '100%', 'object-fit': 'contain'};
var coverCSS = {'width' : '100%', 'height' : '100%', 'object-fit': 'cover'};

// var lastVideoSrc;
function setVideo({ src, style, volume, fit, loop }) {
  var $video = $('<video></video>');
    if (style !== " " && style !== undefined && style !== "[]") {
      $video.css(style);
    } else {
      if (fit === 'contain') {
        $video.css(containCSS);
      } else {
        $video.css(coverCSS);
      }
    }
    
    var loop;
    var muted;

    if (style.loop && style.loop !== null) {
       loop = true;
    }

    if (style.muted && style.muted !== null) {
     muted = true;
    }

  var deviceId;

  if (src.includes('deviceId')) {
    deviceId = src.split('_')[1];
    $video.attr('id', 'stream');
    $video.attr('autoplay', true);
    $decor.append($video); 
    // afterFirstClick(
      async() => {
      await navigator.mediaDevices.getUserMedia({
        video: {
            deviceId: deviceId
        }}).then(stream => document.getElementById('stream').srcObject = stream)}
    // })
    ;
   
  } else {
    src = dataFolder + src;
    var video = $video[0];
    video.loop = loop;
    if (!style.muted || style.muted === null) {
      if (typeof volume === 'number') video.volume = volume / 100;
      else video.volume = 0.5;
    }
   
    if (repet.time !== '') {
      if (Number.isNaN(video.duration) !== false) {
        video.currentTime = repet.time > video.duration ? video.duration : repet.time;
      } else {
        video.currentTime = repet.time;
      }
    }
    $decor.append($video);  
    // afterFirstClick(() => {
      video.src = src;
      video.muted = muted;
      video.addEventListener('canplay', event => {
        if (repet.pause) video.pause();
        else video.play();
      });
      video.addEventListener('ended', event => {
        if (video.loop === false) {
          $video.hide();
        }
      });
    // });
  }
}

async function startStream(streamDeviceId) {
  await navigator.mediaDevices.getUserMedia({
  video: {
      deviceId: streamDeviceId
  }}).then(stream => document.getElementById('stream').srcObject = stream)
}

const handleStream = (stream) => {
  document.querySelector('#stream').srcObject = stream;
};

// var lastImageSrc;
function setImage({ src, style, fit }) {
  var $image = $('<img style="position:absolute"></img>');

    if (style !== " " && style !== undefined && style !== "[]") {
      $image.css(style);
    } else {
      if (fit === 'contain') {
        $image.css(containCSS);
      } else {
        $image.css(coverCSS);
      }
    }
  
  src = dataFolder + src;
  $decor.append($image);
  // $decor.css('background-color', '');
  var image = $image[0];

  // $image.show();

  // if (lastImageSrc === src) return;
  // afterFirstClick(() => {
    image.src = src;
    // lastImageSrc = src;
    
   
  // });
}

var lastMusicSrc;
function setMusic({ src, volume, loop = false }) {
  src = dataFolder + src;
  audio.loop = loop;
  if (typeof volume === 'number') audio.volume = volume / 100;
  else audio.volume = 0.5;

  if (repet.time !== '') {
    if (Number.isNaN(audio.duration) !== false) {
      audio.currentTime = repet.time > audio.duration ? audio.duration : repet.time;
    } else {
      audio.currentTime = repet.time;
    }
  }

  if (lastMusicSrc === src) return;
  // afterFirstClick(() => {
    stop(audio);
    audio.src = src;
    lastMusicSrc = src;
    audio.addEventListener('canplay', event => {
      if (repet.pause) audio.pause();
      else audio.play();
    });
  // });
}

// var lastIframeSrc;
function setIframe({ src, style, fit }) {
  var $iframe = $('<iframe />');

    if (style !== " " && style !== undefined && style !== "[]") {
      $iframe.css(style);
    } else {
      if (fit === 'contain') {
        $iframe.css(containCSS);
      } else {
        $iframe.css(coverCSS);
      }
    }
  
  if (src.includes("layouts")) {
    src = src.startsWith('http') ? src : `/data/media/${src}`;
  } else {
    src = src.slice(1);
    src = src.startsWith('http') ? src : `/data/pages/${src}/index.html`;
  }
  $decor.append($iframe);
  var iframe = $iframe[0];
    // if (lastIframeSrc === src) return;
    // afterFirstClick(() => {
      // $iframe.show();
      // $iframe.css(style);
      iframe.src = src;
      // lastIframeSrc = src;
      // iframe.addEventListener('load', () => {
      //   console.log('iframe loaded');
      // });
      // iframe.onload = function(e) {
      //   if (e.target.contentWindow.document.getElementsByTagName('video')[0]) {
      //     video = e.target.contentWindow.document.getElementsByTagName('video')[0];
          
      //     video.addEventListener('canplay', event => {
      //       if (repet.pause) video.pause();
      //       else video.play();
      //     });
      //     video.addEventListener('ended', event => {
      //       if (video.loop === false) {
      //         $(iframe).contents().find("video").hide();
      //         // $video.hide();
      //         // $decor.css('background-color', '#000');
      //       }
      //     });
      //     if (e.target.contentWindow.document.getElementsByTagName('canvas')[0]) {
      //       processor.start(video);
      //     }
      //   } 
      // }
     
      
    // });
  
}

function killDecors(expect) {
 
  $('.step__decor').find('img').each(function(){$(this).remove()})
  $('.step__decor').find('iframe').each(function(){$(this).remove()})
  $decor.css('background-color', '');
  $step[0].className = 'step';
  
}

function isJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

// function setDecor(data) {
//   var src = data.src;
//   killDecors();
//   if (isJsonString(data.src)) {
//       const src = JSON.parse(data.src);
//       const style = JSON.parse(data.style);

//       // check if there is already video with same source and leave it
//       var existingVideos = [];
//       var newVideoSrc = [];
//       for (var i = 0; i < src.length; i++) {
//         if (
//           src[i].toLowerCase().endsWith('.webm') ||
//           src[i].toLowerCase().endsWith('.ogv') ||
//           src[i].toLowerCase().endsWith('.mp4') ||
//           src[i].toLowerCase().endsWith('.mov') ||
//           src[i].toLowerCase().endsWith('.wmv') ||
//           src[i].toLowerCase().endsWith('.avi') ||
//           src[i].includes('deviceId')
//         ) {
//           if (jQuery(`video[src*='${src[i]}']`).length === 0) {
//             newVideoSrc.push(src[i]);
//           } else {
//             existingVideos.push(src[i]);
//           }
//         }
//       }
//       if (existingVideos.length > 0) {
//         document.querySelectorAll('video').forEach(element => {
//           if (element.getAttribute('src') !== null) {
//             if (!existingVideos.includes(element.getAttribute('src').replace("/data/media/",""))) {
//             $(element)[0].remove();
//           }
//         }})
//       }

//       for (var i = 0; i < src.length; i++) {
//         if (typeof src[i] === 'string') {
//           if (src[i].charAt(0) === '.') {
//                     // killDecors();
//                     $step.addClass(src[i].split('.').join(' '));
//                   } else if (src[i].charAt(0) === '@') {
//                     if (jQuery(`iframe[src*='${src[i]}']`).length === 0) {
//                       // killDecors('iframe');
//                       var tempDATA = data;
//                       tempDATA.src = src[i];
//                       tempDATA.style = style[i];
//                       setIframe(tempDATA);
//                     }
//                   } else if (src[i].includes("html") && src[i].charAt(0) !== '@') {
//                     if (jQuery(`iframe[src*='${src[i]}']`).length === 0) {
//                     // killDecors('iframe');
//                     var tempDATA = data;
//                     tempDATA.src = src[i];
//                     tempDATA.style = style[i];
//                     setIframe(tempDATA);
//                     }
//                   } else if (
//                     src[i].toLowerCase().endsWith('.jpg') ||
//                     src[i].toLowerCase().endsWith('.jpeg') ||
//                     src[i].toLowerCase().endsWith('.gif') ||
//                     src[i].toLowerCase().endsWith('.png') ||
//                     src[i].toLowerCase().endsWith('.webp') ||
//                     src[i].toLowerCase().endsWith('.svg') ||
//                     src[i].toLowerCase().endsWith('.jfif')
//                   ) {
//                     if (jQuery(`img[src*='${src[i]}']`).length === 0) {
//                     // killDecors('image');
//                     var tempDATA = data;
//                     tempDATA.src = src[i];
//                     tempDATA.style = style[i];
//                     setImage(tempDATA);
//                     }
//                     // var url = dataFolder + src[i];
//                     // img.onload = function() {
//                     //   $decor.css('background-image', 'url(' + url + ')');
//                     // };
//                     // img.src[i] = url;
//                   } else if (
//                     src[i].toLowerCase().endsWith('.webm') ||
//                     src[i].toLowerCase().endsWith('.ogv') ||
//                     src[i].toLowerCase().endsWith('.mp4') ||
//                     src[i].toLowerCase().endsWith('.mov') ||
//                     src[i].toLowerCase().endsWith('.wmv') ||
//                     src[i].toLowerCase().endsWith('.avi') ||
//                     src[i].includes('deviceId')
//                   ) {
//                     // if (jQuery(`video[src*='${src[i]}']`).length === 0) {
//                     //   $('.step__decor').find('video').each(function(){$(this).remove()})
//                     if (newVideoSrc.includes(src[i])) {
//                       var tempDATA = data;
//                       tempDATA.src = src[i];
//                       tempDATA.style = style[i];
//                       setVideo(tempDATA);
//                       $step[0].className = 'step';
//                     }
                      
//                     // }
//                   } else {
//                     // killDecors('color');
//                     $decor.css('background-image', '');
//                     $step[0].className = 'step';
//                     $decor.css('background-color', src[i]);
//                   }
//                 }
//     }
//   } 
//   else {
//     if (typeof src === 'string') {
//       killDecors();
//       if (src === ' ') {
//         killDecors();
//         $('.step__decor').find('video').each(function(){$(this).remove()});
//       } else if (src.charAt(0) === '.') {
//         killDecors();
//         $step.addClass(src.split('.').join(' '));
//       } else if (src.charAt(0) === '@') {
//         // killDecors('iframe');
//         setIframe(data);
//       } else if (src.includes("html") && src.charAt(0) !== '@') {
//         // killDecors('iframe');
//         setIframe(data);
//       } else if (
//         src.toLowerCase().endsWith('.jpeg') ||
//         src.toLowerCase().endsWith('.jpg') ||
//         src.toLowerCase().endsWith('.gif') ||
//         src.toLowerCase().endsWith('.png') ||
//         src.toLowerCase().endsWith('.svg') ||
//         src.toLowerCase().endsWith('.webp') ||
//         src.toLowerCase().endsWith('.jfif')
//       ) {
//         // if (jQuery(`img[src*='${src}']`).length === 0) {
//         // killDecors('image');
//         setImage(data);
//         // }
//         // var url = dataFolder + src;
//         // img.onload = function() {
//         //   $decor.css('background-image', 'url(' + url + ')');
//         // };
//         // img.src = url;
//       } else if (
//         src.toLowerCase().endsWith('.webm') ||
//         src.toLowerCase().endsWith('.ogv') ||
//         src.toLowerCase().endsWith('.mp4') ||
//         src.toLowerCase().endsWith('.mov') ||
//         src.includes('deviceId')
//       ) {
//         if (jQuery(`video[src*='${src}']`).length === 0) {
//           $('.step__decor').find('video').each(function(){$(this).remove()});
//           setVideo(data);
//           $step[0].className = 'step';
//         }
//       } else {
//         // killDecors('color');
//         $decor.css('background-image', '');
//         $step[0].className = 'step';
//         $decor.css('background-color', src);
//       }
//     }
//   }

//   $main
//     .removeClass('screen_contain')
//     .removeClass('screen_cover')
//     .addClass(`screen_${data.fit}`);
// }

var mode;
function setMode(data) {
  if (mode) {
    if (mode.type === data) return;
    if ('destroy' in mode) mode.destroy();
  }
  if (arguments.length === 1 && data in modes) {
    mode = modes[data]();
  } else {
    mode = modes.normal();
  }
}
setMode();

socket.on('current language', (data) => {
  startMemeGenerator(data);
})

socket.on('language changed', (data) => {
  startMemeGenerator(data);
})

socket.on('append avatar', (data) => {
    var id = data;
    if (jQuery(`#avatars img[src*=${id}]`).length === 0) {
    var src = 'data/media/Gif/Avatars/Avatars' + id + '.gif';
    var img = new Image();
    $img = $(img);
    img.src = src;
    img.onload = function() {
      $('#avatars').append($img);
      var cw = $('#avatars').width();
      var ch = $('#avatars').height();

      var iw = $img.width();
      var ih = $img.height();

      var x = Math.random() * (cw - iw);
      var y = Math.random() * (ch - ih);
      $img.css({ top: y, left: x });
    };
  }
}
)

socket.on('remove avatar', (data) =>{
  jQuery(`#avatars img[src*=${data}]`).remove();
})

function clearUnwantedMedia(data){
  const div = document.getElementsByClassName('step')[0];
  const stepMedia = data['media'];

  let keysArray = [].map.call($('.step').children().not('#boite'), function (e) {
  return e.getAttribute('data-key')
  })

  keysArray.forEach(key => {
      if (!stepMedia[key]) {
          $(`.step [data-key=${key}]`).remove();
      }
  })
}


function applyZIndexes(data) {
  data['media-order'].forEach((value, index) => {
      $(`.step [data-key=${value}]`).css({"z-index" : index + 1});
  })
}

function displayStep(data) {

    clearUnwantedMedia(data);

    const mediaOrder = data['media-order'];
    const stepMedia = data['media'];

    for (let data_key of mediaOrder) {
      setElements(stepMedia[data_key].attributes.src, checkMediaType(stepMedia[data_key]['attributes']['src']), data_key, stepMedia[data_key]);
    }
    applyZIndexes(data);
    
    setElements("", "avatars", "", data['avatars']);
    setElements("", "console", "", data['console']);
    setElements("", "music", "", data['music']);
}

function setElements(val, type, data_key, stepMediaObject) {
  // $('#media-editor')[0].innerHTML = '';
  src = dataFolder + val;
 
  const avatars = `<div id="avatars" style="width: 25%; height: 15%; position: absolute; top: 25%; left:25%; border-radius: 45%; z-index:99;"><img style = "width: 100%; height: 100%;" class="media"></img></div>`;

  const console = `<div id="console" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:100;"><iframe src="/console" style="width:100%; height: 100%; border: none;"></iframe></div>`;

  const imageElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key}><img style="width: 100%;" src=${src} class="media"></img></div>`

  const videoElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key}><video autoplay style="width: 100%;" src=${src} class="media"></video></div>`
                 
  const audioElement = '<audio id="music" src=""></audio>'
  // var streamElement = ` 
  //                     <div 
  //                     id=${id}
  //                     class = "popup video stream"
  //                     style = "z-index: ${zIndex};
  //                                 text-align: center;
  //                                 position: absolute;
  //                                 left: 0%; 
  //                                 top: 85%;
  //                                 box-sizing: border-box;
  //                                 width: 40%;
  //                                 height: auto;
  //                                 -webkit-touch-callout: none; 
  //                                 -webkit-user-select: none; 
  //                                 -khtml-user-select: none; 
  //                                 -moz-user-select: none; 
  //                                 -ms-user-select: none; 
  //                                 user-select: none; 
  //                             "
  //                     >
  //                         <div 
  //                             class = "popup-body"
  //                                         style = "width: 100%;
  //                                         height: 100%;
  //                                         overflow: hidden;
  //                                         box-sizing: border-box;"
  //                         >
  //                         <div 
  //                             class="popup-header" 
  //                             id=${id + 'header'}
  //                             style = "   position: absolute;
  //                                         left: 7%;
  //                                         top: 20%;
  //                                         width: 85%;
  //                                         height: 80%;
  //                                         padding: 0;
  //                                         cursor: move;
  //                                         z-index: 10;
  //                                     "
  //                         ></div>
                      
  //                         <video id="stream" autoplay style="width: 100%"></video>
  //                         <div class="video-options">
  //                             <select name="" id="" class="custom-select"><option value="">Select camera</option></select>
  //                         </div>
  //                         <div class="controls d-none">
  //                             <button class="play streamControl" title="Play">&gt;</button>
  //                             <button class="pause d-none streamControl" title="Pause">||</button>
  //                         </div>
  //                     </div>
  //                 </div>
  
  
  // `
  
  // var textElement = `<div 
  //                         id=${id}
  //                         class = "popup text"
  //                         style = "z-index: ${zIndex};
  //                                 text-align: center;
  //                                 position: absolute;
  //                                 left: 85%; 
  //                                 top: 85%;
  //                                 box-sizing: border-box;
  //                                 width: 20%;
  //                                 height: auto;
  //                                 -webkit-touch-callout: none; 
  //                                 -webkit-user-select: none; 
  //                                 -khtml-user-select: none; 
  //                                 -moz-user-select: none; 
  //                                 -ms-user-select: none; 
  //                                 user-select: none; 
  //                                 "
  //                     >
  //                         <div 
  //                             class = "popup-body"
  //                                     style = "width: 100%;
  //                                     height: 100%;
  //                                     overflow: hidden;
  //                                     box-sizing: border-box;"
  //                         >
  //                             <div 
  //                                 class="popup-header text-box-header" 
  //                                 id=${id + 'header'}
  //                                 style = "   position: absolute;
  //                                             left: -15px;
  //                                             top: 0px;
  //                                             width: 15px;
  //                                             height: 24px;
  //                                             padding: 0;
  //                                             cursor: move;
  //                                             z-index: 10;
                                              
  //                                         "
  //                             ></div>
  //                             <pre contenteditable="true" id=${id + 'text'} 
  //                                 style=" 
  //                                 white-space: pre-wrap; 
  //                                 word-wrap: break-word;
  //                                 color: white;
  //                                 font-size: 16px;
  //                                 margin: 0px;
  //                                 font-family: Arial;
  //                                 "
  //                             >${val}</pre>
  //                         </div>
  //                     </div>`

  if (type === 'media_video') {
      if($(`.step [data-key=${data_key}]`).length === 0) {
          $('.step').append(videoElement);
      }
  } else if (type === 'videoStream'){
      $('.step').append(streamElement);
      hideIfDisplayed($('#add-stream-button')[0]);
      addMenu(id);
  }
  else if (type === 'media_images' || type === 'media_gifs') {
      //  IF ELEMENT DOES NOT ALREADY EXIST CREATE IT
      if($(`.step [data-key=${data_key}]`).length === 0) {
          $('.step').append(imageElement);
      }
  } else if (type === 'avatars') {
      if($('#avatars').length === 0) {
          $('.step').append(avatars);
      }
     
  } else if(type === 'console') {
      if($('#console').length === 0) {
          $('.step').append(console);
      }
  } else if (type === 'music') {
      if($('#music').length === 0) {
          $('.step').append(audioElement);
      }
  }
  else if (type === 'media_layouts') {
      // const iframe  = document.createElement("iframe");
      // iframe.src = '/data/media/' + val;
      // iframe.style.display = "none";
      // document.body.appendChild(iframe);

      // iframe.onload = function(e) {
          const node = document.createElement('div');
          node.innerHTML = val;

          const popupElements = Array.from(node.getElementsByClassName("popup"));
          var id = [];
          popupElements.forEach(element => id.push(element.id));

          // Adjust src of media elements to be seen by editor
          var mediaElements = node.querySelectorAll('[src]');
          for (var element of mediaElements) {
              var adjustedSRC = element.getAttribute("src").replace("..", "/data/media");
              element.setAttribute("src", adjustedSRC);
          }

          // adjust src of media for background images on elements if exists
          var popupBodyElements = node.querySelectorAll('.popup-body');
          for (var element of popupBodyElements) {
                      if (element.style.backgroundImage !== '') {
                          var adjustedSRC = element.style.backgroundImage.replace('url("..','url("data/media');
                          element.style.backgroundImage = adjustedSRC;
                      }
                  }
          // adjust main color picker value
          $('.step_background')[0].value = node.style.backgroundColor;
          $('.step_background').trigger('input');

          document.getElementById("preview").remove();
          document.getElementsByTagName("main")[0].append(node);
       
          e.target.remove();
                
          const popupElementsNew = Array.from(node.getElementsById("preview"));
         
          // initResizeElement();
          if (typeof(id) === 'string') {
              addMenu(id);
          } else {
              id.forEach(element => addMenu(element));
          // }
          
          // initDragElement();
          closeMediaList();
      }
  } 
  else if (type === 'media_decors') {
      var decors = Array.from(document.querySelector(".media_decors").children);
      var previewElement = document.querySelector(".step");
      // Remove previouse styles
      decors.forEach(decor => {
          var className = decor.innerHTML.substring(1);
          if (previewElement.classList.contains(className)) {
              previewElement.classList.remove(className);
          }
          if (previewElement.style.backgroundColor !== '') {
              $('.step_background')[0].value = '';
              $('.step_background').trigger('input');
          }
      });
      previewElement.classList.add(val.substring(1));
      closeMediaList();
  } 
  else if (type === 'background') {
      var decors = Array.from(document.querySelector(".media_decors").children);
      var previewElement = document.querySelector(".step");
      // Remove previouse styles
      decors.forEach(decor => {
          var className = decor.innerHTML.substring(1);
          if (previewElement.classList.contains(className)) {
              previewElement.classList.remove(className);
          }
          // if (previewElement.style.backgroundColor !== '') {
              $('.step_background')[0].value = val;
              $('.step_background').trigger('input');
          // }
      });
      // previewElement.classList.add(val.substring(1));
  }    
  else if (type === 'text-box') {
      $('.step').append(textElement);
      document.getElementById(id + 'text').focus();
      // initResizeElement(id);
      addMenu(id);
      closeMediaList();
      // initDragElement();
      hideIfDisplayed($('#add-text-button')[0]);
      return id
  }

  // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
  if (stepMediaObject) {
      if (type === 'avatars' || type === 'console') {
          if (!stepMediaObject['active']) {
              $(`#${type}`).hide();
          } else {
              $(`#${type}`).show();
          }
          $(`#${type}`).css(stepMediaObject['css']);
      } else if (type === 'music') {
          if (!$('#music').attr('src').includes(stepMediaObject['src'])) {
              $('#music').attr('src', dataFolder +  stepMediaObject['src']); 
          }
          $('#music').attr('volume', stepMediaObject['volume'])
          $('#music').attr('loop', stepMediaObject['loop'])
      }   
      
      else {
          // APPLY CSS
          let mediaElement = $(".step").find(`*[data-key="${data_key}"]`);
          mediaElement.css(stepMediaObject['css']);

          // CHECK IF NEW SRC SHOULD BE APPLIED
          if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
              mediaElement.find('.media').attr('src', dataFolder +  stepMediaObject['attributes']['src']); 
          }

          // APPLY CLASSES
          let classes = "";
          stepMediaObject['classes'].forEach(element => {
              classes = classes + element;
          });
          mediaElement.addClass(classes);

          // ADD TEXT
          mediaElement.find('.text').text(stepMediaObject['content']);

          if(stepMediaObject['css']['object-fit'] !== "") {
              mediaElement.find('.media').css({"height" : "100%", "object-fit" : stepMediaObject['css']['object-fit']});
          }
      }
  } 
}

function checkMediaType(val) {
  if (
  val.toLowerCase().endsWith('.jpeg') ||
  val.toLowerCase().endsWith('.gif') ||
  val.toLowerCase().endsWith('.jpg') ||
  val.toLowerCase().endsWith('.png') ||
  val.toLowerCase().endsWith('.svg') ||
  val.toLowerCase().endsWith('.webp') ||
  val.toLowerCase().endsWith('.jfif') ) {
      return 'media_images'
  }
  if (
  val.toLowerCase().endsWith('.webm') ||
  val.toLowerCase().endsWith('.mp4') ||
  val.toLowerCase().endsWith('.mov') ||
  val.toLowerCase().endsWith('.wmv') ||
  val.toLowerCase().endsWith('.avi') ||
  val.toLowerCase().endsWith('.ogv') ) {
      return 'media_video'
  }

  return 'media_stream'
}


socket.on('step', function(data){
  if ('boite' in data && 'type' in data.boite) setBoite(data.boite);
  if ('mode' in data) setMode(data.mode);
  // displayStep(data);
  if ('screen' in data) displayStep(data['screen']);
  if ('laptop' in data) displayStep(data['laptop']);
})

// socket.on('step', function(data) {
//   // console.log('step', cat, data);
//   if (data.avatars === 'on') { 
//     if (data.avatars_area && data.avatars_area !== ' ') {
//       $('#avatars').css(JSON.parse(data.avatars_area));
//       $('#avatars')[0].style.bottom = 'auto';
//       $('#avatars')[0].style.right = 'auto';
//     }
//     $('#avatars')
//     $('#avatars').show();
//   } 
//   if (data.avatars === 'off') {
//     $('#avatars').hide();
//   }
//   repet = Object.assign(repetDefault, data.repet);

//   if (data && data.active !== false) {
//     $main.removeClass('off');
//     if ('effect' in data) {
//       setSlideEffect(data['effect']); 
//       setTimeout(() => {
//         if ('boite' in data && 'type' in data.boite) setBoite(data.boite);
//         if ('mode' in data) setMode(data.mode);
//         if ('code' in data) actions.eval(data.code);
//         if ('texte' in data) mode.write(data.texte);
//         if ('decor' in data && data.decor.src) setDecor(data.decor);
//         if ('music' in data && data.music.src) setMusic(data.music);
//         if ('color' in data) {
//           var style = data.color.trim();
//           $texte.css('color', style);
//         }
//         if ('style' in data) {
//           var style = data.style.trim();
//           $texte[0].className = 'step__texte';
//           // if (style) $texte.addClass(style.slice(1));
//           $texte.attr("style",style);
//           $texte.css('padding', '0px')
//         }
//         setSlideEffect(data['effect']); 
//       }, 1000);
//     } else {
//     if ('boite' in data && 'type' in data.boite) setBoite(data.boite);
//     if ('mode' in data) setMode(data.mode);
//     if ('code' in data) actions.eval(data.code);
//     if ('texte' in data) mode.write(data.texte);
//     if ('decor' in data && data.decor.src) setDecor(data.decor);
//     if ('music' in data && data.music.src) setMusic(data.music);
//     if ('color' in data) {
//       var style = data.color.trim();
//       $texte.css('color', style);
//     }
//     if ('style' in data) {
//       var style = data.style.trim();
//       $texte[0].className = 'step__texte';
//       // if (style) $texte.addClass(style.slice(1));
//       $texte.attr("style",style);
//       $texte.css('padding', '0px')
//     }
//   }
//   } else {
//     $main.addClass('off');
//     lastMusicSrc = null;
//     setMode();
//     // $texte.html('');
//     killDecors();
//     $('.step__decor').find('video').each(function(){$(this).remove()})
//     stop(audio);
//   }
// });

// socket.on('collective song answers', (data) => {
//   console.log(data)
// })

socket.on('meme', (data) => {
  $('#boite')[0].style.display = 'block';
  $('#boite')[0].innerHTML = data.data;
})

socket.open();

var $body = $('body');

// if (cat === 'screen') {
//   $(document).idle({
//     onIdle: function() {
//       $body.css('cursor', 'none');
//     },
//     onActive: function() {
//       $body.css('cursor', 'default');
//     },
//     idle: 3000
//   });

//   Mousetrap.bind('ctrl+enter', function() {
//     socket.emit('send', {
//       to: 'master',
//       next_step: true
//     });
//   });
//   Mousetrap.bind('ctrl+backspace', function() {
//     socket.emit('send', {
//       to: 'master',
//       prev_step: true
//     });
//   });
// }

// function setSlideEffect(where) {
//   $('#screen').toggleClass(`slide-${where}`);
// }

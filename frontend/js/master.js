navigator.mediaDevices.getUserMedia({video: true, audio: true});

toggleFullScreen = function() {};

// ACTIVATE draggable elements
$( function() {
  $( ".draggable" ).draggable({
      stop : function(){
        $(this).position();
        $(this).css('position', 'absolute');
      }
  });
})

// ACTIVATE resizable elements
$(".resizable").resizable({
  handles: "se"
});

// ACTIVATE title of elements to be shown as tooltip on hover
$( document ).tooltip();

const isPositiveInteger = val => val >>> 0 === parseFloat(val);

function locate(obj, path, sep = '.') {
  return path
    .split(sep)
    .filter(key => key !== '')
    .reduce((acc, key) => acc[key], obj);
}

function allocate(obj, path, val = null, sep = '.') {
  path
    .split(sep)
    .filter(key => key !== '')
    .reduce((acc, key, i, arr) => {
      acc[key] = arr.length - 1 === i ? val : acc[key] || {};
      return acc[key];
    }, obj);
  return obj;
}

allocate.json = function(obj, path, val = null, sep = '.') {
  path
    .split(sep)
    .filter(key => key !== '')
    .reduce((acc, key, i, arr) => {
      acc[key] =
        arr.length - 1 === i
          ? val
          : acc[key] || (isPositiveInteger(arr[i + 1]) ? [] : {});
      return acc[key];
    }, obj);
  return obj;
};

const getFormValues = (form, withEmpty = false) => {
  var data = {};
  [...form.elements].forEach(el => {
    if (el.name === '' || el.disabled) return;
    let val;
    if ('valueAsDate' in el && el.valueAsDate !== null) val = el.valueAsDate;
    else if (el.type === 'number') val = el.value !== '' ? Number(el.value) : '';
    else if (el.type === 'range') val = el.value !== '' ? Number(el.value) : '';
    else if (el.type === 'checkbox') val = Boolean(el.checked);
    else if (el.type === 'radio') {
      if (el.checked) val = el.value;
      else return;
    } else if (el.type === 'select-multiple') {
      val = [...el.options].filter(option => option.selected).map(option => option.value);
    } else if (withEmpty || el.value) {
      val = el.value;
    } else return;

    var name = el.name;
    if (name === 'mode_aff') name = 'mode';
    allocate(data, name, val);
  });
  return data;
};

const setFormValues = (form, data) => {
  [...form.elements].forEach(el => {
    var name = el.name;
    if (name === 'mode_aff') name = 'mode';
    var val = locate(data, name);
    if (el.type === 'checkbox') {
      el.checked = val;
    } else if (el.type === 'radio') {
      if (el.value === String(val)) el.checked = true;
    } else if (el.type === 'number' || el.type === 'range') {
      if (!Number.isNaN(Number(val))) el.value = val;
    } else if (val != null) {
      el.value = val;
    } 
    $(el).trigger('input');
  });
};

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

// socket.on('saving', function(data) {
//   if (data.error === false) {
//     var remove = actions.message({
//       user: 'system',
//       text: 'Sauvegarde ok'
//     });
//     setTimeout(remove, 1500);
//     var url = `/data/visual_${currentLanguage}.json`;
//     $.getJSON(url, function(data) {
//       scenes = data;
//       displayVisual();
//     });
//   } else {
//     actions.message({
//       user: 'system',
//       text: `Une erreur est survenue lors de la sauvegarde, le mieux à faire est de copier-coller des textes en cours d'édition dans un bloc note, de rafraichir la page et de re-essayer de les enregistrer
//       <textarea class="code">${data.error}</textarea>`
//     });
//   }
// });

// socket.on('multimedia decor', (data) => {
//   if (typeof(data.layout) === 'object') {
//     if (data.layout.src) {
//       document.getElementById(data.to).elements['decor.src'].focus();
//       setEdit(JSON.stringify(data.layout.src));

//       document.getElementById(data.to).elements['decor.style'].focus();
//       setEdit(JSON.stringify(data.layout.style));
      
//     } 
//     if (data.layout.texte) {
//       document.getElementById(data.to).elements['texte'].focus();
//       setEdit(data.layout.texte);

//       document.getElementById(data.to).elements['style'].focus();
//       setEdit(data.layout.style);
//     } 
//   } 
// })

// socket.on('avatars position', (data) => {
//   $('#avatars_area').val(JSON.stringify(data));
//   $('#avatars_area').trigger('input');
//   if ($('#boite').find('.boite_radio--gifs')[0].checked) {
//     $('#boite').find('textarea').val($('#avatars_area').val());
//     $('#boite').find('textarea').trigger('input');
//   }
// })

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
  .on('click', '.scene__toggle, b', function() {
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

const offStep = {...stepObject};


$('#tools').append(
  $(`<div class="box-v tools"></div>`).append(
    $(`<button class="_icon"><i>🚫</i> clear all screens</button>`).on(
      'click',
      function() {
        socket.emit('step', offStep);
      }
    ),
    // $(`<button class="_icon">✏️ editor</button>`).on(
    //   'click',
    //   function() {
    //     var sceneName = '';
    //     var win;
    //       win = window.open('/editor', '_blank');
    //       // function sendScreen(name) {
    //         setTimeout(() => {
    //           var data = fecthScreens();
    //           var out = {};
    //           out['screen'] = data['screen'];
    //           console.log(out)
    //           socket.emit('step from master', addExtraData(out));
    //         }, 1000);
            
    //       if (win) {
    //         //Browser has allowed it to be opened
    //         win.focus();
    //     } else {
    //         //Browser has blocked it
    //         alert('Please allow popups for this website');
    //     }
    //   }
    // ),
    // $(`<button class="_icon">SCAN QR</button>`).on(
    //   'click',
    //   function() {
    //     document.querySelector('#QR_modal').style.display = 'block';
    //     getMediaStream();
    //   }
    // ),
    // $(`<div></div>`).append(
    //   $(`<label for='select_effect' class="_icon" >✨ etape effects</label>`),
    //   $(`<select id='select_effect'>
    //       <option value='none'>none</option>
    //       <option value='up'>⬆️ slide up</option>
    //       <option value='down'>⬇️ slide down</option>
    //       <option value='right'>➡️ slide right</option>
    //       <option value='left'>⬅️ slide left</option>
    //   </select>`)
    // ),
    // $(`<div></div>`).append(
    //   $(`<label for='select_language'>Select language</label>`),
    //   $(`<select class="_icon" id='select_language'></select>`)
    //   .on(
    //     'change',
    //       function() {
    //         socket.emit('change current language', {language : this.value});
    //         currentLanguage = this.value;
    //         var url = `/data/visual_${this.value}.json`;
    //         $.getJSON(url, function(data) {
    //           scenes = data;
    //           displayVisual();
    //         });
    //       }
    //   )
    // ),
    // $(`<div></div>`).append(
    //   $(`<label for='select_language'>Create QR code image</label>`),
    //   $(`<input type='text' id='QR_input'></inpuut>`),
    //   $(`<button type='file'>Save</button>`)
    //   .on(
    //     'click',
    //       function() {
    //         socket.emit('create qr code', {src : $('#QR_input')[0].value});
    //         $('#QR_input')[0].value = '';
    //       }
    //   )
    // )
  )
);

// socket.on('QR code response', function(data){
//   alert(data.message)
// })

// $('#layout').append(
//   $(`<div class="box-v"></div>`).append(
//     $(`<button class="_icon">Define layout</button>`).on(
//       'click',
//       function(e) {
//         e.preventDefault();
//         document.getElementById("layout_modal").style.display = "block";
//       }
//     ),
//     $(`<button class="_icon">Restore to default</button>`).on(
//       'click',
//       function() {
//         setDefaultMainScreenLayout();
//       }
//     )   
//   )
// );

/* Shortcuts
============ */
var disabledCombos = ['ctrl+left', 'ctrl+right', 'y', 'n'];

Mousetrap.prototype.stopCallback = function(e, element, combo) {
  return (
    disabledCombos.includes(combo) &&
    (element.tagName == 'INPUT' ||
      element.tagName == 'SELECT' ||
      element.tagName == 'TEXTAREA' ||
      (element.contentEditable && element.contentEditable == 'true'))
  );
};

// var shortcuts = {
//   'ctrl+s': [
//     'Sauvegarder le visual novel',
//     function() {
//       $('#visual__save').click();
//       return false;
//     },
//     '#visual__save'
//   ],
//   'ctrl+del': [
//     "Supprimer la scène ou l'étape active",
//     function() {
//       $('#visual__delete').click();
//       return false;
//     },
//     '#visual__delete'
//   ],
//   'alt+e': [
//     'Ajouter une étape',
//     function() {
//       $('#visual__add_step').click();
//       return false;
//     },
//     '#visual__add_step'
//   ],
//   'alt+s': [
//     'Ajouter une scène',
//     function() {
//       $('#visual__add_scene').click();
//       return false;
//     },
//     '#visual__add_scene'
//   ],
//   'ctrl+left': [
//     "Lancer l'étape suivante du visual novel",
//     function() {
//       $('#visual__prev').click();
//       return false;
//     },
//     '#visual__prev'
//   ],
//   'ctrl+right': [
//     "Lancer l'étape precedente du visual novel",
//     function() {
//       $('#visual__next').click();
//       return false;
//     },
//     '#visual__next'
//   ],
//   'ctrl+enter': [
//     "Lancer l'écran en cours d'édition",
//     function() {
//       if (document.activeElement.form) {
//         var $form = $(document.activeElement.form);
//         if (
//           $form.hasClass('box-screen') ||
//           $form[0].id === 'boite' ||
//           $form[0].id === 'one_shot'
//         ) {
//           $form.submit();
//         }
//       }
//       return false;
//     }
//   ],
//   'ctrl+shift+enter': [
//     'Lancer tout les écrans',
//     function() {
//       sendScreens();
//       return false;
//     },
//     '#send_all_screens'
//   ],
//   y: [
//     'Valide le 1er message de la liste de moderation',
//     function() {
//       $('.message_moderation')
//         .first()
//         .find('.btn_yes')
//         .click();
//     }
//   ],
//   n: [
//     'Invalide le 1er message de la liste de moderation',
//     function() {
//       $('.message_moderation')
//         .first()
//         .find('.btn_no')
//         .click();
//     }
//   ]
// };

// var $shortcuts = $('#shortcuts');
// $.each(shortcuts, function(key, val) {
//   Mousetrap.bind(key, val[1]);
//   if (val[2]) {
//     $(val[2]).attr('title', `${val[0]} (${key})`);
//   }
//   $shortcuts.append(`<div><strong>${key}</strong> : ${val[0]}</div>`);
// });

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

/* Presets
========== */
// var $presets = $('#presets');
// $presets.append(
//   $('<button><i>⚫</i> noir</button>').on('click', function() {
//     setCtrlScreens(
//       deepMerge({}, dummyStep, offStep, {
//         osc: {
//           message: 0
//         }
//       })
//     );
//   }),
//   $('<button disabled><i>📱</i> émoji téléphone</button>').on('click', function() {
//     // setCtrlScreen(
//     //   screens.emo,
//     //   deepMerge({}, defaultScreen, {
//     //     active: true,
//     //     texte: '📱',
//     //     mode: 'biggest_text'
//     //   })
//     // );
//   }),
//   $('<button><i>⏲</i> choix</button>').on('click', function() {
//     setCtrlScreens(
//       deepMerge({}, dummyStep, {
//         screen: {
//           active: true,
//           music: { src: 'Sons/chrono.wav', loop: true }
//         },
//         // emo: {
//         //   active: true,
//         //   texte: '📱',
//         //   mode: 'biggest_text'
//         // },
//         boite: {
//           type: 'choix'
//         }
//       })
//     );
//   }),
//   $('<button><i>🧙</i> final fantasy</button>').on('click', function() {
//     setCtrlScreen(
//       screens.screen,
//       deepMerge({}, defaultScreen, {
//         active: true,
//         mode: 'final_fantasy'
//       })
//     );
//   }),
//   $('<button><i>🖥</i>️ console</button>').on('click', function() {
//     setCtrlScreen(
//       screens.console,
//       deepMerge({}, defaultScreen, {
//         active: true,
//         mode: 'console'
//       })
//     );
//   })
// );

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

// $boites_types.on('dblclick', '.boite_label', function() {
//   $(this.form).submit();
// });

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

//   datalists.modes.data = Object.keys(modes);

//   /* Pages
//   ======== */
//   $.each(states.pages, function(key, val) {
//     var path = `@${val}`;
//     var file = `<div title="${path}" class="file">${path}</div>`;
//     medias.pages.append(file);
//     datalists.decors.data.push(path);
//   });


//   /* Css
//   ====== */
//   var decorsStyleSheet = document.styleSheets[1].cssRules;
//   [...decorsStyleSheet].forEach(val => {
//     var styles = [...val.style];
//     val = val.selectorText;
//     if (val) {
//       var file = `<div title="${val}" class="file">${val}</div>`;
//       if (styles.includes('background-color') || styles.includes('background-image')) {
//         medias.decors.append(file);
//         datalists.decors.data.push(val);
//       } else {
//         medias.styles.append(file);
//         datalists.styles.data.push(val);
//       }
//     }
//   });

//   /* Media
//   ======== */
//   $.each(states.media, function(key, val) {
//     var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;
//     // var file = `<div title="${val}" class="file">${val}</div>`;
//     if (
//       val.toLowerCase().endsWith('.wav') ||
//       val.toLowerCase().endsWith('.flac') ||
//       val.toLowerCase().endsWith('.mp3') ||
//       val.toLowerCase().endsWith('.ogg')
//     ) {
//       medias.audio.append(file);
//       datalists.musics.data.push(val);
//     } else if (
//       val.toLowerCase().endsWith('.jpeg') ||
//       val.toLowerCase().endsWith('.jpg') ||
//       val.toLowerCase().endsWith('.png') ||
//       val.toLowerCase().endsWith('.svg') ||
//       val.toLowerCase().endsWith('.webp') ||
//       val.toLowerCase().endsWith('.jfif') 
//     ) {
//       medias.images.append(file);
//       datalists.decors.data.push(val);
//     }  else if (
//       val.toLowerCase().endsWith('.html')
//     ) {
//       medias.layouts.append(file);
//       datalists.decors.data.push(val);
//     } else if (
//       val.toLowerCase().endsWith('.gif') //
//     ) {
//       medias.gifs.append(file);
//       datalists.decors.data.push(val);
//     } else if (
//       val.toLowerCase().endsWith('.webm') ||
//       val.toLowerCase().endsWith('.mp4') ||
//       val.toLowerCase().endsWith('.mov') ||
//       val.toLowerCase().endsWith('.wmv') ||
//       val.toLowerCase().endsWith('.avi') ||
//       val.toLowerCase().endsWith('.ogv')
//     ) {
//       medias.video.append(file);
//       datalists.decors.data.push(val);
//     }
//   });

//   datalistsWrite();
// }

/* Screens
========== */
// var $screens = $('#screens');
// var tmpl_screen__ctrl = $('#tmpl_screen__ctrl').html();

var isRepetMode = true;

// var screenName = {
//   screen: '<i>📽️</i> SCREEN',
//   // emo: '<i>📺</i> EMO',
//   laptop: '<i>💻</i> LAPTOP',
//   console: '<i>🖥️</i> CONSOLE'
// };

// displayScreens();

// var screens = {
//   // console: $('#console'),
//   // screen: $('#screen'),
//   // emo: $('#emo'),
//   // laptop: $('#laptop'),
//   boite: $('#boite'),
//   osc: $('#osc'),
//   // saut: $('#saut'),
//   // mainScreen: $('#main-screen-layout')
// };

// var defaultScreen = {};
// var defaultBoite = getFormValues(screens.boite[0], true);
// var defaultOsc = getFormValues(screens.osc[0], true);
// // var defaultSaut = getFormValues(screens.saut[0], true);
// // var defaultMainScreen = getFormValues(screens.mainScreen[0], true);

// var dummyStep = {
//   console: defaultScreen,
//   screen: defaultScreen,
//   // emo: defaultScreen,
//   laptop: defaultScreen,
//   boite: defaultBoite,
//   osc: defaultOsc,
//   // saut: defaultSaut,
//   // mainScreen: defaultMainScreen
// };

// var cleanedStep = cleanStep(deepMerge({}, dummyStep));
// cleanedStep.osc.message = '';

// var offStep = {
//   console: { active: false },
//   screen: { active: false },
//   // emo: { active: false },
//   laptop: { active: false }
// };

// function cleanStep(step) {
//   if (typeof step === 'object') {
//     $.each(step, (key, val) => {
//       if (val === '') step[key] = ' ';
//       else step[key] = cleanStep(step[key]);
//     });
//   }
//   return step;
// }

// function displayScreen(name) {
//   return $(
//     `<form id="${name}" class="box-h box-screen" autocomplete="off"></form>`
//   ).append(
//     $(`<div class="box-v box-min"><div class="button_radio _box-min">
//         <label>
//           <input checked type="checkbox" name="active" />
//           <span>${screenName[name]}</span>
//         </label>
//       </div>
//       <!--<button class="change_screen_rotation box-min icon toggle">📐</button>-->
//       </div>`),
//     $(`${tmpl_screen__ctrl}`),
//     $(`<button class="icon" type="submit">📢</button>`),
//   )
// }

// function displayScreens() {
//   $screens.append(
//     displayScreen('console'),
//     displayScreen('screen'),
//     // displayScreen('emo'),
//     displayScreen('laptop')
//   );
//     $(`#console`).find('.avatars-on').remove();
//     $(`#console`).find('.avatars-off').remove();
//     $(`#console`).find('#avatars_area').remove();
//     $(`#laptop`).find('.avatars-on').remove();
//     $(`#laptop`).find('.avatars-off').remove();
//     $(`#laptop`).find('#avatars_area').remove();
// }

// var lastFocused;
// function setEdit(val) {
//   lastFocused = document.activeElement;
//   lastFocused.value = val;
//   setTimeout(function() {
//     lastFocused.focus();
//     $(lastFocused).trigger('input');
//   }, 0);
// }

// function walkSteps($step) {
//   var $parent = $step.parent();
//   var data = deepMerge({}, cleanedStep);
//   $parent.find('.scene__step').each(function() {
//     var val = normalizeStep($(this).data('val'));
//     if ('boite' in val === false) val.boite = defaultBoite;
//     data = deepMerge(data, val);
//     if (this === $step[0]) {
//       return false;
//     } else {
//       if (data.console && 'active' in data.console) delete data.console.active;
//       if (data.screen && 'active' in data.screen) delete data.screen.active;
//       // if (data.emo && 'active' in data.emo) delete data.emo.active;
//       if (data.laptop && 'active' in data.laptop) delete data.laptop.active;
//     }
//   });
//   return data;
// }

// function getScreen(name) {
//   if (name in screens) {
//     return getFormValues(screens[name][0]);
//   }
// }

// function getScreens() {
//   return {
//     // emo: getScreen('emo'),
//     screen: getScreen('screen'),
//     console: getScreen('console'),
//     laptop: getScreen('laptop'),
//     boite: getScreen('boite'),
//     osc: getScreen('osc'),
//     saut: getScreen('saut'),
//     mainScreen: getScreen('mainScreen')
//   };
// }

// function fecthScreens() {
//   var $step = $('.scene__step.active');
//   return $step.length ? walkSteps($step) : getScreens();
// }

function addRepetData(data) {
  if (isRepetMode) {
    var time = $('#repet__min')
      .val()
      .trim();
    if (time !== '') time = Number($('#repet__min').val()) * 60;
    data.repet = {
      time: time,
      pause: $('.repet__pause').hasClass('active')
    };
  }
  return data;
}

// function addEtapeSlideEffect(data) {
//   if ($('#select_effect').val() !== 'none') {
//     data['screen']['effect'] = $('#select_effect').val();
//   }
//   return data;
// }

// function addExtraData(data) {
//   // addSelectedUsersData(data);
//   addRepetData(data);
//   addEtapeSlideEffect(data);
//   return data;
// }

// function sendScreen(name) {
//   var data = fecthScreens();
//   var out = {};
//   out[name] = data[name];
//   console.log(out)
//   socket.emit('step', addExtraData(out));
// }

// function sendScreens() {
//   var data = fecthScreens();
//   socket.emit('step', addExtraData(data));
//   if (boite && 'send' in boite) boite.send();
// }

// $('.radio_fit').on('input', function() {
//   $(this.form)
//     .find('.sp-preview-inner')
//     .css(
//       'background-size',
//       $(this.form)
//         .find('.radio_fit:checked')
//         .val()
//     );
// });

// $('.color-picker')
//   .on('input', function() {
//     var $this = $(this);
//     var val = $this.val();

//     var $prev = $(this)
//       .next()
//       .find('.sp-preview-inner');

//     $prev[0].className = 'sp-preview-inner';
//     $prev.css('background-color', '');
//     $prev.css('background-image', '');

//     if (val.startsWith('.')) {
//       $prev.addClass(val.slice(1));
//     } else {
//       $prev.css('background-color', val);
//       $prev.css('background-image', `url(/data/media/${val})`);
//     }
//   })
//   .spectrum({
//     showAlpha: true,
//     allowEmpty: true,
//     showPalette: true,
//     showInitial: true,
//     preferredFormat: 'hex3',
//     // prettier-ignore
//     palette: [
//         ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
//         ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
//         ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
//         ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
//         ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
//         ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
//         ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
//         ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
//       ],
//     change: function() {
//       $(this).trigger('input');
//     }
//   });

// $('#send_all_screens').on('click', sendScreens);

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
var $visual = $('#visual');
let mainData = {};
let active = {
    fileName : "",
    scene : "",
    step : ""
}

socket.on('initial json', function(data) {
  setJSONsdata(data);
});


function setJSONsdata(data) { 
  mainData = {};
  // let count = 0;
  $('#visual').empty();
  $('#visual')
  .append('<select id="select-novel"><option selected disabled>Select visual novel</option></select>')
  .append(`<button id="refresh_visual" class="icon box-min" title="Refresh data" onclick="refreshVisual()">
            <img src='icons/refresh.png'></img>
          </button>`)

  $('#select-novel').change(function(){
    $('#visual .show').hide();
    $(`#visual #${$(this).val()}`).show();
  });
   
  const sorted = data.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  sorted.forEach(async(src) => {
      await $.getJSON(src.replace('frontend', '.'), function(jsonData) {
          let array = src.split('/');
          let fileName = array[array.length -1].replace('.json', '');
          mainData[fileName] = jsonData;
          displayStructure(fileName, jsonData);
          // count = count + 1;
          // if (count === data.length) {
          //      // CLICK ON ACTIVE ITEM 
          //      const currentActive = {"fileName" : active.fileName, "step" : active.step, "scene" : active.scene};
          //     if (currentActive.fileName !== "") {
          //         $(`#${currentActive.fileName} .show-name`).click();
          //         if (currentActive.scene !== "") {
          //             $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] .toggler`).click();
          //             if (currentActive.step !== "") {
          //                 $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] li[data-step=${currentActive.step}]`).click();
          //             }
          //         } 
          //     }
          // }
      })    
  });
}

function getFileName(src) {
  return src.split('/')[src.split('/').length -1]
}

// FUNCTION TO MAKE TEMPORARY RANDOM STRING IDs TO CONNECT ALL ELEMENTS
function createRandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function refreshVisual() {
  socket.emit('refresh visual');
}


function setActiveStep(fileName, scene, step) {
  active.fileName = fileName;
  active.scene = scene;
  active.step = step;
}

function displayStructure(fileName, data) {
  let showElement =  `<ul id=${fileName} class="show" style="display: none;">
                          <li class="show-name"><b><u>${data.name}</u></b></li>
                          <li><select class="languages"></select></li>
                          <li>
                              <ul id=${fileName + 'sceneList'} class="scenes"></ul>
                          </li>
                      </ul>`
  $('#visual').append(showElement);
  $('#select-novel').append(`<option value=${fileName}>${data.name}</option>`)


  // APPEND AVAILABLE LANGUAGES
  $.each(data.languages, function(key, value) {   
      $('#' + fileName).find('select')
          .append($("<option></option>")
                     .attr("value", key)
                     .text(value)); 
 });

  // APPEND SCENES AND STEPS IF PRESENT
  if (!jQuery.isEmptyObject( data.scenes )  ) {
  const sceneOrder = data['scene-order'];
  sceneOrder.forEach(sceneOrderNumber => {

      let scene = data['scenes'][sceneOrderNumber];
      const stepOrder = scene['step-order'];

      const id = createRandomString(5);
      $(`<li style="margin-top: 10px;" data-scene=${sceneOrderNumber}>
          <b id=${id + 'toggler'} class="toggler">${scene.name}</b>
          </li>`).appendTo(`#${fileName + 'sceneList'}`)
      .append(`<ul id=${id} style="display: none" class="steps"></ul>`);

      let number = 1;
      stepOrder.forEach(stepOrderNumber => {
          $("#" + id).append(`<li class="step" data-step=${stepOrderNumber} onclick="setStep(event, '${fileName}', ${sceneOrderNumber}, ${stepOrderNumber})">Step ${number}</li>`)
          number = number + 1;
      })

      // DEFINE SORTABLE FUNCTIONS FOR SCENES
      // $('#' + fileName + 'sceneList').sortable({
      //     start : function (event, ui) {
      //         startPosition = ui.item.index();
      //      },
      //      stop: function(event, ui) {
      //         let endPosition = ui.item.index();
      //         if (endPosition !== startPosition) {
      //             // ADJUST MAIN DATA
      //             let movedElement = mainData[fileName]['scene-order'].splice(startPosition, 1)[0];
      //             mainData[fileName]['scene-order'].splice(endPosition, 0, movedElement);
      //             // SAVE TO JSON
      //             saveSceneOrder(fileName, mainData[fileName]['scene-order']);
      //         }
      //      }
      // })

      // DEFINE SORTABLE FUNCTIONS FOR STEPS
      // $("#" + id).sortable({
      //     start : function (event, ui) {
      //        startPosition = ui.item.index();
      //     },
      //     stop: function(event, ui) {
      //         let endPosition = ui.item.index();
      //         if (endPosition !== startPosition) {
      //             // ADJUST MAIN DATA
      //             let movedElement = mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(startPosition, 1)[0];
      //             mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(endPosition, 0, movedElement);
      //             // SAVE TO JSON
      //             saveStepOrder(fileName, sceneOrderNumber, mainData[fileName]['scenes'][sceneOrderNumber]['step-order']);

      //             // ADJUST TEXT STEP number IN HTML
      //             $(ui.item).text('Step ' + (endPosition + 1));
      //             $(function () {
      //                 let currentLi = ui.item;
      //                 let number = endPosition;

      //                 while (number > 0) {
      //                     $(currentLi).prev().text('Step ' + number);
      //                     currentLi = $(currentLi).prev();
      //                     number = number - 1;
      //                 }       
                      
      //                 currentLi = ui.item;
      //                 number = endPosition + 2;

      //                 while (number <= ui.item.parent().children().length) {
      //                     $(currentLi).next().text('Step ' + number);
      //                     currentLi = $(currentLi).next();
      //                     number = number + 1;
      //                 }
      //             });
      //         }
      //     }
      // });    

      // DEFINE TOGGLE FUNCTIONS FOR STEP LIST
      $("#" + id + "toggler").click(function() {
          $(".toggler").not(this).nextAll().hide();
          // $( "#" + id ).toggle();
          $(this).nextAll().toggle();
          
          $(".toggler").not(this).removeClass('active');
          $(this).toggleClass('active');

          // MARK ACTIVE SCENE in constant active and by color in menu
          if ($(this).hasClass('active')) {
              setActiveStep(fileName, sceneOrderNumber, "");
              $(".show-name").removeClass('active');
              $(`#${fileName} .show-name`).addClass('active');
              $(".step").removeClass('active');
          } else {
              setActiveStep(fileName, "", "");
              $(".step").removeClass('active');
          }
          // $('#step-media ul').empty();
          // $('#preview').empty();
          // $('#console-checkbox').prop('checked', false);
          // $('#boite-checkbox').prop('checked', false);
      });
  })
}
   // TOGGLE SHOW
   $(`#${fileName} .show-name`).click(function(){
      // toggle visibility
      $(".show").not(`#${fileName}`).children().not('.show-name').hide();
      $(`#${fileName}`).children().not('.show-name').toggle();
      
      // toggle class
      $(".show-name").not(this).removeClass('active');
      $(this).toggleClass('active');

      // close all scenes
      $(".toggler").next().hide();

      // unmark all scenes and steps
      $(".toggler").removeClass('active');
      $(".step").removeClass('active');

      // MARK ACTIVE SHOW in constant active and by color in menu
      if ($(this).hasClass('active')) {
          setActiveStep(fileName, "", "");
      } else {
          setActiveStep("", "", "");
      }
      // $('#step-media ul').empty();
      // $('#preview').empty();
      // $('#console-checkbox').prop('checked', false);
      // $('#boite-checkbox').prop('checked', false);
  })
  
}

function setStep(e, fileName, scene, step) {
  $(".step").not(e.target).removeClass('active');
  // $(e.target).parent().find('.structure-buttons').remove();
  $(e.target).toggleClass('active');

  // CLEAR PREVIOUS  STEP DATA LIST
  // $('#step-media ul').empty();
  // $('#console-checkbox').prop('checked', false);
  // $('#boite-checkbox').prop('checked', false);

  if($(e.target).hasClass('active')) {
      setActiveStep(fileName, scene, step);

      // APPEND clone and delete buttons
      // $(e.target).append(`<div class="structure-buttons">
      //                         <span onclick="duplicate('step')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
      //                         <span onclick="deleteFromStructure('step')"><img src="./icons/trash.svg"></img></span>
      //                     </div>`)

      $.getJSON('./data/json/' + fileName + '.json', function(jsonData) {
        const stepData = jsonData['scenes'][scene]['steps'][step];
        console.log(stepData);
        if ('boite' in stepData) {
          $(`#boite input[value=${stepData.boite.type}]`).click();
          setBoite(stepData.boite);
        }
       
        
        socket.emit('step', stepData);
          // const mediaOrder = jsonData['scenes'][scene]['steps'][step]['screen']['media-order'];
          // const stepMedia = jsonData['scenes'][scene]['steps'][step]['screen']['media'];
          
          // clearUnwantedMedia(stepMedia);
          // for (let data_key of mediaOrder) {
          //     // DISPLAY MEDIA IN MEDIA LIST
          //     let liName;
          //     if (stepMedia[data_key]['type'] === 'media_images' || stepMedia[data_key]['type'] === 'media_video' || stepMedia[data_key]['type'] === 'media_gifs') {
          //         liName = getFileName(stepMedia[data_key]['attributes']['src']);
          //     } else {
          //         liName = stepMedia[data_key]['type']
          //     }
          //     const li = `<li data-key=${data_key} data-type=${stepMedia[data_key]['type']} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${liName}</li>`;
          //     $('#step-media ul').append(li);
          //     // DISPLAY STEP IN MEDIA PREVIEW
          //     setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
          // }
          // applyZIndexes();
          // setElements("", "console", "", jsonData['scenes'][scene]['steps'][step]['screen']['console']);
          // setElements("", "music", "", jsonData['scenes'][scene]['steps'][step]['screen']['music']);
      }) 
  } else {
      setActiveStep(fileName, scene, ""); 
      socket.emit('step', offStep);
      // $('#preview').empty();
  }
}


// function checkSceneName(titre) {
//   var ok = true;
//   $('.scene__toggle').each(function() {
//     if ($(this).text() === titre) ok = false;
//   });

//   if (!ok) {
//     alert('Ce nom de scene existe déjà');
//     return false;
//   }

//   return true;
// }

// function getSceneName(msg = 'Titre', def) {
//   var titre = prompt(msg, def);
//   if (titre) {
//     titre = titre.trim();
//     var ok = checkSceneName(titre);
//     if (ok) return titre;
//   }
//   return false;
// }

// function scrollToStep($step) {
//   var $scene = $step.parent().parent();
//   if ($scene.hasClass('closed')) {
//     $('#visual__closeall').click();
//     $scene.removeClass('closed');
//   }
//   $visual.scrollTo($step, {
//     offset: -1 * ($visual.height() / 2),
//     over: { top: 0.5 },
//     duration: 200
//   });
// }

// function normalizeStep(val) {
//   var data =
//     typeof val === 'string'
//       ? {
//           screen: { texte: val },
//           // emo: {},
//           console: {},
//           laptop: {},
//           boite: {},
//           osc: {},
//           mainScreen: {}
//         }
//       : val;

//   ['screen', 'console', 'laptop'].forEach(item => {
//     if (item in data && 'decor' in data[item]) {
//       data[item].decor.fit = data[item].decor.fit || 'cover';
//     }
//   });

//   return data;
// }

// function normalizeSeq(val) {
//   var val = normalizeStep(val);
//   // var screenValues = defaultScreen;
//   // screenValues.avatars = $('input[name=avatars]:checked', '#screen').val();

//   var tmp = {
//     screen: deepMerge({}, defaultScreen, val.screen),
//     // emo: deepMerge({}, defaultScreen, val.emo),
//     console: deepMerge({}, defaultScreen, val.console),
//     laptop: deepMerge({}, defaultScreen, val.laptop),
//     boite: deepMerge({}, defaultBoite, val.boite),
//     osc: deepMerge({}, dummyStep.osc, val.osc),
//     saut: deepMerge({}, dummyStep.saut, val.saut),
//     mainScreen: deepMerge({}, dummyStep.mainScreen, val.mainScreen)
//   };

//   return tmp;
// }

// function setCtrlScreen($dest, data) {
//   if (data) setFormValues($dest[0], data);
// }

// function setCtrlScreens(data) {
//   // setCtrlScreen(screens.emo, data.emo);
//   setCtrlScreen(screens.screen, data.screen);
//   setCtrlScreen(screens.console, data.console);
//   setCtrlScreen(screens.laptop, data.laptop);
//   setCtrlScreen(screens.boite, data.boite);
//   setCtrlScreen(screens.osc, data.osc);
//   setCtrlScreen(screens.saut, data.saut);
//   setCtrlScreen(screens.mainScreen, data.mainScreen);
// }

// function activateStep($this) {
//   $('.scene__radio:checked').prop('checked', false);
//   $('.scene__step').removeClass('active');
//   $this.addClass('active');
//   setCtrlScreens(normalizeSeq($this.data('val')));
// }

// function walkStep(data, def) {
//   var out = {};
//   Object.entries(data).forEach(([key, val]) => {
//     if (typeof val === 'object' && key in def) {
//       var res = walkStep(val, def[key]);
//       if (Object.keys(res).length) out[key] = res;
//     } else if (def[key] !== val) out[key] = val;
//   });
//   return out;
// }

// function serialiseStep(val) {
//   if (typeof val === 'object') {
//     val = walkStep(val, dummyStep);
//     if (
//       Object.keys(val).length === 1 &&
//       'screen' in val &&
//       Object.keys(val.screen).length === 1 &&
//       'texte' in val.screen
//     ) {
//       val = val.screen.texte;
//     }
//     // if (val.emo && val.emo.active === false) val.emo = { active: false };
//     if (val.screen && val.screen.active === false) val.screen = { active: false };
//     if (val.console && val.console.active === false) val.console = { active: false };
//     if (val.laptop && val.laptop.active === false) val.laptop = { active: false };
//   }
//   return val;
// }

// function stringifyStep(val) {
//   return JSON.stringify(val, null, 2);
// }

// function displayStep(val) {
//   val = serialiseStep(val);
//   // val1 = adjustStepForCurrentLanguage(val);
//   return $('<div class="scene__step">')
//     .data({
//       val: val,
//       original: val,
//       saved: []
//     })
//     .append(
//       $('<span class="scene__step__json"></span>').text(stringifyStep(val)),
//       $(`<button class="scene__step__reset no_btn icon">↩️</button>`).attr(
//         'title',
//         'Rétablir les précédentes sauvegardes de cette étape'
//       )
//     );
// }


// function adjustStepForCurrentLanguage(item){
//   // $.each(a[0], function(key, x) {
//     // x.forEach(function(item) {
//       if (typeof item === 'string') {
//         return item;
//         // results += item + '\n';
//       } else {
//         var stepObject = item;
//         $.each(item, function(key, y) {
//           if (typeof y !== 'string') {
//             if ('texte' in y) {
//               if (typeof y.texte !== 'string') {
//                 if (currentLanguage in y.texte) {
//                   stepObject[key].texte = y.texte[currentLanguage];
//                 } else {
//                   // stepObject[key].texte = y.texte[defaultLanguage];
//                   stepObject[key].texte = `NO TRANSLATION!`
//                 }
//               }
//             } else if ('arg' in y) {
//               if (typeof y.arg !== 'string') {
//                 if (currentLanguage in y.arg) {
//                   stepObject[key].arg = y.arg[currentLanguage];
//                 } else {
//                   // stepObject[key].texte = y.texte[defaultLanguage];
//                   stepObject[key].arg = `NO TRANSLATION!`
//                 }
//               }
//             }
//           } else {
//             if (currentLanguage in item) {
//               stepObject = item[currentLanguage];
//             } else {
//               // stepObject = item[defaultLanguage];
//               stepObject = `NO TRANSLATION!`
//             }
//           }
//         });
//         return stepObject;
//       }
//     // });
//   // });
// }

// function displaySteps(seq) {
//   if (!seq) return;
//   var out = [];
//   $.each(seq, function(key, val) {
//     out.push(displayStep(val));
//   });
//   return out;
// }

// function displayScene(key, val) {
//   return $(`<div class="scene${states.visual.current === key ? '' : ' closed'}">`).append(
//     $(`<input class="scene__radio" name="scene__radio" type="radio">`),
//     $(`<b class="scene__toggle">${key}</b>`),
//     $(`<div data-key="${key}" class="scene__content"></div>`)
//       .append(displaySteps(val))
//       .sortable({
//         axis: 'y'
//       })
//   );
// }

// function addScene(key, val) {
//   $visual.append(displayScene(key, val));
// }

// function displaySaut() {
//   $('#saut_select').empty();
//   $('#saut_select').append(`<option value="">...</option>`);
//   $('.scene__content').each(function() {
//     var key = $(this).data('key');
//     $('#saut_select').append(`<option>${key}</option>`);
//   });
// }

// function displayVisual() {
//   $visual.empty();
//   $.each(scenes, addScene);
//   $visual.sortable({
//     handle: 'b',
//     axis: 'y'
//   });
//   displaySaut();
// }

// $('#visual__save').on('click', function() {
//   var data = {};
//   $('.scene__content').each(function() {
//     var $this = $(this);
//     var key = $this.data('key');
//     var steps = [];
//     data[key] = steps;

    
//       $this.find('.scene__step').each(function(index, value) {
//         $line = $(this);
//         var val = $line.data('val');
//         val = serialiseStep(val);
             
//         steps.push(val);
//         var saved = $line.data('saved');
//         saved.push(val);
//         $line.data('saved', saved);
//       });
//   });
//   socket.emit('save', data);
// });


// $('#visual__add_scene').on('click', function() {
//   $('#visual__closeall').click();
//   var titre = getSceneName('Nom de la nouvelle scène');
//   if (!titre) return;

//   var $scene = displayScene(titre, ['']);
//   var $prevScene = $('.scene__radio:checked');
//   if ($prevScene.length) {
//     $prevScene.parent().after($scene);
//   } else {
//     $visual.append($scene);
//   }
//   $scene.find('.scene__radio').click();
//   $scene.find('.scene__toggle').click();
//   displaySaut();
//   socket.emit('new scene name', titre);
// });

// $('#visual__add_step').on('click', function() {
//   var $step = displayStep('');
//   var $prevStep = $('.scene__step.active');
//   if ($prevStep.length) $prevStep.after($step);
//   else {
//     var $prevScene = $('.scene__radio:checked');
//     if ($prevScene.length) {
//       $prevScene
//         .parent()
//         .find('.scene__content')
//         .append($step);
//     } else {
//       $('.scene__content')
//         .last()
//         .append($step);
//     }
//   }
//   $step.click();
//   scrollToStep($step);
// });

// $('#visual__openall').on('click', function() {
//   $('.scene').removeClass('closed');
// });

// $('#visual__closeall').on('click', function() {
//   $('.scene').addClass('closed');
// });

// $('#visual__rename').on('click', function() {
//   var $scene = $('.scene__radio:checked').parent();
//   if ($scene.length) {
//     var $content = $scene.find('.scene__content');
//     var titre = getSceneName('Nouveau nom pour la scène', $content.data('key'));
//     if (!titre) return;
//     $scene.find('.scene__toggle').text(titre);
//     $content.data('key', titre).attr('data-key', titre);
//   }
// });

// $('#visual__clone').on('click', function() {
//   var $step = $('.scene__step.active');
//   if ($step.length) {
//     var $clone = $step.clone(true);
//     $step.after($clone);
//     $clone.click();
//   } else {
//     var $scene = $('.scene__radio:checked').parent();
//     if ($scene.length) {
//       var $content = $scene.find('.scene__content');
//       var titre = getSceneName('Nom pour la copie', $content.data('key') + '-2');
//       if (!titre) return;
//       var $clone = $scene.clone(true);
//       $scene.after($clone);
//       $clone.find('.scene__toggle').text(titre);
//       $clone.find('.scene__content').data('key', titre);
//       $clone.find('.scene__radio').prop('checked', true);
//     }
//   }
// });

// $('#visual__delete').on('click', function() {
//   var $step = $('.scene__step.active');
//   if ($step.length) {
//     var $next = $step.next();
//     if ($next.length === 0) $next = $step.prev();
//     $step.remove();
//     $next.click();
//   } else {
//     var $scene = $('.scene__radio:checked').parent();
//     if ($scene.length) {
//       var $next = $scene.next();
//       if ($next.length === 0) $next = $scene.prev();
//       $scene.remove();
//       $next.find('.scene__radio').click();
//     }
//   }
// });

$('#visual__next').on('click', function() {
  // var $current = $('.scene__step.active');
  // var val = $current.data('val');
  // if (val && typeof val === 'object' && 'saut' in val && 'scene' in val.saut) {
  //   var $next = $(
  //     `.scene__content[data-key="${val.saut.scene}"] .scene__step:first-child`
  //   );
  //   if ($next.length) {
  //     activateStep($next);
  //     scrollToStep($next);
  //     sendScreens();
  //   }
  //   return;
  // }

  // var $next = $current.next();
  // if ($next.length === 0) return;
  // activateStep($next);
  // scrollToStep($next);
  // sendScreens();
  if (active.step !== '') {
    $(`#visual #${active.fileName} [data-scene=${active.scene}] [data-step=${active.step + 1}]`).click();
  }

});

$('#visual__prev').on('click', function() {
  if (active.step !== '') {
    $(`#visual #${active.fileName} [data-scene=${active.scene}] [data-step=${active.step - 1}]`).click();
  }
  // var $current = $('.scene__step.active');
  // var $next = $current.prev();
  // if ($next.length === 0) return;
  // activateStep($next);
  // scrollToStep($next);
  // sendScreens();
});

$visual
  // .on('click', function(e) {
  //   if (e.target === $visual[0] || e.target.classList.contains('scene')) {
  //     $('.scene__radio').prop('checked', false);
  //     $('.scene__step').removeClass('active');
  //   }
  // })
  // .on('click', '.scene__radio', function() {
  //   $('.scene__step').removeClass('active');
  // })
  // .on('click', '.scene__step', function() {
  //   activateStep($(this));
  // })
  // .on('dblclick', '.scene__step', function() {
  //   activateStep($(this));
  //   sendScreens();
  // })
  // .on('click', '.scene__step__reset', function(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   var $step = $(this).parent();
  //   var saved = $step.data('saved');
  //   var val = saved.pop() || $step.data('original');
  //   $step
  //     .data('val', val)
  //     .find('.scene__step__json')
  //     .text(stringifyStep(val));
  //   $step.click();
  // });

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
  var $imageInput = $(`<input type="file" style="display: none;" id="image-file"></input>`);
  $reponses.append(
    $btn.on('click', function(e) {
      e.preventDefault();
      $('#image-file').click();
    }),
    $imageInput.on('change', function (e) {
      var data = e.originalEvent.target.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $('#image-msg')[0].src = '';
        $('#image-msg')[0].src = evt.target.result;
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
  // .on('input', 'form', function() {
  //   if (this.id === 'form_osc_ip') return;
  //   var data = getScreens();
  //   if (this.id === 'boite' && 'boite' in data) {
  //     if (data.boite.type === 'gifs') {
  //       $('#boite').find('textarea').val($('#avatars_area').val());
  //     }
  //     setBoite(data.boite);
  //   }
  //   var $step = $('.scene__step.active');
  //   if ($step.length) {
  //     var val = serialiseStep(data);
  //     $step
  //       .data('val', val)
  //       .find('.scene__step__json')
  //       .text(stringifyStep(val));
  //   }
  // })
  .on('submit', 'form', function(e) {
    e.preventDefault();
    if (this.id === 'interactions') {
      let imageMessage = ''
      if ($('#image-msg').attr('src') !== '') {
        imageMessage = $('#image-msg')[0].outerHTML;
      };
      sendToSelectedUsers({
        type: 'message',
        texte: $one_shot__message.val() + imageMessage
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

// Get the modal
// var modal = document.getElementById("layout_modal");

// Get the button that opens the modal
// var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//   modal.style.display = "none";
// }

// window.onload = function() {
//   var console = document.getElementById("console-div");
//   initDragElement(console);
// }
// init drag option for console when iframe loaded
// $('#main-preview').load(function() {
//   var console = document.getElementById("console-div");
//   initDragElement(console);
// });

// SET PREVIEW

// function initDragElement(element) {
//   var pos1 = 0,
//       pos2 = 0,
//       pos3 = 0,
//       pos4 = 0;
    
//     // const iframe = document.getElementById("main-preview");
//     const dragElement = document.getElementById("drag");
//     dragElement.onmousedown = dragMouseDown;

//     function dragMouseDown(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // get the mouse cursor position at startup:
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       document.onmouseup = closeDragElement;
//       // call a function whenever the cursor moves:
//       document.onmousemove = elementDrag;
//   }

//    function elementDrag(e) {
//         e = e || window.event;
//         e.preventDefault();
//         // calculate the new cursor position:
//         pos1 = pos3 - e.clientX;
//         pos2 = pos4 - e.clientY;
//         pos3 = e.clientX;
//         pos4 = e.clientY;
      
//         const previewWindow = document.getElementById("preview-window");

//         const vw = parseInt(getComputedStyle(previewWindow).width);
//         const vh = parseInt(getComputedStyle(previewWindow).height);
//         element.style.top = Math.round((element.offsetTop - pos2)*100/vh) + "%";
//         element.style.left = Math.round((element.offsetLeft - pos1)*100/vw) + "%";
//     }

//     function closeDragElement() {
//         /* stop moving when mouse button is released:*/
//         document.onmouseup = null;
//         document.onmousemove = null;
//     }
// }

// function initResizeElement() {
//   var popups = document.getElementsByClassName("popup");
//   var element = null;
//   var startX, startY, startWidth, startHeight;

//   for (var i = 0; i < popups.length; i++) {
//     var p = popups[i];

//     var right = document.createElement("div");
//     right.className = "resizer-right";
//     p.appendChild(right);
//     right.addEventListener("mousedown", initDrag, false);
//     right.parentPopup = p;

//     var bottom = document.createElement("div");
//     bottom.className = "resizer-bottom";
//     p.appendChild(bottom);
//     bottom.addEventListener("mousedown", initDrag, false);
//     bottom.parentPopup = p;

//     var both = document.createElement("div");
//     both.className = "resizer-both";
//     p.appendChild(both);
//     both.addEventListener("mousedown", initDrag, false);
//     both.parentPopup = p;
//   }

//   function initDrag(e) {
//     element = this.parentPopup;

//     startX = e.clientX;
//     startY = e.clientY;
//     startWidth = parseInt(
//       document.defaultView.getComputedStyle(element).width,
//       10
//     );
//     startHeight = parseInt(
//       document.defaultView.getComputedStyle(element).height,
//       10
//     );
//     document.documentElement.addEventListener("mousemove", doDrag, false);
//     document.documentElement.addEventListener("mouseup", stopDrag, false);
//   }

//   function doDrag(e) {
//     element.style.width = startWidth + e.clientX - startX + "px";
//     element.style.height = startHeight + e.clientY - startY + "px";
//   }

//   function stopDrag() {
//     document.documentElement.removeEventListener("mousemove", doDrag, false);
//     document.documentElement.removeEventListener("mouseup", stopDrag, false);
//   }
// }

// function saveEtapeLayout() {
//   var consoleDiv = $('#console-div')[0];

//   // calculate width and height in %
//   var width = consoleDiv.style.width;
//   var height = consoleDiv.style.height;
//   const previewWindow = document.getElementById("preview-window");

//   if(width.includes('px')) {
//     const vw = parseInt(getComputedStyle(previewWindow).width);
//     width = Math.round(parseInt(width)*100/vw) + "%"; 
//   }

//   if(height.includes('px')) {
//     const vh = parseInt(getComputedStyle(previewWindow).height);
//     height = Math.round(parseInt(height)*100/vh) + "%"; 
//   } 

//   var data = {
//     "top" : consoleDiv.style.top,
//     "left" : consoleDiv.style.left,
//     "width" : width,
//     "height" : height
//   }
  
//   for(const property in data ) {
//     $('#' + property)[0].focus();
//     setEdit(data[property]);
//   }
//   document.getElementById("layout_modal").style.display = "none";
// }

// function setDefaultMainScreenLayout() {
//   var data = {
//     "top" : "75%",
//     "left" : "5%",
//     "width" : "25%",
//     "height" : "auto"
//   }

//   for(const property in data ) {
//     $('#' + property)[0].focus();
//     setEdit(data[property]);
//   }
// }


// QR code reader
// function getMediaStream() {
//   const controls = document.querySelector('.controls');
//   const cameraOptions = document.querySelector('.video-options>select');
//   const video = document.querySelector('#stream');
//   const buttons = [...controls.querySelectorAll('.streamControl')];
//   let streamStarted = false;

//   const [play, pause] = buttons;

//   const constraints = {
//   video: {
//       deviceId: ''
//   }
//   };

//   cameraOptions.onchange = () => {
//       constraints.video.deviceId = cameraOptions.value;
//   startStream(constraints);
//   };

//   play.onclick = () => {
//   if (streamStarted) {
//       video.play();
//       play.classList.add('d-none');
//       pause.classList.remove('d-none');
//       return;
//   }
//   if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
//       constraints.video.deviceId = cameraOptions.value;
//       startStream(constraints);
//   }
//   };

//   const pauseStream = () => {
//   video.pause();
//   play.classList.remove('d-none');
//   pause.classList.add('d-none');
//   };

//   pause.onclick = pauseStream;


//   const startStream = async (constraints) => {
//       controls.classList.add('d-none');
//       navigator.mediaDevices.getUserMedia( constraints )
//       .then( MediaStream => {
//           handleStream(MediaStream);
//       }).catch( error => {
//           console.log(error)
//       });
//   };


//   const handleStream = (stream) => {
//   video.srcObject = stream;
//   play.classList.add('d-none');
//   pause.classList.remove('d-none');
//   controls.classList.remove('d-none');
//   };


//   const getCameraSelection = async () => {
//   const devices = await navigator.mediaDevices.enumerateDevices();
//   const videoDevices = devices.filter(device => device.kind === 'videoinput');
//   const options = videoDevices.map(videoDevice => {
//       return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
//   });
//   cameraOptions.innerHTML = cameraOptions.innerHTML + options.join('');
//   };

//   getCameraSelection();
// }

// function readCode() {
//   import('./lib/qr-scanner/qr-scanner.min.js').then((module) => {
//     const QrScanner = module.default;
//     // do something with QrScanner
//     new QrScanner(document.getElementById('stream'), result => 
//     console.log('decoded qr code:', result));
//     qrScanner.start();
// });
// }

// function closeQRmodal() {
//   document.getElementById('QR_modal').style.display = 'none';
// }

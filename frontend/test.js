const data1 = {
    "media-order": [
        "RYkYB",
        "w6pUR",
        "GmCqM"
    ],
    "background-color": "rgb(0, 0, 0)",
    "media": {
        "RYkYB": {
            "type": "media_video",
            "css": {
                "width": "35%",
                "position": "absolute",
                "top": "6%",
                "left": "3%",
                "z-index": "5"
            },
            "attributes": {
                "src": "YoutubeBand/Screen1.webmhd.webm",
                "loop": false,
                "muted": false,
                "volume": 1
            },
            "content": "",
            "classes": []
        },
              "w6pUR": {
                  "type": "media_video",
                  "css": {
                      "width": "35%",
                      "position": "absolute",
                      "top": "7%",
                      "left": "46%",
                      "z-index": "4"
                  },
                  "attributes": {
                      "src": "YoutubeBand/Screen2.webmhd.webm",
                      "loop": false,
                      "muted": false,
                      "volume": 1
                  },
                  "content": "",
                  "classes": []
              },
              "GmCqM": {
                          "type": "media_video",
                          "css": {
                              "width": "35%",
                              "position": "absolute",
                              "top": "59%",
                              "left": "5%",
                              "z-index": "3"
                          },
                          "attributes": {
                              "src": "YoutubeBand/Screen3.webmhd.webm",
                              "loop": false,
                              "muted": false,
                              "volume": 1
                          },
                          "content": "",
                          "classes": []
                      }
    },
    "console": {
        "active": false,
        "css": {
            "width": "25%",
            "height": "95%",
            "position": "absolute",
            "top": "2.5%",
            "left": "5%",
            "z-index": "100",
            "display": "none"
        }
    },
    "boite": {
    "type": "no_phone",
    "arg": ""
},
"repet" : {}
}

// const data1 = {
//   "media-order": [
//       "RYkYB",
//       "w6pUR",
//       "GmCqM",
//       "wvXLR",
//       "wqLJS"
//   ],
//   "background-color": "rgb(0, 0, 0)",
//   "media": {
//       "RYkYB": {
//           "type": "media_video",
//           "css": {
//               "width": "35%",
//               "position": "absolute",
//               "top": "6%",
//               "left": "3%",
//               "z-index": "5"
//           },
//           "attributes": {
//               "src": "YoutubeBand/Screen1.webmhd.webm",
//               "loop": false,
//               "muted": false,
//               "volume": 1
//           },
//           "content": "",
//           "classes": []
//       },
//       "w6pUR": {
//           "type": "media_video",
//           "css": {
//               "width": "35%",
//               "position": "absolute",
//               "top": "7%",
//               "left": "46%",
//               "z-index": "4"
//           },
//           "attributes": {
//               "src": "YoutubeBand/Screen2.webmhd.webm",
//               "loop": false,
//               "muted": false,
//               "volume": 1
//           },
//           "content": "",
//           "classes": []
//       },
//       "GmCqM": {
//           "type": "media_video",
//           "css": {
//               "width": "35%",
//               "position": "absolute",
//               "top": "59%",
//               "left": "5%",
//               "z-index": "3"
//           },
//           "attributes": {
//               "src": "YoutubeBand/Screen3.webmhd.webm",
//               "loop": false,
//               "muted": false,
//               "volume": 1
//           },
//           "content": "",
//           "classes": []
//       },
//       "wvXLR": {
//           "type": "media_video",
//           "css": {
//               "width": "35%",
//               "position": "absolute",
//               "top": "49%",
//               "left": "46%",
//               "z-index": "2"
//           },
//           "attributes": {
//               "src": "YoutubeBand/Screen4.webmhd.webm",
//               "loop": false,
//               "muted": false,
//               "volume": 1
//           },
//           "content": "",
//           "classes": []
//       },
//       "wqLJS": {
//           "type": "media_video",
//           "css": {
//               "width": "35%",
//               "position": "absolute",
//               "top": "25%",
//               "left": "25%",
//               "z-index": "1"
//           },
//           "attributes": {
//               "src": "YoutubeBand/Laptop2parte.webmhd.webm",
//               "loop": false,
//               "muted": false,
//               "volume": 1
//           },
//           "content": "",
//           "classes": []
//       }
//   },
//   "console": {
//       "active": false,
//       "css": {
//           "width": "25%",
//           "height": "95%",
//           "position": "absolute",
//           "top": "2.5%",
//           "left": "5%",
//           "z-index": "100",
//           "display": "none"
//       }
//   },
//   "boite": {
//   "type": "no_phone",
//   "arg": ""
// },
// "repet" : {}
// }


const data2 = {


"media-order": [],
"background-color": "rgb(0, 0, 0)",
"media": {},
"console": {
    "active": false,
    "css": {}
},

"boite": {
"type": "no_phone",
"arg": ""
},
"repet" : {}
}

$('#play').on('click', function(){
    displayStep(data1);
});

$('#stop').on('click', function(){
    displayStep(data2);
});

var $main = $('main');
var $step = $('<div class="step"></div>');
var $decor = $('<div class="step__decor"></div>');
var $texte = $('<div class="step__texte"></div>');
var $boite = $('<div id="boite"></div>');
// var $boiteAvatars = $('<div id="avatars"></div>');
$boite.hide();

$step.append($decor, $texte, $boite);
$main.append($step);

const htmlPathToMedia = './data/media/';
function clearUnwantedMedia(data){
    // const div = document.getElementsByClassName('step')[0];
    const stepMedia = data['media'];
  
    let keysArray = [].map.call($decor.children().not('#boite, .console'), function (e) {
    return e.getAttribute('data-key')
    })
  
    keysArray.forEach(key => {
        if (!stepMedia[key]) {
          if ($(`.step [data-key=${key}]`).find('video').length !== 0) {
            $(`.step [data-key=${key}] video`).stop();
            $(`.step [data-key=${key}] video`).attr('src', '');
          }
            $(`.step [data-key=${key}]`).remove();
        }
    })
  }
  
  function applyZIndexes(data) {
    let zIndex = data['media-order'].length;
    data['media-order'].forEach((value, index) => {
        $(`.step__decor [data-key=${value}]`).css({"z-index" : zIndex});
        zIndex = zIndex - 1;
    })
  }
  
  let videoElementsNo = 0;
  let loadedVideos = 0;
  
  function countVideoMedias(stepMedia) {
    $.each(stepMedia, function() {
      if (this.type=== 'media_video') videoElementsNo = videoElementsNo + 1;
    })
  }
  
  function displayStep(data) {
  
      clearUnwantedMedia(data);
  
      const mediaOrder = data['media-order'];
      const stepMedia = data['media'];
  
      videoElementsNo = 0;
      loadedVideos = 0;
  
      countVideoMedias(stepMedia);
  
      for (let data_key of mediaOrder) {
        setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
      }
      applyZIndexes(data); 
      
      setElements("", "console", "", data['console']);
      $('.step').css('background-color', data['background-color']);
  
      // start playing videos only after all are loaded to play trough
      Array.from(document.getElementsByTagName('video')).forEach(video => {
        video.oncanplay = function() {
          loadedVideos = loadedVideos + 1;
          if (loadedVideos === videoElementsNo) {
            startAllVideos()
          }
        }
      })
  }
  
  function startAllVideos() {
    Array.from(document.getElementsByTagName('video')).forEach(video => {
      video.play();
    })
  }
  
  function styleToObject(style) {
    const regex = /([\w-]*)\s*:\s*([^;]*)/g;
    let match, properties={};
    while(match=regex.exec(style)) properties[match[1]] = match[2].trim(); 
    return properties;
  }
  
  
  
  function setElements(val, type, data_key, stepMediaObject) {
    // $('#media-editor')[0].innerHTML = '';
    src = './data/media/' + val;
   
    const avatarsElement = `<div class="avatars" style="width: 25%; height: 15%; position: absolute; top: 25%; left:25%; border-radius: 45%; z-index:99;" data-key=${data_key} data-type=${type}>
                            </div>`;
  
    const console = `<div id="console" class="console" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:100;">
                      <iframe src="/console" style="width:100%; height: 100%; border: none;"></iframe>
                    </div>`;
  
    const imageElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                            <img style="width: 100%;" src=${src} class="media"></img>
                          </div>`
  
    const videoElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type} data-audioOutput=''>
                            <video volume=0.5 style="width: 100%;" src=${src} class="media"></video>
                          </div>`
                   
    const audioElement = `<div style="width: 5%; position: absolute; top: 25%; left:85%; padding:5px;" data-key=${data_key} data-type=${type}>
                              <audio autoplay volume=0.5 class="media" src=${src}></audio>
                            </div>`
  
    const streamElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                              <video autoplay style="width: 100%;" class="media"></video>
                            </div>`
   
    const textElement = `
                          <pre contenteditable="true" class="text draggable" data-key=${data_key} data-type=${type} 
                                    style=" 
                                    position: absolute; 
                                    top: 25%; 
                                    left:25%;
                                    white-space: pre-wrap; 
                                    word-wrap: break-word;
                                    color: white;
                                    font-size: 16px;
                                    margin: 0px;
                                    padding: 10px;
                                    font-family: Arial;
                                    "
                          >${val}</pre>
                      `
    
    const elements = {
      'media_images' : imageElement,
      'media_gifs' : imageElement,
      'media_video' : videoElement,
      'media_audio' : audioElement,
      'videoStream' : streamElement,
      'avatars' : avatarsElement,
      'text' : textElement
    } 
  
    if (type in elements) {
        if($(`.step__decor [data-key=${data_key}]`).length === 0) {
            $('.step__decor').append(elements[type]);
        }
    }
    
    // if(type === 'console') {
    //     if(stepMediaObject.active === true && $('.console').length === 0) {
    //         $('.step').append(console);
    //     }
    //     if ((stepMediaObject.active === false && $('.console').length !== 0)) {
    //       $('.step .console').remove();
    //     }
    // } 
  
    if(type === 'console') {
      if($(`.console`).length === 0) {
        $('.step').append(console);
      }
    } 
    
    // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
    if (stepMediaObject) {
        if (type === 'console') {
            // $(`.${type}`).css(stepMediaObject['css']);
            
            if (!stepMediaObject['active']) {
              $(`.${type}`).hide();
          } else {
              $(`.${type}`).show();
          }
          $(`.${type}`).css(stepMediaObject['css']);
        } 
        
        else if (type === 'media_audio') {
          let mediaElement = $(`.step`).find(`*[data-key="${data_key}"]`);
          if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
              mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
          }
          mediaElement.find('.media').prop('volume', stepMediaObject['attributes']['volume'])
          mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop'])
        } 
        
        else {
            // APPLY CSS
            let mediaElement = $(".step").find(`*[data-key="${data_key}"]`);
            mediaElement.removeAttr('style');
            mediaElement.css(stepMediaObject['css']);
  
            // APPLY LOOP AND MUTED TO VIDEOS
            if(stepMediaObject['type'] === 'media_video') {
                mediaElement.find('.media').prop('muted', stepMediaObject['attributes']['muted']);
                mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop']);
                mediaElement.find('.media').prop('volume', stepMediaObject['attributes']['volume']);
                // mediaElement.data('audioOutput', stepMediaObject['attributes']['audioOutput']);
                // mediaElement.find('.media')[0].setSinkId(stepMediaObject['attributes']['audioOutput']);
                
            }
  
             // CHECK IF NEW SRC SHOULD BE APPLIED
             if (stepMediaObject['type'] === 'media_video' || stepMediaObject['type'] === 'media_images' || stepMediaObject['type'] === 'media_gifs') {
              if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
                  mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
              }
            }
  
            if (stepMediaObject['type'] === 'videoStream') {
                if (mediaElement.data('device') !== stepMediaObject['attributes']['device']) {
                    const constraints = {
                        video: { deviceId: stepMediaObject['attributes']['device']}
                    };
                    mediaElement.data('device', stepMediaObject['attributes']['device']);
                    mediaElement.data('label', stepMediaObject['attributes']['label']);
  
                    startStream(constraints, data_key);
                } 
            }
  
             // ADD NEW TEXT IF NEEDED
             if (stepMediaObject['type'] === 'text') {
                if (mediaElement.text() !== stepMediaObject['content']) {
                    mediaElement.text(stepMediaObject['content']);
                }
  
                // CORRECTION DUE TO DIFFERENCE IN EDITOR SCREEN SIZE AND REAL FULL SCREEN SIZE
                const textStyle = styleToObject(mediaElement.attr('style'));
  
                let correctedSize = parseFloat(textStyle['font-size'])*100/55;
                let correctedBorder = parseFloat(textStyle['border-width'])*100/55;
                let correctedPadding = parseFloat(textStyle['padding'])*100/55;
  
                mediaElement.css('font-size', correctedSize + 'vw');
                mediaElement.css('border-width', correctedBorder + 'vw');
                mediaElement.css('padding', correctedPadding + 'vw');
            }
  
            // APPLY CLASSES
            let classes = "";
            
            stepMediaObject['classes'].forEach(element => {
                classes = classes + element;
            });
            mediaElement.addClass(classes);
           
            if(stepMediaObject['css']['object-fit'] && stepMediaObject['css']['object-fit'] !== "") {
                mediaElement.find('.media').css({"height" : "100%", "object-fit" : stepMediaObject['css']['object-fit']});
            }
        }
    } 
  }
  
window.onload = function() {
    initDragElement();
    initResizeElement();
    activateColorPicker();
    // displayVisual(steps);
};

// const steps = [{"id" : 1, "order_number" : 1}, {"id" : 3, "order_number" : 2}, {"id" : 2, "order_number" : 3}]

// function displayVisual(steps) {
    
//     steps.forEach(step => {
//         const listItem = `<div class="list-item" id=${step.id}>
//     <div class="item-content">
//       Step <span class="order">${step.order_number}</span>
//     </div>
//   </div>`
//         // let id = step.id;
//         // let order_number = step.order_number;
//         $( "#layers" ).append(listItem);
//     })
// }

function initDragElement() {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
        
    var popups = document.getElementsByClassName("popup");
    var elmnt = null;

   
    var currentZIndex = 100; //TODO reset z index when a threshold is passed

    for (var i = 0; i < popups.length; i++) {
        var popup = popups[i];
        var header = getHeader(popup);

        popup.onmousedown = function() {
            if (popup.classList.contains('cover')) {
                    this.style.zIndex = "" + ++currentZIndex;
            }
        };

        if (header) {
        header.parentPopup = popup;
        header.onmousedown = dragMouseDown;
        }
    }

    function dragMouseDown(e) {
        elmnt = this.parentPopup;
        if (!elmnt.classList.contains('cover')) {
            elmnt.style.zIndex = "" + ++currentZIndex;
        }

        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        if (!elmnt) {
        return;
        }

        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      
        elmnt.style.top = (elmnt.offsetTop - pos2)*100/vh + "%";
        elmnt.style.left = (elmnt.offsetLeft - pos1)*100/vw + "%";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function getHeader(element) {
        var headerItems = element.getElementsByClassName("popup-header");

        if (headerItems.length === 1) {
        return headerItems[0];
        }
        return null;
    }
}

var croppable = false;
var initialImageWidth;
var initialImageHeight;

function initResizeElement(id) {
    var element = null;
    var image = null;
    var startX, startY, startWidth, startHeight

    var popups = getRelevantPopups(id);
    
    popups.forEach(popup => appendReziseElements(popup));

    function appendReziseElements(popup) {
        var both = document.createElement("div");
        both.className = "resizer-both";
        var styles = {  "width": "15px",
                        "height": "15px",
                        "z-index": "10",
                        "position": "absolute",
                        "right": "-15px",
                        "bottom": "-7.5px",
                        "cursor": "nw-resize",
                        "background-image": 'url("../icons/angles-down-solid.svg")',
                        "background-size": "contain",
                        "background-repeat": "no-repeat",
                        "transform": "rotate(-45deg)",
                        "background-color": "grey",
                        "background-position": "center"
                    }

        for (var property in styles) {
            both.style[property] = styles[property]
        }
        popup.appendChild(both);
        both.addEventListener("mousedown", initDrag, false);
        both.parentPopup = popup;
    }
   

    function initDrag(e) {
        element = this.parentPopup;

        startX = e.clientX;
        startY = e.clientY;

        // Start values
        startWidth = parseInt(
        document.defaultView.getComputedStyle(element).width,
        10
        );
        startHeight = parseInt(
        document.defaultView.getComputedStyle(element).height,
        10
        );

        document.documentElement.addEventListener("mousemove", doDrag, false);
        document.documentElement.addEventListener("mouseup", stopDrag, false);
    }

    function doDrag(e) {
        if (!croppable) {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

            element.style.width = (startWidth +  e.clientX - startX)*100/vw + "%";

            if (popups.length === 1 && $(popups).hasClass('avatars')) {
                element.style.height = (startHeight + e.clientY - startY)*100/vh + "%";
            }
        } 
    }

    function stopDrag() {
        document.documentElement.removeEventListener("mousemove", doDrag, false);
        document.documentElement.removeEventListener("mouseup", stopDrag, false);
    }
    
}
  
  /* Media
======== */
var $main = $('main');

var states = {
    visual: {
        // current: 'TEST boites'
    }
};

var currentLanguage;

const socket = io();

socket.on('init states', function(data) {
    states = deepMerge(states, data);
    // if ('oscHost' in data) $('#osc_ip').val(data.oscHost);
    displayMedia();
});

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

socket.on('step from master', (data) => {
    console.log(data);
   
    var screen = data.screen;
    
    if (screen.decor.src !== ' ') {
    if(isJsonString(screen.decor.src)) {
        var style = JSON.parse(screen.decor.style);
        JSON.parse(screen.decor.src).forEach((value,index) => {
            if (style[index] !== " " && style[index] !== undefined && style[index] !== "[]") {
                displayElement(value, style[index]);
            } else {
                displayElement(value, screen.decor.fit);
            }
        })
    } else {
        var style = screen.decor.style;
        if (style !== " " && style !== undefined && style !== "[]") {
            displayElement(screen.decor.src, style);
        } else {
            if (screen.decor.fit) {
                displayElement(screen.decor.src, screen.decor.fit);
            } else {
                displayElement(screen.decor.src, 'cover');
            }
        }
    }
    }
    if (isJsonString(screen.texte)) {
        var style = JSON.parse(screen.style);
        JSON.parse(screen.texte).forEach((value,index) => {
            if(screen.texte !== '' && screen.texte !== ' ') {
                var id = setElements(screen.texte, 'text-box');
                setTextStyle(id, screen.style[index])
            }
        })
    } 
    if(screen.texte !== '' && screen.texte !== ' ') {
    var id = setElements(screen.texte, 'text-box');
    setTextStyle(id, screen.style)
    }
    
    if (screen.avatars_area !== ' ') {
        setElements('', 'avatars');
        var style = JSON.parse(screen.avatars_area);
        var popupParameters = ['width', 'height', 'top', 'left'];
        for (const property in style) {
            if (popupParameters.includes(property)) {
                $('.avatars')[0].style[property] = style[property];
            } else {
                $('.avatars').find('img')[0].style[property] = style[property];
            }
        }
    }
})

function setTextStyle(id, style) { 

    var textStyle = style.trim();
    $('#' + id + 'text').attr("style", textStyle);

    var popupParameters = ['width', 'height', 'top', 'left', 'transform'];

    for (const parameter of popupParameters) {
        $('#' + id)[0].style[parameter] = $('#' + id + 'text')[0].style[parameter];
        $('#' + id + 'text')[0].style[parameter] = ''
    }

    $('#' + id + 'text')[0].style.position = '';
}

function displayElement(src, style) {
    if (src.charAt(0) === '#' || src.includes('rgb')) {
        setElements(src, 'background');
    } 
  
    else if (src.includes('deviceId')) {
        getMediaStream();
        setTimeout(() => {
            setStyle(src, style);
            $('.video-options>select').val(src.split('_')[1]);
            $('.video-options>select').change();
        }, 1000);
      }
    else {
        $(`div[title|='${src}']`).mousedown();
        if(src.charAt(0) === '.' || src.charAt(0) === '@') {
            src.substring(1);
        }
        setStyle(src, style)
    }
}

var contain = {'width' : '100%', 'height' : '100%', 'object-fit': 'contain'};
var cover = {'width' : '100%', 'height' : '100%', 'object-fit': 'cover'};


function setStyle(src, style) {
    var element;
    if (src.includes('deviceId')) {
        element = $('#stream');
    } else {
        element = $(`[src*='${src}']`);
    }  
    
    var popup = element[0].parentElement.parentElement;

    if (style === 'contain' || style === 'cover') {
        popup.style.top = '';
        popup.style.left = '';
        popup.style.width = '100%';
        popup.style.height = '100%';
        element[0].style.objectFit = style;
        element[0].style.height = '100%';
        if (element.is('video')) {
            element[0].loop = false;
            element[0].muted = false;
        }
    } else {
        element[0].style.backgroundColor = style.backgroundColor;
        element[0].style.backgroundImage = style.backgroundImage;
        element[0].style.backgroundSize = style.backgroundSize;
        element[0].style.backgroundRepeat = style.backgroundRepeat;
        popup.style.width = style.width;
        popup.style.height = style.height;

        if (style.objectFit === 'contain' || style.objectFit === 'cover') {
            element[0].style.objectFit = style.objectFit;
            element[0].style.height = '100%';
            popup.style.top = '';
            popup.style.left = '';
        }  else {
            popup.style.top = style.top;
            popup.style.left = style.left;
        }

        popup.style.zIndex = style.zIndex;
        popup.style.transform = style.transform;

        if (element.is('video')) {
            element[0].loop = returnBoolean(style.loop);
            element[0].muted = returnBoolean(style.muted);
        }
    }
}

function returnBoolean(str) {
    if (str ==='true') return true
    if (str ==='false' || str === 'null') return false
}
// socket.on('language', (data) => {
//     currentLanguage = data.currentLanguage;
// })

// socket.on('change language', (data) => {
//     currentLanguage = data;
//     $.getJSON(`/data/editor_${data}.json`, function(data) {
//         editorSteps = data;
//       });
// })

var datalists = {
    decors: {
      el: $('<datalist id="list_decors"></datalist>'),
      data: []
    },
    musics: {
      el: $('<datalist id="list_musics"></datalist>'),
      data: []
    },
    styles: {
      el: $('<datalist id="list_styles"></datalist>'),
      data: []
    },
    modes: {
      el: $('<datalist id="list_modes"></datalist>'),
      data: []
    }
};
  
function datalistsWrite() {
$.each(datalists, function(key, val) {
    val.el.empty();
    val.data.forEach(item => {
    val.el.append(`<option value="${item}" />`);
    });
});
}

$.each(datalists, function(key, val) {
$main.append(val.el);
val.el.addClass('edit-element');
});

var $media = $('#media');

$media.on('mousedown', '.file', function() {
    setElements($(this).attr('title'), this.parentElement.className);
});

var medias = {
styles: $('.media_styles'),
decors: $('.media_decors'),
// pages: $('.media_pages'),
layouts: $('.media_layouts'),
video: $('.media_video'),
// audio: $('.media_audio'),
gifs: $('.media_gifs'),
images: $('.media_images')
};

function displayMedia() {
medias.styles.empty();
medias.decors.empty();
// medias.pages.empty();
medias.layouts.empty();
medias.video.empty();
// medias.audio.empty();
medias.gifs.empty();
medias.images.empty();

$.each(datalists, function(key, val) {
    val.el.empty();
    val.data.length = 0;
});

// datalists.modes.data = Object.keys(modes);

/* Pages
======== */
// $.each(states.pages, function(key, val) {
//     var path = `@${val}`;
//     var file = `<div title="${path}" class="file">${path}</div>`;
//     medias.pages.append(file);
//     datalists.decors.data.push(path);
// });


/* Css
====== */
var decorsStyleSheet = document.styleSheets[1].cssRules;
[...decorsStyleSheet].forEach(val => {
    var styles = [...val.style];
    val = val.selectorText;
    if (val) {
    var file = `<div title="${val}" class="file">${val}</div>`;
    if (styles.includes('background-color') || styles.includes('background-image')) {
        medias.decors.append(file);
        datalists.decors.data.push(val);
    } else {
        medias.styles.append(file);
        datalists.styles.data.push(val);
    }
    }
});

/* Media
======== */
$.each(states.media, function(key, val) {
    var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;
    
    // if (
    // val.endsWith('.wav') ||
    // val.endsWith('.flac') ||
    // val.endsWith('.mp3') ||
    // val.endsWith('.ogg')
    // ) {
    // medias.audio.append(file);
    // datalists.musics.data.push(val);
    if (
    val.toLowerCase().endsWith('.jpeg') ||
    val.toLowerCase().endsWith('.jpg') ||
    val.toLowerCase().endsWith('.png') ||
    val.toLowerCase().endsWith('.svg') ||
    val.toLowerCase().endsWith('.webp') ||
    val.toLowerCase().endsWith('.jfif')
    ) {
    medias.images.append(file);
    datalists.decors.data.push(val);
    } else if (
        val.toLowerCase().endsWith('.html')
    ) {
    medias.layouts.append(file);
    datalists.decors.data.push(val);
    } else if (
    val.toLowerCase().endsWith('.gif') //
    ) {
    medias.gifs.append(file);
    datalists.decors.data.push(val);
    } else if (
    val.toLowerCase().endsWith('.webm') ||
    val.toLowerCase().endsWith('.mp4') ||
    val.toLowerCase().endsWith('.mov') ||
    val.toLowerCase().endsWith('.wmv') ||
    val.toLowerCase().endsWith('.avi') ||
    val.toLowerCase().endsWith('.ogv')
    ) {
    medias.video.append(file);
    datalists.decors.data.push(val);
    }
});
datalistsWrite();
}

// ADD ELEMENTS
function setElements(val, type) {
    $('#media-editor')[0].innerHTML = '';

    src = '/data/media/' + val;
    var id = Math.floor(100000 + Math.random() * 900000);

    var zIndex ;
    var zIndexes = [];
    if ($('.popup')[0]) {
        $('.popup').each(function() {
            zIndexes.push(parseInt($(this).css('z-index')));
        })
        zIndex = Math.max.apply(Math,zIndexes) + 1;
    } else {
        zIndex = 9;
    }

    var avatars = `<div 
                        id=${id}
                        class = "popup image avatars"
                        style = "z-index: ${zIndex};
                                text-align: center;
                                position: absolute;
                                left: 0%; 
                                top: 85%; 
                                box-sizing: border-box;
                                width: 25%;
                                height: 15%;
                                -webkit-touch-callout: none; 
                                -webkit-user-select: none; 
                                -khtml-user-select: none; 
                                -moz-user-select: none; 
                                -ms-user-select: none; 
                                user-select: none;"
                    >
                        <div 
                            class = "popup-body"
                                    style = "width: 100%;
                                    height: 100%;
                                    overflow: hidden;
                                    box-sizing: border-box;
                                    border-radius: 45%;
                                    border: 2px solid green;"
                        >
                            <div 
                                class="popup-header" 
                                id=${id + 'header'}
                                style = "   position: absolute;
                                            left: 7%;
                                            top: 7%;
                                            width: 85%;
                                            height: 85%;
                                            padding: 0;
                                            cursor: move;
                                            z-index: 10;
                                        "
                            ></div>
                            <img style = "width: 100%; height: 100%;" id=${id + 'img'}></img>
                        </div>
                    </div>`

    var imageElement = `<div 
                            id=${id}
                            class = "popup image"
                            style = "z-index: ${zIndex};
                                     text-align: center;
                                     position: absolute;
                                     left: 0%; 
                                     top: 85%; 
                                     box-sizing: border-box;
                                     width: 20%;
                                     height: auto;
                                     -webkit-touch-callout: none; 
                                     -webkit-user-select: none; 
                                     -khtml-user-select: none; 
                                     -moz-user-select: none; 
                                     -ms-user-select: none; 
                                     user-select: none; 
                                    "
                        >
                            <div 
                                class = "popup-body"
                                         style = "width: 100%;
                                         height: 100%;
                                         overflow: hidden;
                                         box-sizing: border-box;"
                            >
                                <div 
                                    class="popup-header" 
                                    id=${id + 'header'}
                                    style = "   position: absolute;
                                                left: 7%;
                                                top: 7%;
                                                width: 85%;
                                                height: 85%;
                                                padding: 0;
                                                cursor: move;
                                                z-index: 10;
                                            "
                                ></div>
                               
                                <img style="width: 100%" src=${src} id=${id + 'img'}></img>
                            </div>
                        </div>`
    
    var videoElement = `<div 
                            id=${id}
                            class = "popup video"
                            style = "z-index: ${zIndex};
                                        text-align: center;
                                        position: absolute;
                                        left: 0%; 
                                        top: 85%; 
                                        box-sizing: border-box;
                                        width: 20%;
                                        height: auto;
                                        -webkit-touch-callout: none; 
                                        -webkit-user-select: none; 
                                        -khtml-user-select: none; 
                                        -moz-user-select: none; 
                                        -ms-user-select: none; 
                                        user-select: none; 
                                    "
                        >
                            <div 
                                class = "popup-body"
                                            style = "width: 100%;
                                            height: 100%;
                                            overflow: hidden;
                                            box-sizing: border-box;"
                            >
                                <div 
                                    class="popup-header" 
                                    id=${id + 'header'}
                                    style = "   position: absolute;
                                                left: 7%;
                                                top: 7%;
                                                width: 85%;
                                                height: 40%;
                                                padding: 0;
                                                cursor: move;
                                                z-index: 10;
                                            "
                                ></div>
                              
                                <video style="width: 100%" autoplay src=${src} id=${id + 'video'}></video>
                            </div>
                        </div>`
                        
    var streamElement = ` 
                        <div 
                        id=${id}
                        class = "popup video stream"
                        style = "z-index: ${zIndex};
                                    text-align: center;
                                    position: absolute;
                                    left: 0%; 
                                    top: 85%;
                                    box-sizing: border-box;
                                    width: 40%;
                                    height: auto;
                                    -webkit-touch-callout: none; 
                                    -webkit-user-select: none; 
                                    -khtml-user-select: none; 
                                    -moz-user-select: none; 
                                    -ms-user-select: none; 
                                    user-select: none; 
                                "
                        >
                            <div 
                                class = "popup-body"
                                            style = "width: 100%;
                                            height: 100%;
                                            overflow: hidden;
                                            box-sizing: border-box;"
                            >
                            <div 
                                class="popup-header" 
                                id=${id + 'header'}
                                style = "   position: absolute;
                                            left: 7%;
                                            top: 20%;
                                            width: 85%;
                                            height: 80%;
                                            padding: 0;
                                            cursor: move;
                                            z-index: 10;
                                        "
                            ></div>
                        
                            <video id="stream" autoplay style="width: 100%"></video>
                            <div class="video-options">
                                <select name="" id="" class="custom-select"><option value="">Select camera</option></select>
                            </div>
                            <div class="controls d-none">
                                <button class="play streamControl" title="Play">&gt;</button>
                                <button class="pause d-none streamControl" title="Pause">||</button>
                            </div>
                        </div>
                    </div>
    
    
    `
    
    var textElement = `<div 
                            id=${id}
                            class = "popup text"
                            style = "z-index: ${zIndex};
                                    text-align: center;
                                    position: absolute;
                                    left: 85%; 
                                    top: 85%;
                                    box-sizing: border-box;
                                    width: 20%;
                                    height: auto;
                                    -webkit-touch-callout: none; 
                                    -webkit-user-select: none; 
                                    -khtml-user-select: none; 
                                    -moz-user-select: none; 
                                    -ms-user-select: none; 
                                    user-select: none; 
                                    "
                        >
                            <div 
                                class = "popup-body"
                                        style = "width: 100%;
                                        height: 100%;
                                        overflow: hidden;
                                        box-sizing: border-box;"
                            >
                                <div 
                                    class="popup-header text-box-header" 
                                    id=${id + 'header'}
                                    style = "   position: absolute;
                                                left: -15px;
                                                top: 0px;
                                                width: 15px;
                                                height: 24px;
                                                padding: 0;
                                                cursor: move;
                                                z-index: 10;
                                                
                                            "
                                ></div>
                                <pre contenteditable="true" id=${id + 'text'} 
                                    style=" 
                                    white-space: pre-wrap; 
                                    word-wrap: break-word;
                                    color: white;
                                    font-size: 16px;
                                    margin: 0px;
                                    font-family: Arial;
                                    "
                                >${val}</pre>
                            </div>
                        </div>`

    if (type === 'media_video') {
        $('#preview').append(videoElement);
        initResizeElement(id);
        addMenu(id);
        closeMediaList();
    } else if (type === 'videoStream'){
        $('#preview').append(streamElement);
        hideIfDisplayed($('#add-stream-button')[0]);
        initResizeElement(id);
        addMenu(id);
    }
    else if (type === 'media_images' || type === 'media_gifs') {
        $('#preview').append(imageElement);
        initResizeElement(id);
        addMenu(id);
        closeMediaList();
    } else if (type === 'avatars') {
        $('#preview').append(avatars);
        hideIfDisplayed($('#add-avatars-button')[0]);
        initResizeElement(id);
        addMenu(id);
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
            $('#preview_background')[0].value = node.style.backgroundColor;
            $('#preview_background').trigger('input');

            document.getElementById("preview").remove();
            document.getElementsByTagName("main")[0].append(node);
         
            e.target.remove();
                  
            const popupElementsNew = Array.from(node.getElementsById("preview"));
           
            initResizeElement();
            if (typeof(id) === 'string') {
                addMenu(id);
            } else {
                id.forEach(element => addMenu(element));
            // }
            
            initDragElement();
            closeMediaList();
        }
    } 
    else if (type === 'media_decors') {
        var decors = Array.from(document.querySelector(".media_decors").children);
        var previewElement = document.querySelector("#preview");
        // Remove previouse styles
        decors.forEach(decor => {
            var className = decor.innerHTML.substring(1);
            if (previewElement.classList.contains(className)) {
                previewElement.classList.remove(className);
            }
            if (previewElement.style.backgroundColor !== '') {
                $('#preview_background')[0].value = '';
                $('#preview_background').trigger('input');
            }
        });
        previewElement.classList.add(val.substring(1));
        closeMediaList();
    } 
    else if (type === 'background') {
        var decors = Array.from(document.querySelector(".media_decors").children);
        var previewElement = document.querySelector("#preview");
        // Remove previouse styles
        decors.forEach(decor => {
            var className = decor.innerHTML.substring(1);
            if (previewElement.classList.contains(className)) {
                previewElement.classList.remove(className);
            }
            // if (previewElement.style.backgroundColor !== '') {
                $('#preview_background')[0].value = val;
                $('#preview_background').trigger('input');
            // }
        });
        // previewElement.classList.add(val.substring(1));
        closeMediaList();
    }    
    else if (type === 'text-box') {
        $('#preview').append(textElement);
        document.getElementById(id + 'text').focus();
        initResizeElement(id);
        addMenu(id);
        closeMediaList();
        initDragElement();
        hideIfDisplayed($('#add-text-button')[0]);
        return id
    }
    initDragElement();
}

function addMenu(id) {
    var menuTemplate =  `<div  
                            class="menu"
                        >   
                        <div class="remove-element">
                            <img class="icon" src="../icons/xmark-solid.svg" onclick="removeElement(${id});"></img>
                        </div>
                        <div onclick="editElement(${id});">
                            Edit
                        </div>
                    </div>`
    $('#' + id).find('.popup-body')[0].innerHTML += menuTemplate;
}

function editElement(id) {
    // If already editing do nothing
    if ($('#' + id + '_menu').length) {
       
    } else {
        var type = $("#" + id)[0].classList[1]
        if (type === 'image') {
            addImageMenuOptions(id);
        } else if (type === 'text') {
            addMenuOptionsTextBox(id);
        } else if (type === 'video') {
            addVideoMenuOptions(id);
        }
    }
    closeMediaList();
}

function closeMediaList() {
    document.querySelector("#media").classList.add("d-none");
}

function removeElement(id) {
    if ($('#' + id).hasClass('stream')) {
        displayIfHidden($('#add-stream-button')[0]);
    }
    if ($('#' + id).hasClass('avatars')) {
        displayIfHidden($('#add-avatars-button')[0]);
    }
    if ($('#' + id).hasClass('text')) {
        displayIfHidden($('#add-text-button')[0]);
    }
    document.getElementById(id).remove();
    $('#media-editor')[0].innerHTML = '';    
}

function getRelevantPopups(id) {
    var popups = [];
    if (id) {
        if (id.length) {
            id.forEach(id => popups.push(document.getElementById(id))) 
        } else {
            popups.push(document.getElementById(id));
        }
    } else {
        popups = Array.from(document.getElementsByClassName("popup"));;
    }
    return popups;
}

function addImageMenuOptions(id) {
    $('#media-editor')[0].innerHTML = '';

    var imageStyle;

    if ($("#" + id + "img")[0]) {
       imageStyle = getComputedStyle($("#" + id + "img")[0]);
    } else {
        imageStyle = getComputedStyle($("#" + id ).find('.popup-body')[0]);
    }

    var menuTemplate =  `<div  
                            id=${id + '_menu'} 
                            class = 'editor-menu'
                        >   
                            <div class='menu-item size'>
                                <p class='editor-section'>SIZE</p> 
                                <button class="white" onClick="setSize('cover', ${id}, 'img')">cover</button>
                                <button class="white" onClick="setSize('contain', ${id}, 'img')">contain</button>
                                <inline onClick="setSize('reset', ${id}, 'img')">Reset</inline>
                            </div>
                            <div class='menu-item bg-color'>
                                <p class='editor-section'>BACKGROUND COLOR<p> 
                                <label for="background-color">Add background color</label>
                                <input
                                    id = ${id + '_background-color'} 
                                    autocomplete="off"
                                    _list="list_decors"
                                    class="color-picker _box-min d-none"
                                    type="text"
                                    name="background-color"
                                    value = ${(imageStyle.backgroundColor) ? (imageStyle.backgroundColor.replaceAll(' ', '')) : ('transparent')} 
                                />
                                <p style='text-decoration: underline;' onclick='removeBackgroundColor(${id})'>Remove background color</p>
                            </div>
                            <div class='menu-item bg-image'>
                                <p class='editor-section'>BACKGROUND IMAGE</p> 
                                <div id="media-backgrounds">
                                    <div class="media_cat" id='background-gifs'>
                                        <i title="gifs">🖼️</i>
                                    </div>
                                    <div class="media_cat media_images" id='background-images'>
                                        <i title="images">📷</i>
                                    </div>
                                </div>
                                <p style='text-decoration: underline;' onclick='removeBackgroundImage(${id})'>Remove background image</p>
                            </div>
                            <div class='menu-item rotation'>
                                <p class='editor-section'>ROTATION<p> 
                                <div>
                                    <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight(${id});"></img>
                                </div>
                                <div>
                                    <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft(${id});"></img>
                                </div>
                            </div>
                        </div>`
   
    $('#media-editor').append(menuTemplate);
    if ($($('#' + id)).hasClass('avatars')) {
        $('#' + id + '_menu').find($('.size')).remove();
        $('#' + id + '_menu').find($('.rotation')).remove();
    }
    activateColorPicker();
    addBackground(id);
}

function addVideoMenuOptions(id) {
    $('#media-editor')[0].innerHTML = '';
    
    var video = $('#' + id).find($('video'))[0];
    
    var menuTemplate =  `<div  
                            id=${id + '_menu'} 
                            class = 'editor-menu'
                        >   
                        <div class='menu-item size'>
                                <p class='editor-section'>SIZE</p> 
                                <button class="white" onClick="setSize('cover', ${id}, 'video')">cover</button>
                                <button class="white" onClick="setSize('contain', ${id}, 'video')">contain</button>
                                <inline onClick="setSize('reset', ${id}, 'video')">Reset</inline>
                            </div>
                            <div class='menu-item video-controls'>
                                <p class='editor-section'>CONTROLS</p> 
                                <div class='loop'>
                                    <i style="margin-right: 10px;">Loop video</i><img class="icon ${(video.loop) ? ('active') : ('')}" src="../icons/arrow-rotate-right-solid.svg" onclick="setVideoAttribute(${id}, 'loop', event);"></img>
                                </div>
                                <div class='mute'>
                                    <i style="margin-right: 10px;">Video Sound On/Off</i><img class="icon mute ${(video.muted) ? ('active') : ('')}" src="../icons/${(video.muted) ? ('volume-xmark-solid') : ('volume-high-solid')}.svg" onclick="setVideoAttribute(${id}, 'muted', event);"></img>
                                </div>
                            </div>
                            <div>
                            <div class='menu-item bg-image'>
                                <p class='editor-section'>BACKGROUND IMAGE</p> 
                                <div id="media-backgrounds">
                                    <div class="media_cat" id='background-gifs'>
                                        <i title="gifs">🖼️</i>
                                    </div>
                                    <div class="media_cat media_images" id='background-images'>
                                        <i title="images">📷</i>
                                    </div>
                                </div>
                                <p style='text-decoration: underline;' onclick='removeBackgroundImage(${id})'>Remove background image</p>
                            </div>
                            </div>
                            <div class='menu-item rotation'>
                                <p class='editor-section'>ROTATION<p> 
                                <div>
                                    <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight(${id});"></img>
                                </div>
                                <div>
                                    <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft(${id});"></img>
                                </div>
                            </div>
                        </div>`
    $('#media-editor').append(menuTemplate);
    if ($($('#' + id)).hasClass('stream')) {
        $('#' + id + '_menu').find($('.video-controls')).remove();
    }
    addBackground(id);
}

function addMenuOptionsTextBox(id) {
    
        $('#media-editor')[0].innerHTML = '';
        // console.log(getComputedStyle($("#" + id + "text")[0]))
        
        var textStyle = getComputedStyle($("#" + id + "text")[0]);

        var isActive = {
            "bold" : (textStyle.fontWeight === '700') ? ('active') : (''),
            "italic" : (textStyle.fontStyle === 'italic') ? ('active') : (''),
            "underline" : (textStyle.textDecorationLine === 'underline') ? ('active') : ('')
        }

        var menuTemplate =  `<div  
                                id=${id + 'menu'} 
                                class = 'editor-menu'
                            >  
                                                    
                                <div class='menu-item'>
                                    <label for="color">Font color</label>
                                    <input
                                        id = ${id + '_color'} 
                                        autocomplete="off"
                                        _list="list_decors"
                                        class="color-picker _box-min d-none"
                                        type="text"
                                        name="color"
                                        value= ${(textStyle.color) ? (textStyle.color.replaceAll(' ', '')) : ('rgb(255,255,255)')}
                                    />
                                </div>
                                <div class='menu-item'>
                                    <label for="background-color">BG color</label>
                                    <input
                                        id = ${id + '_background-color'} 
                                        autocomplete="off"
                                        _list="list_decors"
                                        class="color-picker _box-min d-none"
                                        type="text"
                                        name="background-color"
                                        value = ${(textStyle.backgroundColor) ? (textStyle.backgroundColor.replaceAll(' ', '')) : ('transparent')} 
                                    />
                                </div>
                                <p style='text-decoration: underline;' onclick='removeBackgroundColor(${id})'>Remove Background color</p>
                                <div class='menu-item'>
                                    <select class='font-family' id=${id + '_font-family'}>
                                        <option value='' disabled selected>Change font style</option>
                                        <option value='fixedsys'>fixedsys</option>
                                        <option value='AvenirBlack'>AvenirBlack</option>
                                        <option value='AvenirRoman'>AvenirRoman</option>
                                        <option value='DINLight'>DINLight</option>
                                        <option value='faBrands'>faBrands</option>
                                        <option value='fishbourne'>fishbourne</option>
                                        <option value='RobotoMedium'>RobotoMedium</option>
                                        <option value='RobotoRegular'>RobotoRegular</option>
                                    </select>
                                </div>
                                <div class='menu-item'>
                                    <input class='font-size' type="number" min = '0' id = ${id + '_font-size'} value=${textStyle.fontSize.replace('px', '')}>
                                </div>
                                <div class='menu-item'>
                                    <img class='icon font-style ${isActive.bold}' src="../icons/bold-solid.svg" id = ${id + '_font-weight_bold'}></img>
                                </div>
                                <div class='menu-item'>
                                    <img class='icon font-style ${isActive.italic}' src="../icons/italic-solid.svg" id = ${id + '_font-style_italic'}></img>
                                </div>
                                <div class='menu-item'>
                                    <img class='icon font-style ${isActive.underline}' src="../icons/underline-solid.svg" id = ${id + '_text-decoration_underline'}></img>
                                </div>
                                Border
                                <div class='menu-item'>
                                    <input 
                                        class ='font-size menu-item border' 
                                        type ="number" 
                                        min = '0'
                                        id = ${id + '_border-width'} 
                                        value = ${(textStyle.borderWidth) ? (parseInt(textStyle.borderWidth.replace('px', ''))) : (0)} 
                                    >
                                </div>
                                <div class='menu-item'>
                                    <input
                                        id = ${id + '_border-color'} 
                                        autocomplete="off"
                                        _list="list_decors"
                                        class="color-picker _box-min d-none menu-item"
                                        type="text"
                                        name="border-color"
                                        value = ${(textStyle.borderColor) ? (textStyle.borderColor.replaceAll(' ', '')) : ('transparent')} 
                                    />
                                </div>
                                <select value = ${(textStyle.borderStyle) ? (textStyle.borderStyle) : ('none')}  class='menu-item border' id = ${id + '_border-style'}>
                                    <option value='solid' ${(textStyle.borderStyle == 'solid') ? ('selected') : (null)}>Solid</option>
                                    <option value='dashed' ${(textStyle.borderStyle == 'dashed') ? ('selected') : (null)}>Dashed</option>
                                    <option value='dotted' ${(textStyle.borderStyle == 'dotted') ? ('selected') : (null)}>Dotted</option>
                                    <option value='double' ${(textStyle.borderStyle === 'double') ? ('selected') : (null)}>Double</option>
                                    <option value='none' ${(textStyle.borderStyle === 'none' || textStyle.borderStyle === '') ? ('selected') : (null)}>none</option>
                                </select>
                                <div class='menu-item'>
                                    <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight(${id});"></img>
                                </div>
                                <div class='menu-item'>
                                    <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft(${id});"></img>
                                </div>
                            </div>
                        </div>
                    `

        $('#media-editor')[0].innerHTML = menuTemplate;
        activateColorPicker();
        activateFontSizeControler();
        activateFontStyleControler();
        activateBorderControler();
        activateFontFamilyControler();
}

function activateFontStyleControler() {
    $('.font-style')
    .on('click', function() {
        var $this = $(this);

        var inputs = {'id' : $this.context.id.split('_')[0], 'CSSparameter' : $this.context.id.split('_')[1], 'value' : $this.context.id.split('_')[2]};
        var isActive = $this.hasClass('active');

        var newValue;

        if ($this.hasClass('active')) {
            newValue = '';
            $this.removeClass('active');
        } else {
            newValue = inputs['value'];
            $this.addClass('active');
        }
       
        $('#' + inputs.id + 'text').css(inputs['CSSparameter'], newValue);
      })
}

function activateFontSizeControler() {
    $('.font-size')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      $("#" + inputs.id + "text").css(inputs['CSSparameter'], val + 'px');
    })
}

function activateFontFamilyControler() {
    $('.font-family')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      $("#" + inputs.id + "text").css(inputs['CSSparameter'], val);
    })
}

function activateBorderControler() {
    $('.border')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], 'CSSparameter' : $this.context.id.split("_")[1]};
      var unit;
      if (inputs['CSSparameter'] === 'border-width') 
            {unit = 'px';
        } else {
            unit = '';
        }

      $("#" + inputs.id + "text").css(inputs['CSSparameter'], val + unit);
    })
}

// EDITING
var setPopup = {'width' : '100%', 'height' : '100%', 'left': '0px', 'top' : '0px'};
var resetPopup = {'width' : '20%', 'height' : 'auto', 'left': '25%', 'top' : '25%'};
var resetMedia = {'height' : 'auto', 'object-fit': ''}

function setSize(size, id, type) {
    var element = document.getElementById(id);
    for (property in setPopup) {
        element.style[property] = setPopup[property];
    }

    if ($('#' + id).find('#stream').length > 0) {
        document.getElementById('stream').style.height = '100%';
        document.getElementById('stream').style.objectFit = size;
    } else {
        document.getElementById(id + type).style.height = '100%';
        document.getElementById(id + type).style.objectFit = size;
    }

    element.classList.add('cover');
   
    if (size === 'reset') {
        for (property in resetPopup) {
            element.style[property] = resetPopup[property];
        }
        if ($('#' + id).find('#stream').length > 0) {
            for (property in resetMedia) {
                document.getElementById('stream').style[property] = resetMedia[property];
            }
        } else {
            for (property in resetMedia) {
                document.getElementById(id + type).style[property] = resetMedia[property];
            }
        }
        element.classList.remove('cover'); 
    }
}

function rotateRight(id) {
    var element = document.getElementById(id);
    var startAngle = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', ''));
    var newAngle;
    if (startAngle) {
        newAngle = startAngle + 15;
    } else {
        newAngle = 15;
    }
    element.style.transform = 'rotate(' + newAngle + 'deg)'
}

function rotateLeft(id) {
    var element = document.getElementById(id);
    var startAngle = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', ''));
    var newAngle;
    if (startAngle) {
        newAngle = startAngle - 15;
    } else {
        newAngle = -15;
    }
    element.style.transform = 'rotate(' + newAngle + 'deg)'
}

function playVideo(id) {
    var video = $('#' + id).find($('video'))[0];
    video.play();
}

function setVideoAttribute(id, attribute, e) {
    var video = $('#' + id).find($('video'))[0];
    
    $(e.target).toggleClass('active');

    var booleanValue;

    if ($(e.target).hasClass('active')){
        video.setAttribute(attribute, true);
        video.pause();
        booleanValue = true;
    } else {
        video.removeAttribute(attribute);
        video.pause();
        booleanValue = false;
    }

    if (attribute === 'muted' && booleanValue === true) {
        $(e.target).attr("src","../icons/volume-xmark-solid.svg");
    } 
    if (attribute === 'muted' && booleanValue === false) {
        $(e.target).attr("src","../icons/volume-high-solid.svg");
    }

    var newVideoElement = video.cloneNode(true);
    var popupBody = video.parentElement;
    video.remove();
    popupBody.appendChild(newVideoElement)
    video.setAttribute(attribute, booleanValue);
    video.load()
    
    
}

function addBackground(id) {
    var gifs = $('.media_gifs')[0].cloneNode(true);
    var images = $('.media_images')[0].cloneNode(true);
    $('#background-gifs')[0].append(gifs);
    $('#background-images')[0].append(images);

    // add event listeners
    var gifsElementsArray = Array.from(gifs.childNodes);
    var imagesElementsArray = Array.from(images.childNodes);

    

    gifsElementsArray.forEach(element => {
        element.addEventListener('mousedown', function(e) {
            var mediaElement;
            if ($('#' + id).find($('img')).length > 0) {
                mediaElement = $('#' + id + 'img')
            } else {
                mediaElement = $('#' + id + 'video')
            }
            // var popupBody = $('#' + id).find($('.popup-body'))[0];
            var backgroundURL = $(e.target).attr('title');
            mediaElement.css({'background-image' : `url(data/media/${backgroundURL})`, 'background-size' : 'cover', 'background-repeat' : 'no-repeat'});
        })
    })

    imagesElementsArray.forEach(element => {
        element.addEventListener('mousedown', function(e) {
            var mediaElement;
            if ($('#' + id).find($('img')).length > 0) {
                mediaElement = $('#' + id + 'img')
            } else {
                mediaElement = $('#' + id + 'video')
            }
            var backgroundURL = $(e.target).attr('title');
            mediaElement.css({'background-image' : `url(data/media/${backgroundURL})`, 'background-size' : 'cover', 'background-repeat' : 'no-repeat'});
        })
    })
}

function removeBackgroundImage(id) {
    var popupBody = $('#' + id).find($('.popup-body'))[0];
    $(popupBody).css({'background-image' : ``, 'background-size' : '', 'background-repeat' : ''});
}

function removeBackgroundColor(id) {
    var elements = ['text', 'img', 'video'];
    var count = 0;
    elements.forEach(element => {
        if ($("#" + id + element)[0]) {
            $("#" + id + element).css({'background-color' : 'transparent'});
            count = count + 1;
        }
    })
    if (id === null) {
        $("#preview").css({'background-color' : 'transparent'});
    }
    if (id !== null && count === 0) {
        $("#" + id).find('.popup-body').css({'background-color' : 'transparent'});
    }
}

function displayModal() {
    displayIfHidden(document.getElementById("save-new-modal"));
}
function closeModal() {
    document.getElementById("file-name").value = "";
    hideIfDisplayed(document.getElementById("save-new-modal"));
}

socket.on('response', (response) => {
    alert(response);
})

function clearPreview() {
    window.location.reload();
}

function hideIfDisplayed(element) {
    if (element.classList.contains("d-none") === false) {
        element.classList.add("d-none");
    }
}

function displayIfHidden(element) {
    if (element.classList.contains("d-none")) {
        element.classList.remove("d-none");
    }
}

function displayMediaList() {
    $('#media')[0].classList.toggle("d-none");
    $('#media-editor')[0].innerHTML = '';
}

function sendToScreenInput(screen) {
    
    // get all elements from screen
    const preview = document.getElementById('preview')
    const tempHTML = preview.cloneNode(true);

    // ge all menu elements and avatars area
    var resizerElements = tempHTML.querySelectorAll(".resizer-both");
    var menuElements = tempHTML.querySelectorAll(".menu");
    var avatarsAreas = tempHTML.querySelectorAll(".avatars");
   
    for (var element of resizerElements) {
        element.remove()
    }
    for (var element of menuElements) {
        element.remove()
    }
    if (avatarsAreas.length > 0) {
        for (var element of avatarsAreas) {
            element.remove()
        }
    }
    
    // remove main menu
    tempHTML.querySelector('#media-menu').remove();

    // Adjust src of media elements relative to file path
    var mediaElements = tempHTML.querySelectorAll('[src]');
    for (var element of mediaElements) {
        var adjustedSRC = element.getAttribute("src").replace("/data/media/", "");
        element.setAttribute("src", adjustedSRC);
    }
   
    
    let values = {'src' : [], 'style' : []}
    if ($(tempHTML).css('background-color') !== '') {
        values.src.push($(tempHTML).css('background-color'));
        var tempSTYLE = {'' : ''};
        JSON.stringify(tempSTYLE);
        values.style.push(tempSTYLE);
    }

    var deviceId;
    if ($(tempHTML).find('#stream').length > 0) {
        deviceId = 'deviceId_' + document.querySelector('.video-options>select').value;
        // $('.video-options').remove();
        // $('.controls').remove();
    }

    // IMAGES
    if ($(tempHTML).find('img').length > 0) {
        $(tempHTML).find('img').each(function() {
            values.src.push($(this)[0].getAttribute('src'));
            
            var tempSTYLE = {};
            tempSTYLE.backgroundColor = $(this)[0].style.backgroundColor;
            tempSTYLE.backgroundImage = $(this)[0].style.backgroundImage;
            tempSTYLE.backgroundSize = $(this)[0].style.backgroundSize;
            tempSTYLE.backgroundRepeat = $(this)[0].style.backgroundRepeat;
            tempSTYLE.width = $(this)[0].parentElement.parentElement.style.width;
            tempSTYLE.height = $(this)[0].parentElement.parentElement.style.height;
            if ($(this)[0].style.objectFit !== '') {
                tempSTYLE.objectFit = $(this)[0].style.objectFit;
            } else {
                tempSTYLE.top = $(this)[0].parentElement.parentElement.style.top;
                tempSTYLE.left = $(this)[0].parentElement.parentElement.style.left;
            }
            tempSTYLE.zIndex = $(this)[0].parentElement.parentElement.style.zIndex;
            tempSTYLE.transform = $(this)[0].parentElement.parentElement.style.transform;
          
            values.style.push(tempSTYLE);
        })
    }

    // VIDEOS
    if ($(tempHTML).find('video').length > 0) {
        $(tempHTML).find('video').each(function() {
            if ($(this)[0].getAttribute('src') !== null) {
                values.src.push($(this)[0].getAttribute('src'));
            } else {
                values.src.push(deviceId);
            }

            var tempSTYLE = {};
            tempSTYLE.backgroundColor = $(this)[0].style.backgroundColor;
            tempSTYLE.backgroundImage = $(this)[0].style.backgroundImage;
            tempSTYLE.backgroundSize = $(this)[0].style.backgroundSize;
            tempSTYLE.backgroundRepeat = $(this)[0].style.backgroundRepeat;
            tempSTYLE.width = $(this)[0].parentElement.parentElement.style.width;
            tempSTYLE.height = $(this)[0].parentElement.parentElement.style.height;
            if ($(this)[0].style.objectFit !== '') {
                tempSTYLE.objectFit = $(this)[0].style.objectFit;
            } else {
                tempSTYLE.top = $(this)[0].parentElement.parentElement.style.top;
                tempSTYLE.left = $(this)[0].parentElement.parentElement.style.left;
            }
            tempSTYLE.zIndex = $(this)[0].parentElement.parentElement.style.zIndex;
            tempSTYLE.transform = $(this)[0].parentElement.parentElement.style.transform;
            tempSTYLE.loop = $(this)[0].getAttribute('loop');
            tempSTYLE.muted = $(this)[0].getAttribute('muted');
            values.style.push(tempSTYLE);
        })
    }

    let valuesTEXTE = {'texte' : [], 'style' : []}
    if ($(tempHTML).find('pre').length > 0) {
        $(tempHTML).find('pre').each(function() {
            valuesTEXTE.texte.push($(this)[0].innerHTML);
            valuesTEXTE.style.push($(this)[0].getAttribute('style') + $(this)[0].parentElement.parentElement.getAttribute('style'));
        })
    }

    if (screen === 'boite') {
        if (document.querySelector('.avatars')) {
            var avatarArea = document.querySelector('.avatars');
            var data = {
                'width' : avatarArea.style.width,
                'height' : avatarArea.style.height,
                'top' : avatarArea.style.top,
                'left' : avatarArea.style.left,
                'border-radius' : $(avatarArea).find('.popup-body').css('border-radius'),
                'background-color' : $(avatarArea).find('img').css('background-color'),
                'background-image' : $(avatarArea).find('img')[0].style.backgroundImage,
                'background-size' : $(avatarArea).find('img').css('background-size'),
                'background-repeat' : $(avatarArea).find('img').css('background-repeat'),
            }
            socket.emit('avatars position', data);
            alert ('Position and style of avatars area sent to master step')
        } else {
            alert ("Add avatars area first")
        }  
    }
    if (screen !== 'boite') {
        socket.emit('multimedia decor', {to : screen, layout : values});
        if (valuesTEXTE.texte.length > 0) {
            socket.emit('multimedia decor', {to : screen, layout : valuesTEXTE});
        }
        alert ('Send to master step')
    }
}

function activateColorPicker() {
    $('.color-picker')
    .on('input change', function() {
      var $this = $(this);
      var val = $this.val();
    
      if($this.context.id !== "preview_background") {
        var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
        if ($("#" + inputs.id + "text")[0]) {
            $("#" + inputs.id + "text").css(inputs['CSSparameter'], val);
        } else if ($("#" + inputs.id + "img")[0]) {
            $("#" + inputs.id + "img").css(inputs['CSSparameter'], val);
        } else {
            $("#" + inputs.id).find('.popup-body').css(inputs['CSSparameter'], val);
        }
        
      } else {
          // remove background classes 
          var decors = Array.from(document.querySelector(".media_decors").children);
          var previewElement = document.querySelector("#preview");
          // Remove previouse styles
          decors.forEach(decor => {
              var className = decor.innerHTML.substring(1);
              if (previewElement.classList.contains(className)) {
                  previewElement.classList.remove(className);
              }
          });
          $('#preview').css('background-color', val);
      }
       
      var $prev = $(this)
        .next()
        .find('.sp-preview-inner');
  
      $prev[0].className = 'sp-preview-inner';
      $prev.css('background-color', '');
      $prev.css('background-image', '');
  
      if (val.startsWith('.')) {
        $prev.addClass(val.slice(1));
      } else {
        $prev.css('background-color', val);
        $prev.css('background-image', `url(/data/media/${val})`);
      }
    })
    .spectrum({
      showAlpha: true,
      allowEmpty: true,
      showPalette: true,
      showInitial: true,
      preferredFormat: 'hex3',
      // prettier-ignore
      palette: [
          ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
          ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
          ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
          ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
          ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
          ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
          ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
          ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
        ],
      change: function() {
        $(this).trigger('input');
      }
    });
}

function addAvatarsArea(e) {
    setElements('', 'avatars');
}

// function saveAvatarsPosition() {
// var avatars = $('.avatars')[0];

// calculate width and height in %
// var width = consoleDiv.style.width;
// var height = consoleDiv.style.height;
// const previewWindow = document.getElementById("preview-window");

// if(width.includes('px')) {
//     const vw = parseInt(getComputedStyle(previewWindow).width);
//     width = Math.round(parseInt(width)*100/vw) + "%"; 
// }

// if(height.includes('px')) {
//     const vh = parseInt(getComputedStyle(previewWindow).height);
//     height = Math.round(parseInt(height)*100/vh) + "%"; 
// } 

// var data = {
//     "top" : consoleDiv.style.top,
//     "left" : consoleDiv.style.left,
//     "width" : width,
//     "height" : height
// }

// for(const property in data ) {
//     $('#' + property)[0].focus();
//     setEdit(data[property]);
// }
// document.getElementById("layout_modal").style.display = "none";
// } 

function newEtape() {
    socket.emit('new etape');
    alert ("New step added to master")

}

// LIVE STREAM
function getMediaStream() {
    setElements('', 'videoStream');
    
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



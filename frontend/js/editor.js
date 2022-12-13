let mainData = {};
// const socket = io();

// MAIN STATUS TRACKER
let active = {
    fileName : "",
    scene : "",
    step : ""
}

$( function() {
    $( ".draggable" ).draggable();
  } );

// separate JSONs for each show made, data gives array of all JSONs
socket.on('initial json', function(data) {
    setJSONsdata(data);
});

function setJSONsdata(data) { 
    mainData = {};
    let count = 0;
    $('#structure-content').empty();

    const sorted = data.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    sorted.forEach(async(src) => {
        await $.getJSON(src.replace('frontend', '.'), function(jsonData) {
            let array = src.split('/');
            let fileName = array[array.length -1].replace('.json', '');
            mainData[fileName] = jsonData;
            displayStructure(fileName, jsonData);
            count = count + 1;
            if (count === data.length) {
                 // CLICK ON ACTIVE ITEM 
                 const currentActive = {"fileName" : active.fileName, "step" : active.step, "scene" : active.scene};
                if (currentActive.fileName !== "") {
                    $(`#${currentActive.fileName} .show-name`).click();
                    if (currentActive.scene !== "") {
                        $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] .toggler`).click();
                        if (currentActive.step !== "") {
                            $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] li[data-step=${currentActive.step}]`).click();
                        }
                    } 
                }
            }
        })    
    });
}

let startPosition;
let movedStep;
let arrayEl;

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

function displayStructure(fileName, data) {
    let showElement =  `<ul id=${fileName} class="show">
                            <li class="show-name"><b><u>${data.name}</u></b></li>
                            <li style="display: none;" class="structure-buttons">
                                <span onclick="addInStructure('scene')"><img src="./icons/plus.svg"></img></span>
                                <span onclick="duplicate('show')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                                <span onclick="deleteFromStructure('show')"><img src="./icons/trash.svg"></img></span>
                                <span onclick="editName('show')"><img class="edit-icon" src="./icons/edit.png"></img></span>
                            </li>
                            <li style="display: none;"><select class="languages"></select></li>
                            <li style="display: none;">
                                <ul id=${fileName + 'sceneList'} class="scenes"></ul>
                            </li>
                        </ul>`
    $('#structure-content').append(showElement);


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
            <div style="display: none;" class="structure-buttons">
                <span onclick="addInStructure('step')"><img src="./icons/plus.svg"></img></span>
                <span onclick="duplicate('scene')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                <span onclick="deleteFromStructure('scene')"><img src="./icons/trash.svg"></img></span>
                <span onclick="editName('scene')"><img class="edit-icon" src="./icons/edit.png"></img></span>
            </div>
            </li>`).appendTo(`#${fileName + 'sceneList'}`)
        .append(`<ul id=${id} style="display: none" class="steps"></ul>`);

        let number = 1;
        stepOrder.forEach(stepOrderNumber => {
            $("#" + id).append(`<li class="step" data-step=${stepOrderNumber} onclick="setStep(event, '${fileName}', ${sceneOrderNumber}, ${stepOrderNumber})">Step ${number}</li>`)
            number = number + 1;
        })

        // DEFINE SORTABLE FUNCTIONS FOR SCENES
        $('#' + fileName + 'sceneList').sortable({
            start : function (event, ui) {
                startPosition = ui.item.index();
             },
             stop: function(event, ui) {
                let endPosition = ui.item.index();
                if (endPosition !== startPosition) {
                    // ADJUST MAIN DATA
                    let movedElement = mainData[fileName]['scene-order'].splice(startPosition, 1)[0];
                    mainData[fileName]['scene-order'].splice(endPosition, 0, movedElement);
                    // SAVE TO JSON
                    saveSceneOrder(fileName, mainData[fileName]['scene-order']);
                }
             }
        })

        // DEFINE SORTABLE FUNCTIONS FOR STEPS
        $("#" + id).sortable({
            start : function (event, ui) {
               startPosition = ui.item.index();
            },
            stop: function(event, ui) {
                let endPosition = ui.item.index();
                if (endPosition !== startPosition) {
                    // ADJUST MAIN DATA
                    let movedElement = mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(startPosition, 1)[0];
                    mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(endPosition, 0, movedElement);
                    // SAVE TO JSON
                    saveStepOrder(fileName, sceneOrderNumber, mainData[fileName]['scenes'][sceneOrderNumber]['step-order']);

                    // ADJUST TEXT STEP number IN HTML
                    $(ui.item).text('Step ' + (endPosition + 1));
                    $(function () {
                        let currentLi = ui.item;
                        let number = endPosition;

                        while (number > 0) {
                            $(currentLi).prev().text('Step ' + number);
                            currentLi = $(currentLi).prev();
                            number = number - 1;
                        }       
                        
                        currentLi = ui.item;
                        number = endPosition + 2;

                        while (number <= ui.item.parent().children().length) {
                            $(currentLi).next().text('Step ' + number);
                            currentLi = $(currentLi).next();
                            number = number + 1;
                        }
                    });
                }
            }
        });    

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
            $('#step-media ul').empty();
            $('#preview').empty();
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
        console.log(active)
        $('#step-media ul').empty();
        $('#preview').empty();
    })
    
}

function saveStepOrder(fileName, sceneOrderNumber, stepsOrder) {
    socket.emit('reorder steps', {"fileName" : fileName, "sceneOrderNumber" : sceneOrderNumber, "stepsOrder" : stepsOrder})
}

function saveSceneOrder(fileName, scenesOrder) {
    socket.emit('reorder scenes', {"fileName" : fileName, "scenesOrder" : scenesOrder})
}


function setActiveStep(fileName, scene, step) {
    active.fileName = fileName;
    active.scene = scene;
    active.step = step;
    console.log(active)
}

function applyZIndexes() {
    let mediaOrder = [];
    $('#step-media li').each(function(){mediaOrder.push($(this).data('key'))})
    mediaOrder.forEach((value, index) => {
        $(`#preview [data-key=${value}]`).css({"z-index" : index + 1});
    })
}

function clearUnwantedMedia(stepMedia){
    // const div = document.getElementById(container);
    // const stepMedia = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media'];

    let keysArray = [].map.call($('.step').children().not('#boite'), function (e) {
    return e.getAttribute('data-key')
    })

    keysArray.forEach(key => {
        if (!stepMedia[key]) {
            $(`#preview [data-key=${key}]`).remove();
        }
    })
}

$("#step-media ul").sortable({
    start : function (event, ui) {
       startPosition = ui.item.index();
    },
    stop: function(event, ui) {
        let endPosition = ui.item.index();
        if (endPosition !== startPosition) {
            // ADJUST MAIN DATA
            // let movedElement = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].splice(startPosition, 1)[0];
            // mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].splice(endPosition, 0, movedElement);

            applyZIndexes();
           
        }
    }
});    

// STEP IS DISPLAYED FROM SAVED JSON DATA
function setStep(e, fileName, scene, step) {
    $(".step").not(e.target).removeClass('active');
    $(e.target).parent().find('.structure-buttons').remove();
    $(e.target).toggleClass('active');

    // CLEAR PREVIOUS  STEP DATA LIST AND PREVIEW
    $('#step-media ul').empty();

    if($(e.target).hasClass('active')) {
        setActiveStep(fileName, scene, step);

        // APPEND clone and delete buttons
        $(e.target).append(`<div class="structure-buttons">
                                <span onclick="duplicate('step')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                                <span onclick="deleteFromStructure('step')"><img src="./icons/trash.svg"></img></span>
                            </div>`)

        $.getJSON('./data/json/' + fileName + '.json', function(jsonData) {
            const mediaOrder = jsonData['scenes'][scene]['steps'][step]['screen']['media-order'];
            const stepMedia = jsonData['scenes'][scene]['steps'][step]['screen']['media'];
            
            clearUnwantedMedia(stepMedia);
            for (let data_key of mediaOrder) {
                // DISPLAY MEDIA IN MEDIA LIST
                let liName;
                if (stepMedia[data_key]['type'] === 'media_images' || stepMedia[data_key]['type'] === 'media_video' || stepMedia[data_key]['type'] === 'media_gifs') {
                    liName = getFileName(stepMedia[data_key]['attributes']['src']);
                } else {
                    liName = stepMedia[data_key]['type']
                }
                const li = `<li data-key=${data_key} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${liName}</li>`;
                $('#step-media ul').append(li);
                // DISPLAY STEP IN MEDIA PREVIEW
                setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
            }
            applyZIndexes();
            // setElements("", "avatars", "", jsonData['scenes'][scene]['steps'][step]['screen']['avatars']);
            setElements("", "console", "", jsonData['scenes'][scene]['steps'][step]['screen']['console']);
            setElements("", "music", "", jsonData['scenes'][scene]['steps'][step]['screen']['music']);
        }) 
    } else {
        setActiveStep(fileName, scene, ""); 
        $('#preview').empty();
    }
}

// ADD ELEMENTS
function setElements(val, type, data_key, stepMediaObject) {
    // $('#media-editor')[0].innerHTML = '';
    src = htmlPathToMedia + val;
   
    const avatarsElement = `<div class="avatars draggable resizable" style="width: 25%; height: 15%; position: absolute; top: 25%; left:25%; border-radius: 45%; z-index:99;" data-key=${data_key} data-type=${type}><img style = "width: 100%; height: 100%;" class="media"></img></div>`;

    const console = `<div id="console" class="draggable resizable" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:100;"><iframe src="/console" style="width:100%; height: 100%; border: none;"></iframe></div>`;

    const imageElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}><img style="width: 100%;" src=${src} class="media"></img></div>`

    const videoElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}><video autoplay style="width: 100%;" src=${src} class="media"></video></div>`
                   
    const audioElement = `<audio id="music" src="" data-type=${type}></audio>`

    const streamElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}><video autoplay id="stream" style="width: 100%;" src=${src} class="media"> </video><div class="video-options">
    <select name="" id="" class="custom-select"><option value="">Select camera</option></select>
</div>
<div class="controls d-none">
    <button class="play streamControl" title="Play">&gt;</button>
    <button class="pause d-none streamControl" title="Pause">||</button>
</div></div>`
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
        if($(`#preview [data-key=${data_key}]`).length === 0) {
            $('#preview').append(videoElement);
        }
    } else if (type === 'videoStream'){
        if($(`#preview [data-key=${data_key}]`).length === 0) {
            $('#preview').append(streamElement);
        }
    }
    else if (type === 'media_images' || type === 'media_gifs') {
        //  IF ELEMENT DOES NOT ALREADY EXIST CREATE IT
        if($(`#preview [data-key=${data_key}]`).length === 0) {
            $('#preview').append(imageElement);
        }
    } else if (type === 'avatars') {
        if($(`#preview [data-key=${data_key}]`).length === 0) {
            $('#preview').append(avatarsElement);
        }
       
    } else if(type === 'console') {
        if($('#console').length === 0) {
            $('#preview').append(console);
        }
    } else if (type === 'music') {
        if($('#music').length === 0) {
            $('#preview').append(audioElement);
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
            $('#preview_background')[0].value = node.style.backgroundColor;
            $('#preview_background').trigger('input');

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
        // initResizeElement(id);
        addMenu(id);
        closeMediaList();
        // initDragElement();
        hideIfDisplayed($('#add-text-button')[0]);
        return id
    }


    // DEFINE FUNCTIONS FOR ELEMENT TO BE DRAGGABLE AND RESIZABLE
    $("#preview .draggable").draggable({
        stop: function () {
            const l = Math.round(( 100 * parseFloat($(this).position().left / parseFloat($('#preview').width())) )) + "%" ;
            const t = Math.round(( 100 * parseFloat($(this).position().top / parseFloat($('#preview').height())) )) + "%" ;
            $(this).css("left", l);
            $(this).css("top", t);
        }
    });
    $('#preview .draggable').mousedown(function(){
        $('#preview .draggable').not(this).removeClass('active');
        $(this).addClass('active');
        // MARK ACTIVE IN MEDIA LIST
        $("#step-media ul li").not(`li[data-key="${this.dataset.key}"]`).removeClass('active');
        $("#step-media").find(`li[data-key="${this.dataset.key}"]`).addClass('active');
        // SET EVENT LISTENERS ON BUTTONS
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        let previewElement = $(this);
        let data_key = this.dataset.key;
        let type = this.dataset.type;
        if ($(this).hasClass('active')) {
            $("#delete-media-button").click(function(){
                // DELETE FROM JSON
                // deleteMedia(data_key);
                // DELETE FROM MAIN DATA
                // const index = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].indexOf(data_key);
                // mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].splice(index, 1);
                // delete mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media'][data_key];
                $(previewElement).remove();
                $("#step-media").find(`li[data-key="${data_key}"]`).remove();
                applyZIndexes();
            })
            $("#edit-media-button").click(function(){
                editElement(data_key, type)
            })
        }
    });

    $(".resizable").resizable({
        handles: "se",
        resize: function () {
            $(this).css("object-fit", "");
            $(this).children().each(function(){$(this).css("object-fit", "");$(this).css("height", "");})
            const w = Math.round(( 100 * $(this).width() / $('#preview').width() )) + "%" ;
            const h = Math.round(( 100 * $(this).height() / $('#preview').height() )) + "%" ;
            $(this).css("width", w);
            $(this).css("height", h);
        }
    });

    // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
    if (stepMediaObject) {
        if (type === 'console') {
            if (!stepMediaObject['active']) {
                $(`#${type}`).hide();
                $(`#${type}-checkbox`).prop("checked", false);
            } else {
                $(`#${type}`).show();
                $(`#${type}-checkbox`).prop("checked", true);
            }
            $(`#${type}`).css(stepMediaObject['css']);
        } else if (type === 'music') {
            if (!$('#music').attr('src').includes(stepMediaObject['src'])) {
                $('#music').attr('src', htmlPathToMedia +  stepMediaObject['src']); 
            }
            $('#music').attr('volume', stepMediaObject['volume'])
            $('#music').attr('loop', stepMediaObject['loop'])
        }   
        
        else {
        // if (type === 'media_images') {
            // APPLY CSS
            let mediaElement = $("#preview").find(`*[data-key="${data_key}"]`);
            mediaElement.removeAttr('style');
            mediaElement.css(stepMediaObject['css']);

            // APPLY LOOP AND MUTED TO VIDEOS
            if(stepMediaObject['type'] === 'media_video') {
                mediaElement.find('.media').prop('muted', stepMediaObject['attributes']['muted'])
                mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop'])
            }

            // CHECK IF NEW SRC SHOULD BE APPLIED
            if (stepMediaObject['type'] === 'media_video' || stepMediaObject['type'] === 'media_images') {
                if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
                    mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
                }
            }

            // if (stepMediaObject['type'] === 'videoStream') {
            //     if (mediaElement.find('.media')[0].srcObject('id') !== stepMediaObject['attributes']['device']) {
            //         async() => {
            //             await navigator.mediaDevices.getUserMedia({
            //               video: {
            //                   deviceId: stepMediaObject['attributes']['device']
            //               }}).then(stream => mediaElement.find('.media')[0].srcObject = stream)
            //             } 
            //     }
            // }


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
        // }
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


function toggleVisibility(e) {
    $(e.target).toggleClass('visible');
    $('#preview').find(`[data-key='${e.target.dataset.key}']`).toggle();
}

function markActiveStepMediaElement(e) {
    // MARK IN MEDIA LIST
    $("#step-media ul li").not(e.target).removeClass('active');
    $(e.target).toggleClass('active');

    // MARK IN PREVIEW
    $('#preview .draggable').not(`#preview .draggable[data-key='${e.target.dataset.key}']`).removeClass('active');
    $(`#preview .draggable[data-key='${e.target.dataset.key}']`).toggleClass('active');

    // ADD EVENT LISTENERS
    $("#delete-media-button").unbind("click");
    $("#edit-media-button").unbind("click");
    if ($(e.target).hasClass('active')) {
        $("#delete-media-button").click(function(){
            $(`#preview .draggable[data-key='${e.target.dataset.key}']`).remove();
            $(e.target).remove();
            applyZIndexes();
        })
        $("#edit-media-button").click(function(){
            editElement(e.target.dataset.key, e.target.dataset.type)
        })
    }
}

function addMedia() {
    if (active.step !== "") {
        displayMediaList();
    }
}

function styleToObject(style) {
    const regex = /([\w-]*)\s*:\s*([^;]*)/g;
    let match, properties={};
    while(match=regex.exec(style)) properties[match[1]] = match[2].trim(); 
    return properties;
}

function analyseStep() {
    let updatedStepObject = {...stepObject};

    updatedStepObject['screen']['background-color'] = $('#preview').css('background-color');

    let mediaOrder = [];
    $('#step-media li').each(function(){mediaOrder.push($(this).data('key'))});
    updatedStepObject['screen']['media-order'] = mediaOrder;


    let updatedMediaObject = {};

    // get all media elements
    $("#preview").children().not('#console, #music, #boite').each(function(){
        let object =   {   "type" : "",     
                            "css" : {},
                            "attributes" : {},
                            "content" : "",
                            "classes" : [] 
                        }
                        
        object['type'] = $(this).data('type');

        object['css'] = styleToObject($(this).attr('style'));

        // display none can be present if visibility was toggled
        delete object['css']['display'];

        if ($(this).data('type') === 'media_video' || $(this).data('type') === 'media_images') {
            object['attributes']['src'] = $(this).children().attr('src').replace(htmlPathToMedia, '');
        } 
        // else {
        //     object['attributes']['src'] = '';
        // }

        if($(this).data('type') === 'media_video') {
            object['attributes']['loop'] = $(this).find('video')[0].loop;
            object['attributes']['muted'] = $(this).find('video')[0].muted;
        }

        if ($(this).data('type') === 'videoStream') {
            object['attributes']['device'] = $(this).find('video')[0].srcObject.id;
        }
       

        let classArray = $(this).attr('class').split(" ");

        classArray.forEach(element => {
            if (!element.includes('draggable') && !element.includes('resizable') && !element.includes('active')) {
                object['classes'].push(element);
            }
        })
        object['content'] = $(this).children().text();

        updatedMediaObject[$(this).data('key')] = object;
    })

    updatedStepObject['screen']['media'] = updatedMediaObject;

    // updatedStepObject['screen']['avatars']['active'] = $('#avatars-checkbox').is(':checked');
    // updatedStepObject['screen']['avatars']['css'] = styleToObject($('#avatars').attr('style'));

    updatedStepObject['screen']['console']['active'] = $('#console-checkbox').is(':checked');
    updatedStepObject['screen']['console']['css'] = styleToObject($('#console').attr('style'));

    if ($('#console-checkbox').is(':checked')) {
        updatedStepObject['console'] = {...consoleObject};
    }

    updatedStepObject['screen']['music']['scr'] = $('#audio').attr('src');

    // ADD IF BOITE
    return updatedStepObject;
}

function saveStep() {
    if (active.step !== "") {
        const step = analyseStep();
        // SAVE TO JSON
        socket.emit("save step", {"fileName" : active.fileName, "scene": active.scene, "step" : active.step, 'stepObject' : step})
    }
}

function createNewObjectKey(array) {
    if (array.length > 0) {
        return Math.max(...array) + 1;
    } else {
        return 1;
    }
}

function addInStructure(parameter) {
    if (parameter === 'show') {
        const languageList = Object.keys(languages);

        let options = `<option value="" selected disabled>Select language</option>`

        $.each(languages, function(index,value){
            options = options + `<option data-code=${index} value=${index}>${value}</option>`
        });

        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    <input type="text" name="name" placeholder="New show name" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')"></input>
                    <select name="language" required>${options}</select>
                    <small>* you need to select language due to multilingual support.<br>Languages can be edited later.</small>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
         // OK BUTTON FUNCTION
         $('#alert form').submit(function(e) {
            e.preventDefault();
            const showName = e.target.elements.name.value;
            const fileName = showName.replace(/ /g, '').trim();

            let newShowObject = {...showObject};
            newShowObject.name = showName;
            newShowObject.languages.push(e.target.elements.language.value.toUpperCase())
            
            // SAVE TO JSON FILE
            addNewShow(fileName, newShowObject);
            showSpinner();
        })
    }
    if (parameter === 'step') {
        $('#alert')
        .empty()
        .append(`<p>Add new step?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            let newStepNumber = createNewObjectKey(mainData[active.fileName]['scenes'][active.scene]['step-order']);
            let newStepObject = {...stepObject};
            // SAVE TO JSON FILE
            addNewStep(newStepNumber, newStepObject);
            showSpinner();
        })
    } 
    if (parameter === 'scene') {
        $('#alert')
        .empty()
        .append(`<form>
                    <input type="text" name="name" placeholder="New scene name" required></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
        // OK BUTTON FUNCTION
        $('#alert form').submit(function(e) {
            e.preventDefault();
            const sceneName = e.target.elements.name.value;
           
            let newSceneNumber = createNewObjectKey(mainData[active.fileName]['scene-order'])

            // DEFINE NEW SCENE OBJECT
            let newSceneObject = {...sceneObject};
            newSceneObject['name'] = sceneName;
            newSceneObject['step-order'] = [1];
            newSceneObject['steps'] = {
                                        "1": {...stepObject}
                                    };

            // SAVE TO JSON FILE
            addNewScene(newSceneNumber, newSceneObject);
            showSpinner();
        })
    }
}

function duplicate(parameter) {
    if (parameter === 'show') {
        $('#alert')
        .empty()
        .append(`<p>Duplicate ${mainData[active.fileName]['name']} ?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            // SAVE TO JSON FILE
            duplicateShow();
            showSpinner();
        })
    } 
    
    if (parameter === 'scene'){
        $('#alert')
        .empty()
        .append(`<p>Duplicate ${mainData[active.fileName]['scenes'][active.scene]['name']} ?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            const sceneName = mainData[active.fileName]['scenes'][active.scene]['name'] + '-copy';
            
            let newSceneNumber = createNewObjectKey(mainData[active.fileName]['scene-order'])

            // DEFINE NEW SCENE OBJECT
            let newSceneObject = {...mainData[active.fileName]['scenes'][active.scene]};
            newSceneObject['name'] = sceneName;
           
            // SAVE TO JSON FILE
            addNewScene(newSceneNumber, newSceneObject);
            showSpinner();
        })
    }

    if (parameter === 'step'){
        $('#alert')
        .empty()
        .append(`<p>Duplicate step?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            let newStepNumber = createNewObjectKey(mainData[active.fileName]['scenes'][active.scene]['step-order']);
            let newStepObject = {...mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]};
            // SAVE TO JSON FILE
            addNewStep(newStepNumber, newStepObject);
            showSpinner();
        })
    }


}

function editName(parameter) {
    if (parameter === 'show') {
        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    <input type="text" name="name" placeholder="${mainData[active.fileName]['name']}" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')"></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
         // OK BUTTON FUNCTION
         $('#alert form').submit(function(e) {
            e.preventDefault();
            const showName = e.target.elements.name.value.trim();
            const newFileName = showName.replace(/ /g, '').trim();
            
            // SAVE TO JSON FILE
            renameShow(newFileName, showName);
            showSpinner();
        })
    } 
    if (parameter === 'scene') {
        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    <input type="text" name="name" placeholder="${mainData[active.fileName]['scenes'][active.scene]['name']}" required></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
         // OK BUTTON FUNCTION
         $('#alert form').submit(function(e) {
            e.preventDefault();
            const sceneName = e.target.elements.name.value.trim();
            
            // SAVE TO JSON FILE
            renameScene(sceneName);
            showSpinner();
        })
    }
}

function deleteFromStructure(parameter) {
    if (parameter === 'step') {
        $('#alert')
        .empty()
        .append(`<p>Delete step?</p>
                <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            // SAVE CHANGES TO JSON FILE
            deleteStep();
            showSpinner();
        })
    } 
    if (parameter === 'scene') {
        $('#alert')
        .empty()
        .append(`<p>Delete scene?</p>
                <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            // SAVE CHANGES TO JSON FILE
            deleteScene();
            showSpinner();
        })
    }

    if (parameter === 'show') {
        $('#alert')
        .empty()
        .append(`<p>Delete ${mainData[active.fileName]['name']}?</p>
                <div class='editor-buttons' style='justify-content: center;'>
                    <button>Ok</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert button').click(function() {
            // SAVE CHANGES TO JSON FILE
            deleteShow();
            showSpinner();
        })
    }
}

function showSpinner() {
    $('#alert')
    .empty()
    .append(`<div class="spinner"><div>`);
}

socket.on('success', function(data){

    // EMPTY PREVIOUS STRUCTURE AND STEP PREVIEW
    $('#step-media ul').empty();
    $('#structure-content').empty();

    // UNBIND EVENT LISTENERS
    $("#delete-media-button").unbind("click");
    $("#edit-media-button").unbind("click");
    
    
    // ADJUST constant ACTIVE
    if (data && data.deleted === 'step') {
        setActiveStep(active.fileName, active.scene, "");
    } else if (data && data.deleted === 'scene') {
        setActiveStep(active.fileName, "", "");
    } else if (data && data.deleted === 'show') {
        setActiveStep("", "", "");
    }

    setJSONsdata(data.data);

    // CLOSE MODAL
    setTimeout(() => {
        $('#alert').empty();
        $(".ui-dialog-titlebar-close"). click();
    }, 500);
})

socket.on('error', function(data){
    $('#alert')
    .empty()
    .append(`<p>Connection to server failed. Please try again.</p>`);

    if (data.deleted) {
        $('#alert').dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
            minWidth: 500
        });
    }
})

$('.editor-buttons fieldset input').change(function() {
    if (active.step !== "") {
        if ($(this).is(':checked')) {
            $(`#${$(this).attr('name')}` ).show();
            // $("this").prop("checked", false);
        } else {
            $(`#${$(this).attr('name')}` ).hide();
            // $(this).prop("checked", false);
        }
    } else {
        $(this).prop("checked", false);
    }
});


function addNewStep(newStepNumber, step) {
    socket.emit("add step", {"fileName" : active.fileName, "scene" : active.scene, "key" : newStepNumber, "step" : step});
}

function deleteStep() {
    socket.emit("delete step", {"fileName" : active.fileName, "scene" : active.scene, "step" : active.step});
}

function addNewScene(newSceneNumber, scene) {
    socket.emit("add scene", {"fileName" : active.fileName, "key" : newSceneNumber, "scene" : scene});
}

function renameScene(sceneName) {
    socket.emit("rename scene", {"fileName" : active.fileName, "scene" : active.scene, "name" : sceneName});
}

function deleteScene() {
    socket.emit("delete scene", {"fileName" : active.fileName, "scene" : active.scene});
}

function addNewShow(fileName, show) {
    socket.emit("add show", {"fileName" : fileName, "content" : show});
}

function duplicateShow() {
    socket.emit("duplicate show", {"fileName" : active.fileName});
}

function renameShow(newFileName, showName) {
    socket.emit("rename show", {"fileName" : active.fileName, "newFileName" : newFileName, "name" : showName});
}

function deleteShow() {
    socket.emit("delete show", {"fileName" : active.fileName});
}

// function sendStep() {
//     const step = analyseStep();
//     socket.emit('step', step)
// }


window.onload = function() {
    activateColorPicker();
};
  
  /* Media
======== */
var $main = $('main');

var states = {
    visual: {
        // current: 'TEST boites'
    }
};

var currentLanguage;


socket.on('init states', function(data) {
    states = deepMerge(states, data);
    // if ('oscHost' in data) $('#osc_ip').val(data.oscHost);
    displayMedia();
});

// function isJsonString(str) {
//     try {
//         JSON.parse(str);
//     } catch (e) {
//         return false;
//     }
//     return true;
// }


// function returnBoolean(str) {
//     if (str ==='true') return true
//     if (str ==='false' || str === 'null') return false
// }
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


// BOITES
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

function addAvatars() {
    let data_key = createRandomString(5);
     // ADD TO MAIN DATA MEDIA ORDER TO MANIPULATE Z INDEXES
     mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].push(data_key);
    const li = `<li data-key=${data_key} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>Avatars</li>`;
    $('#step-media ul').append(li);
    setElements('', 'avatars', data_key);
    applyZIndexes();
    setTimeout(() => {
        $(".ui-dialog-titlebar-close"). click();
    }, 200);   
}

$media.on('mousedown', '.file', function() {
    let data_key = createRandomString(5);

    // ADD TO MAIN DATA MEDIA ORDER TO MANIPULATE Z INDEXES
    mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].push(data_key);
    // mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media'][data_key] = newMediaObject;

    const li = `<li data-key=${data_key} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${getFileName($(this).attr('title'))}</li>`;
           
    $('#step-media ul').append(li);
    
    setElements($(this).attr('title'), this.parentElement.className, data_key);

    applyZIndexes();

    setTimeout(() => {
        $(".ui-dialog-titlebar-close"). click();
    }, 200);   
});

var medias = {
// styles: $('.media_styles'),
// decors: $('.media_decors'),
// pages: $('.media_pages'),
// layouts: $('.media_layouts'),
video: $('.media_video'),
// audio: $('.media_audio'),
gifs: $('.media_gifs'),
images: $('.media_images')
};

function displayMedia() {
// medias.styles.empty();
// medias.decors.empty();
// medias.pages.empty();
// medias.layouts.empty();
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
// var decorsStyleSheet = document.styleSheets[1].cssRules;
// [...decorsStyleSheet].forEach(val => {
//     var styles = [...val.style];
//     val = val.selectorText;
//     if (val) {
//     var file = `<div title="${val}" class="file">${val}</div>`;
//     if (styles.includes('background-color') || styles.includes('background-image')) {
//         medias.decors.append(file);
//         datalists.decors.data.push(val);
//     } else {
//         medias.styles.append(file);
//         datalists.styles.data.push(val);
//     }
//     }
// });

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
$(".media_cat p").click(function(){
    $(".media_cat p").not(this).next().hide();
    $(this).next().toggle();
})
}


// function addMenu(id) {
//     var menuTemplate =  `<div  
//                             class="menu"
//                         >   
//                         <div class="remove-element">
//                             <img class="icon" src="../icons/xmark-solid.svg" onclick="removeElement(${id});"></img>
//                         </div>
//                         <div onclick="editElement(${id});">
//                             Edit
//                         </div>
//                     </div>`
//     $('#' + id).find('.popup-body')[0].innerHTML += menuTemplate;
// }

function toggleMediaList(e) {
    e.target.classList.toggle('active')
    $('#alert #media-backgrounds').toggleClass('d-none');
}

function editElement(key, type) {
    // if (type === 'media_images' || type === 'media_gifs') {
        $('#alert')
        .empty()
        .append(`<div  
                    class = 'editor-menu'
                >   
                    <div class='menu-item size'>
                        <p onClick="setSize(event, 'cover', '${key}', '${type}')">COVER</p>
                        <p onClick="setSize(event, 'contain', '${key}',  '${type}')">CONTAIN</p>
                    </div>
                    <div class='menu-item bg-color'>
                        <label for="background-color">BACKGROUND COLOR</label>
                        <input
                            id = ${key + '_background-color'} 
                            autocomplete="off"
                            _list="list_decors"
                            class="color-picker _box-min d-none"
                            type="text"
                            name="background-color"
                           
                        />
                    </div>
                    <div class='menu-item bg-image'>
                        <b onclick="toggleMediaList(event)">BACKGROUND IMAGE</b> 
                        <div id="media-backgrounds" class='d-none'>
                            <p onclick="removeBackgroundImage('${key}')">NONE</p>
                            <div class="media_cat" id='background-gifs'>
                            </div>
                            <div class="media_cat media_images" id='background-images'>
                            </div>
                        </div>
                       
                    </div>
                    <div class='menu-item rotation'>
                        <p>ROTATION</p> 
                        <div>
                            <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight('${key}');"></img>
                        </div>
                        <div>
                            <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft('${key}');"></img>
                        </div>
                    </div>
                </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
        $('#media .media_images').clone().appendTo('#background-images').show();
        $('#media .media_gifs').clone().appendTo('#background-gifs').show();
        $('#background-images .media_images').children().click(function(){
            $(`#preview [data-key=${key}]`).css({'background-image': `url('${htmlPathToMedia}${this.title}')`, 'background-size': 'cover', 'background-repeat': 'no-repeat'})
        });
        $('#background-gifs .media_gifs').children().click(function(){
            $(`#preview [data-key=${key}]`).css({'background-image': `url('${htmlPathToMedia}${this.title}')`, 'background-size': 'cover', 'background-repeat': 'no-repeat'})
        });
        activateColorPicker();
    // }

    if (type === 'media_video') {
        const video = $(`#preview [data-key=${key}] video`)[0];
        $('#alert .editor-menu')
        .append(`<div class='menu-item video-controls'>
        <p class='editor-section'>CONTROLS</p> 
        <div class='loop'>
            <img class="icon ${(video.loop) ? ('active') : ('')}" src="../icons/arrow-rotate-right-solid.svg" onclick="setVideoAttribute('${key}', 'loop', event);"></img>
        </div>
        <div class='mute'>
            <div class="icon mute ${(video.muted) ? ('active') : ('')}" onclick="setVideoAttribute('${key}', 'muted', event);"></div>
           
        </div>
    </div>`)
    }

    // APPLY CURRENT STYLE
    let objectFit = $(`#preview [data-key=${key}]`).css('object-fit').toUpperCase();
    $(`.size p:contains('${objectFit}')`).toggleClass('active');
    
    // let bcgColor = $(`#preview [data-key=${key}]`).css('background-color')
    // $('.bg-color input:text').val(bcgColor)
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

oncontextmenu = (event) => {console.log(event) };

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

function setSize(event, size, key, type) {
    $(event.target).siblings().removeClass('active');
    $(event.target).toggleClass('active');

    $(`#preview [data-key=${key}]`).css({'object-fit' : size, 'width' : '100%', 'height' : '100%', 'top' : '0%', 'left' : '0%'});
    if (type === 'media_images' || type === 'media_gifs') {
        $(`#preview [data-key=${key}] img`).css({'object-fit' : size, 'height' : '100%'})
    }
    if (type === 'media_videos') {
        $(`#preview [data-key=${key}] video`).css({'object-fit' : size, 'height' : '100%'})
    }
}

function rotateRight(key) {
    var element = document.querySelector(`#preview [data-key='${key}']`);
    var startAngle = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', ''));
    var newAngle;
    if (startAngle) {
        newAngle = startAngle + 15;
    } else {
        newAngle = 15;
    }
    element.style.transform = 'rotate(' + newAngle + 'deg)'
}

function rotateLeft(key) {
    var element = document.querySelector(`#preview [data-key='${key}']`);
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

function setVideoAttribute(key, attribute, e) {
    var video = $(`#preview [data-key=${key}] video`);

    if( $(video).prop(attribute) ) {
            $(video).prop(attribute, false);
    } else {
        $(video).prop(attribute, true);
    }
    $(e.target).toggleClass('active');
    video.load();
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

function removeBackgroundImage(key) {
    $(`#preview [data-key='${key}']`).css({'background-image' : '', 'background-size' : '', 'background-repeat' : ''});
}

// function removeBackgroundColor(id) {
//     var elements = ['text', 'img', 'video'];
//     var count = 0;
//     elements.forEach(element => {
//         if ($("#" + id + element)[0]) {
//             $("#" + id + element).css({'background-color' : 'transparent'});
//             count = count + 1;
//         }
//     })
//     if (id === null) {
//         $("#preview").css({'background-color' : 'transparent'});
//     }
//     if (id !== null && count === 0) {
//         $("#" + id).find('.popup-body').css({'background-color' : 'transparent'});
//     }
// }

// function displayModal() {
//     displayIfHidden(document.getElementById("save-new-modal"));
// }

// function closeModal() {
//     document.getElementById("file-name").value = "";
//     hideIfDisplayed(document.getElementById("save-new-modal"));
// }

// socket.on('response', (response) => {
//     alert(response);
// })

// function clearPreview() {
//     window.location.reload();
// }

// function hideIfDisplayed(element) {
//     if (element.classList.contains("d-none") === false) {
//         element.classList.add("d-none");
//     }
// }

// function displayIfHidden(element) {
//     if (element.classList.contains("d-none")) {
//         element.classList.remove("d-none");
//     }
// }

function displayMediaList() {
    $( "#media" ).dialog({
        resizable: false,
        modal: true,
        maxHeight: 600,
        minWidth: 500
    });
}


function activateColorPicker() {
    $('.color-picker')
    .on('input change', function() {
      var $this = $(this);
      var val = $this.val();
    
      if($this.context.id !== "preview_background") {
        var inputs = {"key" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
        // if ($("#" + inputs.id + "text")[0]) {
        //     $("#" + inputs.id + "text").css(inputs['CSSparameter'], val);
        // } else if ($("#" + inputs.id + "img")[0]) {
        //     $("#" + inputs.id + "img").css(inputs['CSSparameter'], val);
        // } else {
        //     $("#" + inputs.id).find('.popup-body').css(inputs['CSSparameter'], val);
        // }
        $(`#preview [data-key=${inputs.key}]`).css(inputs['CSSparameter'], val)
        
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

// function addAvatarsArea(e) {
//     setElements('', 'avatars');
// }

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


// LIVE STREAM
function getMediaStream() {
    let data_key = createRandomString(5);
    // ADD TO MAIN DATA MEDIA ORDER TO MANIPULATE Z INDEXES
    mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]['screen']['media-order'].push(data_key);
   const li = `<li data-key=${data_key} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>Stream</li>`;
   $('#step-media ul').append(li);
   setElements('', 'videoStream', data_key);
    
   applyZIndexes();
   setTimeout(() => {
       $(".ui-dialog-titlebar-close"). click();
   }, 200);   

   
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



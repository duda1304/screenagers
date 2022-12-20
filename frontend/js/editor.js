let mainData = {};
// const socket = io();

// MAIN STATUS TRACKER
let active = {
    fileName : "",
    scene : "",
    step : ""
}

const screens = ['screen', 'laptop'];

let activeScreen = 'screen';

$('#delete-media-button').on('click', showTooltips);
$('#edit-media-button').on('click', showTooltips);

$('.screens div').on('click', function(){
    $('.screens div').not(this).removeClass('active');
    $(this).addClass('active');
    activeScreen = $(this).text().toLowerCase();

     // deactivate active media
     if ($('#step-media li.active').length !== 0){
        $('#step-media li.active').click();
    }

    // adjust console radio button
    if ($(`#${activeScreen} .console`).css('display') === 'none') {
        $('#console-checkbox').prop('checked', false);
    } else {
        $('#console-checkbox').prop('checked', true);
    }

    // toggle media list
    $(`#step-media .${activeScreen}`).show();
    $(`#step-media ul`).not(`.${activeScreen}`).hide();

    // pause music on previous screen and start on active
    // $(`.preview`).not(`#${activeScreen}`).find('audio').pause();
    // $(`#${activeScreen} audio`).play();

    // pause videos on previus screena and start on active
    // $(`.preview`).not(`#${activeScreen}`).find('video').pause();
    // $(`#${activeScreen} video`).play();

    // toggle preview
    $(`#${activeScreen}`).show();
    $('.preview').not(`#${activeScreen}`).hide();

    

});

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

        // TOGGLE SCENE
        $("#" + id + "toggler").click(function() {
            $(".toggler").not(this).nextAll().hide();
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
            $(`#step-media ul`).empty();
            screens.forEach(screen => $(`#${screen}`).empty());
            $('#console-checkbox').prop('checked', false);
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
        $(`#step-media ul`).empty();
        screens.forEach(screen => $(`#${screen}`).empty());
        $('#console-checkbox').prop('checked', false);
    })
    
}

let currentBoiteType;
// BOITE
$('#boites_types').on('click', '.button_radio', function(){
    if ($(this).find('input').is(':checked')) {
        const boiteObject =     {
            "type": "",
            "arg": ""
            }
        let data = {...boiteObject};
        data.type = $(this).find('input').val();
        $('#boite textarea').val('');
        data.arg = $('#boite textarea').val();
        currentBoiteType = $(this).find('input').val();
        setBoite(data);
    }
});

$('#boite textarea').on('input', function() {
    const boiteObject =     {
        "type": "",
        "arg": ""
        }
    let data = {...boiteObject};
    data.type = currentBoiteType;
    data.arg = $(this).val();
    setBoite(data);
})

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

    if (step !== '') {
        $('#select-audio').prop('disabled', false);
    } else {
        $('#select-audio').prop('disabled', true);
    }
}

function applyZIndexes() {
    let mediaOrder = [];
    $(`#step-media .${activeScreen} li`).each(function(){mediaOrder.push($(this).data('key'))})
    mediaOrder.forEach((value, index) => {
        $(`#${activeScreen} [data-key=${value}]`).css({"z-index" : index + 1});
    })
}

function clearUnwantedMedia(stepMedia){ 
    let keysArray = [].map.call($(`#${activeScreen}`).children().not('#boite, audio'), function (e) {
    return e.getAttribute('data-key')
    })

    keysArray.forEach(key => {
        if (!stepMedia[key]) {
            $(`#${activeScreen} [data-key=${key}]`).remove();
        }
    })
}

$(`#step-media .${activeScreen}`).sortable({
    start : function (event, ui) {
       startPosition = ui.item.index();
    },
    stop: function(event, ui) {
        let endPosition = ui.item.index();
        if (endPosition !== startPosition) {
            applyZIndexes();
        }
    }
});    


// STEP IS DISPLAYED FROM SAVED JSON DATA
function setStep(e, fileName, scene, step) {
    $(".step").not(e.target).removeClass('active');
    $(e.target).parent().find('.structure-buttons').remove();
    $(e.target).toggleClass('active');

    // CLEAR PREVIOUS  STEP DATA LIST
    $(`#step-media ul`).empty();
    $('#console-checkbox').prop('checked', false);

    if($(e.target).hasClass('active')) {
        setActiveStep(fileName, scene, step);

        // APPEND clone and delete buttons to step
        $(e.target).append(`<div class="structure-buttons">
                                <span onclick="duplicate('step')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                                <span onclick="deleteFromStructure('step')"><img src="./icons/trash.svg"></img></span>
                            </div>`)

        // DISPLAY step media
        displayActiveStepMedia(); 
      
    } else {
        setActiveStep(fileName, scene, ""); 
        screens.forEach(screen => $(`#${screen}`).empty());
    }
}

function displayActiveStepMedia() {
    $.getJSON('./data/json/' + active.fileName + '.json', function(jsonData) {
        let currentActiveScreen = activeScreen;

        screens.forEach(screen => {
            activeScreen = screen;
            const mediaOrder = jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['media-order'];
            const stepMedia = jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['media'];
            
            clearUnwantedMedia(stepMedia);
            for (let data_key of mediaOrder) {
                // DISPLAY MEDIA IN MEDIA LIST
                let liName;
                if (stepMedia[data_key]['type'] === 'media_images' || stepMedia[data_key]['type'] === 'media_video' || stepMedia[data_key]['type'] === 'media_gifs') {
                    liName = getFileName(stepMedia[data_key]['attributes']['src']);
                } else {
                    liName = stepMedia[data_key]['type']
                }
                const li = `<li data-key=${data_key} data-type=${stepMedia[data_key]['type']} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${liName}</li>`;
                $(`#step-media .${activeScreen}`).append(li);
                // DISPLAY STEP IN MEDIA PREVIEW
                setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
            }
            applyZIndexes();
            setElements("", "console", "", jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['console']);
            setElements("", "media_audio", "", jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['audio']);
            $(`#${screen}`).css('background-color', jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['background-color']);
        });

        activeScreen = currentActiveScreen;
       
        // SET console radio box state for active screen
        if ( $(`#${activeScreen} .console`).css('display') === 'none' ) {
            $(`#console-checkbox`).prop("checked", false);
        } else {
            $(`#console-checkbox`).prop("checked", true);
        }

        // set boite
        if ('boite' in jsonData['scenes'][active.scene]['steps'][active.step]) {
            setBoite(jsonData['scenes'][active.scene]['steps'][active.step]['boite']);
            $('#boite input').each(function(){
                $(this).prop('checked', false);
                $(`#boite input[value=${jsonData['scenes'][active.scene]['steps'][active.step]['boite']['type']}]`).prop('checked', true);
            })
        }
    }) 
}

// ADD ELEMENTS
function setElements(val, type, data_key, stepMediaObject) {
    src = htmlPathToMedia + val;
   
    const avatarsElement = `<div class="avatars draggable resizable" style="width: 25%; height: 15%; position: absolute; top: 25%; left:25%; border-radius: 45%; z-index:99;" data-key=${data_key} data-type=${type}><img style = "width: 100%; height: 100%;" class="media"></img></div>`;

    const console = `<div class="console draggable resizable" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:100;"><iframe src="/console" style="width:100%; height: 100%; border: none;"></iframe></div>`;

    const imageElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}><img style="width: 100%;" src=${src} class="media"></img></div>`

    const videoElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}><video autoplay style="width: 100%;" src=${src} class="media"></video></div>`
                   
    const audioElement = `<audio autoplay class="audio" data-key=${data_key} data-type=${type} src=""></audio>`

    const streamElement = `<div class="draggable resizable" style="width: 35%; height: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                            <video autoplay style="width: 100%;" class="media"> </video>
                           </div>`
   
    const textElement = `
                            <pre contenteditable="true" class="text draggable" style="position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type} 
                                     style=" 
                                     white-space: pre-wrap; 
                                     word-wrap: break-word;
                                     color: white;
                                     font-size: 16px;
                                     margin: 0px;
                                     font-family: Arial;
                                     "
                            >${val}</pre>
                        `
    
    const elements = {
        'media_images' : imageElement,
        'media_gifs' : imageElement,
        'media_video' : videoElement,
        // 'media_audio' : audioElement,
        'videoStream' : streamElement,
        'avatars' : avatarsElement,
        'text' : textElement
    }

    if (type in elements) {
        if($(`#${activeScreen} [data-key=${data_key}]`).length === 0) {
            $(`#${activeScreen}`).append(elements[type]);
        }
    }
  
    if(type === 'console') {
        if($(`#${activeScreen} .console`).length === 0) {
            $(`#${activeScreen}`).append(console);
        }
    } 
    
    if (type === 'media_audio') {
        if($(`#${activeScreen} audio`).length === 0) {
            $(`#${activeScreen}`).append(audioElement);
        }
        if (val !== '' && !$(`#${activeScreen} audio`).attr('src').includes(val)) {
            $(`#${activeScreen} audio`).attr('src', src)
        }
    }
   
    if (type === 'text') {
        $(`#${activeScreen} [data-key=${data_key}]`).focus();
    }

    // DEFINE FUNCTIONS FOR ELEMENT TO BE DRAGGABLE AND RESIZABLE
    $(`#${activeScreen} .draggable`).draggable({
        stop: function () {
            const l = Math.round(( 100 * parseFloat($(this).position().left / parseFloat($(`#${activeScreen}`).width())) )) + "%" ;
            const t = Math.round(( 100 * parseFloat($(this).position().top / parseFloat($(`#${activeScreen}`).height())) )) + "%" ;
            $(this).css("left", l);
            $(this).css("top", t);
        }
    });

    $(`#${activeScreen} .draggable`).mousedown(function(){
        $(`#${activeScreen} .draggable`).not(this).removeClass('active');
        $(this).addClass('active');
        // MARK ACTIVE IN MEDIA LIST
        $(`#step-media .${activeScreen} li`).not(`li[data-key="${this.dataset.key}"]`).removeClass('active');
        $(`#step-media .${activeScreen}`).find(`li[data-key="${this.dataset.key}"]`).addClass('active');
        // SET EVENT LISTENERS ON BUTTONS
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        let previewElement = $(this);
        let data_key = this.dataset.key;
        let type = this.dataset.type;
        if ($(this).hasClass('active')) {
            $("#delete-media-button").click(function(){
                $(previewElement).remove();
                $(`#step-media .${activeScreen}`).find(`li[data-key="${data_key}"]`).remove();
                $("#delete-media-button").unbind("click");
                $("#edit-media-button").unbind("click");
                $("#delete-media-button").on("click", showTooltips);
                $("#edit-media-button").on("click", showTooltips);
                applyZIndexes();
            })
            $("#edit-media-button").click(function(){
                editElement(data_key, type)
            })
        } else {
            $("#delete-media-button").unbind("click");
            $("#edit-media-button").unbind("click");
            $("#delete-media-button").on("click", showTooltips);
            $("#edit-media-button").on("click", showTooltips);
        }
    });

    $(".resizable").resizable({
        handles: "se",
        resize: function () {
            $(this).css("object-fit", "");
            $(this).children().each(function(){$(this).css("object-fit", "");$(this).css("height", "");})
            const w = Math.round(( 100 * $(this).width() / $(`#${activeScreen}`).width() )) + "%" ;
            const h = Math.round(( 100 * $(this).height() / $(`#${activeScreen}`).height() )) + "%" ;
            $(this).css("width", w);
            $(this).css("height", h);
        }
    });

    // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
    if (stepMediaObject) {
        if (type === 'console') {
            if (!stepMediaObject['active']) {
                $(`#${activeScreen} .${type}`).hide();
                // $(`#${type}-checkbox`).prop("checked", false);
            } else {
                $(`#${activeScreen} .${type}`).show();
                // $(`#${type}-checkbox`).prop("checked", true);
            }
            $(`#${activeScreen} .${type}`).css(stepMediaObject['css']);
        } else if (type === 'media_audio') {
            let mediaElement = $(`#${activeScreen} audio`);
            if (!mediaElement.attr('src').includes(stepMediaObject['src'])) {
                mediaElement.attr('src', htmlPathToMedia +  stepMediaObject['src']); 
            }
            mediaElement.attr('volume', stepMediaObject['volume'])
            mediaElement.attr('loop', stepMediaObject['loop'])
        }   
        
        else {
            // APPLY CSS
            let mediaElement = $(`#${activeScreen}`).find(`*[data-key="${data_key}"]`);
            mediaElement.removeAttr('style');
            mediaElement.css(stepMediaObject['css']);

            // APPLY LOOP AND MUTED TO VIDEOS
            if(stepMediaObject['type'] === 'media_video') {
                mediaElement.find('.media').prop('muted', stepMediaObject['attributes']['muted'])
                mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop'])
            }

            // CHECK IF NEW SRC SHOULD BE APPLIED
            if (stepMediaObject['type'] === 'media_video' || stepMediaObject['type'] === 'media_images' || stepMediaObject['type'] === 'media_gifs') {
                if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
                    mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
                }
            }

            if (stepMediaObject['type'] === 'videoStream') {
                if (mediaElement.find('video').data('device') !== stepMediaObject['attributes']['device']) {
                    const constraints = {
                        video: { deviceId: stepMediaObject['attributes']['device']}
                    };
                    mediaElement.find('video').data('device', stepMediaObject['attributes']['device']);
                    startStream(constraints, data_key, activeScreen);
                }
            }

             // ADD NEW TEXT IF NEEDED
             if (stepMediaObject['type'] === 'text') {
                if (mediaElement.text() !== stepMediaObject['content']) {
                    mediaElement.text(stepMediaObject['content']);
                }
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
    $(`#${activeScreen}`).find(`[data-key='${e.target.dataset.key}']`).toggle();
}

function markActiveStepMediaElement(e) {
    // MARK IN MEDIA LIST
    $(`#step-media .${activeScreen} li`).not(e.target).removeClass('active');
    $(e.target).toggleClass('active');

    // MARK IN PREVIEW
    $(`#${activeScreen} .draggable`).not(`#${activeScreen} .draggable[data-key='${e.target.dataset.key}']`).removeClass('active');
    $(`#${activeScreen} .draggable[data-key='${e.target.dataset.key}']`).toggleClass('active');

    // ADD EVENT LISTENERS
    if ($(e.target).hasClass('active')) {
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        $("#delete-media-button").click(function(){
            $(`#${activeScreen} .draggable[data-key='${e.target.dataset.key}']`).remove();
            $(e.target).remove();
            $("#delete-media-button").unbind("click");
            $("#edit-media-button").unbind("click");
            $("#delete-media-button").on("click", showTooltips);
            $("#edit-media-button").on("click", showTooltips);
            applyZIndexes();
        })
        $("#edit-media-button").click(function(){
            editElement(e.target.dataset.key, e.target.dataset.type);
        })
    } else {
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        $("#delete-media-button").on("click", showTooltips);
        $("#edit-media-button").on("click", showTooltips);
    }
}

function addMedia(e) {
    if (active.step !== "") {
        displayMediaList();
    } else {
        const button = e.currentTarget;
        $(button).addClass('active');
            setTimeout(() => {
                $(button).removeClass('active');
            }, 1800);
    }
}

function styleToObject(style) {
    const regex = /([\w-]*)\s*:\s*([^;]*)/g;
    let match, properties={};
    while(match=regex.exec(style)) properties[match[1]] = match[2].trim(); 
    return properties;
}

function analyseStep(updatedStepObject) {
    // let updatedStepObject = Object.assign({}, stepObject);

    updatedStepObject[activeScreen]['background-color'] = $(`#${activeScreen}`).css('background-color');

    let mediaOrder = [];
    $(`#step-media .${activeScreen} li`).each(function(){mediaOrder.push($(this).data('key'))});
    updatedStepObject[activeScreen]['media-order'] = mediaOrder;


    let updatedMediaObject = {};

    // get all media elements
    $(`#${activeScreen}`).children().not('.console, .audio, #boite').each(function(){
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

        if ($(this).data('type') === 'media_video' || $(this).data('type') === 'media_images' || $(this).data('type') === 'media_gifs') {
            object['attributes']['src'] = $(this).children().attr('src').replace(htmlPathToMedia, '');
        } 

        if($(this).data('type') === 'media_video') {
            object['attributes']['loop'] = $(this).find('video')[0].loop;
            object['attributes']['muted'] = $(this).find('video')[0].muted;
        }

        let classArray = $(this).attr('class').split(" ");

        classArray.forEach(element => {
            if (!element.includes('draggable') && !element.includes('resizable') && !element.includes('active')) {
                object['classes'].push(element);
            }
        })

        if ($(this).data('type') === 'text') {
            object['content'] = $(this).text();
        }
       
        updatedMediaObject[$(this).data('key')] = object;
    })

    updatedStepObject[activeScreen]['media'] = updatedMediaObject;

    // add console
    if ($(`#${activeScreen} .console`).css('display') === 'none') {
        updatedStepObject[activeScreen]['console']['active'] = false;
    } else {
        updatedStepObject[activeScreen]['console']['active'] = true;
    }
    // updatedStepObject[activeScreen]['console']['active'] = $('#console-checkbox').is(':checked');
    updatedStepObject[activeScreen]['console']['css'] = styleToObject($(`#${activeScreen} .console`).attr('style'));

    // if ($('#console-checkbox').is(':checked')) {
    //     updatedStepObject['console'] = {...consoleObject};
    // }

    // add boite
        updatedStepObject['boite'] = {...boiteObject};
        let boite_type;
        $('#boite input').each(function(){
            if($(this).is(':checked')) {
                boite_type = $(this).val();
            } 
        })
        updatedStepObject['boite']['type'] = boite_type;
        updatedStepObject['boite']['arg'] = $('#boite textarea').val();

    // add audio
    updatedStepObject[activeScreen]['audio']['scr'] = $(`#${activeScreen} audio`).attr('src');
    updatedStepObject[activeScreen]['audio']['loop'] = $(`#${activeScreen} audio`).loop;

    return updatedStepObject;
}

function saveStep(e) {
    if (active.step !== "") {
        let currentActiveScreen = activeScreen;
        let step = { 
            "screen" :  {
                            "media-order": [],
                            "background-color": "rgb(0, 0, 0)",
                            "media": {},
                            "console": {
                                "active": false,
                                "css": {}
                            },
                            "audio" : {
                                "src": "",
                                "volume": "",
                                "loop": ""
                            }
                        },
            "laptop" :  {
                            "media-order": [],
                            "background-color": "rgb(0, 0, 0)",
                            "media": {},
                            "console": {
                                "active": false,
                                "css": {}
                            },
                            "audio" : {
                                "src": "",
                                "volume": "",
                                "loop": ""
                            }
                        },
            "boite" :   {
                            "type": "no_phone",
                            "arg": ""
                        }
            }

        screens.forEach(screen => {
            activeScreen = screen;
            const update = analyseStep(step);
            Object.assign(step, update);
        });
        activeScreen = currentActiveScreen;
        // SAVE TO JSON
        socket.emit("save step", {"fileName" : active.fileName, "scene": active.scene, "step" : active.step, 'stepObject' : step})
    } else {
        const button = e.currentTarget;
        $(button).addClass('active');
        setTimeout(() => {
            $(button).removeClass('active');
        }, 1800);
    }
}

function createNewObjectKey(array) {
    if (array.length > 0) {
        return Math.max(...array) + 1;
    } else {
        return 1;
    }
}

function closeModal() {
    setTimeout(() => {
        $(".ui-dialog-titlebar-close"). click();
    }, 200);  
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
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
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

            let newShowObject = Object.assign({}, showObject);
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
                    <button id="ok">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            let newStepNumber = createNewObjectKey(mainData[active.fileName]['scenes'][active.scene]['step-order']);
            // let newStepObject = {...stepObject};
            let newStepObject = Object.assign({}, stepObject);
            // let newStepObject = { 
            //     "screen" :  {
            //                     "media-order": [],
            //                     "background-color": "",
            //                     "media": {},
            //                     "console": {
            //                         "active": false,
            //                         "css": {}
            //                     },
            //                     "audio" : {
            //                         "src": "",
            //                         "volume": "",
            //                         "loop": ""
            //                     }
            //                 },
            //     "laptop": {
            //         "media-order": [],
            //         "background-color": "",
            //         "media": {},
            //         "console": {
            //             "active": false,
            //             "css": {}
            //         },
            //         "audio": {
            //             "src": "",
            //             "volume": "",
            //             "loop": ""
            //         }
            //     },
            //     "boite" : {
            //         "type": "no_phone",
            //         "arg": ""
            //     }
            //     }
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
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
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
            let newSceneObject = Object.assign({}, sceneObject);
            newSceneObject['name'] = sceneName;
            newSceneObject['step-order'] = [1];
            let emptyStep = Object.assign({}, stepObject);
            newSceneObject['steps']['1'] = emptyStep;
           
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
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
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
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
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
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
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
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
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
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
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
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
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
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            // SAVE CHANGES TO JSON FILE
            deleteScene();
            showSpinner();
        })
    }

    if (parameter === 'show') {
        $('#alert')
        .empty()

        if (active.fileName === '') {
            $('#delete-scene-step-button').addClass('active');
            setTimeout(() => {
                $('#delete-scene-step-button').removeClass('active');
            }, 1800);
        } else {
            $('#alert')
            .append(`<p>Delete ${mainData[active.fileName]['name']}?</p>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                    </div>`)
            .dialog({
                resizable: false,
                modal: true,
                maxHeight: 600,
            });

            // OK BUTTON FUNCTION
            $('#alert #ok').click(function() {
                // SAVE CHANGES TO JSON FILE
                deleteShow();
                showSpinner();
            })
        }
    }
}

function showTooltips(e) {
    const button = e.currentTarget;
    $(button).addClass('active');
    setTimeout(() => {
        $(button).removeClass('active');
    }, 1800);
}

function showSpinner() {
    $('#alert')
    .empty()
    .append(`<div class="spinner"><div>`);
}

socket.on('success', function(data){

    // EMPTY PREVIOUS STRUCTURE AND STEP PREVIEW
    $(`#step-media ul`).empty();
    $('#structure-content').empty();
    $('#console-checkbox').prop('checked', false);

    // UNBIND EVENT LISTENERS
    $("#delete-media-button").unbind("click");
    $("#edit-media-button").unbind("click");
    
    $("#delete-media-button").on("click", showTooltips);
    $("#edit-media-button").on("click", showTooltips);

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
    closeModal();
})

socket.on('error', function(data){
    $('#alert')
    .empty()
    .append(`<p>Connection to server failed. Please try again.</p>
            <div class='editor-buttons' style='justify-content: center;'>
                <button type='button'onclick="closeModal()">Close</button>
            </div>`);

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
            $(`#${activeScreen} .${$(this).attr('name')}` ).show();
        } else {
            $(`#${activeScreen} .${$(this).attr('name')}` ).hide();
        }
    } 
    else {
        $(this).prop("checked", false);
    }
    
});

function addNewStep(newStepNumber, step) {
    socket.emit("add step", {"fileName" : active.fileName, "scene" : active.scene, "key" : newStepNumber, "step" : step, "activeStep" : active.step});
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

function toggleDebugger() {
//     if (active.step !== "") {
//     $('#debug').toggleClass('active');
    
//     if ($('#debug').hasClass('active')) {
//         let currentActiveScreen = activeScreen;
//     let step = {};
//     screens.forEach(screen => {
//         activeScreen = screen;
//         step = Object.assign(step, analyseStep());

//     });
//     activeScreen = currentActiveScreen;
//     sendStep(step);
//         $(`#${activeScreen}`).hide();
//         $('#preview-step').text('Close debugger');
//     } else {
//         $('#preview').show();
//         $('#preview-step').text('Preview in debugger');
//     }
// }
}

function sendStep(step) {
    // const step = analyseStep();
    socket.emit('step', step);
    // if (boite && 'send' in boite) boite.send();
}


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

var datalists = {
    decors: {
      el: $('<datalist id="list_decors"></datalist>'),
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


function addAvatars() {
    let data_key = createRandomString(5);
    const li = `<li data-key=${data_key} data-type='avatars' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>Avatars</li>`;
    $(`#step-media .${activeScreen}`).append(li);
    setElements('', 'avatars', data_key);
    applyZIndexes();
    closeModal(); 
}

function addText() {
    let data_key = createRandomString(5);
    const li = `<li data-key=${data_key} data-type='text' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>Text</li>`;
    $(`#step-media .${activeScreen}`).append(li);
    setElements('', 'text', data_key);
    applyZIndexes();
    $(`${activeScreen} [data-key=${data_key}]`).text($('#text-content').val());
    closeModal();   
}

$media.on('mousedown', '.file', function() {
    let data_key = createRandomString(5);
    const li = `<li data-key=${data_key} data-type=${this.parentElement.className} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${getFileName($(this).attr('title'))}</li>`;
    $(`#step-media .${activeScreen}`).append(li);
    
    setElements($(this).attr('title'), this.parentElement.className, data_key);

    applyZIndexes();
    closeModal();  
});

var medias = {
// styles: $('.media_styles'),
// decors: $('.media_decors'),
// pages: $('.media_pages'),
// layouts: $('.media_layouts'),
video: $('.media_video'),
audio: $('.media_audio'),
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
    // var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;
    var file = `<div title="${val}" class="file">${val}</div>`;
    if (
    val.endsWith('.wav') ||
    val.endsWith('.flac') ||
    val.endsWith('.mp3') ||
    val.endsWith('.ogg')
    ) {
        $('#select-audio').append(`<option>${val}</option>`);
    } else if (
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

$('#select-audio').change(function(){
    setElements('', 'media_audio', '', $(`#select-audio option:selected`).text());
    // $(`#${activeScreen} audio`).attr('src', htmlPathToMedia + $(`#select-audio option:selected`).text());
});

function toggleMediaList(e) {
    e.target.classList.toggle('active')
    $('#alert #media-backgrounds').toggleClass('d-none');
}

// EDITING

function editElement(key, type) {
  
    if (type === 'text') {

        var textStyle = getComputedStyle($(`#${activeScreen} [data-key=${key}]`)[0]);

        var isActive = {
            "bold" : (textStyle.fontWeight === '700') ? ('active') : (''),
            "italic" : (textStyle.fontStyle === 'italic') ? ('active') : (''),
            "underline" : (textStyle.textDecorationLine === 'underline') ? ('active') : (''),
            "center" : (textStyle.textAlign === 'center') ? ('active') : (''),
            "left" : (textStyle.textAlign === 'left') ? ('active') : (''),
            "right" : (textStyle.textAlign === 'right') ? ('active') : ('')
        }
        $('#alert')
        .empty()
        .append(`<div class = 'editor-menu'>  
                        <div class='menu-item'>
                            <label for="color">FONT COLOR</label>
                            <input
                                id = ${key + '_color'} 
                                autocomplete="off"
                                _list="list_decors"
                                class="color-picker _box-min d-none"
                                type="text"
                                name="color"
                                value= ${(textStyle.color) ? (textStyle.color.replaceAll(' ', '')) : ('rgb(255,255,255)')}
                            />
                        </div>
                        <div class='menu-item'>
                            <label for="background-color">BACKGROUND COLOR</label>
                            <input
                                id = ${key + '_background-color'} 
                                autocomplete="off"
                                _list="list_decors"
                                class="color-picker _box-min d-none"
                                type="text"
                                name="background-color"
                                value = ${(textStyle.backgroundColor) ? (textStyle.backgroundColor.replaceAll(' ', '')) : ('transparent')} 
                            />
                        </div>
                        <div class='menu-item'>
                            <p>PADDING</p>
                            <input class='padding' type="number" min = '0' id = ${key + '_padding'} value=${textStyle.padding.replace('px', '')}>
                        </div>
                        <div class='menu-item'>
                            <p>FONT STYLE</p>
                            <select class='font-family' id=${key + '_font-family'}>
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
                            <p>FONT SIZE</p>
                            <input class='font-size' type="number" min = '0' id = ${key + '_font-size'} value=${textStyle.fontSize.replace('px', '')}>
                        </div>
                        <div class='editor-buttons'>
                            <div class='menu-item'>
                                <button class='font-style ${isActive.bold}' id = ${key + '_font-weight_bold'}>
                                    <img class='icon' src="../icons/bold.svg"></img>
                                </div>
                            </button>
                            <div class='menu-item'>
                                <button class='font-style ${isActive.italic}' id = ${key + '_font-style_italic'}>
                                    <img class='icon' src="../icons/italic.svg"></img>
                                </div>
                            </button>
                            <div class='menu-item'>
                                <button class='font-style ${isActive.underline}' id = ${key + '_text-decoration_underline'}>
                                    <img class='icon' src="../icons/underline.svg"></img>
                                </button>
                            </div>
                        </div>
                        <div class='editor-buttons'>
                            <div class='menu-item'>
                                <button class='text-align ${isActive.center}' id = ${key + '_text-align_center'}>
                                    <img class='icon' src="../icons/align-center.svg"></img>
                                </div>
                            </button>
                            <div class='menu-item'>
                                <button class='text-align ${isActive.left}' id = ${key + '_text-align_left'}>
                                    <img class='icon' src="../icons/align-left.svg"></img>
                                </div>
                            </button>
                            <div class='menu-item'>
                                <button class='text-align ${isActive.right}' id = ${key + '_text-align_right'}>
                                    <img class='icon' src="../icons/align-right.svg"></img>
                                </button>
                            </div>
                        </div>
                        Border
                        <div class='menu-item'>
                            <input 
                                class ='font-size menu-item border' 
                                type ="number" 
                                min = '0'
                                id = ${key + '_border-width'} 
                                value = ${(textStyle.borderWidth) ? (parseInt(textStyle.borderWidth.replace('px', ''))) : (0)} 
                            >
                        </div>
                        <div class='menu-item'>
                            <input
                                id = ${key + '_border-color'} 
                                autocomplete="off"
                                _list="list_decors"
                                class="color-picker _box-min d-none menu-item"
                                type="text"
                                name="border-color"
                                value = ${(textStyle.borderColor) ? (textStyle.borderColor.replaceAll(' ', '')) : ('transparent')} 
                            />
                        </div>
                        <select value = ${(textStyle.borderStyle) ? (textStyle.borderStyle) : ('none')}  class='menu-item border' id = ${key + '_border-style'}>
                            <option value='solid' ${(textStyle.borderStyle == 'solid') ? ('selected') : (null)}>Solid</option>
                            <option value='dashed' ${(textStyle.borderStyle == 'dashed') ? ('selected') : (null)}>Dashed</option>
                            <option value='dotted' ${(textStyle.borderStyle == 'dotted') ? ('selected') : (null)}>Dotted</option>
                            <option value='double' ${(textStyle.borderStyle === 'double') ? ('selected') : (null)}>Double</option>
                            <option value='none' ${(textStyle.borderStyle === 'none' || textStyle.borderStyle === '') ? ('selected') : (null)}>none</option>
                        </select>
                        <div class='menu-item rotation'>
                            <p>ROTATION</p>
                            <div class='editor-buttons'>
                                <button>
                                <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight('${key}');"></img>
                                </button>
                            </div>
                            <div class='editor-buttons'>
                            <button>
                                <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft('${key}');"></img>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`)
                .dialog({
                    resizable: false,
                    modal: true,
                    maxHeight: 600,
                    dialogClass: "no-titlebar"
                });

    activateColorPicker();
    activateFontSizeControler();
    activatePaddingControler();
    activateFontStyleControler();
    activateTextAlignControler();
    activateBorderControler();
    activateFontFamilyControler();
    } else {
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
            dialogClass: "no-titlebar"
        });
        $('#media .media_images').clone().appendTo('#background-images').show();
        $('#media .media_gifs').clone().appendTo('#background-gifs').show();
        $('#background-images .media_images').children().click(function(){
            $(`#${activeScreen} [data-key=${key}]`).css({'background-image': `url('${htmlPathToMedia}${this.title}')`, 'background-size': 'cover', 'background-repeat': 'no-repeat'})
        });
        $('#background-gifs .media_gifs').children().click(function(){
            $(`#${activeScreen} [data-key=${key}]`).css({'background-image': `url('${htmlPathToMedia}${this.title}')`, 'background-size': 'cover', 'background-repeat': 'no-repeat'})
        });
        activateColorPicker();
    }
    if (type === 'media_video') {
        const video = $(`#${activeScreen} [data-key=${key}] video`)[0];
        $('#alert .editor-menu')
        .append(`<div class='menu-item video-controls'>
                    <p class='editor-section'>CONTROLS</p> 
                    <div class='loop editor-buttons'>
                        <button class="${(video.loop) ? ('active') : ('')}" onclick="setVideoAttribute('${key}', 'loop', event);">
                            <img class="icon" src="../icons/arrow-rotate-right-solid.svg"></img>
                        </button>
                    </div>
                    <div class='editor-buttons'>
                        <button class="mute ${(video.muted) ? ('active') : ('')}" onclick="setVideoAttribute('${key}', 'muted', event);">
                        </button>
                    
                    </div>
                </div>`)
    }

    // APPLY CURRENT STYLE
    let objectFit = $(`#${activeScreen} [data-key=${key}]`).css('object-fit').toUpperCase();
    $(`.size p:contains('${objectFit}')`).toggleClass('active');
}

oncontextmenu = (event) => {console.log(event) };

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
       
        $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], newValue);
      })
}

function activateTextAlignControler() {
    $('.text-align')
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
       
        $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], newValue);
      })
}

function activateFontSizeControler() {
    $('.font-size')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val + 'px');
    })
}

function activatePaddingControler() {
    $('.padding')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val + 'px');
    })
}

function activateFontFamilyControler() {
    $('.font-family')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val);
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

      $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val + unit);
    })
}

function setSize(event, size, key, type) {
    $(event.target).siblings().removeClass('active');
    $(event.target).toggleClass('active');

    $(`#${activeScreen} [data-key=${key}]`).css({'object-fit' : size, 'width' : '100%', 'height' : '100%', 'top' : '0%', 'left' : '0%'});
    if (type === 'media_images' || type === 'media_gifs') {
        $(`#${activeScreen} [data-key=${key}] img`).css({'object-fit' : size, 'height' : '100%'})
    }
    if (type === 'media_videos' || type === 'videoStream') {
        $(`#${activeScreen} [data-key=${key}] video`).css({'object-fit' : size, 'height' : '100%'})
    }
}

function rotateRight(key) {
    var element = document.querySelector(`#${activeScreen} [data-key='${key}']`);
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
    var element = document.querySelector(`#${activeScreen} [data-key='${key}']`);
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
    var video = $(`#${activeScreen} [data-key=${key}] video`);

    if( $(video).prop(attribute) ) {
            $(video).prop(attribute, false);
    } else {
        $(video).prop(attribute, true);
    }
    $(e.currentTarget).toggleClass('active');
    video.load();
}

function removeBackgroundImage(key) {
    $(`#${activeScreen} [data-key='${key}']`).css({'background-image' : '', 'background-size' : '', 'background-repeat' : ''});
}

function displayMediaList() {
    $("#text-content").val('');
    $( "#media" ).dialog({
        resizable: false,
        modal: true,
        maxHeight: 600,
        minWidth: 500,
        dialogClass: "no-titlebar" 
    })
    getMediaStream();
}

function activateColorPicker() {
    $('.color-picker')
    .on('input change', function() {
      var $this = $(this);
      var val = $this.val();
    
      if($this.context.id !== "preview_background-color") {
        var inputs = {"key" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
        $(`#${activeScreen} [data-key=${inputs.key}]`).css(inputs['CSSparameter'], val)
        
      } else {
          $(`#${activeScreen}`).css('background-color', val);
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

// LIVE STREAM
function getMediaStream() {
    const cameraOptions = document.querySelector('.video-options>select');

    const constraints = {
        video: { deviceId: ''}
    };

    cameraOptions.onchange = () => {
        let data_key = createRandomString(5);
        const li = `<li data-key=${data_key} data-type='videoStream' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>Stream</li>`;
        $(`#step-media .${activeScreen}`).append(li);
        setElements('', 'videoStream', data_key);
        applyZIndexes();
        constraints.video.deviceId = cameraOptions.value;
        $(`#${activeScreen} [data-key=${data_key}] video`).data('device', cameraOptions.value);
        startStream(constraints, data_key, activeScreen);
        setTimeout(() => {
            $(".ui-dialog-titlebar-close"). click();
        }, 200); 
    };

    const getCameraSelection = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const options = videoDevices.map(videoDevice => {
            return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
        });
        cameraOptions.innerHTML = `<option value="">Select camera</option>` + options.join('');
    };

    getCameraSelection();
}

async function startStream(constraints, data_key, screen) {
    navigator.mediaDevices.getUserMedia( constraints )
    .then( MediaStream => {
        handleStream(MediaStream, data_key, screen);
    })
    .catch( error => {
        console.log(error);
    });
}

function handleStream(stream, data_key, screen) {
    $(`#${screen} [data-key=${data_key}] video`)[0].srcObject = stream;
}



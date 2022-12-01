// KADA NOVI SHOE NESMIJE IMATI RAZMAKA U FILENAMEu
const socket = io();

let mainData = {};


let active = {
    fileName : "",
    scene : "",
    step : ""
}

$(".resizable").resizable({
    handles: "se"
});

// separate JSONs for each show made, data gives array of all JSONs
socket.on('initial json', function(data) {
    setJSONsdata(data);
});

function setJSONsdata(data) { 
    mainData = {};
    let count = 0;

    data.sort().forEach(async(src) => {
        await $.getJSON(src.replace('frontend', '.'), function(jsonData) {
            let array = src.split('/');
            let fileName = array[array.length -1].replace('.json', '');
            mainData[fileName] = jsonData;
            displayStructure(fileName, jsonData);
            count = count + 1;
            console.log(active)
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
function makeid(length) {
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

        const id = makeid(5);
        $(`<li style="margin-top: 10px;" data-scene=${sceneOrderNumber}><b id=${id + 'toggler'} class="toggler">${scene.name}<b></li>`).appendTo(`#${fileName + 'sceneList'}`)
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
                    let movedElement = mainData[fileName]['scene-order'].splice(startPosition, 1)[0];
                    mainData[fileName]['scene-order'].splice(endPosition, 0, movedElement);
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
                    let movedElement = mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(startPosition, 1)[0];
                    mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(endPosition, 0, movedElement);
                    saveStepOrder(fileName, sceneOrderNumber, mainData[fileName]['scenes'][sceneOrderNumber]['step-order']);
                    console.log(mainData[fileName]['scenes'][sceneOrderNumber]['step-order']);

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
            $(".toggler").not(this).next().hide();
            $( "#" + id ).toggle();
            
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
        $(".show").not(`#${fileName}`).children().not('.show-name').hide()
        $(`#${fileName}`).children().not(this).toggle();
        
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

function setStep(e, fileName, scene, step) {
    $(".step").not(e.target).removeClass('active');
    $(e.target).toggleClass('active');

    // CLEAR PREVIOUS  STEP DATA LIST AND PREVIEW
    $('#step-media ul').empty();
    $('#preview').empty();

    if($(e.target).hasClass('active')) {
        setActiveStep(fileName, scene, step);
   
        // DISPLAY STEP DATA IN MEDIA LIST 
        let media = [];
        let zIndex = [];
        let sortedMedia;

        $.getJSON('./data/json/' + fileName + '.json', function(jsonData) {
            const stepData = jsonData['scenes'][scene]['steps'][step];

            // GET ALL STEP ELEMENTS AND ALL Z INDEXES
            stepData.image.forEach(image => media.push(image));
            stepData.stream.forEach(stream => media.push(stream));
            stepData.text.forEach(text => media.push(text));
            stepData.video.forEach(video => media.push(video));

            // SORT MEDIA ACCRODING TO Z INDEX TO DISPLAY LAYOUT ORDER 
            sortedMedia = media.sort((r1, r2) => (r1['z-index'] < r2['z-index']) ? 1 : (r1['z-index'] > r2['z-index']) ? -1 : 0);
            sortedMedia.forEach(element => {
                let data_key = makeid(5);
                const li = `<li data-key=${data_key} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${getFileName(element.src)}</li>`;
                $('#step-media ul').append(li);
                // DISPLAY STEP IN MEDIA LIST
                setElements(element.src, 'media_images', data_key, element);
            })
        }) 
    } else {
        setActiveStep(fileName, scene, ""); 
    }
}

function toggleVisibility(e) {
    $(e.target).toggleClass('visible');
    $('#preview').find(`[data-key='${e.target.dataset.key}']`).toggle();
}

// $('.up-button').click(function(){
//     $(this).parents('.leg').insertBefore($(this).parents('.leg').prev());
//     });
    
// $('.down-button').click(function(){
// $(this).parents('.leg').insertAfter($(this).parents('.leg').next());
// });

function markActiveStepMediaElement(e) {
    // MARK IN MEDIA LIST
    $("#step-media ul li").not(e.target).removeClass('active');
    $(e.target).toggleClass('active');

    // MARK IN PREVIEW
    $('.draggable').not(`.draggable[data-key='${e.target.dataset.key}']`).removeClass('active');
    $(`.draggable[data-key='${e.target.dataset.key}']`).toggleClass('active');

    // ADD EVENT LISTENERS
    $("#delete-media-button").unbind("click");
    if ($(e.target).hasClass('active')) {
        $("#delete-media-button").click(function(){
            $(`.draggable[data-key='${e.target.dataset.key}']`).remove();
            $(e.target).remove();
        })
        $('#layer-up').click(function(){
            $(e.target).parents('li').insertBefore($(e.target).parents('li').prev());
        })
        $('#layer-down').click(function(){
            $(e.target).parents('li').insertAfter($(e.target).parents('uli').next());
        })
            
        // $("#edit-media-button").click(function(){
        //     $(`[data-key='${e.target.dataset.key}']`).parent().remove();
        //     $(e.target).remove();
        // })
    }
   
}

function addMedia() {
    if (active.step !== "") {
        displayMediaList();
    }
}

function addInStructure() {
    if (active.fileName === "") {
        const languageList = Object.keys(languages);

        let options = `<option value="" selected disabled>Select language</option>`

        $.each(languages, function(index,value){
            options = options + `<option data-code=${index} value=${index}>${value}</option>`
        });

        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    <input type="text" name="name" placeholder="New show name" required></input>
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

            let newShowObject = showObject;
            newShowObject.name = showName;
            newShowObject.languages.push(e.target.elements.language.value.toUpperCase())
            
            // SAVE TO JSON FILE
            addNewShow(fileName, newShowObject);
            showSpinner();
            // // ADD TO MAINDATA
            // let newShowObject = showObject;
            // newShowObject['name'] = showName;
            // newShowObject['languages'].push(e.target.elements.language.value.toUpperCase());

            // // ADD TO STRUCTURE LIST
            // const id = makeid(5);

            // $(`<li style="margin-top: 10px;" data-scene=${newSceneNumber}><b id=${id + 'toggler'} class="toggler">${sceneName}<b></li>`).appendTo(`#${active.fileName + 'sceneList'}`)
            // .append(`<ul id=${id} style="display: none" class="steps"></ul>`);
    
            // $("#" + id).append(`<li class="step" data-step=${1} onclick="setStep(event, '${active.fileName}', ${newSceneNumber}, ${1})">Step 1</li>`);

           // DEFINE SORTABLE FUNCTIONS FOR STEPS IN NEW SCENE
            // $("#" + id).sortable({
            //     start : function (event, ui) {
            //     startPosition = ui.item.index();
            //     },
            //     stop: function(event, ui) {
            //         let endPosition = ui.item.index();
            //         if (endPosition !== startPosition) {
            //             let movedElement = mainData[active.fileName]['scenes'][newSceneNumber]['step-order'].splice(startPosition, 1)[0];
            //             mainData[active.fileName]['scenes'][newSceneNumber]['step-order'].splice(endPosition, 0, movedElement);
            //             saveStepOrder(active.fileName, newSceneNumber, mainData[active.fileName]['scenes'][newSceneNumber]['step-order']);
            //             console.log(mainData[active.fileName]['scenes'][newSceneNumber]['step-order']);

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
            // $("#" + id + "toggler").click(function() {
            //     $(".toggler").not(this).next().hide();
            //     $( "#" + id ).toggle();
                
            //     $(".toggler").not(this).removeClass('active');
            //     $(this).toggleClass('active');

            //     // MARK ACTIVE SCENE in constant active and by color in menu
            //     if ($(this).hasClass('active')) {
            //         setActiveStep(active.fileName, newSceneNumber, "");
            //         $(".show-name").removeClass('active');
            //         $(`#${active.fileName} .show-name`).addClass('active');
            //         $(".step").removeClass('active');
            //     } else {
            //         setActiveStep(active.fileName, "", "");
            //         $(".step").removeClass('active');
            //     }
            //     $('#step-media ul').empty();
            //     $('#preview').empty();
            // });
            
            // setTimeout(() => {
            //     $(".ui-dialog-titlebar-close"). click();
            // }, 200); 
        })
    }
    else if (active.scene !== "") {
        $('#alert')
        .empty()
        .append(`<p>Add new empty step?</p>
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
            let stepNumbers = mainData[active.fileName]['scenes'][active.scene]['step-order'].map(Number);
            let newStepNumber;
            if (stepNumbers.length > 0) {
                newStepNumber = Math.max(...stepNumbers) + 1;
            } else {
                newStepNumber = 1;
            }
           
            // ADD TO MAINDATA
            // mainData[active.fileName]['scenes'][active.scene]['steps'][newStepNumber] = stepObject;
            // mainData[active.fileName]['scenes'][active.scene]['step-order'].push((newStepNumber));

            // SAVE TO JSON FILE
            addNewStep(newStepNumber, stepObject);
            showSpinner();
            // ADD TO STRUCTURE LIST
            // $('#structure .toggler.active').next().append(`<li class="step" data-step=${newStepNumber} onclick="setStep(event, '${active.fileName}', ${active.scene}, ${newStepNumber})">Step ${newStepNumber}</li>`)

            // setTimeout(() => {
            //     $(".ui-dialog-titlebar-close"). click();
            // }, 200); 
        })
    } else {
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
            
            let sceneNumbers = mainData[active.fileName]['scene-order'];
            
            let newSceneNumber;
            if (sceneNumbers.length > 0) {
                newSceneNumber = Math.max(...sceneNumbers) + 1;
            } else {
                newSceneNumber = 1;
            }

            // DEFINE NEW SCENE OBJECT
            let newSceneObject = sceneObject;
            newSceneObject['name'] = sceneName;
            newSceneObject['step-order'] = [1];
            newSceneObject['steps'] = {
                                        "1": {
                                            "background-color": "",
                                            "image": [],
                                            "video": [],
                                            "stream": [],
                                            "text": [],
                                            "avatar": "",
                                            "console": ""
                                        }
                                    };

            // mainData[active.fileName]['scenes'][newSceneNumber] = newSceneObject;
            // mainData[active.fileName]['scene-order'].push((newSceneNumber));

            // SAVE TO JSON FILE
            addNewScene(newSceneNumber, newSceneObject);
            showSpinner();
            // ADD TO STRUCTURE LIST
            // const id = makeid(5);

            // $(`<li style="margin-top: 10px;" data-scene=${newSceneNumber}><b id=${id + 'toggler'} class="toggler">${sceneName}<b></li>`).appendTo(`#${active.fileName + 'sceneList'}`)
            // .append(`<ul id=${id} style="display: none" class="steps"></ul>`);
    
            // $("#" + id).append(`<li class="step" data-step=${1} onclick="setStep(event, '${active.fileName}', ${newSceneNumber}, ${1})">Step 1</li>`);

           // DEFINE SORTABLE FUNCTIONS FOR STEPS IN NEW SCENE
            // $("#" + id).sortable({
            //     start : function (event, ui) {
            //     startPosition = ui.item.index();
            //     },
            //     stop: function(event, ui) {
            //         let endPosition = ui.item.index();
            //         if (endPosition !== startPosition) {
            //             let movedElement = mainData[active.fileName]['scenes'][newSceneNumber]['step-order'].splice(startPosition, 1)[0];
            //             mainData[active.fileName]['scenes'][newSceneNumber]['step-order'].splice(endPosition, 0, movedElement);
            //             saveStepOrder(active.fileName, newSceneNumber, mainData[active.fileName]['scenes'][newSceneNumber]['step-order']);
            //             console.log(mainData[active.fileName]['scenes'][newSceneNumber]['step-order']);

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
            // $("#" + id + "toggler").click(function() {
            //     $(".toggler").not(this).next().hide();
            //     $( "#" + id ).toggle();
                
            //     $(".toggler").not(this).removeClass('active');
            //     $(this).toggleClass('active');

            //     // MARK ACTIVE SCENE in constant active and by color in menu
            //     if ($(this).hasClass('active')) {
            //         setActiveStep(active.fileName, newSceneNumber, "");
            //         $(".show-name").removeClass('active');
            //         $(`#${active.fileName} .show-name`).addClass('active');
            //         $(".step").removeClass('active');
            //     } else {
            //         setActiveStep(active.fileName, "", "");
            //         $(".step").removeClass('active');
            //     }
            //     $('#step-media ul').empty();
            //     $('#preview').empty();
            // });
            
            // setTimeout(() => {
            //     $(".ui-dialog-titlebar-close"). click();
            // }, 200); 
        })
    }
}

function deleteFromStructure() {
    if (active.step !== "") {
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
            // DELETE FROM MAINDATA
            // delete mainData[active.fileName]['scenes'][active.scene]['steps'][active.step];
            // const index = mainData[active.fileName]['scenes'][active.scene]['step-order'].indexOf(active.step);
            // mainData[active.fileName]['scenes'][active.scene]['step-order'].splice(index, 1);
            // REMOVE FROM STRUCTURE LIST
            // $(`#${active.fileName} li[data-scene=${active.scene}] li[data-step=${active.step}]`).remove();
            // REMOVE FROM ACTIVE
            // setActiveStep(active.fileName, active.scene, "");

            // setTimeout(() => {
            //     $(".ui-dialog-titlebar-close"). click();
            // }, 200); 
        })
    } else if (active.scene !== "") {
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

            // DELETE FROM MAINDATA
            // delete mainData[active.fileName]['scenes'][active.scene];
            // const index = mainData[active.fileName]['scene-order'].indexOf(active.scene);
            // mainData[active.fileName]['scene-order'].splice(index, 1);
            // REMOVE FROM STRUCTURE LIST
            // $(`#${active.fileName} li[data-scene=${active.scene}]`).remove();
            // REMOVE FROM ACTIVE
            // setActiveStep(active.fileName, "", "");

            // setTimeout(() => {
            //     $(".ui-dialog-titlebar-close"). click();
            // }, 200); 
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
    $("#layer-up").unbind("click");
    $("#layer-down").unbind("click");

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

socket.on('error', function(){
    $('#alert')
    .empty()
    .append(`<p>Connection to server failed. Please try again.</p>`);
})

// FIND LARGEST INDEX OF ELEMENTS IN PREVIEW
function findBiggestIndex() {
    let index_highest = 0;   

    $("#preview .draggable").each(function() {
        // always use a radix when using parseInt
        var index_current = parseInt($(this).css("zIndex"), 10);
        if(index_current > index_highest) {
            index_highest = index_current;
        }
    });
    
    return index_highest;
}

function addNewStep(newStepNumber, step) {
    socket.emit("add step", {"fileName" : active.fileName, "scene" : active.scene, "key" : newStepNumber, "step" : step});
}

function deleteStep() {
    socket.emit("delete step", {"fileName" : active.fileName, "scene" : active.scene, "step" : active.step});
}

function addNewScene(newSceneNumber, scene) {
    socket.emit("add scene", {"fileName" : active.fileName, "key" : newSceneNumber, "scene" : scene});
}

function deleteScene() {
    socket.emit("delete scene", {"fileName" : active.fileName, "scene" : active.scene});
}

function addNewShow(fileName, showObject) {
    socket.emit("add show", {"fileName" : fileName, "content" : showObject});
}



window.onload = function() {
    // initDragElement();
    // initResizeElement();
    activateColorPicker();
    // displayVisual(steps);
};

function initDragElement() {
    $( function() {
        $( ".draggable" ).draggable();
      } );
}


var croppable = false;
var initialImageWidth;
var initialImageHeight;

  
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
    //CREATE UNIQUE DATA KEY TO BE ABLE TO ADD MEDIA WITH SAME SOURCE AND RECOGNIZE THEM
    let data_key = makeid(5) + $(this).attr('title');

    setElements($(this).attr('title'), this.parentElement.className, data_key);
   
    const li = `<li data-key=${data_key} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${getFileName($(this).attr('title'))}</li>`;
           
    $('#step-media ul').append(li);
           
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

// ADD ELEMENTS
function setElements(val, type, data_key, mediaObject) {
    $('#media-editor')[0].innerHTML = '';

    src = '/data/media/' + val;
    // var id = Math.floor(100000 + Math.random() * 900000);

    // var zIndex ;
    // var zIndexes = [];
    // if ($('.popup')[0]) {
    //     $('.popup').each(function() {
    //         zIndexes.push(parseInt($(this).css('z-index')));
    //     })
    //     zIndex = Math.max.apply(Math,zIndexes) + 1;
    // } else {
    //     zIndex = 9;
    // }

    // var avatars = `<div 
    //                     id=${id}
    //                     class = "popup image avatars"
    //                     style = "z-index: ${zIndex};
    //                             text-align: center;
    //                             position: absolute;
    //                             left: 0%; 
    //                             top: 85%; 
    //                             box-sizing: border-box;
    //                             width: 25%;
    //                             height: 15%;
    //                             -webkit-touch-callout: none; 
    //                             -webkit-user-select: none; 
    //                             -khtml-user-select: none; 
    //                             -moz-user-select: none; 
    //                             -ms-user-select: none; 
    //                             user-select: none;"
    //                 >
    //                     <div 
    //                         class = "popup-body"
    //                                 style = "width: 100%;
    //                                 height: 100%;
    //                                 overflow: hidden;
    //                                 box-sizing: border-box;
    //                                 border-radius: 45%;
    //                                 border: 2px solid green;"
    //                     >
    //                         <div 
    //                             class="popup-header" 
    //                             id=${id + 'header'}
    //                             style = "   position: absolute;
    //                                         left: 7%;
    //                                         top: 7%;
    //                                         width: 85%;
    //                                         height: 85%;
    //                                         padding: 0;
    //                                         cursor: move;
    //                                         z-index: 10;
    //                                     "
    //                         ></div>
    //                         <img style = "width: 100%; height: 100%;" id=${id + 'img'}></img>
    //                     </div>
    //                 </div>`


    const imageElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key}><img style="width: 100%;" src=${src} id=${id + 'img'}></img></div>`

    const videoElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key}><video autoplay style="width: 100%;" src=${src} id=${id + 'video'}></video></div>`
                        
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
        $('#preview').append(videoElement);
        // initResizeElement(id);
        // addMenu(id);
        closeMediaList();
    } else if (type === 'videoStream'){
        $('#preview').append(streamElement);
        hideIfDisplayed($('#add-stream-button')[0]);
        // initResizeElement(id);
        addMenu(id);
    }
    else if (type === 'media_images' || type === 'media_gifs') {
        $('#preview').append(imageElement);
        // initResizeElement(id);
        // addMenu(id);
        closeMediaList();
    } else if (type === 'avatars') {
        $('#preview').append(avatars);
        hideIfDisplayed($('#add-avatars-button')[0]);
        // initResizeElement(id);
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
           
            // initResizeElement();
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
        // initResizeElement(id);
        addMenu(id);
        closeMediaList();
        initDragElement();
        hideIfDisplayed($('#add-text-button')[0]);
        return id
    }

    // MAKE MEDIA DRAGABLE
    initDragElement();

    // DEFINE FUNCTIONS FOR ELEMENT TO BE DRAGGABLE AND RESIZABLE
    $('.draggable').mousedown(function(){
        $('.draggable').not(this).removeClass('active');
        $(this).addClass('active');
        // MARK ACTIVE IN MEDIA LIST
        $("#step-media ul li").not(`li[data-key="${this.dataset.key}"]`).removeClass('active');
        $("#step-media").find(`li[data-key="${this.dataset.key}"]`).addClass('active');
        // SET EVENT LISTENERS ON BUTTONS
        $("#delete-media-button").unbind("click");
        let previewElement = $(this);
        let data_key = this.dataset.key;
        if ($(this).hasClass('active')) {
            $("#delete-media-button").click(function(){
                $(previewElement).remove();
                $("#step-media").find(`li[data-key="${data_key}"]`).remove();
            })
            // $("#edit-media-button").click(function(){
            //     $(`[data-key='${e.target.dataset.key}']`).parent().remove();
            //     $(e.target).remove();
            // })
        }
    });

    $(".resizable").resizable({
        handles: "se"
    });

    // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
    if (mediaObject) {
        if (type === 'media_images') {
            let div_css = editor_media_div_css;
            for (let property in div_css) {
                div_css[property] = mediaObject[property];
            }

            let image_css = editor_image_css;
            for (let property in image_css) {
                image_css[property] = mediaObject[property];
            }

            if (image_css['object-fit'] !== '') {
                image_css['height'] = '100%';
            }
            $("#preview").find(`*[data-key="${data_key}"]`).css(div_css);
            $("#preview").find(`*[data-key="${data_key}"] img`).css(image_css);
            
        }
    } else {
        const zIndex = findBiggestIndex() + 1;
        $("#preview").find(`*[data-key="${data_key}"]`).css('z-index', zIndex);
    }
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
    $( "#media" ).dialog({
        resizable: false,
        modal: true,
        maxHeight: 600,
        minWidth: 500
    });
    // $('#media')[0].classList.toggle("d-none");
    // $('#media-editor')[0].innerHTML = '';
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



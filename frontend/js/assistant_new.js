function createRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function chooseRandom(array) {
    return array[Math.floor(Math.random()*array.length)];
    // var items = $('#' + group).find('.answer').children('p');
    // Array.from(items).forEach(element => element.classList.remove('selected'));
    // var item = items[Math.floor(Math.random()*items.length)];
    // $('#' + group + 'input').val(item.innerHTML);
    // item.classList.add('selected');
}

function serialiseData(data) {
    return JSON.stringify(data).replace(/'/g, '&#39;');
}

function startMemeGenerator(language) {
  var currentLanguage = language;
  var memeGeneratorHTML;
  var meme;

  $.getJSON('/data/memes.json', function(data) {
    if (currentLanguage in data) {
      meme = data[currentLanguage];
    } else {
      meme = data[defaultLanguage];
    }
   
    $('#collective_song').empty();
    // var i = 0;

    memeGeneratorHTML =
      '<section id="meme_generator"><fieldset id="meme_generator_select"><legend>Select meme:</legend>';
    $.each(meme, function name(key, val) {
    //   memeGeneratorHTML += `<option value="${i++}" data-key="${key}" data-meme='${serialiseData(
    //     val
    //   )}'>${val[0]}</option>`;
    let id = createRandomString(5);
      memeGeneratorHTML += `<input type="radio" id="${id}" valu="${key}" name="meme" data-meme='${serialiseData(val)}'></input><label for="${id}">${val[0]}, ${val[1]}</label><br>`;
    });

    memeGeneratorHTML += '</fieldset></section>';
    memeGeneratorHTML += `<section id="meme_lines" class="hide">
    <header class="impact" id="meme_generator_header"></header>
    <footer class="impact" id="meme_generator_footer"></footer>
    </section>`;
    $('.boite--image #meme_div').append(memeGeneratorHTML);
    $('#meme_generator_select input').on('change', function() {
    var data = $(this).data('meme');
      if (typeof data === 'object') {
        var header = typeof data[0] === 'string' ? data[0] : data[1];
        var footer = typeof data[0] === 'string' ? data[1] : data[2];
        $('#meme_generator_header').html(header || '');
        $('#meme_generator_footer').html(footer || '');
      }
      createMeme();
    })
  });

  $('#meme').append(`<div class="editor-buttons">
                        <button id='send-button'>Send to screen</button>
                        <button id='choose-random'>Choose random</button>
                    </div>`)
  $('#send-button').on('click', function() {
    if ($('input[name=meme]:checked').length !== 0) {
      socket.emit('meme', {
        to: 'screens',
        data: $('.meme')[0].outerHTML
      });
      $('.boite--image').empty();
      $('#send-button').parent().remove();
    }
  });
  $('#choose-random').on('click', function() {
    $(chooseRandom($('#meme_generator_select input'))).click();
  })
}


function createMeme() {
  $('.meme').find('#meme_header').remove();
  $('.meme').find('#meme_footer').remove();

  var $meme_header = $('#meme_generator_header').clone();
  $meme_header.css({
    'position': 'absolute',
    'top': '1em',
    'width': '100%',
    'font-size': '140%',
    'text-align': 'center'
  })
  $meme_header.attr('id', 'meme_header');
  $('.meme').append($meme_header);

  var $meme_footer = $('#meme_generator_footer').clone();
  $meme_footer.css({
    'position': 'absolute',
    'bottom': '1em',
    'width': '100%',
    'font-size': '140%',
    'text-align': 'center'
  })
  $meme_footer.attr('id', 'meme_footer');
  $('.meme').append($meme_footer);
}


// socket.on('collective song answers', (data) => {
//     $group = $('#' + data.group)
//     if ($group[0]) {
//       $group.find('.answer').append(`<p id=${data.group + '_answer'} onclick='setValue(event)'>${data.answer.substring(0, 50)}</p>`)
//     } else {
//       $('#collective_song').append(`<div id=${data.group} class='collective-song-group'><button class='show-random'>Choose random</button><p class='question'>${data.question}</p><div class='answer'><p  id=${data.group + '_answer'} onclick='setValue(event)'>${data.answer.substring(0, 50)}</p></div><div class='submit-div'><input id=${data.group + 'input'}></input><button class='submit-button'>Send selected</button></div></div>`)
//       $('#' + data.group).find('.show-random').on('click', function() {
//         randomAnswer(data.group)
//       });
//       $('#' + data.group).find('.submit-button').on('click', function() {
//         sendAnswer(data.group)
//       });
//     }
// });

socket.on('collective song answers', (data) => {
    $group = $('#' + data.group);
    $('#meme .boite--image').empty();
    let id = createRandomString(5);
    if ($group[0]) {
      $group.find('.answer').append(`<input type="radio" id="${id}" name="${data.group}" data-answer=${serialiseData(data.answer)}></input>
                                     <label for="${id}">${data.answer.substring(0, 50)}</label><br>`)
    } else {
      $('#collective_song').append(`<div id=${data.group} class='collective-song-group'>
                                        <p class='question'>${data.question}</p>
                                        <div class='answer'>
                                            <input type="radio" id="${id}" name="${data.group}" data-answer=${serialiseData(data.answer)}></input>
                                            <label for="${id}">${data.answer.substring(0, 50)}</label><br>
                                        </div>
                                        <div class='submit-div'>
                                            <button class="choose-random" class="icon box-min">🎲</button>
                                            <button class='submit-button'>Send to screen</button>
                                        </div>
                                    </div>`)
      $(`#${data.group} .choose-random`).on('click', function() {
        // randomAnswer(data.group);
        if($(`#${data.group} input`).length !== 0) {
            $(chooseRandom($(`#${data.group} input`))).click();
        }
      });
      $(`#${data.group} .submit-button`).on('click', function() {
        if($(`#${data.group} input`).length !== 0) {
            // sendAnswer(data.group)
            socket.emit('collective song selected', {'question' : data.question, 'answer' : $(`#${data.group} input:checked`).data('answer')});
            $(`#${data.group} input:checked`).next().remove();
            $(`#${data.group} input:checked`).remove();
        }
      });
    }
});

// function randomAnswer(group) {
//     var items = $('#' + group).find('.answer').children('p');
//     Array.from(items).forEach(element => element.classList.remove('selected'));
//     var item = items[Math.floor(Math.random()*items.length)];
//     $('#' + group + 'input').val(item.innerHTML);
//     item.classList.add('selected');
// }
  
// function setValue(e) {
//     e.target.classList.add('selected');
//     var group = e.target.id.split('_')[0];
//     $('#' + group + 'input').val(e.target.innerHTML);
// }

// function sendAnswer(group) {
//     if ($('#' + group + 'input').val() !== '') {
//         var items = $('#' + group).find('.answer').children('p');
//         var selected = Array.from(items).find(element => element.classList.contains('selected'));
//         var question = $('#' + group).find('.question')[0].innerHTML;
//         socket.emit('collective song selected', {'question' : question, 'answer' : $('#' + group + 'input').val()})
//         selected.remove();
//         $('#' + group + 'input').val('');
//     }
// }
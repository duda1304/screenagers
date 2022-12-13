var modes = {};

modes.normal = function() {
  return {
    type: 'normal',

    write(data) {
      data = emojify(data);
      $texte.html(data);
    },

    destroy() {}
  };
};

(function() {
  var cnt = 0;
  // function resizeFit() {
  //   cnt++;
  //   if (cnt > 500) return;
  //   var fontsize = parseFloat($texte.css('font-size'));
  //   if (fontsize > 30) {
  //     $texte.css('fontSize', fontsize - 5 + 'px');
  //     var h = $step.height();
  //     if ($texte.height() >= h - h * 0.4 || $step[0].scrollWidth > $step.width()) {
  //       resizeFit();
  //     }
  //   }
  // }

  modes.biggest_text = function() {
    $main.addClass('mode--biggest_text');

    return {
      type: 'biggest_text',

      write(data) {
        data = emojify(data);
        cnt = 0;
        data = data.replace(/\n/, '<br>');
        $texte.css('font-size', '55vmin').html(data);
        // resizeFit();
      },

      destroy() {
        $main.removeClass('mode--biggest_text');
        $texte.css('font-size', '');
      }
    };
  };
})();

/* Final fantasy
================ */
(function() {
  var lastStr;
  modes.final_fantasy = function() {
    var timeouts = [];

    function ecrireMot(letter, i) {
      var time = i * 30;
      return setTimeout(function() {
        if (
          letter != '' &&
          letter != ' ' &&
          letter != '.' &&
          letter != ',' &&
          letter != '?' &&
          letter != '!'
        ) {
          s('bot');
        }
        letter = emojify(letter);
        $texte.append(letter);
      }, time);
    }
    function ecrirePhrase(str) {
      timeouts.forEach(tid => clearTimeout(tid));
      $texte.html('');
      timeouts = [...str].map((letter, i) => ecrireMot(letter, i));
    }

    // $main.addClass('mode--final_fantasy');
    $texte.hide();

    return {
      type: 'final_fantasy',

      write(data) {
        if (data === lastStr) {
          $texte.html(data).show();
          return;
        }
        data = data.trim();
        lastStr = data;
        if (data) {
          $texte.show();
          ecrirePhrase(data);
        } else {
          $texte.hide();
        }
      },

      destroy() {
        $texte.show();
        // $main.removeClass('mode--final_fantasy');
      }
    };
  };
})();

/* Console
========== */
(function() {
  var lastData;

 
  if ($('.step__texte').length === 0) {
    var $texte = $('<div class="step__texte"></div>');
    $('step').append($texte);
  } 

  var $texte = $('.step__texte')
  

  var log;
  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  function getTime() {
    var today = new Date();
    var h = String(today.getHours()).padStart(2, '0');
    var m = String(today.getMinutes()).padStart(2, '0');
    var s = String(today.getSeconds()).padStart(2, '0');
    return h + ':' + m + ':' + s;
  }

  var history = [];

  modes.console = function() {
    $texte.empty();
    log = $texte[0];
    $main.addClass('mode--console');

    history.forEach(msg => $texte.append(msg));
    scrollDown();

    return {
      type: 'console',

      write(data) {
        data = data.trim();
        if (!data) return;
        if (lastData === data) return;
        if (data === '#clear') {
          history.length = 0;
          $texte.empty();
          return;
        }
        lastData = data;

        var msg = document.createElement('div');
        msg.innerHTML = `<span class='ctime'>${getTime()}</span> ${data}`;
        history.push(msg);
        if (history.length > 30) {
          var x = history.shift();
          x.remove();
        }

        log.append(msg);
        scrollDown();
      },

      destroy() {
        $main.removeClass('mode--console');
      }
    };
  };
})();

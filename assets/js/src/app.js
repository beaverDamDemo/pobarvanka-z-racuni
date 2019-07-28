( function() {
  "use strict";
  /* ***************************** LOADER handle begin ***********************************************/
  var now = new Date().getTime();
  var page_load_time = now - performance.timing.navigationStart;
  console.warn("User-perceived page loading time: " + page_load_time);
  var width = 100,
    perfData = window.performance.timing,
    EstimatedTime = -(perfData.loadEventEnd - perfData.navigationStart),
    time = parseInt((EstimatedTime/1000)%60)*100;
    console.log("estimated time: ", time)
  $('.loadbar').animate({
    'width': width+'%'
  }, time)
  /******************************** loader handle end *************************************************/
  function preloaderTimeout() {
    let dfd = $.Deferred();
    console.warn("temporary")
    setTimeout(()=>{
      dfd.resolve('preloader timeout passed')
    }, time)
    return dfd.promise();
  }

	const json = 'settings.json';
  const filesJson = 'files.json';
  var page_title,
      background_color, background_image, background_size, background_position,
      header_text, header_allCaps, header_fontBold, header_textAlignCenter, header_fontSize,
      number_of_examples = 0,
      backgroundToBeColored,
      bucketColors = [],
      delay_clickFirstBucket = time+2000,
      congratulations_bgr_color,
      instructions_audio, congratulations_audio, congratulations_image,
      congratulations_button, correct_audio, background_image_from_url, uncoloredImgColor;

  window.audioCurrentlyPlaying = false;
  var drawingColor, drawingColorIndexId, drawingColorIndex;
  window.bucketColors;
  let myBuckets = [];

  window.stage = [];

  createCalcs();
  function createCalcs() {
    // window.stage = [];
    // disabled following code was for random numbers
    // for( let i=0; i<16; i++ ) {
    //   if( window.stage.length < 1) {
    //     window.stage.push({sum: (-1 - Math.round(Math.random())), challenge: [] });
    //   } else {
    //     window.stage.push({sum: (-1 - Math.round(Math.random()*0.75) + window.stage[ (window.stage.length-1) ].sum), challenge: [] });
    //   }
    // }
    window.stage = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  $.getJSON( filesJson)
    .done(onfilesJsonComplete)
    .fail( function(error) {
      console.log('Request failed: ', error);
    });

  function onfilesJsonComplete(data) {
    backgroundToBeColored = data.backgroundToBeColored;
    window.backgroundToBeColored = backgroundToBeColored;
    // suppport supportFiles
    try {
      instructions_audio = data.supportFiles.instructions_audio[0].uri;
      congratulations_audio = data.supportFiles.congratulations_audio;
      window.congratulations_audio_length = congratulations_audio.length;
      congratulations_image = data.supportFiles.congratulations_image[0].uri;
      congratulations_button = data.supportFiles.congratulations_button[0].uri;
      correct_audio = data.supportFiles.correct_audio[0].uri;
      background_image_from_url = data.supportFiles.background_image_from_url[0].uri;
    } catch(error) {
      console.warn('Error: ', error)
    }

    $.getJSON( json)
    .done(onJsonComplete)
    .fail( function(error) {
      console.log("Request failed: " +err );
    });
  }

  function onJsonComplete(data) {
    FastClick.attach(document.body);
    try {
      /*parameters*/
      background_color = data.parameters.background_color[0].value;
      background_image = data.parameters.background_image[0].value;
      background_size = data.parameters.background_size[0].value;
      background_position = data.parameters.background_position[0].value;
      header_allCaps = data.parameters.header_allCaps[0].value;
      header_fontBold = data.parameters.header_fontBold[0].value;
      header_textAlignCenter = data.parameters.header_textAlignCenter[0].value;
      header_fontSize = data.parameters.header_fontSize[0].value;
      congratulations_bgr_color = data.parameters.congratulations_bgr_color[0].value;
      uncoloredImgColor = data.parameters.uncoloredImgColor[0].value;
      window.uncoloredImgColor = uncoloredImgColor;
      /*texts*/
      page_title = data.texts.page_title[0].written;
      header_text = data.texts.header_text[0].written;
    }
    catch( err) {
      console.warn('Error: ', err);
    }

    setBackgrounds();
    populateHeader();
    populateCongratulations();
    window.bucketColors = bucketColors;
    window.number_of_examples = number_of_examples;
    loadMainImage(backgroundToBeColored);

    $.when( loadAudio(), preloaderTimeout()).done(()=>{
      $('.preloader-wrapper').removeClass('active');
      handleAudio('instructions_audio');
      // setTimeout(()=>{
      //   TweenMax.staggerTo( $(".buckets"), 0.5, {
      //     left: "0px"
      //   }, -0.06)
      // }, 650)

      setTimeout(()=>{
        TweenMax.staggerTo( $(".buckets"), 0.05, {
          left: "0px"
        }, -0.06)
      }, 65)
      setTimeout(()=>{
        $('#bucketsWrapper .buckets:nth-child(1)').trigger('click');
        $('#wrapper').removeClass('disabled');
      }, 100)
    })
	}

  function Tanja( color, colorId, label, labelSum) {
    this.currentColor = color;
    this.currentColorId = colorId;
    this.correctColor = color;
    this.correctColorId = colorId;
    this.label = label;
    this.labelSum = labelSum;
    this.solved = false;

    Tanja.prototype.getCurrentColor = function() {
      return {
        'color': this.currentColor,
        'colorId': this.currentColorId
      }
    }
    Tanja.prototype.setColor = function(color, colorId) {
      this.currentColor = color;
      this.currentColorId = colorId;
      this.checkSolved();
    }
    Tanja.prototype.getCorrectColor = function() {
      return {
        'color': this.correctColor,
        'colorId': this.correctColorId
      }
    }
    Tanja.prototype.label = function(a, b) {
      return a+'-'+b;
    }
    Tanja.prototype.labelSum = function(a, b) {
      return parseInt(a)-parseInt(b);
    }
    Tanja.prototype.checkSolved = function() {
      // console.log('currentColorId: ', this.currentColorId, 'correctColorId: ', this.correctColorId)
      if( this.currentColorId == this.correctColorId ) {
        this.solved = true;
      } else {
        this.solved = false;
      }
    }
  }

  let tanjaArray = []; window.tanjaArray;
  let hardcodedBucketTexts = [];

  // function loadMainImage(backgroundToBeColored) {
  window.loadMainImage = function(backgroundToBeColored) {
    tanjaArray = [];
    // hardcoded / not random array of calculations. napis.label is just for helping
    let arrayOfCalculations = [
      ['', '1:1'],
      ['', '8:4'],
      ['', '12:6'],
      ['', '57:19'],
      ['', '28:7'],
      ['', '9:9'],
      ['', '27:9'],
      ['', '12:4'],
      ['', '20:5'],
      ['', '12:3'],
      ['', '16:4'],
      ['', '25:5'],
      ['', '36:6'],
      ['', '42:7'],
      ['', '28:4'],
      ['', '49:7'],
      ['', '35:5'],
      ['', '24:3'],
      ['', '90:10'],
      ['', '81:9'],
      ['', '100:10']
    ];
    hardcodedBucketTexts = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    ];
    window.tanjaArray = [];
    var z = Snap("#mainImage");
    Snap.load(backgroundToBeColored, onSVGLoaded);

    function onSVGLoaded(data) {
      z.append( data );
      // Snap('#mainImage svg title').remove();

      $.each( Snap('#mainImage').selectAll('g[id^=g]'), function(index, value) {
        // it loads the image in reverse order, from eg. g100 down to g0
        let $id = this.node.id;
        let $path = value.node.children[0];
        let $pathId = value.node.children[0].id;
        let $text = value.node.children[1];
        let _col = Snap(value).node.children[0].style.fill
        let rgbRegex = /^(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/;
        let isRgb = _col.match(rgbRegex) != null;
        if( isRgb ) {
          _col = rgb2hex(_col).hex;
        }

        let thisColorId = addColorToBucket( _col );
        let tmpsum = arrayOfCalculations[index][1];
        $($text).text(tmpsum)
        tanjaArray.push(new Tanja(_col, undefined, tmpsum, window.stage[thisColorId].sum))

        // styling text inside svg
        value.node.children[1].style.fill = '#000';
        value.node.children[1].style.pointerEvents = 'none';
        Snap('#mainImage #'+$id+' #'+$pathId).attr({
          fill: uncoloredImgColor
        })
        tanjaArray[index].setColor(uncoloredImgColor, -999)
      });

      window.bucketColors = bucketColors;
      populateBucketsWrapper();
      bindBucketsWithPictureParts();
      fillUsedBuckets();
    }
    window.tanjaArray = tanjaArray;
  }

  function addColorToBucket(c, $id) {
    // here we must check in which format is C, because on MS products it's in HEX value or even in html color names, while on the others its in rgb
    if( c.indexOf('rgb') != -1 ) {
      // for non ms-browsers don't make changes
    }
    else if( c.indexOf('#') != -1) {
      c = hex2rgb(c);
    }
    else {
      console.warn("Attention, img must be exported from Illustraotr with selected styling:inline style")
    }
    var col = rgb2hex(c);
    var found = false;
    for( var j=0; j<bucketColors.length; j++) {
      if( bucketColors[j].hex == col.hex) {
        found = true;
        return j;
      }
    }
    if( found == false) {
      bucketColors.push(col);
      return bucketColors.length-1;
    }
  }

  function setBackgrounds() {
    // $('body').css({
    //   'background-color' : background_color
    // });
    $('#mainImage').css({
      'background-color': uncoloredImgColor
    })
    if( background_image_from_url.length > 0 ) {
      try {
        $('body').css({
          'background-image' : background_image_from_url,
          'background-size': background_size,
          'background-position': background_position
        });
      } catch(e) {
        console.warn("Error appending image")
      }
    } else {
      console.log("elsing")
      try {
        console.log(background_position, background_size)
        $('body').css({
          'background-size': background_size,
          'background-position': background_position,
          'background-image' : background_image
        });
      } catch(e) {
        console.warn("Error appending image")
      }
    }
  }  //setBackground end

  function populateHeader() {
    document.title = page_title;
    $("#headingWrapper #heading p").html(header_text);
    if( header_allCaps.toUpperCase() == "TRUE" ) {
      $("#headingWrapper #heading p").css({ 'text-transform' : 'uppercase' });
    }
    if( header_fontBold.toUpperCase() == "TRUE" ) {
      $("#headingWrapper #heading p").css({ 'font-weight' : 'bold' });
    }
    if( header_textAlignCenter.toUpperCase() ==  "TRUE") {
      $("#headingWrapper #heading p").css({ 'text-align' : 'center' });
    }
    $("#headingWrapper #heading p").css({ 'font-size' : header_fontSize+'px' });
  }

  function loadAudio() {
    let queue = new createjs.LoadQueue();
    createjs.Sound.alternateExtensions = ["mp3"];
    queue.installPlugin(createjs.Sound);
    queue.on("complete", handleCompleteAudio);
    queue.on('error', handleErrorAudio);
    for( let i=0; i<congratulations_audio.length; i++) {
      queue.loadFile({id:"congratulations-"+i, src:congratulations_audio[i].uri });
    }
    if( instructions_audio.length ) {
      queue.loadFile({id:"instructions_audio", src:instructions_audio });
    }
    queue.loadFile({id:"correct_audio", src:correct_audio});
    let dfd = $.Deferred();
    function handleCompleteAudio(e) {
      dfd.resolve('sounds ready');
    }
    return dfd.promise();
  }
  window.handleAudio = function(audioFile) {
    var instance = createjs.Sound.play(audioFile);
    if( audioFile == 'instructions_audio') {
      window.audioCurrentlyPlaying = true;
      instance.on("complete", handleComplete)
    }
  };
  function onAudioComplete(e) {
    audioPlayer.off("complete");
  };
  function handleComplete(e) {
    window.audioCurrentlyPlaying = false;
  }
  function handleErrorAudio(e) {
    console.warn("Error handling audio: ", e);
  }

  function populateCongratulations() {
    $('.finalGreeting').css({
      'background-color': congratulations_bgr_color,
      'background-image': 'url('+ congratulations_image +')',
      'width': '100%',
      'height': '100%',
      'background-repeat': 'no-repeat',
      'background-size': '50% auto'
    });
    $('.finalGreeting .finalGreeting_button_playagain').css({
      'background-image': 'url('+ congratulations_button +')'
    });
  }

  function Bucket(hex) {
    this.hex = hex;
    this.usedIn = [];
    this.solved = false;
  }

  Bucket.prototype.addUsedIn = function(e) {
    this.usedIn.push(e);
  };
  Bucket.prototype.getUsedin = function() {
    return this.usedIn;
  };
  Bucket.prototype.setSolved = function(data) {
    this.solved = data;
  }
  Bucket.prototype.getSolved = function() {
    return this.solved;
  }

  function populateBucketsWrapper() {
    if( $('.buckets').length > 0 ) return;

    $.each(bucketColors, function(index, value) {
      let b = new Bucket(value.hex)
      myBuckets.push(b);
    })
    console.log("Sort disabled")
    // myBuckets.sort(dynamicSort("label"))
    window.myBuckets = myBuckets;
    // here we set number of feedback stars. tanja array length is number of picture parts.
    number_of_examples = tanjaArray.length;
    window.number_of_examples = number_of_examples;
    drawingColor = bucketColors[0];
    let fragList = new Array, fragLoadedCount;
    function dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
      }
    }

    function loadMulti( bucketColors ) {
      let image, fragLoadedCount = 0;
      for( let i = 0; i < bucketColors.length; i++ ) {
        $('#bucketsWrapper').append("<div class='buckets' id='bucket_"+i+"'></div>");
        let $thisChild = $("#bucket_"+i);
        $thisChild.css({
          'left': -$(window).width()+'px'
        });
        // $($thisChild).append("<div class='bucket__label'>"+window.stage[i].sum+"</div>");
        $($thisChild).append("<div class='bucket__label'>"+hardcodedBucketTexts[i]+"</div>");
        (function() {
          image = Snap.load( "assets/images/stanjak_v.svg", function ( loadedFragment ) {
            fragLoadedCount++;
            fragList[ i ] = loadedFragment;
            if( fragLoadedCount >= bucketColors.length ) {
              addLoadedFrags( fragList );
            }
          } );
        })();
      }
      populateFeedbackWrapper(number_of_examples);
    } //lodmulti

    function addLoadedFrags( list ) {
      let ourList;

      for( let i = 0; i < list.length; i++ ) {
        Snap('#bucket_'+i).append( fragList[i]);
        ourList = Snap('#bucket_'+i+' #colored').selectAll('path');
         $.each( ourList, function(index, value) {
          Snap( (value.node) ).attr('fill', myBuckets[i].hex);
        });
      }
    }  //addloadedfrags

    loadMulti( bucketColors );

    $('.buckets').on('click', function(index, value) {
      drawingColor, drawingColorIndex = myBuckets[$(this).index()].hex;
      drawingColor, drawingColorIndexId = index;
      $('.buckets').removeClass('active');
      $(this).addClass("active");
      window.drawingColor = drawingColor;
      window.drawingColorIndex = drawingColorIndex;
    });
  } //populatebuckets wrapper end

  function bindBucketsWithPictureParts() {
    $.each( tanjaArray, function(index, value) {
      let i=0;
      while( myBuckets[i].hex != value.correctColor) {
        if( i < 64) {
          i++
        }
      }
      value.correctColorId = i;
    })
  }

  function fillUsedBuckets() {
    $.each( tanjaArray, function(index, value) {
      // console.log('index: ', index, "coor id: ", value.correctColorId)
      myBuckets[value.correctColorId].addUsedIn(index)
    })
  }

  function populateFeedbackWrapper(n) {
    for( let i=0; i<n; i++) {
      $('#feedbackWrapper #feedbackContent').append("<div class='feedback-items'></div>");
    }
    $('#wrapper #feedbackWrapper').css({
      'background-color': '#000'
    })

  }
})();
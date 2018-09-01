'use strict';
var selectedBucketId = 0;
// here happens the main playing
$('#mainImage').on('click', function(e) {
   var _id = e.target.parentElement.id;
   var $snap;
   if( ! e.target.parentElement.id ) return;

   try {
   	$snap = Snap('#mainImage').select('#'+_id+' path');
   	if( $snap == null ) {
   		$snap = Snap('#mainImage').select('#'+_id+' polygon');
	   	if( $snap == null ) {
	   		$snap = Snap('#mainImage').select('#'+_id+' compoundPath');
	   	}
   	}
	  try {
		 	var matches = _id.match(/\d+$/);
		 	var part_id = -1;
			if (matches) {
			    part_id = matches[0];
			}
			part_id = parseInt(part_id, 10);
			if( part_id < 0) {
				return;
			}
			// this is the weird part. it works like that because snapsvg reads the svg image in reverse order
			part_id = window.tanjaArray.length -1 - part_id;
		 	let c = window.tanjaArray[part_id].getCurrentColor();
		 	var colorBeforeChange = $snap.attr('fill');
      let rgbRegex = /^(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/;
      let isRgb = colorBeforeChange.match(rgbRegex) != null;
      if( isRgb ) {
        colorBeforeChange = rgb2hex(colorBeforeChange).hex;
      }

		  var prevColorIndex = 0;
		  while( prevColorIndex < bucketColors.length ) {
		   	if( bucketColors[prevColorIndex].hex == colorBeforeChange ) {
		   		break;
		   	}
		   	prevColorIndex++;
		  }
		  if( prevColorIndex == bucketColors.length) {
		   	prevColorIndex = -1;
		  }
			if( colorBeforeChange.indexOf('rgb') != -1 ) {
				colorBeforeChange = colorBeforeChange;
			}
			else if( colorBeforeChange.indexOf('#') != -1) {
				// leave intact
			}
			else {
				throw "Color names disabled in this lesson"
			}
		  if( colorBeforeChange == drawingColor.hex) {
		   	// reverting back to default color - like two consecutive clicks
		   	$snap.animate( { fill : '#ffffff' }, 300, mina.easeout);
				window.tanjaArray[part_id].setColor('#ffffff', -999);
				// updateFeedbackItems(window.tanjaArray[part_id].correctColor);
				// if( colorBeforeChange != uncoloredImgColor) updateFeedbackItems(colorBeforeChange)
		  }
		  else {
	   		$snap.animate( { fill : drawingColor.hex }, 300, mina.easeout);
				window.tanjaArray[part_id].setColor(drawingColor.hex, window.drawingColor.index);
   			// updateFeedbackItems(window.tanjaArray[part_id].correctColor);
				// updateFeedbackItems(drawingColor.hex);
		  }
		  updateFeedbackItemsSimplified();
	  }
		catch (exc) {
		   console.log("exc: ", exc)
		} 	
  }
  catch( e) {
   	console.warn("Error: ", e);
   	return;
  }
 	window.tanjaArray[part_id].checkSolved();
}); //mainimage click end

$(document).on('click','.buckets',function(e){
	selectedBucketId = $(this).index();
	window.drawingColor = window.myBuckets[$(this).index()];
	window.drawingColor.index = $(this).attr('id').split('_')[1];
});

function getRGB(col) {
	if( col.indexOf('rgb') != -1 ) {
		return col;
	}
	else if( col.indexOf('#') != -1) {
		// leave intact
		return hex2rgb(col);
	}
	else {
		return colorName2rgb(col);
	}	
}

function updateFeedbackItemsSimplified() {
	let _activeBefore = $('.feedback-items.active').length;
	$('.feedback-items').removeClass('active');
	$.each(window.tanjaArray, function(index, value) {
		if( value.solved == true ) {
			$('.feedback-items').not('.active').last().addClass('active')
		}
	})

	let _activeAfter = $('.feedback-items.active').length;
	if( _activeAfter > _activeBefore ) {
		handleAudio('correct_audio')
	}
	
	if( $('.feedback-items.active').length == number_of_examples) {
		$('#bucketsWrapper').addClass('disabled');
		$('#wrapper').addClass('disabled');
		setTimeout(()=>{
			let rnd = Math.floor( Math.random() * 2);
    		handleAudio('congratulations-'+rnd);
		}, 500);
		setTimeout(()=>{
			$('.finalGreeting').removeClass('off').addClass('on');
		}, 2927);
	}	
}


// function updateFeedbackItems(selectedColorHex) {
// 	console.warn("CHecking: ", selectedColorHex)
// 	let myColor = selectedColorHex;
// 	let allCorrect = true;
// 	$.each( window.tanjaArray, function(index, value) {
// 		if( value.currentColor == myColor) {
// 			if( value.solved == false) {
// 				allCorrect = false;
// 			}
// 		}
// 		if( value.correctColor == myColor) {
// 			if( value.solved == false) {
// 				allCorrect = false;
// 			}
// 		}
// 	})

// 	try {
// 		( allCorrect==true ) ? console.log("%cAll correct.", "background: green; color: white") : console.log("%cAt least one mistake.", "background: crimson; color: white") 	
// 	} catch(e) {
// 		console.error("E: ", e)
// 	}

// 	let selectedBucketId = undefined;
// 	for( let sara=0; sara<myBuckets.length; sara++) {
// 		if( myBuckets[sara].hex == selectedColorHex) {
// 			selectedBucketId = sara;
// 		}
// 	}
// 	// count how many items have class solved!
// 	let solvedBeforeChange = myBuckets[selectedBucketId].getSolved();
// 	if( solvedBeforeChange == true ) {
// 		if( allCorrect != true ) {
// 			// remove one feedback star!
// 			myBuckets[selectedBucketId].setSolved(false);
// 			$('.feedback-items.active').first().removeClass('active');
// 		}
// 	} else {
// 		if( allCorrect == true ) {
// 			// add one feedback star
// 			handleAudio('correct_audio')
// 			myBuckets[selectedBucketId].setSolved(true);
// 			$('.feedback-items').not('.active').last().addClass('active');
// 		}
// 	}

// 	if ( $('.feedback-items.active').length == number_of_examples) {
// 		$('#bucketsWrapper').addClass('disabled');
// 		$('#mainImage').addClass('disabled');
// 		setTimeout(()=>{
// 			let rnd = Math.floor( Math.random() * 4);
//     	handleAudio('congratulations-'+rnd);
// 		}, 1468);
// 		setTimeout(()=>{
// 			$('.finalGreeting').removeClass('off').addClass('on');
// 		}, 3982);
// 	}
// } //updateFeedbackItemsEnd

$('.finalGreeting .finalGreeting_button_playagain').on('click', function() {
	$('.finalGreeting').removeClass('off').addClass('on');
	playAgain();
});

$('#closeButton').on('click', function() {
	window.history.back();
});

$('.closeButton.finalGreeting__closeBtn').on('click', function() {
	window.history.back();
});

$('.helpButton').on('click', function() {
  if( window.audioCurrentlyPlaying == true ) {
    createjs.Sound.stop();
    window.audioCurrentlyPlaying = false;
  } else {
    handleAudio('instructions_audio');    
  }
});

function playAgain() {
	// play again
	console.log('resetting')
	$('.finalGreeting').removeClass('on').addClass('off');
	$('#bucketsWrapper').removeClass('disabled');
	$('#wrapper').removeClass('disabled');
	$('#mainImage').empty();
	$('.buckets').removeClass('solved missed');
	$('.feedback-items').removeClass('active');
	$('#bucketsWrapper .buckets:nth-child(1)').trigger('click');
	loadMainImage(backgroundToBeColored);
}


var ResizeToFullWindow = (function () {
  'use strict';
  var $wrapper = $('#wrapper');

  function resizeWrapper () {
    var width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

      var height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    width = $('body').width();
    height = $('body').height();
    // var ratioHeightWidth = width / 1024;
    var ratioHeightWidth = $('body').width() / 1024;
    // console.log('ratioHeightWidth', ratioHeightWidth);

    // var ratioHeight = height / 768;
    var ratioHeight = $('body').height() / 768;
    // console.log('ratioHeight', ratioHeight);
    var ratioToUse = (ratioHeightWidth < ratioHeight) ? ratioHeightWidth:ratioHeight;

    var scaleRatioLabel;
    if(ratioHeightWidth < ratioHeight) {
      scaleRatioLabel = 'w';
    }
    else {
      scaleRatioLabel = 'h';
    }

    window.scaleRatio = ratioToUse;
    window.scaleRatioLabel = scaleRatioLabel;


    $($wrapper[0]).css({
      'transform': 'scale(' + ratioToUse + ') translateX(-50%)',
      '-webkit-transform': 'scale(' + ratioToUse + ') translateX(-50%)',
      '-moz-transform': 'scale(' + ratioToUse + ') translateX(-50%)',
      '-o-transform': 'scale(' + ratioToUse + ') translateX(-50%)',
      '-ms-transform': 'scale(' + ratioToUse + ') translateX(-50%)',
      'left' : '50%'
    });
  };
  resizeWrapper();

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };


  var myEfficientFn = debounce(function() {
    // console.log('debaunce');
    resizeWrapper();
  }, 50);

  window.addEventListener('resize', myEfficientFn);

  return {
    scale: resizeWrapper
  }
})();

function rgb2hex(rgb){
	// console.log("Received rgb2 to convert to hex:", rgb)
	var myArray = rgb.toString().split(",");
	var t0a = myArray[0];
	var t0b = t0a.slice(4, t0a.length);
	var t0c = parseInt(t0b, '10');
	var t0d = t0c.toString(16);
	var t0e = addZeroPadding(t0d, 2);

	var t1a = myArray[1];
	var t1b = t1a.slice(1, t1a.length);
	var t1c = parseInt(t1b, '10');
	var t1d = t1c.toString(16);
	var t1e = addZeroPadding(t1d, 2);

	var t2a = myArray[2];
	var t2b = t2a.slice(1, t2a.length-1);
	var t2c = parseInt(t2b, '10');
	var t2d = t2c.toString(16);
	var t2e = addZeroPadding(t2d, 2);

	function addZeroPadding(t, size) {
		var s = t+'';
		while( s.length < size) s = "0" + s;
		return s;
	}

	var r = t0c;
	var g = t1c;
	var b = t2c;

	var arr = [r, g, b];
	var maxId = 0;
	var max = arr[maxId];
	var min = 256;
	var hue;
	for( var i=0; i<arr.length; i++) {
		if( arr[i] > arr[maxId]) {
			maxId = i;
			max = arr[i];
		}
		if( arr[i] < min) {
			min = arr[i];
		}
	}
	if( maxId == 1) {
		hue = (g-b) / (max-min);
	}
	else if( maxId == 2) {
		hue = 2 + (b-r) / (max-min);
	}
	else {
		hue = 4 + (r-g) / (max-min);
	}
	
	if( isNaN(hue)) {
		hue = 6-(r+g+b)/5120;
	}
	var result = {
		hex : '#'+t0e+t1e+t2e,
		hue: hue
	};
	// console.log("Returning rgb2hex: ", result)
	return result;
}

function hex2rgb(c) {
	// console.log('Converting color hex 2 rgb')
   if( c.length == 4) 
   {
	  var result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(c);
	  result[1]+=result[1];
	  result[2]+=result[2];
	  result[3]+=result[3];

	  // console.log('result', result)
	  let r = parseInt(result[1], 16);
	  let g = parseInt(result[2], 16);
	  let b = parseInt(result[3], 16);
	  var returnString = '';
	  returnString+='rgb(';
	  returnString+=r;
	  returnString+=', ';
	  returnString+=g;
	  returnString+=', ';
	  returnString+=b;
	  returnString+=')';
	  // console.log("Returning: ", returnString)
	  return returnString;
	}
	else {
	  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
	  let r = parseInt(result[1], 16);
	  let g = parseInt(result[2], 16);
	  let b = parseInt(result[3], 16);
	  var returnString = '';
	  returnString+='rgb(';
	  returnString+=r;
	  returnString+=', ';
	  returnString+=g;
	  returnString+=', ';
	  returnString+=b;
	  returnString+=')';
	  // console.log("Returning: ", returnString)
	  return returnString;
	}
}
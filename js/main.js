window.onload = function () {
	// Set the name of the hidden property and the change event for visibility
	var hidden, visibilityChange; 
	if (typeof document.hidden !== "undefined") {
	  hidden = "hidden";
	  visibilityChange = "visibilitychange";
	} else if (typeof document.mozHidden !== "undefined") {
	  hidden = "mozHidden";
	  visibilityChange = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
	  hidden = "msHidden";
	  visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
	  hidden = "webkitHidden";
	  visibilityChange = "webkitvisibilitychange";
	}

	// Back key event listener
	document.addEventListener('tizenhwkey', function(e) {
	  if (e.keyName === "back") {
	      try {
	          tizen.application.getCurrentApplication().exit();
	      } catch (ignore) {}
	  }
	});

	// Visibility change event listener
	document.addEventListener(visibilityChange, function () {
	  if (document[hidden]){
	  	pause = true;
	      document.removeEventListener('click', action);
	      document.removeEventListener('rotarydetent', move);
	  } else {
	    pause = false;
	    countP = 0;
	    document.addEventListener('click', action);
	    document.addEventListener('rotarydetent', move);
	  }
	}, false);
	// tap event
	document.addEventListener('click', action);
    
    // Setting up the canvas
    var canvas = document.getElementById('canvas'),
        ctx    = canvas.getContext('2d'),
        cH     = ctx.canvas.height = 360,
        cW     = ctx.canvas.width  = 360;

    //General sprite load
    var imgWheel = new Image();
    imgWheel.src = 'images/wheel.png'
    var imgWheelFrame = new Image();
    imgWheelFrame.src = 'images/wheel_frame.png'
    var imgRefresh = new Image();
    imgRefresh.src = 'images/refresh.png';
    var imgSafe = new Image();
    imgSafe.src = 'images/safe.png';

    //Game
    var record     = 0,
        roundRecord = 0,
        currentNumber = 0,
        combinationNumbers = randomSequence(3),
        selectedNumbers = [],
        rotationDirection = null,
        level	   = 1,
        count      = 0,
        pause      = false,
        countP     = 0,
        playing    = false,
        gameOver   = false,
    	memorizing = false,
    	starting = true;
    
    //Player
    var player = {
        posX   : -cW/2,
        posY   : -cH/2,
        spriteWidth  : 48,
        spriteHeight : 48,
        sizeX : 48,
        sizeY : 48,
        deg    : 0
    };

    function move(e) {
    	if (rotationDirection != null) {
    		if (rotationDirection != e.detail.direction) {
    			selectedNumbers.push(currentNumber);
    			rotationDirection = e.detail.direction;
    		}
    	} else {
    		rotationDirection = e.detail.direction;
    	}
    	
    	if (e.detail.direction === "CW") {
    		player.deg += 0.261799388;
    		player.deg %= 2*Math.PI;
    		currentNumber -= 1;
    		if (currentNumber < 0) {
    			currentNumber += 24;
    		}
    	} else {
    		player.deg -= 0.261799388;
    		player.deg %= 2*Math.PI;
    		currentNumber += 1;
    		currentNumber %= 24;
    	}

    }

    function action(e) {
        e.preventDefault();
        if(gameOver) {
            if(e.type == 'click') {
                gameOver   = false;
                starting = true;
                playing = false;
                count      = 0;
                player.deg = 0;
                roundRecord = 0;
                combinationNumbers = randomSequence(3);
                document.removeEventListener('rotarydetent', move);
            } 
        } else if (starting) {
        	if(e.type == 'click') {
        		memorizing = true;
        		starting = false;
        	}
        } else if (playing) {
            if(e.type == 'click') {
                playing = true;
                document.addEventListener('rotarydetent', move);
            }
        } else if (memorizing) {
            if(e.type == 'click') {
                playing = true;
                document.addEventListener('rotarydetent', move);
            }        	
        }
        
    }

    function _player() {

        ctx.save();
        ctx.translate(cW/2,cH/2);

        ctx.rotate(player.deg);
        
        ctx.drawImage(
          imgWheel,
          player.posX,
          player.posY,
          360,
          360
        );

        ctx.restore();
    }


    function start() {
        if (pause) {
            if (countP < 1) {
                countP = 1;
            }
        } else if (playing) {
        	//Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();
            
            //Player
            _player();
            
            ctx.drawImage(
                imgWheelFrame,
                0,
                0,
                360,
                360
            );
            var currentNumberString = currentNumber + "";
            if (currentNumberString.length < 2) {currentNumberString = "0" + currentNumberString};
        	ctx.font = "bold 50px Segment7Standard";
        	ctx.fillStyle = "white";
        	ctx.textAlign = "center";
        	ctx.textBaseline = 'middle';
        	ctx.fillText(currentNumberString, cW/2,cH/2);
        	
        	ctx.fillStyle = "white";
        	ctx.textAlign = "left";
        	
        	if (combinationNumbers.length <= 12){
        		ctx.font = "bold 16px Helvetica";
        		ctx.fillTextCircle(selectedNumbers.join(' '), cW/2,cH/2,53,0.15,-Math.PI/4);
        	} else {
        		ctx.font = "bold 14px Helvetica";
        		ctx.fillTextCircle(selectedNumbers.join(' '), cW/2,cH/2,53,0.10,-Math.PI/4);
        	}
        	
			if (selectedNumbers.length == combinationNumbers.length) {
				if (selectedNumbers.equals(combinationNumbers)) {
					playing = false;
					memorizing = true;
					level += 1;
					rotationDirection = null;
					currentNumber = 0;
					combinationNumbers = randomSequence(2+level);
					player.deg = 0;
					document.removeEventListener('rotarydetent', move);
					selectedNumbers = [];
					return;
				} else {
					gameOver = true;
					playing = false;
					memorizing = false;
					level = 1;
					rotationDirection = null;
					currentNumber = 0;
					player.deg = 0;
					document.removeEventListener('rotarydetent', move);
					selectedNumbers = [];
					return;
				}
			}
        	
        } else if(starting) {
            //Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();

            ctx.font = "bold 25px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Memory Vault", cW/2,cH/2 - 120);

            ctx.font = "bold 18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["tap_to_play"], cW/2,cH/2 - 90);     
              
            ctx.font = "bold 18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["instructions"], cW/2,cH/2 + 100);
              
            ctx.font = "14px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            wrapText(TIZEN_L10N["memorize"], cW/2,cH/2 + 125, 220, 18);
            
            ctx.drawImage(
                    imgSafe,
                    cW/2 - 60,
                    cH/2 - 64,
                    120,
                    128
                );
            
        } else if (memorizing) {
            //Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();
            
            ctx.font = "bold 25px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["level"] + " " + level, cW/2,cH/2 - 120);
           
            ctx.font = "bold 16px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["tap_ready"], cW/2,cH/2 - 90);
            
            ctx.font = "25px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            wrapText(combinationNumbers.join(", "), cW/2,cH/2, 250, 25)

            ctx.font = "14px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            wrapText(TIZEN_L10N["dial"], cW/2,cH/2 + 100, 220, 18);
            
            //ctx.fillText(combinationNumbers.join(" "), cW/2,cH/2);
        } else if(count < 1) {
            count = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.rect(0,0, cW,cH);
            ctx.fill();

            ctx.font = "bold 25px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Game over",cW/2,cH/2 - 100);
            
            ctx.font = "20px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["wrong_code"],cW/2,cH/2 - 70);

            //ctx.font = "18px Helvetica";
            //ctx.fillStyle = "white";
            //ctx.textAlign = "center";
            //ctx.fillText("Score: "+ roundRecord, cW/2,cH/2 + 100);
            //ctx.fillText("Record: "+ record, cW/2,cH/2 + 125)

            record = roundRecord > record ? roundRecord : record;
            
            ctx.font = "18px Helvetica";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(TIZEN_L10N["correct_code"], cW/2,cH/2 + 70);
            wrapText(combinationNumbers.join(", "), cW/2,cH/2 + 90, 220, 25);

            ctx.drawImage(imgRefresh, cW/2 - 23, cH/2 - 23);
        }
    }

    function init() {
        window.requestAnimationFrame(init);
        start();
    }

    init();

    //Utils
    function random(from, to) {
        return Math.floor(Math.random() * (to - from + 1)) + from;
    }
    
    function randomSequence(size) {
    	var sequence = [];
    	for (var i = 0; i < size; i++) {
    		sequence.push(random(1,23));
    	}
    	return sequence;
    }
    
    CanvasRenderingContext2D.prototype.fillTextCircle = function(text,x,y,radius,numRadsPerLetter,startRotation){
    	   this.save();
    	   this.translate(x,y);
    	   this.rotate(startRotation);

    	   for(var i=0;i<text.length;i++){
    	      this.save();
    	      this.rotate(i*numRadsPerLetter);

    	      this.fillText(text[i],0,-radius);
    	      this.restore();
    	   }
    	   this.restore();
    	}
    
    function wrapText(text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
      }
    
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;       
            }           
            else if (this[i] != array[i]) { 
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;   
            }           
        }       
        return true;
    }
    // Hide method from for-in loops
    Object.defineProperty(Array.prototype, "equals", {enumerable: false});

}
/*  LetItSnow.JS
    
    Based on loktar00's Snowfall jQuery Plugin (https://github.com/loktar00/JQuery-Snowfall)
    Converted to vanilla-js by Murat Çeşmecioğlu (http://murat.cesmecioglu.net)
    Thanks to loktar00.
*/
function extend() {
    for (var i = 1; i < arguments.length; i++)
        for (var key in arguments[i])
            if (arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

function letItSnow() {
    var defaults = {
        flakeCount: 100,
        flakeColor: '#fff',
        flakeIndex: 999999,
        minSize: 2,
        maxSize: 3,
        minSpeed: 3,
        maxSpeed: 5,
        collection: "#site_content",
        collectionHeight: 10,
        updateInterval: 30,
        doRatio: false,
    },
    options = extend(defaults, options),
    random = function random(min, max) {
        return Math.round(min + Math.random() * (max - min));
    };


    function Flake(_x, _y, _size, _speed, _id) {
        this.id = _id;
        this.x = _x;
        this.y = _y;
        this.size = _size;
        this.speed = _speed;
        this.step = 0;
        this.stepSize = random(1, 10) / 100;
        
        if(options.collection){
            this.target = canvasCollection[random(0, canvasCollection.length - 1)];
        }

        var flakeMarkup = null;
        flakeMarkup = document.createElement("div");
        flakeMarkup.style.background = options.flakeColor;
        flakeMarkup.className = 'snowfall-flakes';
        flakeMarkup.id = 'flake-' + this.id;
        flakeMarkup.style.width = this.size + 'px';
        flakeMarkup.style.height = this.size + 'px';
        flakeMarkup.style.position = 'absolute';
        flakeMarkup.style.top = this.y;
        flakeMarkup.style.left = this.x;
        flakeMarkup.style.fontSize = '12px';
        flakeMarkup.style.zIndex = '999999';

        document.querySelector("body").append(flakeMarkup);
        this.element = document.getElementById('flake-' + this.id);

        this.update = function() {
            this.y += this.speed;

            if (this.y > (elHeight) - (this.size + 6)) {
                this.reset();
            }

            this.element.style.top = this.y + 'px';
            this.element.style.left = this.x + 'px';
            this.step += this.stepSize;

            if (options.doRatio === false) {
                this.x += Math.cos(this.step);
            } else {
                this.x += (options.doRatio + Math.cos(this.step));
            }

            // Pileup check
            if(options.collection){
                if (this.x > this.target.x && this.x < this.target.width + this.target.x && this.y > this.target.y && this.y < this.target.height + this.target.y) {
                    var ctx = this.target.element.getContext("2d"),
                        curX = this.x - this.target.x,
                        curY = this.y - this.target.y,
                        colData = this.target.colData;

                    if (colData[parseInt(curX)][parseInt(curY + this.speed + this.size)] !== undefined || curY + this.speed + this.size > this.target.height) {
                        if (curY + this.speed + this.size > this.target.height) {
                            while (curY + this.speed + this.size > this.target.height && this.speed > 0) {
                                this.speed *= .5;
                            }

                            ctx.fillStyle = "#fff";

                            if (colData[parseInt(curX)][parseInt(curY + this.speed + this.size)] == undefined) {
                                colData[parseInt(curX)][parseInt(curY + this.speed + this.size)] = 1;
                                ctx.fillRect(curX, (curY) + this.speed + this.size, this.size, this.size);
                            } else {
                                colData[parseInt(curX)][parseInt(curY + this.speed)] = 1;
                                ctx.fillRect(curX, curY + this.speed, this.size, this.size);
                            }
                            this.reset();
                        } else {
                            // flow to the sides
                            this.speed = 1;
                            this.stepSize = 0;

                            if (parseInt(curX) + 1 < this.target.width && colData[parseInt(curX) + 1][parseInt(curY) + 1] == undefined) {
                                // go left
                                this.x++;
                            } else if (parseInt(curX) - 1 > 0 && colData[parseInt(curX) - 1][parseInt(curY) + 1] == undefined) {
                                // go right
                                this.x--;
                            } else {
                                //stop
                                ctx.fillStyle = "#fff";
                                ctx.fillRect(curX, curY, this.size, this.size);
                                colData[parseInt(curX)][parseInt(curY)] = 1;
                                this.reset();
                            }
                        }
                    }
                }
            }

            if (this.x > (elWidth) - widthOffset || this.x < widthOffset) {
                this.reset();
            }
        }

        this.reset = function() {
            this.y = 0;
            this.x = random(widthOffset, elWidth - widthOffset);
            this.stepSize = random(1, 10) / 100;
            this.size = random((options.minSize * 100), (options.maxSize * 100)) / 100;
            this.speed = random(options.minSpeed, options.maxSpeed);
        }
    }

    var flakes = [],
        flakeId = 0,
        i = 0,
        elHeight = document.documentElement.clientHeight,
        elWidth = document.documentElement.clientWidth,
        widthOffset = 25,
        snowTimeout = 0;

    if(options.collection !== false){
        var testElem = document.createElement('canvas');
        if (!!(testElem.getContext && testElem.getContext('2d'))) {
            var canvasCollection = [],
                elements = document.querySelectorAll(options.collection),
                collectionHeight = options.collectionHeight;

            for (var i = 0; i < elements.length; i++) {
                var bounds = elements[i].getBoundingClientRect(),
                    canvas = document.createElement('canvas'),
                    collisionData = [];

                if (bounds.top - collectionHeight > 0) {
                    document.body.appendChild(canvas);
                    canvas.style.position = 'absolute';
                    canvas.height = collectionHeight;
                    canvas.width = bounds.width;
                    canvas.style.left = bounds.left + 'px';
                    canvas.style.top = bounds.top - collectionHeight + 'px';

                    for (var w = 0; w < bounds.width; w++) {
                        collisionData[w] = [];
                    }

                    canvasCollection.push({
                        element: canvas,
                        x: bounds.left,
                        y: bounds.top - collectionHeight,
                        width: bounds.width,
                        height: collectionHeight,
                        colData: collisionData
                    });
                }
            }
        } else {
            options.collection = false;
        }
    }

    window.addEventListener('resize', function() {
        elHeight = document.documentElement.clientHeight;
        elWidth = document.documentElement.clientWidth;
        console.log(elHeight + " - " + elWidth);
    }, false);

    // initialize the flakes
    for (i = 0; i < options.flakeCount; i += 1) {
        flakeId = flakes.length;
        flakes.push(new Flake(random(widthOffset, elWidth - widthOffset), random(0, elHeight), random((options.minSize * 100), (options.maxSize * 100)) / 100, random(options.minSpeed, options.maxSpeed), flakeId));
    }

    // this controls flow of the updating snow
    function snow() {
        for (i = 0; i < flakes.length; i += 1) {
            flakes[i].update();
        }
        snowTimeout = setTimeout(function() {
            snow()
        }, options.updateInterval);
    }
    snow();
}

document.addEventListener("DOMContentLoaded", function() {
  letItSnow();
});

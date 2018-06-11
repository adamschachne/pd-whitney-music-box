var HeavyLoader = (function () {
    function HeavyLoader() {
        this.heavyArray = [];
        this.webAssemblySupported = (typeof WebAssembly === 'object');
    }
    HeavyLoader.prototype.loadModule = function (gain, note, velocity, callback) {
        var _this = this;
        if (this.webAssemblySupported) {
            var heavyModule_1 = whitney_music_box_Module();
            var loader_1;
            heavyModule_1['onRuntimeInitialized'] = function () {
                loader_1 = new heavyModule_1.AudioLibLoader();
                loader_1.init({
                    blockSize: 2048,
                    printHook: function (message) {
                        console.log(message);
                    },
                    sendHook: function (sendName, floatValue) {
                        console.log(sendName, floatValue);
                    },
                    webAudioContext: null
                });
                loader_1.audiolib.setFloatParameter("gain", gain);
                loader_1.audiolib.setFloatParameter("note", note);
                loader_1.audiolib.setFloatParameter("velocity", velocity);
                loader_1.start();
                _this.heavyArray.push({ heavyModule: heavyModule_1, loader: loader_1 });
                callback();
            };
        }
        else {
            console.warn("heavy: web assembly not found, falling back to asm.js");
            var script = document.createElement('script');
            script.src = "whitney_music_box.asm.js";
            script.onload = function () {
                var heavyModule = whitney_music_box_AsmModule();
                var loader = new heavyModule.AudioLibLoader();
                loader.init({
                    blockSize: 2048,
                    printHook: function (message) {
                        console.log(message);
                    },
                    sendHook: function (sendName, floatValue) {
                        console.log(sendName, floatValue);
                    },
                    webAudioContext: null
                });
                loader.audiolib.setFloatParameter("gain", gain);
                loader.audiolib.setFloatParameter("note", note);
                loader.audiolib.setFloatParameter("velocity", velocity);
                loader.start();
                _this.heavyArray.push({ heavyModule: heavyModule, loader: loader });
                callback();
            };
            document.body.appendChild(script);
        }
    };
    return HeavyLoader;
}());
var sketch = function (p5) {
    var num_points = 50;
    var radius;
    var center;
    var maxCircleWidth;
    var minCircleWidth;
    var canvas;
    var rate;
    var inverse;
    var doneLoading;
    var heavyLoader;
    var numLoading;
    var startTime;
    var playing;
    p5.preload = function () {
        heavyLoader = new HeavyLoader();
        console.log(heavyLoader);
        doneLoading = false;
        numLoading = num_points;
        playing = [];
        for (var i = 0; i < num_points; i++) {
            playing.push(false);
            heavyLoader.loadModule(75, 90 - i, 0, finishedLoading);
        }
    };
    function resize() {
        radius = Math.min(p5.windowWidth, p5.windowHeight) / 2 - maxCircleWidth;
        center = {
            x: p5.windowWidth / 2,
            y: p5.windowHeight / 2
        };
        p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
    }
    function finishedLoading() {
        numLoading--;
        if (numLoading === 0) {
            doneLoading = true;
            startTime = window.performance.now();
        }
    }
    function playNote(i, velocity) {
        heavyLoader.heavyArray[i].loader.start();
        playing[i] = true;
        setTimeout(function () {
            heavyLoader.heavyArray[i].loader.audiolib.setFloatParameter("velocity", velocity);
        });
    }
    function stopNote(i) {
        heavyLoader.heavyArray[i].loader.audiolib.setFloatParameter("velocity", 0);
        playing[i] = false;
        setTimeout(function () {
            heavyLoader.heavyArray[i].loader.stop();
        });
    }
    p5.setup = function () {
        rate = 0.05;
        canvas = p5.createCanvas(0, 0);
        p5.strokeWeight(0.7);
        p5.colorMode(p5.HSB, 1);
        p5.angleMode(p5.DEGREES);
        minCircleWidth = 5;
        maxCircleWidth = 35;
        inverse = 1 / num_points;
        resize();
    };
    p5.windowResized = function () {
        resize();
    };
    p5.draw = function () {
        p5.background(p5.color(0, 0, 0.59));
        p5.line(center.x, center.y, center.x + radius + maxCircleWidth / 2, center.y);
        if (!doneLoading) {
            p5.textSize(32);
            p5.text("Loading...", center.x, center.y - 1);
            return;
        }
        var millis = window.performance.now() - startTime;
        var time = millis * rate;
        for (var i = 0; i < num_points; i++) {
            var angle = time * (1 - i * inverse);
            var len = radius * (inverse * (i + 1));
            var x = (center.x + p5.cos(angle) * len);
            var y = (center.y + p5.sin(angle) * len);
            var cWidth = minCircleWidth + (maxCircleWidth - minCircleWidth) * (i + 1) * inverse;
            var hue = i * inverse;
            var saturation = 1;
            var brightness = 1;
            var strumDist = p5.dist(x, y, center.x + len, center.y);
            if (strumDist < 10) {
                if (!playing[i]) {
                    playNote(i, 1);
                }
            }
            else {
                if (playing[i]) {
                    stopNote(i);
                }
            }
            p5.fill(p5.color(hue, saturation, brightness));
            p5.ellipse(x, y, cWidth);
        }
    };
};
new p5(sketch);

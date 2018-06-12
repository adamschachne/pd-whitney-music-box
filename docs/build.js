var HeavyLoader = (function () {
    function HeavyLoader(numModules) {
        this.numModules = numModules;
        this.heavyArray = new Array(numModules);
        this.webAssemblySupported = (typeof WebAssembly === 'object');
    }
    HeavyLoader.prototype.loadModule = function (gain, index, freq, duration, release, velocity, finishedLoading, done) {
        var _this = this;
        if (this.webAssemblySupported) {
            var heavyModule_1 = whitney_music_box_Module();
            var loader_1;
            heavyModule_1['onRuntimeInitialized'] = function () {
                loader_1 = new heavyModule_1.AudioLibLoader();
                loader_1.init({
                    blockSize: 2048,
                    printHook: function (message) {
                    },
                    sendHook: function (sendName, floatValue) {
                        if (sendName === "done") {
                            done(floatValue);
                        }
                        else {
                            console.log(sendName, floatValue);
                        }
                    },
                    webAudioContext: null
                });
                loader_1.start();
                loader_1.audiolib.setFloatParameter("gain", gain);
                loader_1.audiolib.setFloatParameter("id", index);
                loader_1.audiolib.setFloatParameter("frequency", freq);
                loader_1.audiolib.setFloatParameter("duration", duration);
                loader_1.audiolib.setFloatParameter("release", release);
                loader_1.stop();
                _this.heavyArray[index] = { heavyModule: heavyModule_1, loader: loader_1 };
                finishedLoading();
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
                        if (sendName === "done") {
                            done(floatValue);
                        }
                        else {
                            console.log(sendName, floatValue);
                        }
                    },
                    webAudioContext: null
                });
                loader.start();
                loader.audiolib.setFloatParameter("gain", gain);
                loader.audiolib.setFloatParameter("id", index);
                loader.audiolib.setFloatParameter("frequency", freq);
                loader.audiolib.setFloatParameter("duration", duration);
                loader.audiolib.setFloatParameter("release", release);
                loader.stop();
                _this.heavyArray[index] = { heavyModule: heavyModule, loader: loader };
                finishedLoading();
            };
            document.body.appendChild(script);
        }
    };
    return HeavyLoader;
}());
var sketch = function (p5) {
    var num_points = 48;
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
    var lastPlayed;
    var baseFreq;
    var millisLastFrame;
    var timeSlider;
    var period;
    var buf = 0.00005;
    p5.preload = function () {
        heavyLoader = new HeavyLoader(num_points);
        console.log(heavyLoader);
        doneLoading = false;
        numLoading = num_points;
        playing = new Array(num_points);
        lastPlayed = new Array(num_points);
        baseFreq = 35;
        for (var i = 0; i < num_points; i++) {
            playing[i] = false;
            lastPlayed[i] = -1;
            heavyLoader.loadModule(80 + i * 1 / 6, i, baseFreq * (num_points - i), 150, 150, 0, finishedLoading, doneHook);
        }
    };
    function resize() {
        radius = Math.min(p5.windowWidth, p5.windowHeight) / 2 - maxCircleWidth;
        center = {
            x: p5.windowWidth / 2,
            y: p5.windowHeight / 2
        };
        timeSlider.position(10, p5.windowHeight - 30);
        timeSlider.style('width', p5.windowWidth - 30 + "px");
        p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
    }
    function finishedLoading() {
        numLoading--;
        if (numLoading === 0) {
            setTimeout(function () {
                doneLoading = true;
                startTime = window.performance.now();
                millisLastFrame = startTime;
            }, 1000);
        }
    }
    function doneHook(val) {
        stopNote(val);
    }
    function playNote(i, velocity) {
        heavyLoader.heavyArray[i].loader.audiolib.setFloatParameter("velocity", velocity);
        playing[i] = true;
        setTimeout(function () {
            heavyLoader.heavyArray[i].loader.start();
        }, 0);
    }
    function stopNote(i) {
        playing[i] = false;
        setTimeout(function () {
            heavyLoader.heavyArray[i].loader.stop();
        }, 50);
    }
    p5.setup = function () {
        rate = 0.08;
        period = num_points * 360;
        timeSlider = p5.createSlider(0, period + 10, 0, 1);
        timeSlider.position(10, p5.windowHeight - 30);
        timeSlider.style('width', p5.windowWidth - 30 + "px");
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
        var deltaTime = millis - millisLastFrame;
        millisLastFrame = millis;
        var time = timeSlider.value();
        timeSlider.value((time + deltaTime * rate) % period);
        for (var i = 0; i < num_points; i++) {
            var angle = time * (1 - i * inverse);
            if (i == num_points - 1) {
            }
            var len = radius * (inverse * (i + 1));
            var cos = p5.cos(angle);
            var sin = p5.sin(angle);
            if (lastPlayed[i] > 0 && cos <= -1 + buf && cos >= -1 - buf) {
                lastPlayed[i] = -1;
            }
            if (lastPlayed[i] < 0 && !playing[i]) {
                if (cos <= 1 + buf && cos >= 1 - buf) {
                    playNote(i, 1);
                    lastPlayed[i] = 1;
                }
            }
            var x = (center.x + cos * len);
            var y = (center.y + sin * len);
            var cWidth = minCircleWidth + (maxCircleWidth - minCircleWidth) * (i + 1) * inverse;
            var hue = i * inverse;
            var saturation = 1;
            var brightness = 1;
            p5.fill(p5.color(hue, saturation, brightness));
            p5.ellipse(x, y, cWidth);
        }
    };
};
new p5(sketch);

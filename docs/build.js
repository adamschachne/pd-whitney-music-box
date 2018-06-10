var sketch = function (p5) {
    var NUM_POINTS = 50;
    var radius;
    var center;
    var maxCircleWidth;
    var canvas;
    var rate;
    p5.preload = function () {
    };
    function resize() {
        console.log(p5.windowWidth, p5.windowHeight);
        radius = Math.min(p5.windowWidth, p5.windowHeight) / 2 - maxCircleWidth;
        center = {
            x: p5.windowWidth / 2,
            y: p5.windowHeight / 2
        };
        p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
    }
    p5.setup = function () {
        rate = 0.05;
        canvas = p5.createCanvas(0, 0);
        p5.strokeWeight(0.7);
        p5.colorMode(p5.HSB, 1);
        p5.angleMode(p5.DEGREES);
        maxCircleWidth = 25;
        resize();
    };
    p5.windowResized = function () {
        resize();
    };
    p5.draw = function () {
        p5.background(p5.color(0, 0, 0.59));
        p5.line(center.x, center.y, center.x + radius + maxCircleWidth, center.y);
        var millis = window.performance.now();
        var time = millis * rate;
        for (var i = 0; i < NUM_POINTS; i++) {
            var distance = (i + 1) / NUM_POINTS;
            var angle = time * distance;
            var len = radius * (1 + 1 / NUM_POINTS - distance);
            var x = (center.x + p5.cos(angle) * len);
            var y = (center.y + p5.sin(angle) * len);
            var cWidth = maxCircleWidth - distance * 16;
            var hue = distance;
            var saturation = 1;
            var brightness = 1;
            p5.fill(p5.color(hue, saturation, brightness));
            p5.ellipse(x, y, cWidth);
        }
    };
};
new p5(sketch);

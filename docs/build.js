var sketch = function (p) {
    p.preload = function () {
    };
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
    };
    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
    p.draw = function () {
        p.background(100);
        p.ellipse(100, 100, 200, 200);
    };
};
var sketchP = new p5(sketch);

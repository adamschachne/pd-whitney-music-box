const sketch = (p5: p5) => {
	const NUM_POINTS = 50;
	let radius: number;
	let center: { x: number, y: number };
	let maxCircleWidth: number;
	let canvas : HTMLCanvasElement;
	let rate : number;

	p5.preload = () => { 

	}

	function resize() {
		console.log(p5.windowWidth, p5.windowHeight);
		radius = 0.8*(p5.windowWidth / 2);
		center = {
			x: p5.windowWidth / 2,
			y: p5.windowHeight / 2
		};
		
		// slightly less than full page to prevent overflow
		p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
	}

	p5.setup = () => {
		rate = 0.05;
		canvas = p5.createCanvas(0, 0);
		p5.strokeWeight(0.7);
		p5.colorMode(p5.HSB, 1);
		p5.angleMode(p5.DEGREES);
		maxCircleWidth = 25;
		resize(); // initialize canvas size and variables		
	}

	p5.windowResized = () => {
		resize();
	}

	p5.draw = () => {
		p5.background(p5.color(0,0,0.59));		
		p5.line(center.x, center.y, center.x + radius + maxCircleWidth, center.y);

		// @ts-ignore millis between each frame
		//let deltaTime = window.performance.now() - canvas._pInst._lastFrameTime;
		let millis = window.performance.now();
		let time = millis * rate;

		for (let i = 0; i < NUM_POINTS; i++) {
			let distance = (i + 1) / NUM_POINTS;
			let angle = time * distance;
			let len = radius * (1 + 1 / NUM_POINTS - distance);

			let x = (center.x + p5.cos(angle) * len);
			let y = (center.y + p5.sin(angle) * len);
			
			let cWidth = maxCircleWidth - distance * 16;
			let hue = distance;
			let saturation = 1;
			let brightness = 1;

			p5.fill(p5.color(hue, saturation, brightness));
			p5.ellipse(x, y, cWidth);
		}
	}
}

new p5(sketch);
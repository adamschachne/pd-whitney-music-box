/// <reference path="./heavy.ts" />

const sketch = (p5: p5) => {
	let num_points = 50;
	let radius: number;
	let center: { x: number, y: number };
	let maxCircleWidth: number;
	let minCircleWidth: number;
	let canvas: HTMLCanvasElement;
	let rate: number;
	let inverse: number;
	let doneLoading: boolean;
	let heavyLoader: HeavyLoader;
	let numLoading: number;
	let startTime: number;
	let playing: Array<boolean>;
	let lastPlayed: Array<number>;
	let baseFreq: number;
	let millisLastFrame: number;
	const buf = 0.00005;

	p5.preload = () => {
		// prepare array of num_points
		heavyLoader = new HeavyLoader(num_points);
		console.log(heavyLoader);

		// redo the callback/async system TODO
		doneLoading = false;
		numLoading = num_points;
		playing = new Array(num_points);
		lastPlayed = new Array(num_points);

		baseFreq = 35;
		for (let i = 0; i < num_points; i++) {
			playing[i] = false;
			lastPlayed[i] = -1;
			heavyLoader.loadModule(75, i, baseFreq, 200, 0, finishedLoading, doneHook);
		}
	}

	function resize() {
		radius = Math.min(p5.windowWidth, p5.windowHeight) / 2 - maxCircleWidth;
		center = {
			x: p5.windowWidth / 2,
			y: p5.windowHeight / 2
		};
		// slightly less than full page to prevent overflow
		p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
	}

	function finishedLoading() {
		numLoading--;
		if (numLoading === 0) {
			doneLoading = true;
			startTime = window.performance.now() - 1000;
			millisLastFrame = startTime;
		}
	}

	function doneHook(val: number) {
		// console.log("finished playing index: ", val);
		stopNote(val);
	}

	function playNote(i: number, velocity: number) {
		heavyLoader.heavyArray[i].loader.audiolib.setFloatParameter("velocity", velocity);
		heavyLoader.heavyArray[i].loader.start();
		playing[i] = true;
		// setTimeout(() => {
			
		// }, 0);
	}

	function stopNote(i: number) {
		// heavyLoader.heavyArray[i].loader.audiolib.setFloatParameter("velocity", 0);
		playing[i] = false;
		setTimeout(() => {
			// if (heavyLoader.heavyArray[i].loader.isPlaying) {
				heavyLoader.heavyArray[i].loader.stop();
			// }
		}, 50);
	}

	p5.setup = () => {
		rate = 0.05;
		canvas = p5.createCanvas(0, 0);
		p5.strokeWeight(0.7);
		p5.colorMode(p5.HSB, 1);
		p5.angleMode(p5.DEGREES);
		minCircleWidth = 5;
		maxCircleWidth = 35;
		inverse = 1 / num_points;
		resize(); // initialize canvas size and variables		
	}

	p5.windowResized = () => {
		resize();
	}

	p5.draw = () => {

		p5.background(p5.color(0, 0, 0.59));
		p5.line(center.x, center.y, center.x + radius + maxCircleWidth / 2, center.y);

		if (!doneLoading) {
			p5.textSize(32);
			p5.text("Loading...", center.x, center.y - 1);
			return;
		}

		// @ts-ignore millis between each frame
		// let deltaTime = window.performance.now() - canvas._pInst._lastFrameTime;
		let millis = window.performance.now() - startTime;
		let deltaTime = millis - millisLastFrame;
		let time = millis * rate;

		millisLastFrame = millis;

		for (let i = 0; i < num_points; i++) {
			let angle = time * (1 - i * inverse);
			let len = radius * (inverse * (i + 1)); // length from center of canvas

			let cos = p5.cos(angle);
			let sin = p5.sin(angle);

			let x = (center.x + cos * len);
			let y = (center.y + sin * len);

			let cWidth = minCircleWidth + (maxCircleWidth - minCircleWidth) * (i + 1) * inverse;
			let hue = i * inverse;
			let saturation = 1;
			let brightness = 1;

			p5.fill(p5.color(hue, saturation, brightness));
			p5.ellipse(x, y, cWidth);

			// free up lastPlayed
			if (lastPlayed[i] > 0 && cos <= -1 + buf && cos >= -1 - buf) {
				// console.log("free: ", i)
				lastPlayed[i] = -1;
			}

			// check last played and is not playing
			if (lastPlayed[i] < 0 && !playing[i]) {
				// check is on strummer
				if (cos <= 1 + buf && cos >= 1 - buf) {
					playNote(i, 1);
					lastPlayed[i] = 1;
					// console.log("playing: ", i)
				}
			}	
		}
	}
}

new p5(sketch);
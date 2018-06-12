/// <reference path="./heavy.ts" />

const sketch = (p5: p5) => {
	let num_points = 48;
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
	let timeSlider : any;
	let period : number;

	const buf = 0.00005;
	// time before a note can be played again
	const wait = 1000;

	p5.preload = () => {
		// prepare array of num_points
		heavyLoader = new HeavyLoader(num_points);
		//console.log(heavyLoader);

		// redo the callback/async system TODO
		doneLoading = false;
		numLoading = num_points;
		playing = new Array(num_points);
		lastPlayed = new Array(num_points);

		baseFreq = 35;
		for (let i = 0; i < num_points; i++) {
			playing[i] = false;
			lastPlayed[i] = -1;
			heavyLoader.loadModule(80 + i*1/6, i, baseFreq * (num_points - i), 150, 150, 0, finishedLoading, doneHook);
		}
	}

	function resize() {
		radius = Math.min(p5.windowWidth, p5.windowHeight) / 2 - maxCircleWidth;
		center = {
			x: p5.windowWidth / 2,
			y: p5.windowHeight / 2
		};
		// slightly less than full page to prevent overflow
		timeSlider.position(10, p5.windowHeight - 30);
		timeSlider.style('width', p5.windowWidth - 30 + "px");
		p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
	}

	function finishedLoading() {
		numLoading--;
		if (numLoading === 0) {
			// wait extra second because the loader thinks its finished before it really is
			setTimeout(() => {
				doneLoading = true;
				startTime = window.performance.now();
				millisLastFrame = startTime;
			}, 1000);			
		}
	}

	function doneHook(val: number) {
		// console.log("finished playing index: ", val);
		stopNote(val);
	}

	function playNote(i: number, velocity: number) {
		heavyLoader.heavyArray[i].loader.audiolib.setFloatParameter("velocity", velocity);
		playing[i] = true;

		// add to end of processing queue
		setTimeout(() => {
			heavyLoader.heavyArray[i].loader.start();
		}, 0)
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
		rate = 0.08;
		period = num_points * 360;
		timeSlider = p5.createSlider(0, period + 10, 0, 1);
		timeSlider.position(10, p5.windowHeight - 30);
		timeSlider.style('width', p5.windowWidth - 30 + "px");
		// period = num_points * 360;
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

		millisLastFrame = millis;
		// current time is the slider value this frame
		let time = timeSlider.value();
		// set the slider value to be current time + delta
		timeSlider.value((time + deltaTime * rate) % period);
		

		for (let i = 0; i < num_points; i++) {
			
			let angle = time * (1 - i * inverse);
			if (i == num_points - 1) {
				// console.log(angle);
			}
			let len = radius * (inverse * (i + 1)); // length from center of canvas

			let cos = p5.cos(angle);
			let sin = p5.sin(angle);

			// check last played and is not playing
			if (!playing[i] && millis < lastPlayed[i] || millis - lastPlayed[i] > wait) {
				// check is on strummer
				if (cos <= 1 + buf && cos >= 1 - buf) {
					playNote(i, 1);
					lastPlayed[i] = millis;
					// console.log("playing: ", i)
				}
			}

			let x = (center.x + cos * len);
			let y = (center.y + sin * len);

			let cWidth = minCircleWidth + (maxCircleWidth - minCircleWidth) * (i + 1) * inverse;
			let hue = i * inverse;
			let saturation = 1;
			let brightness = 1;

			p5.fill(p5.color(hue, saturation, brightness));
			p5.ellipse(x, y, cWidth);
		}
	}
}

new p5(sketch);
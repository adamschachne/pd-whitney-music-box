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
	let timeSlider: any;
	let period: number;
	let invertButton: any;
	let inverted: boolean;
	let pauseButton: any;
	let paused: boolean;
	let millis: number;
	let deltaTime: number;
	let time: number;
	let angleModLastFrame : Array<number>;
	let decaySlider: any;
	// let attackSlider: any;
	// let releaseSlider: any;
	let attack : number;
	let release : number;

	const buf = 0.00008;
	// time before a note can be played again
	const wait = 1000;

	p5.preload = () => {
		// prepare array of num_points
		heavyLoader = new HeavyLoader(num_points);
		console.log(heavyLoader);

		// redo the callback/async system TODO
		paused = false;
		doneLoading = false;
		numLoading = num_points;
		playing = new Array(num_points);
		lastPlayed = new Array(num_points);
		inverted = false;
		baseFreq = 35;
		angleModLastFrame = Array(num_points);
		attack = 10;
		release = 200;
		for (let i = 0; i < num_points; i++) {
			angleModLastFrame[i] = -1;
			playing[i] = false;
			lastPlayed[i] = -1;
			heavyLoader.loadModule(80, i, baseFreq * (num_points - i), 150, attack, release, 0, finishedLoading, doneHook);
			//heavyLoader.loadModule(80, i, baseFreq + baseFreq * i, 150, 150, 0, finishedLoading, doneHook);
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
			}, 1500);
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
		}, 2*(num_points - i))
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

	function invertPitches() {
		inverted = !inverted;

		if (inverted) {
			heavyLoader.heavyArray.forEach((e, i) => {
				e.loader.audiolib.setFloatParameter("frequency", baseFreq + baseFreq * i);
			});
		} else {
			heavyLoader.heavyArray.forEach((e, i) => {
				e.loader.audiolib.setFloatParameter("frequency", baseFreq * (num_points - i));
			});
		}
	}

	function togglePause() {
		paused = !paused;
		if (paused) {
			pauseButton.html("resume");
		} else {
			pauseButton.html("pause");
		}
	}

	function drawCircles() {
		for (let i = 0; i < num_points; i++) {
			let angle = time * (1 - i * inverse);
			let cos = p5.cos(angle);
			let sin = p5.sin(angle);
			let angleMod = angle % 360;

			if (!paused) {
				if (!playing[i] && millis < lastPlayed[i] || millis - lastPlayed[i] > wait) {
					// check is on strummer
					if (angleMod < angleModLastFrame[i] && !p5.mouseIsPressed) {
						playNote(i, 1);
						lastPlayed[i] = millis;
						// console.log("playing: ", i)
					}
				}
			}

			angleModLastFrame[i] = angleMod;

			let len = radius * (inverse * (i + 1)); // length from center of canvas
			let x = (center.x + cos * len);
			let y = (center.y + sin * len);

			let cWidth = minCircleWidth + (maxCircleWidth - minCircleWidth) * (i + 1) * inverse;
			let hue = i * inverse;
			//let saturation = 1;
			let saturation = 1;
			if (millis - lastPlayed[i] < 200) {
				saturation = 0.2;
			}

			let brightness = 1;

			p5.fill(p5.color(hue, saturation, brightness));
			p5.ellipse(x, y, cWidth);
		}
	}

	function sendAttack(val : number) {
		heavyLoader.heavyArray.forEach((e, i) => {
			e.loader.audiolib.setFloatParameter("duration", attack + release + 10);
			e.loader.audiolib.setFloatParameter("attack", val);
		});
	}

	function sendRelease(val : number) {
		heavyLoader.heavyArray.forEach((e, i) => {
			e.loader.audiolib.setFloatParameter("duration", attack + release + 10);
			e.loader.audiolib.setFloatParameter("release", val);
		});
	}

	p5.setup = () => {
		rate = 0.08;
		period = num_points * 360;
		p5.color(0);
		timeSlider = p5.createSlider(0, period + 10, 0, 1);
		timeSlider.position(10, p5.windowHeight - 30);
		timeSlider.style('width', p5.windowWidth - 30 + "px");

		// attackSlider = p5.createSlider(0, 100, 10, 1);
		// attackSlider.position(100, 110);

		// releaseSlider = p5.createSlider(0, 500, 200, 1);
		// releaseSlider.position(100, 140);

		invertButton = p5.createButton('invert pitches');
		invertButton.position(100, 80);
		invertButton.mousePressed(invertPitches);

		pauseButton = p5.createButton('pause');	
		pauseButton.position(100, 50);
		pauseButton.mousePressed(togglePause);

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

		// if (attackSlider.value() != attack) {
		// 	attack = attackSlider.value();
		// 	sendAttack(attack);
		// }

		// if (releaseSlider.value() != release) {
		// 	release = releaseSlider.value()
		// 	sendAttack(release);
		// }

		// p5.text("attack: " + attack, 200, 110);
		// p5.text("release: " + release, 200, 140);

		// @ts-ignore millis between each frame
		// let deltaTime = window.performance.now() - canvas._pInst._lastFrameTime;
		millis = window.performance.now() - startTime + 200;
		deltaTime = millis - millisLastFrame;
		millisLastFrame = millis;

		if (paused) {
			time = timeSlider.value();
			drawCircles();
			return;
		}

		// current time is the slider value this frame
		time = timeSlider.value();
		// set the slider value to be current time + delta
		timeSlider.value((time + deltaTime * rate) % period);

		drawCircles();

	}
}

new p5(sketch);
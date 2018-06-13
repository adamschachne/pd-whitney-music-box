declare function whitney_music_box_Module() : any;
declare function whitney_music_box_AsmModule() : any;

class HeavyLoader {

  webAssemblySupported : boolean;
  heavyArray : Array<{heavyModule : any, loader : any}>;
  numModules : number;
  audioContext : AudioContext;

  constructor(numModules : number) {
    this.numModules = numModules;
    this.heavyArray = new Array(numModules);
    // @ts-ignore    
    this.webAssemblySupported = (typeof WebAssembly === 'object');
    this.audioContext = new AudioContext();
  }

  loadModule(gain : number, index : number, freq : number, duration : number, attack : number, release : number, velocity : number, finishedLoading : Function, done : Function) {
    if (this.webAssemblySupported) {      
        let heavyModule = whitney_music_box_Module();
        let loader;
        heavyModule['onRuntimeInitialized'] = () => {
          loader = new heavyModule.AudioLibLoader();
          loader.init({
          // optional: set audio processing block size, default is 2048
          blockSize: 1024,
          // optional: provide a callback handler for [print] messages
          printHook: (message : string) => {
            // console.log(message);
          },
          // optional: provide a callback handler for [s {sendName} @hv_param] messages
          sendHook: (sendName : any, floatValue : any) => {
            if (sendName === "done") {
              done(floatValue);
            }
            else {
              console.log(sendName, floatValue);
            }
          },
          // optional: pass an existing web audio context, otherwise a new one
          // will be constructed.
          // webAudioContext: null
          webAudioContext: this.audioContext          
        });
        loader.start();
        loader.audiolib.setFloatParameter("gain", gain);
        loader.audiolib.setFloatParameter("id", index);
        loader.audiolib.setFloatParameter("type", 0);
        loader.audiolib.setFloatParameter("frequency", freq);
        loader.audiolib.setFloatParameter("duration", duration);
        // loader.audiolib.setFloatParameter("attack", attack);
        loader.audiolib.setFloatParameter("release", release);
        loader.stop();
        // loader.audiolib.setFloatParameter("velocity", velocity);
        this.heavyArray[index] = { heavyModule, loader };
        finishedLoading();
      }      
    }
    else {
      console.warn("heavy: web assembly not found, falling back to asm.js");
      var script = document.createElement('script');
      script.src = "whitney_music_box.asm.js";
      script.onload = () => {
        let heavyModule = whitney_music_box_AsmModule();
        let loader = new heavyModule.AudioLibLoader();
        loader.init({
          // optional: set audio processing block size, default is 2048
          blockSize: 1024,
          // optional: provide a callback handler for [print] messages
          printHook: (message : any) => {
            console.log(message);
          },
          // optional: provide a callback handler for [s {sendName} @hv_param] messages
          sendHook: (sendName : any, floatValue : any) => {
            if (sendName === "done") {
              done(floatValue);
            }
            else {
              console.log(sendName, floatValue);
            }
          },
          // optional: pass an existing web audio context, otherwise a new one
          // will be constructed.
          webAudioContext: this.audioContext
        });
        loader.start();
        loader.audiolib.setFloatParameter("gain", gain);
        loader.audiolib.setFloatParameter("id", index);
        loader.audiolib.setFloatParameter("type", 0);
        loader.audiolib.setFloatParameter("frequency", freq);
        loader.audiolib.setFloatParameter("duration", duration);
        // loader.audiolib.setFloatParameter("attack", attack);
        loader.audiolib.setFloatParameter("release", release);
        loader.stop();
        // loader.audiolib.setFloatParameter("velocity", velocity);      
        this.heavyArray[index] = { heavyModule, loader };
        finishedLoading();
      }
      document.body.appendChild(script);
    }
  }
}
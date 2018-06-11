declare function whitney_music_box_Module() : any;
declare function whitney_music_box_AsmModule() : any;

class HeavyLoader {

  webAssemblySupported : boolean;
  heavyArray : Array<{heavyModule : any, loader : any}>;

  constructor() {
    this.heavyArray = [];
    // @ts-ignore    
    this.webAssemblySupported = (typeof WebAssembly === 'object');
  }

  loadModule(gain : number, note : number, velocity : number, callback : Function) {
    if (this.webAssemblySupported) {      
        let heavyModule = whitney_music_box_Module();
        let loader;
        heavyModule['onRuntimeInitialized'] = () => {
          loader = new heavyModule.AudioLibLoader();
          loader.init({
          // optional: set audio processing block size, default is 2048
          blockSize: 2048,
          // optional: provide a callback handler for [print] messages
          printHook: (message : any) => {
            console.log(message);
          },
          // optional: provide a callback handler for [s {sendName} @hv_param] messages
          sendHook: (sendName : any, floatValue : any) => {
            console.log(sendName, floatValue);
          },
          // optional: pass an existing web audio context, otherwise a new one
          // will be constructed.
          webAudioContext: null          
        });              
        loader.audiolib.setFloatParameter("gain", gain);
        loader.audiolib.setFloatParameter("note", note);
        loader.audiolib.setFloatParameter("velocity", velocity);
        loader.start();
        this.heavyArray.push({ heavyModule, loader });
        callback();
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
          blockSize: 2048,
          // optional: provide a callback handler for [print] messages
          printHook: (message : any) => {
            console.log(message);
          },
          // optional: provide a callback handler for [s {sendName} @hv_param] messages
          sendHook: (sendName : any, floatValue : any) => {
            console.log(sendName, floatValue);
          },
          // optional: pass an existing web audio context, otherwise a new one
          // will be constructed.
          webAudioContext: null
        });
        loader.audiolib.setFloatParameter("gain", gain);
        loader.audiolib.setFloatParameter("note", note);
        loader.audiolib.setFloatParameter("velocity", velocity);
        loader.start();
        this.heavyArray.push({ heavyModule, loader });
        callback();
      }
      document.body.appendChild(script);
    }
  }
}
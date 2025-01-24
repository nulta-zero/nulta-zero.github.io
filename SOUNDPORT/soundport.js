const doc = document,
      log = (...x) => console.log(x),
      qu  = (P)=> doc.querySelector(P),
      bigger = (x)=>(y)=> x > y ? x : y,
      dce = (x)=> doc.createElement(x);

const $$ = {
  vars : {
    STATE : false,
    INTERVAL : null,
    audio : {},
    fColor : "#cd5c5c",  //indianred
    mColor : "#00bfff",  //deepskyblue
    TIMEOUT : false,
  },
  query : {},
  collectQuery : function(){
                 $$.query = {

                 }
  },
  mean : function(arr){
        let total = 0;
        for(let i = 0; i< arr.length;i++){
            total += arr[i];
        }
        return total / arr.length;
  },
  detectVoice : function(){
    // Audio context and analyser setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const microphoneStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        console.log("Microphone connected.");
        $$.vars.audio.stream = stream;
        analyze();  // Start real-time analysis
      } catch (err) {
        console.error("Error accessing microphone: ", err);
      }
    };

    const bufferLength = analyser.fftSize;
    const timeDomainData = new Float32Array(bufferLength);
    const voiceFrequencyBuffer = [];
    const bufferSize = 15;
    let previousRMS = 0;
    let sustainedFrameCount = 0;

    // Analyze voice data
    function analyzeVoiceRange(frequency) {
      const smoothedFrequency = smoothFrequency(frequency);
      const minFramesForSpeech = 8;
      if (smoothedFrequency > 0) {
        let detectedRange = '';
        if (smoothedFrequency >= 165 && smoothedFrequency <= 255) {
          detectedRange = 'Female Voice';
        } else if (smoothedFrequency >= 85 && smoothedFrequency < 165) {
          detectedRange = 'Male Voice';
        }else{
          detectedRange = null;
        }

        if (detectedRange) {
          sustainedFrameCount++;
          if (sustainedFrameCount >= minFramesForSpeech) {
            // console.log(`Detected ${detectedRange} at ${smoothedFrequency.toFixed(2)} Hz`);
              if(detectedRange === 'Female Voice') {
                 qu('.traxer').style.background = $$.vars.fColor;
                 $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, $$.vars.fColor, smoothedFrequency );
              }else{
                 qu('.traxer').style.background = $$.vars.mColor;
                 $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, $$.vars.mColor, smoothedFrequency );
              }
            qu('.traxer').innerText = `${smoothedFrequency.toFixed(2)} Hz`;
            sustainedFrameCount = 0;
          }
        } else {
          sustainedFrameCount = 0;
        }
      }
    }

    function smoothFrequency(frequency) {
      if (frequency > 0) {
        voiceFrequencyBuffer.push(frequency);
        if (voiceFrequencyBuffer.length > bufferSize) {
          voiceFrequencyBuffer.shift();
        }
        const medianFrequency = [...voiceFrequencyBuffer].sort((a, b) => a - b)[Math.floor(bufferSize / 2)];
        return medianFrequency;
      }
      return -1;
    }

    function autoCorrelation(buffer, sampleRate) {
      let bestOffset = -1;
      let bestCorrelation = 0;
      let rms = 0;

      for (let i = 0; i < buffer.length; i++) {
        const val = buffer[i];
        rms += val * val;
      }
      rms = Math.sqrt(rms / buffer.length);

      if(rms > 0.4) {
         $$.popover('Loud noise detected!');
         let i = 0;
         //KEEP preventing loud noise sounds for the time of timeout period
         $$.vars.INTERVAL = setInterval( t=>{
             $$.vars.TIMEOUT = true;
             i+=1;
             if(i > 20) { clearInterval( $$.vars.INTERVAL); $$.vars.TIMEOUT = false; }
         },0.1 * 1000);

      }

      if (rms < 0.02 || rms > 0.35 || Math.abs(rms - previousRMS) > 0.15) {
        return -1;
      }
      previousRMS = rms;

      const correlations = new Float32Array(buffer.length);
      let maxSamples = buffer.length / 2;
      const minPitchSamples = Math.floor(sampleRate / 300);
      const maxPitchSamples = Math.floor(sampleRate / 85);

      for (let offset = minPitchSamples; offset < maxPitchSamples; offset++) {
        let correlation = 0;
        for (let i = 0; i < maxSamples; i++) {
          correlation += buffer[i] * buffer[i + offset];
        }
        correlations[offset] = correlation;
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }

      if (bestCorrelation > 0.03) {
        return sampleRate / bestOffset;
      }
      return -1;
    }

    function analyze() {
      analyser.getFloatTimeDomainData(timeDomainData);
      const frequency = autoCorrelation(timeDomainData, audioContext.sampleRate);
      analyzeVoiceRange(frequency);
      requestAnimationFrame(analyze);
    }

    // Start microphone processing
    microphoneStream();
},
popover : (newContent, disappear)=>  {
    if(doc.getElementById("pop") != null) doc.getElementById("pop").remove();  //ONLY ONCE pop AT THE TIME remove old
    let pop = doc.createElement('DIV');
    pop.id = 'pop';
    disappear = disappear || 4130; //can be not set it will use default value

    //DEFINE INNER CONTENT OF POP DIV
    pop.innerHTML = newContent;
    doc.body.appendChild(pop); //ADD POP TO DOCUMENT

    let hide = () => {pop.style.opacity = '0'}

    setTimeout(hide, disappear) //FADE OUT EFFECT
    setTimeout( t=> pop.remove(), disappear + 300) //REMOVE OLD POP
},
generateTextPasus : function(){
     fetch('./text/aristotle.txt').then( x=> x.text() ).then( xx=> {
        let arr = xx.split(/\-THE END\-/gi);          //xx.split('\r\n\r\n\r\n');
         let random = arr[Math.floor(Math.random() * arr.length) ];
         while(random.length < 300){
           random = arr[Math.floor(Math.random() * arr.length) ];    //make sure its not small text
         }
         qu('.text-div').innerHTML =  "<h3>Read Aloud in speaking voice:</h3> \n\n" + random;
      });
},
generateTextToRead : function(){
      let random = TEXTS[ Math.floor(Math.random() * TEXTS.length)];
      qu('.text-div').innerText =  "Read: \n\n" + random;
},
draw_rect : function(it, x,y,width,height,fillColor, strokeColor ){
      //DRAW STOKED RECTANGLE ON CANVAS
      it.beginPath();
      it.strokeStyle = strokeColor || '#202124';
      it.strokeRect(x, y, width, height);
      it.fillStyle = fillColor;
      it.lineWidth = Math.log(Math.log10(x + y));
      it.fillRect(x, y, width, height);
},
draw_line_with_angle : function(it, x1, y1, angle, length, color, thikness){
      let radians = angle/180*Math.PI;
      let dx = (length/2)*Math.cos( radians ),
      dy = (length/2)*Math.sin( radians );
      it.beginPath();
      it.moveTo(x1, y1);
      it.lineTo(dx, dy);
      it.strokeStyle = color;
      it.lineWidth = thikness;
      it.stroke();
  // draw_line(ctx, NULTA.vars.mouse.x, NULTA.vars.mouse.y, NULTA.vars.mouse.x + dx, NULTA.vars.mouse.y-dy, colors[i] || 'deeppink', .5);
},
draw_line : function(it, x1, y1, x2, y2, color, thikness){
      //DRAW LINE ON CANVAS
      it.beginPath();
      it.moveTo(x1, y1);
      it.lineTo(x2, y2);
      it.strokeStyle = color;
      it.lineWidth = thikness;
      it.stroke();

  it.lineWidth = 1; //normalize grid
},
draw_text : function(it, text, x, y, color, textSize){
       //DRAW TEXT ON CANVAS
       it.font = `${textSize}px Menlo`;  //TESTING TEXT
       it.fillStyle = color;
       it.fillText(text, x, y);
       ctx.strokeText(text, x, y);
},
hexToRGB : function(hex){
        let RGB = [];
        if(hex == null) return false;
        for( let i=0; i < hex.length; i++) {
            if(i % 2 == 1){
              const splited = hex[i] + hex[i+1];
              RGB.push(parseInt(splited, 16));
           }
        }
        return RGB;
},
paintOnCanvas : function(it, x, y, color, hz){
        let i = 0;
        let previous_x = Math.random() * ctx.canvas.width,
            previous_y = Math.random() * ctx.canvas.height;
        let w = 5, h = 5,  limit = (hz < 100) ? hz * 0.1 : hz * 0.05;

        let inter = setInterval( t=>{
            if($$.vars.TIMEOUT ) return clearInterval(inter);
            let randomHz = parseInt(Math.random() * hz/5) * Math.random();
            i+=1;
            let freq_color = `rgba(${$$.hexToRGB(color).join(',')},${(hz + limit) * 0.005})`;

              let dir = 1;
                  (Math.random() > 0.5) ? dir = -1 : dir = 1;  //first dir
                  x += (dir * randomHz);
              let offset_x = x + (i*2) * dir;
                  (Math.random() > 0.5) ? dir = -1 : dir = 1;  //repeat dir assignment
                  y += (dir * randomHz);
              let offset_y = y + (i*2) * dir;

               $$.draw_rect(ctx, offset_x, offset_y, w, h, freq_color );
               $$.draw_line(ctx, offset_x + w/2, offset_y+h/2,  previous_x + w/2, previous_y+h/2, freq_color, .089);
               previous_x = offset_x;
               previous_y = offset_y;
               w -= (limit / (limit * 2));
               h -= (limit / (limit * 2));
               if(i > limit) clearInterval(inter);
        },0.1* 1000);
},
stopAudioListening : function(stream) {
        stream.getTracks().forEach((track) => {
            if (track.readyState == 'live' && track.kind === 'audio') track.stop()
        });
},
fillInfoBox : function(){
        qu('.info-box').innerHTML = INFO;
},

}//END OF $$ Object

const main = function(){
  $$.fillInfoBox();
  window.addEventListener('click', e=>{
       switch(e.target.classList[0]){
         case 'start':
               $$.vars.STATE = true;
               $$.detectVoice();
               $$.generateTextPasus();
          break;
          case 'stop':    $$.vars.STATE = false; $$.stopAudioListening($$.vars.audio.stream);  break;
          case 'info':
               let infoBox = qu('.info-box');
               (infoBox.style.display == 'block') ? infoBox.style.display = 'none' : infoBox.style.display = 'block';
          break;
       }
  });

  window.canvas = qu('.canvas');
  window.ctx = canvas.getContext("2d", {willReadFrequently : true});
}

main();

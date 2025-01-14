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
  detectVoiceRangeWithStabilization : async function(){
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.fftSize;
        const timeDomainData = new Float32Array(bufferLength);

        let fColor = "#cd5c5c";  //indianred
        let mColor = "#00bfff";  //deepskyblue

  const voiceFrequencyBuffer = [];
  const bufferSize = 15;
  let lastDetectedRange = '';
  const switchThreshold = 8;

  function smoothFrequency(frequency) {
    if (frequency > 0) {
      voiceFrequencyBuffer.push(frequency);
      if (voiceFrequencyBuffer.length > bufferSize) {
        voiceFrequencyBuffer.shift(); // Keep buffer size fixed
      }
      const recentFrequencies = [...voiceFrequencyBuffer].sort((a, b) => a - b);
      return recentFrequencies[Math.floor(recentFrequencies.length / 2)];
    }
    return -1;
  }

  function analyzeVoiceRange(frequency) {
    const smoothedFrequency = smoothFrequency(frequency);
    if (smoothedFrequency > 0) {
      let detectedRange = '';
      if (smoothedFrequency >= 165 && smoothedFrequency <= 255) {
        detectedRange = 'Female Voice';
      } else if (smoothedFrequency >= 85 && smoothedFrequency < 165) {
        detectedRange = 'Male Voice';
      }
      if (detectedRange && detectedRange !== lastDetectedRange) {
        const recentRangeCount = voiceFrequencyBuffer.filter(f => {
          detectedRange === 'Female Voice' ? f >= 165 : f < 165;

          if(detectedRange === 'Female Voice') {
             qu('.traxer').style.background = fColor;
             $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, fColor, smoothedFrequency );
           }else{
             qu('.traxer').style.background = mColor;
             $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, mColor, smoothedFrequency );
           }
         }).length;

        qu('.traxer').innerText = `${smoothedFrequency.toFixed(2)} Hz`;

        if (recentRangeCount >= switchThreshold) {
          // console.log(`%cDetected ${detectedRange} at ${smoothedFrequency.toFixed(2)} Hz`, detectedRange === 'Female Voice' ? fColor : mColor);
          lastDetectedRange = detectedRange;
        }
      }
    }
  }

  // function autoCorrelation(buffer, sampleRate) {
  //     let bestOffset = -1;
  //     let bestCorrelation = 0;
  //     let rms = 0;
  //
  //     for (let i = 0; i < buffer.length; i++) {
  //       const val = buffer[i];
  //       rms += val * val;
  //     }
  //     rms = Math.sqrt(rms / buffer.length);
  //
  //     if(rms > 0.4) { $$.popover('Loud noise detected!'); return 'false-positive'; }
  //
  //     if (rms < 0.02 || rms > 0.4) return -1;  // Skip classification for low or high rms,  If environment is noisy, increase rms < 0.03 and/or lower the upper bound slightly.
  //
  //     const correlations = new Float32Array(buffer.length);
  //     let maxSamples = buffer.length / 2;
  //     const minPitchSamples = Math.floor(sampleRate / 300);
  //     const maxPitchSamples = Math.floor(sampleRate / 85);
  //
  //     for (let offset = minPitchSamples; offset < maxPitchSamples; offset++) {
  //       let correlation = 0;
  //       for (let i = 0; i < maxSamples; i++) {
  //         correlation += buffer[i] * buffer[i + offset];
  //       }
  //       correlations[offset] = correlation;
  //       if (correlation > bestCorrelation) {
  //         bestCorrelation = correlation;
  //         bestOffset = offset;
  //       }
  //     }
  //
  //     if (bestCorrelation > 0.03) {
  //       return sampleRate / bestOffset;
  //     }
  //     return -1;
  // }
  let previousRMS = 0;

  function autoCorrelation(buffer, sampleRate) {
      let bestOffset = -1;
      let bestCorrelation = 0;
      let rms = 0;

      for(let i = 0; i < buffer.length; i++) {
          const val = buffer[i];
          rms += val * val;
      }
      rms = Math.sqrt(rms / buffer.length);

      const amplitudeSpike = Math.abs(rms - previousRMS) > 0.2;  // Adjust sensitivity as needed
      previousRMS = rms;

      if(rms > 0.4) { $$.popover('Loud noise detected!'); return -1; }     //false-positives

      if (rms < 0.02 || rms > 0.4 || amplitudeSpike) {
        return -1;  // Ignore low, high, or spike-induced noise
      }

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

  try {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    $$.vars.audio = {
      stream : stream,
      source : source
    }

    function analyze() {
      if($$.vars.STATE == false) return false;
      analyser.getFloatTimeDomainData(timeDomainData);
      const frequency = autoCorrelation(timeDomainData, audioContext.sampleRate);
      if(frequency > 0){
         analyzeVoiceRange(frequency);
       }
      requestAnimationFrame(analyze);
    }

    analyze();
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
},
// detectVoice : function(){
//   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//   const analyser = audioContext.createAnalyser();
//   analyser.fftSize = 2048;
//   const bufferLength = analyser.fftSize;
//   const timeDomainData = new Float32Array(bufferLength);
//
//       const voiceFrequencyBuffer = [];
//       const bufferSize = 15;
//       const noiseDurationThreshold = 5;  // Minimum frames for sustained speech
//       let sustainedFrameCount = 0;
//
//       function smoothFrequency(frequency) {
//         if (frequency > 0) {
//           voiceFrequencyBuffer.push(frequency);
//           if (voiceFrequencyBuffer.length > bufferSize) {
//             voiceFrequencyBuffer.shift();  // Fixed buffer size
//           }
//           const medianFrequency = [...voiceFrequencyBuffer].sort((a, b) => a - b)[Math.floor(bufferSize / 2)];
//           return medianFrequency;
//         }
//         return -1;
//       }
//
//       function analyzeVoiceRange(frequency) {
//         const smoothedFrequency = smoothFrequency(frequency);
//         const minFramesForSpeech = 8;  // Number of consistent frames needed to classify as speech
//         if (smoothedFrequency > 0) {
//           let detectedRange = '';
//           if (smoothedFrequency >= 165 && smoothedFrequency <= 255) {
//             detectedRange = 'Female Voice';
//           } else if (smoothedFrequency >= 85 && smoothedFrequency < 165) {
//             detectedRange = 'Male Voice';
//           }
//
//           if (detectedRange) {
//             sustainedFrameCount++;
//             if (sustainedFrameCount >= minFramesForSpeech) {
//
//               if(detectedRange === 'Female Voice') {
//                  qu('.traxer').style.background = fColor;
//                  $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, fColor, smoothedFrequency );
//                }else{
//                  qu('.traxer').style.background = mColor;
//                  $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, mColor, smoothedFrequency );
//                }
//
//                qu('.traxer').innerText = `${smoothedFrequency.toFixed(2)} Hz`;
//
//               console.log(`Detected ${detectedRange} at ${smoothedFrequency.toFixed(2)} Hz`);
//               sustainedFrameCount = 0;  // Reset after a valid speech detection
//             }
//           } else {
//             sustainedFrameCount = 0;  // Reset if no valid range detected
//           }
//         }
//       }
//
//       function autoCorrelation(buffer, sampleRate) {
//         let bestOffset = -1;
//         let bestCorrelation = 0;
//         let rms = 0;
//
//         for (let i = 0; i < buffer.length; i++) {
//           const val = buffer[i];
//           rms += val * val;
//         }
//         rms = Math.sqrt(rms / buffer.length);
//
//         if (rms < 0.02 || rms > 0.35) return -1;  // More refined RMS range
//         if (Math.abs(rms - previousRMS) > 0.15) return -1;  // Ignore sharp amplitude spikes
//         previousRMS = rms;
//
//         const correlations = new Float32Array(buffer.length);
//         let maxSamples = buffer.length / 2;
//         const minPitchSamples = Math.floor(sampleRate / 300);
//         const maxPitchSamples = Math.floor(sampleRate / 85);
//
//         for (let offset = minPitchSamples; offset < maxPitchSamples; offset++) {
//           let correlation = 0;
//           for (let i = 0; i < maxSamples; i++) {
//             correlation += buffer[i] * buffer[i + offset];
//           }
//           correlations[offset] = correlation;
//           if (correlation > bestCorrelation) {
//             bestCorrelation = correlation;
//             bestOffset = offset;
//           }
//         }
//
//         if (bestCorrelation > 0.03) {
//           return sampleRate / bestOffset;
//         }
//         return -1;
//       }
//
//       function analyze() {
//         analyser.getFloatTimeDomainData(timeDomainData);
//         const frequency = autoCorrelation(timeDomainData, audioContext.sampleRate);
//         analyzeVoiceRange(frequency);  // Integrating smoothing and classification
//         requestAnimationFrame(analyze);
//         }
//
// },
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
paintOnCanvas : function(it, x, y, color, mhz){
        let randomMhz = parseInt(Math.random() * mhz/5) * Math.random();
        let symbolSize = randomMhz;

        let formSymbol = (hz)=>{
           if(hz >= 155 && hz < 185)     { symbolSize = 25;  return '⚧';  }
           else if(hz >= 185)            { symbolSize = 20;  return '♀';   }
           else  if(hz < 155 && hz >= 85){ symbolSize = 15;  return '♂';   }
        }

        if(Math.random() > 0.997){
          it.strokeStyle = '#202124ba';
          $$.draw_text(ctx, formSymbol(mhz), x, y, color, symbolSize);  //`rgba(${$$.hexToRGB(color).join(',')},0.5)`  //Math.random() * mhz/15, Math.random() * mhz/15
        }else{
          let freq_color = `rgba(${$$.hexToRGB(color).join(',')},${mhz/2})`;
          if(Math.random() < 0.5)  $$.draw_rect(ctx, x, y,  Math.random() * randomMhz, Math.random() * randomMhz, freq_color );
          else                     $$.draw_rect(ctx, y, x,  Math.log2(Math.random() * Math.log2(mhz)), Math.log2(Math.random() * Math.log10(mhz)), freq_color );

          // log(freq_color);
        }
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
               // $$.detectVoiceRangeWithStabilization();
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

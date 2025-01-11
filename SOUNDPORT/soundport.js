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
  captureAudioAndAnalyzePitch : async function () {
               const audioContext = new (window.AudioContext || window.webkitAudioContext)();
               const analyser = audioContext.createAnalyser();
               analyser.fftSize = 2048;  // Higher value for more detailed frequency analysis

               try {
                 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                 const source = audioContext.createMediaStreamSource(stream);
                 source.connect(analyser);

                 const frequencyData = new Uint8Array(analyser.frequencyBinCount);

                 function analyzePitch() {
                   if($$.vars.STATE == false) return false;
                   analyser.getByteFrequencyData(frequencyData);

                   // Find the index of the maximum frequency
                   const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));

                   // Map index to frequency in Hz
                   const nyquist = audioContext.sampleRate / 2;
                   const frequency = (maxIndex / frequencyData.length) * nyquist;

                   let mean = $$.mean(frequencyData);
                   let mineValue = frequency - mean;

                   // Classify pitch ranges (Example ranges: adjust as needed)
                   if (mineValue > 85 && mineValue < 125) {
                     console.log(`Male ${mineValue.toFixed(2)} Hz`);
                   // }else if (mineValue > 165 && mineValue < 180) {
                       // console.log(`Trans ${mineValue.toFixed(2)} Hz`);
                   } else if (mineValue > 175 && mineValue < 255) {
                     console.log(`Female ${mineValue.toFixed(2)} Hz`);
                   }

                   // log(Math.max(...frequencyData));



                   requestAnimationFrame(analyzePitch);  // Loop for real-time analysis
                 }

                 analyzePitch();
               } catch (err) {
                 console.error('Error accessing microphone:', err);
               }
},
detectVoiceRange : async function(){
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // Balance between resolution and performance
  analyser.smoothingTimeConstant = 0.7; // Smooth out transient peaks

  const minVoiceAmplitudeThreshold = 30;  // Skip very low volume noises
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  let accumulatedFrequency = 0;
  let sampleCount = 0;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    function analyze() {

      analyser.getByteFrequencyData(frequencyData);

      const nyquist = audioContext.sampleRate / 2;
      let maxAmplitude = 0;
      let dominantFrequency = 0;

      frequencyData.forEach((amplitude, index) => {
        if (amplitude > maxAmplitude) {
          maxAmplitude = amplitude;
          dominantFrequency = (index / frequencyData.length) * nyquist;
        }
      });

      if (maxAmplitude > minVoiceAmplitudeThreshold) {
        accumulatedFrequency += dominantFrequency;
        sampleCount++;
      }

      // Evaluate after several samples (e.g., 2-3 seconds)
      if (sampleCount >= 60) {
        const averageFrequency = accumulatedFrequency / sampleCount;


        if (averageFrequency >= 165 && averageFrequency <= 255) {
          console.log('Female Voice');         console.log(`Average Frequency: ${averageFrequency.toFixed(2)} Hz`);
        } else if (averageFrequency >= 85 && averageFrequency < 165) {
          console.log('Male Voice');           console.log(`Average Frequency: ${averageFrequency.toFixed(2)} Hz`);
        } else {
          // console.log('Out of typical speaking range');
        }

        // Reset for next period
        accumulatedFrequency = 0;
        sampleCount = 0;
      }

      requestAnimationFrame(analyze);
    }

    analyze();
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
},
detectVoiceRangeImproved : async function(){
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 4096; // Higher resolution for more accurate analysis
  analyser.smoothingTimeConstant = 0.9; // Smooths transient spikes even further

  const minVoiceAmplitudeThreshold = 25;  // Lower to capture quieter male voices
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  const voiceFrequencies = [];
  const evaluationInterval = 3000;  // Evaluate every 3 seconds

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    function analyze() {

      analyser.getByteFrequencyData(frequencyData);

      const nyquist = audioContext.sampleRate / 2;
      let maxAmplitude = 0;
      let dominantFrequency = 0;

      for (let index = 0; index < frequencyData.length; index++) {
        const amplitude = frequencyData[index];
        const frequency = (index / frequencyData.length) * nyquist;

        if (amplitude > maxAmplitude && frequency >= 70 && frequency <= 300) {
          maxAmplitude = amplitude;
          dominantFrequency = frequency;
        }
      }

      if (maxAmplitude > minVoiceAmplitudeThreshold && dominantFrequency > 0) {
        voiceFrequencies.push(dominantFrequency);
      }

      requestAnimationFrame(analyze);
    }

    function evaluateVoiceRange() {
      if (voiceFrequencies.length > 0) {
        const averageFrequency = voiceFrequencies.reduce((a, b) => a + b, 0) / voiceFrequencies.length;


        if (averageFrequency >= 165 && averageFrequency <= 255) {
          console.log('Female Voice');   console.log(`Average Frequency: ${averageFrequency.toFixed(2)} Hz`);
        } else if (averageFrequency >= 85 && averageFrequency < 165) {
          console.log('Male Voice');     console.log(`Average Frequency: ${averageFrequency.toFixed(2)} Hz`);
        } else {
          // console.log('Out of speaking range');
        }

        voiceFrequencies.length = 0;  // Reset the array for next interval
      }

      setTimeout(evaluateVoiceRange, evaluationInterval);
    }

    analyze();
    setTimeout(evaluateVoiceRange, evaluationInterval);
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
},
detectVoiceRangeCorrected : async function() {
  let recording = async()=> {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192; // Higher resolution for more low-frequency precision
      analyser.smoothingTimeConstant = 0.95; // Further smoothing to reduce transient noise

      const minVoiceAmplitudeThreshold = 20;  // Lowered to capture softer male voices
      const frequencyData = new Float32Array(analyser.frequencyBinCount);
      const voiceFrequencies = [];
      const evaluationDuration = 3000;  // Evaluate every 3 seconds

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.getFloatFrequencyData(frequencyData);
        log(Math.max(...frequencyData));
  }



      $$.vars.INTERVAL = setInterval(t=>{
           if($$.vars.STATE == false) { clearInterval($$.vars.INTERVAL); return false; }
           else{
               recording();
           }
      }, 1* 1000);




    // function analyze() {
    //   if($$.vars.STATE == false) return false;
    //   analyser.getFloatFrequencyData(frequencyData);  // More precise than ByteFrequencyData
    //
    //   const nyquist = audioContext.sampleRate / 2;
    //   let dominantFrequency = 0;
    //   let maxAmplitude = -Infinity;  // Float data range is negative
    //
    //   for (let index = 0; index < frequencyData.length; index++) {
    //     const frequency = (index / frequencyData.length) * nyquist;
    //     const amplitude = frequencyData[index];
    //
    //     if (frequency >= 85 && frequency <= 300 && amplitude > maxAmplitude) {
    //       maxAmplitude = amplitude;
    //       dominantFrequency = frequency;
    //     }
    //   }
    //
    //   if (maxAmplitude > -60 && dominantFrequency > 0) {
    //     voiceFrequencies.push(dominantFrequency);
    //   }
    //
    //   requestAnimationFrame(analyze);
    // }
    //
    // function evaluateVoiceRange() {
    //   if (voiceFrequencies.length > 0) {
    //     const medianFrequency = voiceFrequencies.sort((a, b) => a - b)[Math.floor(voiceFrequencies.length / 2)];
    //
    //     log(medianFrequency);
    //
    //     if (medianFrequency >= 165 && medianFrequency <= 255) {
    //       console.log('Detected Female Voice');      console.log(`Median Frequency: ${medianFrequency.toFixed(2)} Hz`);
    //     } else if (medianFrequency >= 85 && medianFrequency < 165) {
    //       console.log('Detected Male Voice');        console.log(`Median Frequency: ${medianFrequency.toFixed(2)} Hz`);
    //     } else {
    //       // console.log('Frequency out of speaking range.');
    //     }
    //
    //     voiceFrequencies.length = 0;  // Reset
    //   }
    //
    //   setTimeout(evaluateVoiceRange, evaluationDuration);
    // }

    // analyze();
    // setTimeout(evaluateVoiceRange, evaluationDuration);
  // } catch (err) {
  //   console.error('Error accessing microphone:', err);
  // }
},

detectVoiceRangeWithPitchDetection : async function() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;  // FFT size optimized for latency and frequency resolution
  const bufferLength = analyser.fftSize;
  const timeDomainData = new Float32Array(bufferLength);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    let fColor = "color:indianred;"
    let mColor = "color:deepskyblue;"

    function autoCorrelation(buffer, sampleRate) {
      let bestOffset = -1;
      let bestCorrelation = 0;
      let rms = 0;

      for (let i = 0; i < buffer.length; i++) {
        const val = buffer[i];
        rms += val * val;
      }
      rms = Math.sqrt(rms / buffer.length);
      if (rms < 0.02) return -1; // Noise floor adjusted for better sensitivity

      const correlations = new Float32Array(buffer.length);
      let maxSamples = buffer.length / 2;

      // Tune search range dynamically
      const minPitchSamples = Math.floor(sampleRate / 300);  // Upper limit for female voices (~300 Hz)
      const maxPitchSamples = Math.floor(sampleRate / 85);   // Lower limit for male voices (~85 Hz)

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

      if (bestCorrelation > 0.03) {  // Balanced correlation threshold
        const frequency = sampleRate / bestOffset;
        return frequency;
      }
      return -1;
    }

    function analyze() {
      if($$.vars.STATE == false) return false;
      analyser.getFloatTimeDomainData(timeDomainData);
      const frequency = autoCorrelation(timeDomainData, audioContext.sampleRate);

      if (frequency > 0) {
        if (frequency >= 85 && frequency <= 130) {
          // console.log(`%cDetected Male Voice at ${frequency.toFixed(2)} Hz`, mColor);
          qu('.traxer').style.background = 'deepskyblue';
        } else if (frequency >= 165 && frequency <= 255) {
          // console.log(`%cDetected Female Voice at ${frequency.toFixed(2)} Hz`, fColor);
            qu('.traxer').style.background = 'indianred';
        }
      }

      requestAnimationFrame(analyze);
    }

    analyze();
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
},

detectVoiceRangeWithStabilization : async function(){
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.fftSize;
  const timeDomainData = new Float32Array(bufferLength);

  let fColor = "color:indianred;"
  let mColor = "color:deepskyblue;"

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
      } else if (smoothedFrequency >= 85 && smoothedFrequency < 125) {
        detectedRange = 'Male Voice';
      }
      if (detectedRange && detectedRange !== lastDetectedRange) {
        const recentRangeCount = voiceFrequencyBuffer.filter(f => {
          detectedRange === 'Female Voice' ? f >= 165 : f < 165;

          if(detectedRange === 'Female Voice') {
             qu('.traxer').style.background = 'indianred';
             // $$.draw_rect(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, Math.random() * 2, Math.random() * 7, 'indianred' );
             $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, 'indianred', smoothedFrequency );
           }else{
             qu('.traxer').style.background = 'deepskyblue';
             $$.paintOnCanvas(ctx, Math.random() * canvas.width,  Math.random() * canvas.height, 'deepskyblue', smoothedFrequency );
             // $$.draw_rect(ctx, Math.random() * canvas.width,  Math.random() * canvas.height,  Math.random() * 7, Math.random() * 2, 'deepskyblue');
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

  function autoCorrelation(buffer, sampleRate) {
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    for(let i = 0; i < buffer.length; i++) {
        const val = buffer[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.02) return -1;

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
      analyzeVoiceRange(frequency);  // Integrating smoothing and classification
      requestAnimationFrame(analyze);
    }

    analyze();
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
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
draw_rect : function(it, x,y,width,height,color ){
          //DRAW STOKED RECTANGLE ON CANVAS
          it.beginPath();
          it.strokeStyle = '#202124';
          it.strokeRect(x, y, width, height);
          it.fillStyle = color;
          it.lineWidth = Math.log(Math.log10(x + y));
          it.fillRect(x, y, width, height);
          // if(typeof color == 'undefined'){
          //    //DO NOTHING
          //    it.strokeStyle = 'brown';
          //    it.strokeRect(x, y, width, height);
          // }else{
          //    it.fillStyle = color;
          //    it.fillRect(x, y, width, height);
          //    it.stroke();
          //    // it.font = "15px Arial";  //TESTING TEXT
          //    // it.fillText(text, x, y);
          // }
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
      if(Math.random() < 0.5)  $$.draw_rect(ctx, x, y,  Math.random() * randomMhz, Math.random() * randomMhz, color );
      else                     $$.draw_rect(ctx, y, x,  Math.log2(Math.random() * Math.log2(mhz)), Math.log2(Math.random() * Math.log10(mhz)), color );
    }
},
stopAudioListening : function(stream) {
    stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'audio') {
            track.stop();
        }
    });
},
fillInfoBox : function(){
   qu('.info-box').innerHTML = INFO;
}


}


const main = function(){

  $$.fillInfoBox();

  window.addEventListener('click', e=>{
       switch(e.target.classList[0]){
         case 'start':
            $$.vars.STATE = true;
            $$.detectVoiceRangeWithStabilization();
            $$.generateTextPasus();
          break;
          case 'stop':    $$.vars.STATE = false; $$.stopAudioListening($$.vars.audio.stream);  break;
          case 'info':
                let infoBox = qu('.info-box');
                if(infoBox.style.display == 'block'){
                   infoBox.style.display = 'none';
                }else{
                   infoBox.style.display = 'block';
                }
                // if(infoBox.style.visibility == 'hidden'){
                //    infoBox.style.visibility = 'visible';
                // }else{
                //    infoBox.style.visibility = 'hidden';
                // }
          break;
       }
  });

  window.canvas = qu('.canvas');
  window.ctx = canvas.getContext("2d", {willReadFrequently : true});

}

main();

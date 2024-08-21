const doc = document,
      log = (x)=> console.log(x),
      qu = (x)=> doc.querySelector(x),
      aud = qu('.aud-mode'),
      dl = qu('.dl-mode');

const $$ = {
    vars : {},
    speakThis : function(rate, word ){ //SPEAKs string/number
                    $$.vars.speakInc+=1;
                    window.speechSynthesis.cancel();

                    $$.vars.synth = window.speechSynthesis;
                    const u = new SpeechSynthesisUtterance(word);

                    const VOICES = window.speechSynthesis.getVoices();
                    const reed = VOICES[89];  //33 is SAMANTHA

                    u.lang= 'en-GB',  u.pitch= 1,  u.rate= rate || 0.85;
                    u.volume= 0.9,    u.voice= reed;
                    return $$.vars.synth.speak(u);
    },
    darkMode : function(){
        qu('html').style.mixBlendMode = 'darken';
    },
    lightMode : function(){
        qu('html').style.mixBlendMode = 'difference';
    },
}

const main = function(){
  dl.addEventListener('input', e=>{
      let state = e.target.checked;
      switch(state){
        case true:  $$.lightMode(); break;
        case false: $$.darkMode();  break;
      }
  });

  aud.addEventListener('input', e=>{
     let text = qu('.container').innerText;
         text = text.split('\n').join('!'); //adds pause in speaking when reading next row in table
     switch(e.target.checked){
       case true :  $$.speakThis(1 ,text); break;
       case false:  if($$.vars.synth == null) return false;
                    else $$.vars.synth.pause();
       break;
     }
  });
}

main();

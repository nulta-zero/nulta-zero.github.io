const doc = document,
      log = (x)=> console.log(x),
      dce = (x)=> doc.createElement(x),
      qu = (x)=> doc.querySelector(x),
      aud = qu('.aud-mode'),
      dl = qu('.dl-mode'),
      mat = qu('.mat-mode');

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
    matrix : function(bool){
         if(bool) qu('.table-holder').classList.add('matrix');
         else     qu('.table-holder').classList.remove('matrix');
    },
    calculateLargestTitlePos : function(){
         let ltr = qu('.largest-title').getBoundingClientRect();
         let horizontalLine = qu('.horizontal-line');
         let banderX = qu('.bander-x');
         horizontalLine.style.top = ltr.top + ltr.height + 10 + 'px';
         banderX.style.top = ltr.top + ltr.height + 20 + 'px';
    },
    createTRS : function(){
      let OV = Object.values(DATA);
      let tbody = qu('.projects-list').querySelector('tbody');
      for(let i = 0; i<OV.length;i++){
          let tr = dce('tr');
          let td1 = dce('td');
          let td2 = dce('td');

          td1.classList.add('lister');
          td2.classList.add('explainer');
          td1.innerText = OV[i].name + ' ';
          td2.innerText = OV[i].desc;

          if(OV[i].link.length > 0){
             let a = dce('a');
                 a.setAttribute('target', '_blank');
                 a.title = 'Open link in a new tab';
                 a.innerText = '⌗';
                 td1.appendChild(a);
          }

          if(OV[i].super){
             td1.classList.add('emphasis');
          }

          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
      }

    }
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

  mat.addEventListener('input', e=>{
    let state = e.target.checked;
    switch(state){
      case true:  $$.matrix(true);   break;
      case false: $$.matrix(false);  break;
    }
  });

  window.addEventListener('DOMContentLoaded', e=>{
      $$.calculateLargestTitlePos();
      $$.createTRS();
  });

  $$.calculateLargestTitlePos();
  window.addEventListener('resize', e=>{
      $$.calculateLargestTitlePos();
  });
}

main();

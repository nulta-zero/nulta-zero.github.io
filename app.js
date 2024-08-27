const doc = document,
      log = (x)=> console.log(x),
      dce = (x)=> doc.createElement(x),
      qu = (x)=> doc.querySelector(x);

const $$ = {
    vars : {
      program_name : 'CALCULATOR',
    },
    query : {},
    loadQuery : function(){
            $$.query.aud  = qu('.aud-mode'),
            $$.query.dl   = qu('.dl-mode'),
            $$.query.mat  = qu('.mat-mode'),
            $$.query.lp   = qu('.lp-mode');
    },
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
                 a.href = OV[i].link;
                 td1.appendChild(a);
          }

          if(OV[i].power){
             td1.classList.add('power');
          }
          if(OV[i].name.toUpperCase() == $$.vars.program_name.toUpperCase()){
             td1.classList.add('available');
          }

          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
      }
    },
    fetchData : async function(url) {
        try {
          const response = await fetch(url);
          if(!response.ok) {
             $$.loadProgram(true, 'dead-page.html');
            // throw new Error(`Response status: ${response.status}`);
          }else{
            $$.loadProgram(true, url);
          }
        } catch (error) {
          //die
        }
    },
    loadProgram : function(state, source){
      switch(state){
        case true:
             let iframe = dce('iframe');
             iframe.id = 'program-frame';
             iframe.src = source;
             iframe.setAttribute('frameborder', 0);
            qu('.program').appendChild(iframe);
        break;
        case false:  if(qu('#program-frame') != null) qu('#program-frame').remove(); break;
      }
    },
    splitScreen : function(state){
        let splitWindow = qu('.split-window');
        let window_width = window.innerWidth;
        let window_height = window.innerHeight;

        let combos = ['width', 'left', window_width];

        // DETECT TO SPLIT VERTICAL OR HORIZONTAL (smaller screens horizontal, larger vertical)
        if(window_width > 900)  combos = ['width', 'left', window_width];   // SPLIT HORIZONTAL
        else                    combos = ['height', 'top', window_height];  // SPLIT VERTICAL

        for(let i = 0; i<splitWindow.children.length; i++){
          switch(state){
            case true:
                 splitWindow.children[i].style.position = 'fixed';
                 if(combos.includes('width')) splitWindow.children[i].style.height = '-webkit-fill-available';
                 else                         splitWindow.children[i].style.width  = '-webkit-fill-available';
                 splitWindow.children[i].style[combos[0]] = combos[2]/2 + 'px';
                 switch(i){
                   case 1:
                       splitWindow.children[i].style[combos[1]] = splitWindow.children[0].getBoundingClientRect()[combos[0]] + 'px';
                       splitWindow.children[i].style.overflow = 'scroll';
                        splitWindow.children[i].style[combos[0]] = combos[2]/2-70 + 'px'; //asign right side to somewhat less space -70px
                   break;
                 }
            break;
            case false:
                 splitWindow.children[i].style.position = '';
                 splitWindow.children[i].style.height   = '';
                 splitWindow.children[i].style.width    = '';
                 splitWindow.children[i].style.left     = '';
                 splitWindow.children[i].style.top      = '';
            break;
          }
        }
    },
}

const main = function(){
   $$.loadQuery();

   $$.query.dl.addEventListener('input', e=>{
      let state = e.target.checked;
      switch(state){
        case true:  $$.lightMode(); break;
        case false: $$.darkMode();  break;
      }
  });

   $$.query.aud.addEventListener('input', e=>{
     let text = qu('.container').innerText;
         text = text.split('\n').join('!'); //adds pause in speaking when reading next row in table
     switch(e.target.checked){
       case true :  $$.speakThis(1 ,text); break;
       case false:  if($$.vars.synth == null) return false;
                    else $$.vars.synth.pause();
       break;
     }
  });

   $$.query.mat.addEventListener('input', e=>{
    let state = e.target.checked;
    switch(state){
      case true:  $$.matrix(true);   break;
      case false: $$.matrix(false);  break;
    }
  });

    $$.query.lp.addEventListener('input', e=>{
      let state = e.target.checked;
      switch(state){
        case true:  $$.fetchData('../../'+ $$.vars.program_name);  $$.splitScreen(state);  break;
        case false: $$.loadProgram(state);                         $$.splitScreen(state);  break;
      }
      setTimeout( $$.calculateLargestTitlePos, 0.2 * 1000);
  });

  window.addEventListener('DOMContentLoaded', e=>{
      $$.calculateLargestTitlePos();
      $$.createTRS();
  });

  window.addEventListener('resize', e=>{
      $$.calculateLargestTitlePos();
  });
}

main();

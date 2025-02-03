const doc = document,
      log = (x)=> console.log(x),
      dce = (x)=> doc.createElement(x),
      qu = (x)=> doc.querySelector(x),
      quAll = (x)=> doc.querySelectorAll(x);

const $$ = {
    vars : {
      availables : ['CALCULATOR', 'VIEWPORT', 'SOUNDPORT', 'MNEMONIC'],
      active_program : '',
      abc   : ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
    },
    query : {},
    loadQuery : function(){
            $$.query.aud  = qu('.aud-mode'),
            $$.query.dl   = qu('.dl-mode'),
            $$.query.mat  = qu('.mat-mode'),
            $$.query.wr   = qu('.wr-mode'),
            $$.query.rev  = qu('.rev-mode');
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
         if(bool) qu('.super-container').classList.add('matrix');
         else     qu('.super-container').classList.remove('matrix');
    },
    calculateLargestTitlePos : function(){
         let ltr = qu('.largest-title').getBoundingClientRect();
         let horizontalLine = qu('.horizontal-line');
         let banderX = qu('.bander-x');
         horizontalLine.style.top = ltr.top + ltr.height + ltr.height / 5 + 'px';
         banderX.style.top = ltr.top + ltr.height + 20 + 'px';
         // if(qu('.abc-holder') != null) qu('.abc-holder').style.top = ltr.top + ltr.height - 10 + 'px';
    },
    createTRS : function(){
      let tbody = qu('.projects-list').querySelector('tbody');
      for(let i = 0; i<DATA.length;i++){
          let tr = dce('tr');
          let td1 = dce('td');
          let td2 = dce('td');

          td1.classList.add('lister');
          td2.classList.add('explainer');
          td1.innerText = DATA[i].name + ' ';
          td2.innerText = DATA[i].desc;
          td1.setAttribute('program-name', DATA[i].name);

          if(DATA[i].link.length > 0){
             let a = dce('a');
                 a.setAttribute('target', '_blank');
                 a.title = 'Open link in a new tab';
                 a.innerText = '⌗';
                 a.href = DATA[i].link;
                 td1.appendChild(a);
          }

          if(DATA[i].power){
             td1.classList.add('power');
          }
          if( $$.vars.availables.includes( DATA[i].name.toUpperCase()) ){
             td1.classList.add('available');
             td1.title = "[tap to run / tap to cancel]";
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
    replaceProgram : (src, name)=>  { qu('#program-frame').src = src; $$.vars.active_program = name;},
    splitScreen : function(state){
       let windowHolder = qu('.window-holder');
       let horizontalLine = qu('.horizontal-line');
       let banderY = qu('.bander-y');
      switch(state){
        case true :  windowHolder.classList.add('grid-split-window');   window.scrollTo(0, 0); horizontalLine.style.position = 'relative';  banderY.style.position = 'relative';  break;
        case false : windowHolder.classList.remove('grid-split-window'); horizontalLine.style.position = 'absolute'; banderY.style.position = 'absolute'; break;
      }
    },
    createPoints : function(max, className, abc){
           let pointsHolder = dce('div');
               pointsHolder.classList.add(className);
           for(let i = 0; i< max; i++){
               let point = dce('div');
                 point.classList.add('points');
                 switch(abc){
                   case true:   point.innerText = $$.vars.abc[i]; break;
                   default :    point.innerText = i;   break;
                 }
             pointsHolder.appendChild(point);
           }
          qu('.super-container').appendChild(pointsHolder);
    },
    exporter : function(content){
                  //INIT LINK TO DOWNLOAD
                  const init_link_download = function(content){
                     const a_link = dce('a');
                     const file = new Blob([content], {type: 'text/plain'});
                     a_link.href = URL.createObjectURL(file);
                     name = 'my-pad-file'; //NAME THE EXPORTED FILE
                     a_link.download = name;
                     a_link.hidden = true;
                     a_link.id = 'secondWindow';
                     doc.body.appendChild(a_link); //ADD LINK TO BODY
                     const SW = doc.getElementById('secondWindow');

                    setTimeout( t=>{ SW.click(); SW.remove(); },0.25 * 1000); //CLICK AND REMOVE
                   }

                   init_link_download(content);
     },
    createPad : function(){
         let pad = dce('div');
             pad.classList.add('pad');
         let pad_notes = dce('textarea');
             pad_notes.classList.add('pad-notes');
             pad_notes.setAttribute('contenteditable', true);
             pad.appendChild(pad_notes);
         let bar = dce('div');
             bar.classList.add('pad-bar');


         //PAD INPUTS
         let full_width = dce('input');
             full_width.value = '⤢';
             full_width.classList.add('simple-btn');
             full_width.type = 'button';
             full_width.title = "FULL-SCREEN";

             full_width.addEventListener('click', e=>{
               if(navigator.userAgent.search('iPhone') > -1){
                  // MOBILE PHONES
                  if(pad.clientWidth > window.innerWidth / 3 ){
                    pad.style.width = '20vw';
                    pad.style.height = '45%';
                  }else{
                    pad.style.width =  '95%';
                    pad.style.height = '45%';
                  }
                  return true;
               }

                // USUAL DESKTOP BEHAVIOR
                if(pad.clientWidth > window.innerWidth / 3 ){
                  pad.style.width = '20vw';
                  pad.style.height = '45vh';
                }else{
                  pad.style.width =  (qu('.program').clientWidth < 1) ? '99%' : (window.innerWidth - qu('.program').clientWidth) - 22.5 + 'px';
                  pad.style.height = 'calc(100% - 40px)';
                }
             });
          let export_btn = dce('input');
              export_btn.value = '⏍';
              export_btn.classList.add('simple-btn');
              export_btn.type = 'button';
              export_btn.title = "EXPORT AS TXT";

              export_btn.addEventListener('click', e=>{
                  $$.exporter(qu('.pad-notes').innerText);
              });

              pad.appendChild(pad_notes);

              bar.appendChild(full_width);
              bar.appendChild(export_btn);
              pad.appendChild(bar);

         doc.body.appendChild(pad);
    },
}

const main = function(){
   $$.loadQuery();


   let checkboxes = quAll("[type=checkbox]");
   for(let i = 0; i<checkboxes.length;i++){
       let onStateAct = (state, T, F)=>{
           switch(state){
             case true : T(); break;
             case false: F(); break;
           }
       }
       checkboxes[i].addEventListener('input', e=>{
       switch(checkboxes[i].classList[0]){
          case 'dl-mode':  onStateAct(e.target.checked, $$.lightMode, $$.darkMode);  break;
          case 'aud-mode':
                    let text = qu('.container').innerText;
                        text = text.split('\n').join('!'); //adds pause in speaking when reading next row in table
                        onStateAct(e.target.checked, f=> $$.speakThis(1 ,text),  f=>{  ($$.vars.synth == null) ? false : $$.vars.synth.pause(); } );
          break;
          case 'mat-mode':   onStateAct(e.target.checked, f=> $$.matrix(true), f=> $$.matrix(false) );  break;
          case 'wr-mode':
                           onStateAct(e.target.checked, $$.createPad, f=> qu('.pad').remove() );
                           setTimeout( $$.calculateLargestTitlePos, 0.1 * 1000);
          break;
          case 'rev-mode':
                      if(qu('.window-holder').classList.contains('grid-split-window') == false) return false; //NO need to change
                        onStateAct(e.target.checked, f=> qu('.super-container').style.order = -1, f=> qu('.super-container').style.order = 0 );
          break;
          }
      });
   }

  window.addEventListener('click', e=>{
     let programState = qu('.program').contains(qu('#program-frame'));
     switch(e.target.classList[0]){
       case 'lister':
             switch(e.target.classList[1]){
               case 'available':
                  let clickedProgramName = e.target.getAttribute('program-name');
                  if(programState == false) {
                     $$.fetchData('../../'+ clickedProgramName);
                     $$.splitScreen(true);
                     $$.vars.active_program = clickedProgramName;
                  }else if( clickedProgramName != $$.vars.active_program ) {
                     $$.replaceProgram('../../' + clickedProgramName, clickedProgramName );
                  }else{
                     $$.loadProgram(false);
                     $$.splitScreen(false);
                     $$.vars.active_program = '';
                  }
               break;
                   $$.calculateLargestTitlePos();
             }
       break;
     }
  });

  window.addEventListener('DOMContentLoaded', e=>{
      $$.calculateLargestTitlePos();
      $$.createTRS();
      $$.createPoints( 38, 'points-holder' );
      // $$.createPoints( $$.vars.abc.length-1, 'abc-holder', true );
  });

  window.addEventListener('resize', e=>{
      $$.calculateLargestTitlePos();
  });

  window.addEventListener('focus', e=>{
    (doc.visibilityState == 'visible') ? $$.calculateLargestTitlePos() : '';
  });
}

main();

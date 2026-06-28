const doc = document,
      log = (x)=> console.log(x),
      dce = (x)=> doc.createElement(x),
      qu = (x)=> doc.querySelector(x),
      quAll = (x)=> doc.querySelectorAll(x),
      show_this = (x, state)=> x.style.display = state,
      outlineAll = ()=> quAll('*').forEach(el => el.classList.add('outlined')),
      deOutlineAll = ()=>quAll('*').forEach(el => el.classList.remove('outlined'));

const $$ = {
    vars : {
      availables : ['CALCULATOR', 'VIEWPORT', 'SOUNDPORT', 'FEMY'],
      active_program : '',
      abc   : ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
      timer : 0,
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
         doc.body.style.background = 'var(--dark)';
         doc.body.style.color = '';
    },
    lightMode : function(){
         doc.body.style.background = '#e3e5e8';
         doc.body.style.color = 'black';
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
                 a.title = 'OPEN LINK';
                 a.innerText = '⌗';
                 a.href = DATA[i].link;
                 td1.appendChild(a);
              let span = dce('span');
                  span.textContent = '◲';
                  span.classList.add('embeded-video', 'simple-btn');
                  span.title="VIEW EMBEDED VIDEO";
                  td1.appendChild(span);
          }

          if(DATA[i].break){
             tr.classList.add('segment-break');
             td2.innerText = '-- ' + DATA[i].desc + ' --';
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
        case true :  windowHolder.classList.add('grid-split-window');     window.scrollTo(0, 0); horizontalLine.style.position = 'none';  banderY.style.position = 'relative';  break;
        case false : windowHolder.classList.remove('grid-split-window');  horizontalLine.style.position = 'absolute'; banderY.style.position = 'absolute'; $$.calculateLargestTitlePos(); break;
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
             pad_notes.value = "//Ready to take notes...";
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
                   pad_notes.scrollIntoView(true);
                }

                // USUAL DESKTOP BEHAVIOR
                if(pad.clientWidth > window.innerWidth / 3 ){
                  pad.style.width = '20vw';
                  pad.style.height = '45vh';
                }else{
                  pad.style.width =  (qu('.program').clientWidth < 1) ? '99%' : (window.innerWidth - qu('.program').clientWidth) - 22.5 + 'px';
                  pad.style.height = 'calc(100% - 35px)';
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
    collectPageSEOkeywords : function(){
         let from =  qu('.container') || qu('body');
         let keywords = from.innerText.replaceAll(/\t|\n|\W+/gi, ' ');
             qu('[name="keywords"]').setAttribute('content', keywords);
    },
    openEmbeded : function(e){
         let name = e.target.parentElement.getAttribute('program-name');
         let iframe = qu('.i-frame');
         if(name == null || e.target.parentElement.querySelector('a') == null) return;  //safe exit

         iframe.removeAttribute('sandbox');  //de-freeze
         let facebook = 'https://www.facebook.com/plugins/video.php';

         switch(name){
            case 'FEMY': iframe.src = facebook + "?height=460&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2130544091227184%2F&show_text=false&width=560&t=0"; break;
            case 'CHESS': iframe.src = facebook + "?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F733573402203970%2F&show_text=false&width=343&t=0"; break;
            case 'DOROTEJA': iframe.src=facebook + "?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F224555588569922%2F&show_text=false&width=560&t=0"; break;
            case 'FROGGY_LEAP': iframe.src= facebook + "?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F710233299384031%2F&show_text=false&width=560&t=0"; break;
            case 'HUNT':  iframe.src = facebook + "?height=526&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F185311370221164%2F&show_text=false&width=560&t=0"; break;
            case 'NINJA_ESCAPE': iframe.src = facebook + "?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F579801112426482%2F&show_text=false&width=560&t=0"; break;
            case 'ANIMIX':  iframe.src = facebook + "?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F502833019171008%2F&show_text=false&width=397&t=0"; break;
            case 'ART': iframe.src = facebook + "?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F299171132206369%2F&show_text=false&width=475&t=0"; break;
            case 'CHIP_TUNE': iframe.src = facebook + "?height=422&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F566372738410609%2F&show_text=false&width=560&t=0"; break;
            case 'PLAN_3D': iframe.src = facebook + "?height=437&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F934657085648586%2F&show_text=false&width=560&t=0"; break;
            case 'GRAPH': iframe.src = facebook + "?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F343597011953439%2F&show_text=false&width=392&t=0"; break;
            case 'FEMY': iframe.src = facebook + "?height=460&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2130544091227184%2F&show_text=false&width=560&t=0"; break;
            case 'NULTA': iframe.src = facebook + "?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F1852154845277172%2F&show_text=false&width=446&t=0"; break;
            case 'PAPER': iframe.src = facebook + "?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F2335019296681246%2F&show_text=false&width=422&t=0"; break;
            case 'ROS': iframe.src = facebook + "?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fnulta.io%2Fvideos%2F444419753883243%2F&show_text=false&width=560&t=0"; break;
         }
         let height = iframe.src.split('&').filter( x=> x.includes('height'))[0].replaceAll(/[^\d]/gi, '');
         iframe.style.display = 'block';
         iframe.style.right   = '-32%';
         iframe.style.bottom  = 5 + 'px';
         iframe.style.height  = height + 'px';
    },

   startTimer : function(time, func, step=1){
        $$.vars.timer = 0;
        let inter = setInterval( x=>{
            $$.vars.timer += step;

           if($$.vars.timer >= time){
              if(typeof func == 'function'){
                 func();
                 clearInterval(inter);
              }
           }
           if(qu('.i-frame').style.display != 'none') clearInterval(inter);
        }, (step || 1) * 1000);
   },
   clearIframeContent : function(frame){
        // 1. Point to about:blank to kill the frames processes
        frame.src = 'about:blank';
        // 2. Remove the 'src' attribute entirely to prevent accidental reloads
        frame.removeAttribute('src');
        // 3. Remove sandbox/allow permissions temporarily to completely freeze it
        frame.removeAttribute('sandbox');
        frame.setAttribute('sandbox', ''); // Keeps it locked down while idle
   },
}

const main = function(){
   $$.loadQuery();
   $$.collectPageSEOkeywords();

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
       case 'embeded-video':  $$.openEmbeded(e); break;
       case 'window-holder': case 'body': case 'super-container':
             let i_frame = qu('.i-frame');
             if(i_frame.style.display == 'block') {
                show_this(i_frame, 'none');
                $$.startTimer(30, a=> { if(i_frame.style.display == 'none') $$.clearIframeContent(i_frame);  });  //clear idle frame
             }
       break;
     }
  });

  window.addEventListener('DOMContentLoaded', e=>{
      $$.calculateLargestTitlePos();
      $$.createTRS();
      $$.createPoints( (new Date().getFullYear()-1987) , 'points-holder' );
      setTimeout( t=> doc.body.style.filter = "opacity(1)", 1*1000);
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

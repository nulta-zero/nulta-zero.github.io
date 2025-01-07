const doc = document,
      log = (...x) => console.log(x),
      qu  = (P)=> doc.querySelector(P),
      bigger = (x)=>(y)=> x > y ? x : y,
      dce = (x)=> doc.createElement(x);

//CREATE PREVIEW CANVAS
const $$ = {
  vars : {
    DEEP_ZOOM : {
      state : false,
      ammount : 1,
      translatedToX : 0,
      translatedToY : 0,
    },
    MOUSE_IS_DOWN : false,
    ZOOM_LEV : 1,
    ROT      : 0,
    DRAW_COLOR_ARR : ['custom'],

    DRAW_SIZE : 3,
    DRAW_COLOR : 'rgb(136 136 136)',
    IMG_FILE : new Image(),   //MAIN IMAGE FILE
    CANVAS_HAS_IMAGE : false,
    ERASING : false,
    DRAWING : false,
    MODE    : '',
    FLIPED  : false,
    ISCOLLAGE : 'default',   /// default  || collage
    collage   : { A : null, B : null },
    mousedown : { x : 0,    y : 0    },
    croper_object  : {
      x : null,
      y : null,
      w : null,
      h : null,
      model  : null,
      border : null,
    },
    translatedToX : 1,
    translatedToY : 1,
    chosenKind : 'png',
    savedImageData : '',
    previousVersions : [], //HOLD DATA ABOUT SAVED IMAGE
    collageSetup : 'left-right',
    initalW : qu('.container').clientWidth,
    initalH : qu('.container').clientHeight,
    inventory : {},
    Ai : { automatation : null },
  },
  query : {},
  collectQuery : function(){
                 $$.query = {
                    container    : qu('.container'),
                    img_export   : qu('.img-export'),
                    img_rotate   : qu('.img-rotate'),
                    open_file    : qu('.open'),
                    undo         : qu('.undo'),
                    croper       : qu('.croper'),
                    wh           : qu('.w-h'),
                    collageWindow: qu('.collage-window'),
                    cph          : qu('.collage-preview-holder'),
                    console      : qu('.console'),
                 }
  },
  // WHAT OD WE HAVE AVAILABLE
  inventoryListing : function(){
      let menu = qu('.menu');

      for(let i = 0; i< menu.children.length;i++){
          let branch = menu.children[i];
          let branch_name = branch.classList[0];
          $$.vars.inventory[branch_name] = [];

           for(let j = 0; j<branch.children.length;j++){
               let sub_branch = branch.children[j];
               if(sub_branch.nodeName != 'INPUT') continue;
               let sub_branch_name = sub_branch.classList[0];
               if(branch_name == 'form') sub_branch_name = sub_branch.id;
               $$.vars.inventory[branch_name].push(sub_branch_name);
           }
      }
  },
  _inject : function(that, start, array ){  //NOT USED
             if(Array.isArray(that) == false) return false; //SAFE
                for(let i= 0; i< array.length;i++){
                    that.splice(start + i, 0, array[i]);
                }
              },
  clear_canvas : function(it, x=0, y=0, w=it.canvas.width, h=it.canvas.height) { it.clearRect(x, y, w, h) },
  //MAKE STAMP SIGNATURE ON CANVAS
  madeOn : function( it, x, y){
       const sign = new Image();
       sign.src = 'images/icon.png';
       sign.addEventListener('load', ()=> it.drawImage(sign, x - (sign.width+ 10), y - (sign.height +10) ) );
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
  rotateImage : function(it, image, x, y, w, h, degrees, centar){
      //ROTATE ANY IMAGE ON CANVAS
      it.save();
      it.translate(x+w/2, y+h/2);
      it.rotate( degrees * Math.PI/180.0 );
      it.translate(-x-w/2, -y-h/2);
      it.drawImage(image, x, y, w, h);
      it.restore();
  },
  //SHOW AS THIS
  asThis : function(data, mode){
             $$.vars.IMG_FILE.src = '';  //RESET OLD
             let image = new Image();
                 image.src = data;

             image.addEventListener('load' , e=>{
                 //ASSIGN NEW;
                 $$.vars.IMG_FILE.src = data;

               switch(mode){
                 default :
                     $$.query.canvas.width = $$.vars.IMG_FILE.naturalWidth;
                     $$.query.canvas.height = $$.vars.IMG_FILE.naturalHeight;
                     ctx.drawImage($$.vars.IMG_FILE, 0, 0, $$.vars.IMG_FILE.naturalWidth,  $$.vars.IMG_FILE.naturalHeight);

                     let w = $$.vars.IMG_FILE.naturalWidth;
                     let h = $$.vars.IMG_FILE.naturalHeight;

                     $$.query.container.style.width  = w + 'px';
                     $$.query.container.style.height = h + 'px';

                     let larger = (bigger(w)(h) / (w + h) * 100);
                     // log(larger);

                     if(qu('.container').clientWidth > 800) $$.query.container.style.maxWidth  = larger + 'vw';
                     $$.query.container.style.maxHeight = 100 + 'vh';

                     $$.query.wh.innerText = `[↔︎:${$$.query.canvas.width}  ↕︎:${$$.query.canvas.height}]`;
                     $$.vars.CANVAS_HAS_IMAGE = true;
                     $$.saveCanvasImage();
                  break;
                  case 'collage':   $$.toCollage(data);   break
               }
             });
          },
  minimize_me : function(el){
      let initiator;
          initiator = dce('div');
          initiator.setAttribute('role', 'init-console-holder');
          initiator.innerHTML = '☰';
          initiator.style.animation = "fader_in 1s";
          initiator.style.fontSize = 'larger';
      doc.body.addEventListener('click', e=>{
           initiator.style.display = 'block';
           initiator.style.cssText = document.defaultView.getComputedStyle(el, "").cssText;
           el.style.display = 'none';
      });

      initiator.addEventListener('click', e=>{
           e.stopPropagation();
           el.style.display = 'block';
           initiator.style.display = 'none';
      });

      el.style.display = 'none';
      qu('.rest').appendChild(initiator);
  },
  draw_rect : function(it, x,y,width,height,color ){
            //DRAW RECTANGLE ON CANVAS
            it.beginPath();
            if(typeof color == 'undefined'){
               //DO NOTHING
               it.strokeStyle = 'brown';
               it.strokeRect(x, y, width, height);
            }else{
               it.fillStyle = color;
               it.fillRect(x, y, width, height);
               it.stroke();
               // it.font = "15px Arial";  //TESTING TEXT
               // it.fillText(text, x, y);
            }
  },
  addBackgroundToImage : function(){
      // $$.saveCanvasImage();
      let image = new Image();
      let data = $$.query.canvas.toDataURL('image/png', 1);
          image.src = data;
      let canvas = $$.query.canvas;

          image.addEventListener('load', e=>{
              $$.draw_rect(ctx, 0, 0, canvas.width, canvas.height, $$.vars.DRAW_COLOR );
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          });
  },
  whenLoaded : function(that, file, paps){
                //APPEND
               that.addEventListener('load', ()=>{
                 let _type= file.name;

                 //LOAD BY TYPE
                 if(_type.search(/[.png|.jpg|.jpeg|.ico]/) > -1)  setTimeout( t=> { $$.asThis(that.result, $$.vars.ISCOLLAGE); }, 1 * 1000);
                 else                                             console.log('Program failed at loading image');

                 if(paps != null)  paps.value = ""; //CLEAN AFTER YOURSELF
               });
                 //READ
                 if(file) { that.readAsDataURL(file); } //RESET BORDER WHEN LOADED  //ONCE IN, REVEAL IT
  },
  //READ UPLOADED FILE
  readUploadedFile : function(){
                      let readFile = qu('#readFile');
                          readFile.onchange = function(){
                               let newFile = readFile.files[0];
                               let reader = new FileReader();
                               $$.whenLoaded(reader, newFile, readFile);
                           };
  },
  //QUICK DROP OF ELEMENT TO GET DATA ON QUICKMENU[RIGHT MOUSE CLICK]
  quickDropHandler : function(e) {
                        e.preventDefault();
                        let newFile = e.dataTransfer.files[0]; //FILE;
                        if(newFile == null ) return false;

                        if (newFile.type.search(/image\//) < 0 ) {
                           e.target.parentElement.classList.remove('net');
                           return $$.popover('Not valid image');
                        }

                        let reader = new FileReader();
                        e.target.parentElement.classList.remove('net');

                        if(newFile) $$.whenLoaded(reader, newFile);
  },
  injectAnimation : function(that, anim, time){
                  that.style.animation = anim;
                  that.style.animationDuration = time+'s';
                  setTimeout( ()=>{
                    that.style.animation = '';
                      // that.style.animationDuration = 1+'s';
                  }, (time || 0.2) * 1000);
  },
  //# GRAB CTX for previewer
  grab_ctx : function(x, y , w,  h ){
                   let croper = qu('.croper').getBoundingClientRect();
                   $$.query.previewer.width  =  w;//Math.abs(croper.x - croper.w);
                   $$.query.previewer.height =  h;//Math.abs(croper.y - croper.h);

                   let dataX = $$.query.canvas.toDataURL('image/png', 1); //GRAB ENTIRE CANVAS
                   let IMGX = new Image();                       //CREATE NEW IMAGE
                       IMGX.src = dataX;                         //ASSAIGN  DATA TO IT

                   window.pctx.clearRect(0, 0, $$.query.previewer.width, $$.query.previewer.height); //CLEAR OLD
                   window.pctx.drawImage( IMGX , x-w, y, w, h,   0, 0, $$.query.previewer.width , $$.query.previewer.height  ); //DRAW CROPPED IMAGE ON mCtx
  },
  //FETCH THIS WHEN PASSED TO YOU JUST LINK
  fetchThis : function(link){
                if(link.search(/[.png|.jpg|.jpeg|.ico]/) > -1 ){
                     fetch(link).then( (x)=>x.text() ).then( (xx)=> { $$.asThis(xx);  });
                }else return false;
  },
  //********************************************************
  quickDragOverHandler : (e) => { e.preventDefault(); },
  quickDragEnter : async e => {
      e.preventDefault();
      e.stopPropagation();
      if(e.fromElement && e.fromElement.classList[0] != 'croper' && e.fromElement.nodeName == 'BODY'){
         if(e.target.parentElement.classList.contains('container')) { e.target.parentElement.classList.add('net');  }
     }
  },
  quickDragLeave : e => {  $$.query.container.classList.remove('net') },
  //ADD PIXELATION EFFECT TO BETTER SEE ZOOMED IMAGE
  pixelate : function(state){
              (state == true) ? $$.query.canvas.style.imageRendering = "pixelated"
                              : $$.query.canvas.style.imageRendering = "auto";
  },
  //DETECT COLOR FROM CTX
  colorDetect : function(e){
             let recter = $$.query.canvas.getBoundingClientRect();
               let _cX , _cY; //HOLD CORDINATES

               _cX = Math.round(e.clientX - recter.x);
               _cY = Math.round(e.clientY - recter.y);

                 let theData = ctx.getImageData(_cX, _cY, 1, 1).data;
               let ARR = [theData[0], theData[1], theData[2]];
           return ARR;
  },
  //TRANSFER TO ANY OF OPTION
  imageMutation : function(usecase, arr, offset){
                let theImage = ctx.getImageData(0,0,$$.query.canvas.width, $$.query.canvas.height);
                let data = theImage.data;

              switch(usecase){
                case 'grayscale':
                      for(let i = 0; i < data.length; i += 4) {
                          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                          data[i]     = avg; // R
                          data[i + 1] = avg; // G
                          data[i + 2] = avg; // B
                      }
                break;
                case 'clearing':
                      if(arr == null) return false;  //PASS ARRAY AS VALUES to TARGET
                      for(let i = 0; i < data.length; i += 4) {
                          // const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                          if(
                             data[i]  > arr[0] - offset && data[i] < arr[0] + offset &&   // R
                             data[i + 1] > arr[1] - offset && data[i+1] < arr[1] + offset &&  // G
                             data[i + 2] > arr[2] - offset && data[i+2] < arr[2] + offset){    // B
                               data[i + 3] = 0;         //RESET ALPHA TO CLEAR
                             }
                      }
                break;
                case 'invert':
                      for(let i = 0; i < data.length; i += 4) {
                          data[i]     = 255 - data[i];     // R
                          data[i + 1] = 255 - data[i + 1]; // G
                          data[i + 2] = 255 - data[i + 2]; // B
                      }
                break;
                case 'fade-out':
                      for(let i = 0; i < data.length; i += 4) {
                          data[i+3] = data[i+3] * (0.9);
                      }
                break;
                case 'ghosting':
                      for(let i = 0; i < data.length; i += 4) {
                          data[i]     = data[i]; // R
                          data[i + 1] = data[i]; // G
                          data[i + 2] = data[i]; // B
                          data[i + 3] = data[i]; // A
                      }
                break;
                case 'blur':
                      for(let i = 0; i < data.length; i += 4) {
                          const avg1 = (data[i] + data[i + 4] + data[i - 4]) / 3;
                          const avg2 = (data[i+1] + data[(i+1) + 4] + data[ (i+1) - 4]) / 3;
                          const avg3 = (data[i+2] + data[(i+2) + 4] + data[ (i+2) - 4]) / 3;
                          data[i]     = avg1; // R
                          data[i + 1] = avg2; // G
                          data[i + 2] = avg3; // B
                      }
                break;
                case 'cartoonize':
                      for(let i = 0; i < data.length; i += 4) {
                          const strong1 = Math.max(...[ data[i], data[i + 4], data[i - 4] ]);
                          const strong2 = Math.max(...[ data[i+1] , data[(i+1) + 4] , data[ (i+1) - 4] ]);
                          const strong3 = Math.max(...[ data[i+2] , data[(i+2) + 4] , data[ (i+2) - 4] ]);
                          let avg = Math.min(...[strong1 , strong2 , strong3 ]);
                          if(data[i] > avg ){
                             data[i]     = strong1; // R
                             data[i + 1] = strong2; // G
                             data[i + 2] = strong3; // B
                          }
                      }
                break;
                case 'noise':
                       for(let i = 0; i < data.length; i += 4) {
                           let a = (data[i- Math.round(Math.random() * i)]);
                           let rand = Math.random();
                           if(rand > 0.75)     data[i] = a;
                           else if(rand < 0.2) data[i+1] = a;
                           else                data[i+2] = a;
                       }
                break;
                case 'glow':
                     for(let z = 0; z < 50; z++){
                       for(let i = 0; i < data.length; i += 4) {
                           if(data[i] < 25) data[i] = (data[i-8] + data[i+8]) * 0.5;
                           if(data[i+1] < 25) data[i+1] = (data[i+1-8] + data[i+1+8]) * 0.5;
                           if(data[i+2] < 25) data[i+2] = (data[i+2-8] + data[i+2+8]) * 0.5;
                       }
                       // if(z == 50-1){
                       //   log('done');
                       // }
                     }
                break;
              }
              ctx.putImageData(theImage, 0,0);
              $$.saveCanvasImage();
              $$.popover(usecase.toUpperCase() + ' ✔︎✔︎', 3000);
  },
  //# TRANSFORM ANY IMAGE ON CANVAS
  transImage : function(it, image, x, y, w, h, [a,b,c,d,e,f]){
              it.save();
              it.translate(x+w/2, y+h/2);
              it.transform(a,b,c,d,e,f);
              // it.rotate( degrees * Math.PI/180.0 );
              it.translate(-x-w/2, -y-h/2);
              it.drawImage(image, x, y, w, h);
              it.restore();
              ($$.vars.FLIPED == false) ? $$.vars.FLIPED = true : $$.vars.FLIPED = false;
  },
  //FLIP IMAGE
  imageFlip : function(){
              const dataX = $$.query.canvas.toDataURL("image/"+$$.vars.chosenKind, 1.0);
              let IMGX = new Image();                       //CREATE NEW IMAGE
                  IMGX.src = dataX;

                  IMGX.onload = ()=>{
                      $$.clear_canvas(ctx);
                      if($$.vars.FLIPED) $$.transImage(ctx, IMGX, 0 , 0,  IMGX.width,  IMGX.height, [1,0,0,1,0,0] );   //RETURN TO DEFAULT             //$$.vars.IMG_FILE
                      else               $$.transImage(ctx, IMGX, 0 , 0,  IMGX.width,  IMGX.height, [-1,0,0,1,0,0] );        //FLIP
                  }
  },
  //ASSIGN ACTIVE SETTINGS OBJECT
  assignActive : function(e){
                    let tools = qu('.tools');
                    for(let i = 0; i < tools.children.length; i++ ){
                        tools.children[i].classList.remove('active');
                    }
                    if(e.target.parentElement.classList.contains('tools')){
                       e.target.classList.add('active');
                    }
                    if(e.target.parentElement.classList.contains('filters')){
                       $$.addToConsole(e);
                    }
  },
  saveToLocal   : (name, data)=> localStorage.setItem(name, data),
  pullFromLocal : (name)=> localStorage.getItem(name),
  checkLocal    : (name)=> (localStorage.getItem(name) != null) ? localStorage.getItem(name) : '',

  assignLocal : function(){
            let automationData = $$.checkLocal('viewport-console');
            if( automationData != null && automationData.search('::') > -1 ) {     //SOMETHING EXISTS SO RETURN IT IN HISTORY
               if( automationData.length > 0) {
                  $$.vars.Ai.automatation = automationData;
                  qu('.automation-order').innerText = '\n'+$$.vars.Ai.automatation;
                }
              }
  },
  //KEEP TRACK ON HISTORY FILTERS APPLIED
  addToConsole : function(e){
      let possible_filter_name = e.target.classList[0];
      if($$.vars.inventory.filters.includes(possible_filter_name)) {
        let div = dce('DIV');
            div.innerText = `${e.target.value + ' :: ' + e.target.title}`;
        let spanKill = dce('span');
             spanKill.innerText = '[x]';
             spanKill.classList.add('filter-kill');
             div.appendChild(spanKill);
        qu('.console').appendChild(div); //ONLY ADD FILTERS TO POSSIBLE AUTOMATATION
      }
  },
  automateConsole : function(automationData){
     let splited = automationData.split('\n');

     let steps = [];
     for(let i = 0; i < splited.length; i++){
         if(splited[i].length < 1) continue;
         let arr = splited[i].split('::');
         let filter = arr[0].trim();

         steps.push(qu(`[value=${filter}]`));
     }
     if(steps.length < 1) return false;
     let k = 0;
     let interval = setInterval( t=>{
        if(k > steps.length-1) clearInterval(interval);
        else {
          steps[k].click();
          k+=1;
          // $$.injectAnimation(qu('.container'), 'pulse', k / 5);
        }
     }, 1500);
  },
  //# SAVE IMAGE
  saveCanvasImage : function(){
               $$.vars.savedImageData = ctx.getImageData(0,0,$$.query.canvas.width, $$.query.canvas.height);
               $$.vars.previousVersions.push($$.vars.savedImageData);
             },
  //# REMOVE LAST ITEM FROM ARRAY
  getPreviousVersion : function(){
                $$.vars.previousVersions.pop();
                ($$.vars.previousVersions.length >= 1) ? ctx.putImageData( $$.vars.previousVersions[$$.vars.previousVersions.length-1], 0, 0) : '';
              },
  //# REDRAW CANVAS
  redrawCanvasImage : function(){
               let lastImage = $$.vars.previousVersions[$$.vars.previousVersions.length-1];
               ctx.putImageData(lastImage, 0, 0 );
            },
  //CANVAS SIZE ADJUST
  adjustCanvas : function(){
                let W = window.innerWidth; //parseFloat(qu('.mother-width').value);
                let H = window.innerHeight;//parseFloat(qu('.mother-height').value);

                let nw = $$.vars.IMG_FILE.naturalWidth || parseFloat($$.query.container.style.width);
                let nh = $$.vars.IMG_FILE.naturalHeight || parseFloat($$.query.container.style.height);

                $$.query.container.style.width  = (W || nw) + 'px';
                $$.query.container.style.height = (H || nh) + 'px';

                $$.query.canvas.width  = W || nw;
                $$.query.canvas.height = H || nh;
   },
   //CREATE COLLAGE EFFECT
   toCollage : function(x){
               switch(x){
                 default :  if($$.vars.collage.A == null)      { $$.vars.collage.A = x; $$.createCollagePreview('A'); }
                            else if($$.vars.collage.B == null) { $$.vars.collage.B = x; $$.createCollagePreview('B'); }
                 break;

                 case 'clear':  $$.vars.collage.A = null;   //has nothing to do with 'clearing'
                                $$.vars.collage.B = null;
                                $$.query.cph.innerHTML = '';
                 break;
               }
            },
   drawCollage : function(setup){
           if($$.vars.collage.A == null || $$.vars.collage.B == null) return false; //SAFE
           let can = $$.query.canvas;
           let O_V = Object.values($$.vars.collage);
           let A, B, C, D,   E, F, G, H;
           switch (setup) {
             case 'left-right':   A=0, B=0, C=can.width / 2, D=can.height,     E=C, F=B, G=C, H=D;  break;
             case 'top-bottom':   A=0, B=0, C=can.width,     D=can.height /2,  E=A, F=D, G=C, H=D;  break;
           }
           for(let i = 0; i < O_V.length; i++){
               let img = new Image();
                   img.src = O_V[i];
               switch(i){
                 case 0:  ctx.drawImage(img, A, B, C, D );  break;
                 case 1:  ctx.drawImage(img, E, F, G, H );  break;
               }
           }
           $$.vars.CANVAS_HAS_IMAGE = true;
   },
   createCollagePreview : function(name){
           let img = dce('img');
               img.src = $$.vars.collage[name];
               img.classList.add('collage-preview');
           $$.query.cph.appendChild(img);
   },
   createAllCanvases : function(){
            const previewer = doc.createElement('canvas');
                  previewer.classList.add('previewer');
                  doc.body.appendChild(previewer);
                  $$.query.previewer = qu('.previewer');
            window.pctx = previewer.getContext("2d", {willReadFrequently : true});
            //CREATE MAIN IMAGE CANVAS
            const canvas = doc.createElement('canvas');
                  canvas.classList.add('main-canvas');
                  $$.query.container.appendChild(canvas);
                  $$.query.canvas = qu('.main-canvas');
            window.ctx = canvas.getContext("2d", {willReadFrequently : true});
    },
   safeAbort : function(e){
            if(e.target.classList.value == 'croper' ) return false;  //ONCE ON CROPER RESET IS DISABLED
            $$.query.croper.style.display =  'none';
            $$.query.container.style.transformOrigin = 'center';
            $$.vars.translatedToX = 1;  $$.vars.translatedToY = 1;
            $$.vars.ZOOM_LEV = 1;
            $$.pixelate(false);
            $$.vars.MODE = '';
            // $$.assignActive(e, 'disable-all');
            $$.query.container.style.transform = `translate(${$$.vars.translatedToX}px, ${$$.vars.translatedToY}px)  scale(${$$.vars.ZOOM_LEV})`;
            $$.vars.ISCOLLAGE = 'default';
            $$.show_this($$.query.collageWindow, 'none');
   },
   show_this : function(it, mechanism){
            //EXAMPLE OF USING THIS FUNC      show_this( invertory_holder, true/false )
            if(mechanism) { it.style.display = mechanism || 'block'; }
            else          { it.style.display = 'none';               }
   },
   focusOne : function(that){
            let cs = doc.querySelectorAll('canvas');
            for(let i = 0; i < cs.length; i++){
                cs[i].classList.remove('focused');
            }
            if(that != 'clear') qu(that).classList.add('focused');
   },
   view_recter : function(x, y){
           let recter = qu('.recter');
           $$.show_this(recter, 'block');
           recter.style.left   = x - $$.vars.DRAW_SIZE /2 + 'px';
           recter.style.top    = y - $$.vars.DRAW_SIZE /2 + 'px';
           recter.style.width  = $$.vars.DRAW_SIZE + 'px';
           recter.style.height = $$.vars.DRAW_SIZE + 'px';
   },
   view_croper : function(x, y, w, h){
           let croper = $$.query.croper;
           $$.show_this(croper, 'block');
           croper.style.left   = x + 'px';
           croper.style.top    = y + 'px';
           croper.style.width  = w + 'px';
           croper.style.height = h + 'px';
   },
   createResizableElement : function(that){
         const detectBorder = function(e, that){
           let classes = [];
           let position = null;

           let wid = that.clientWidth;
           let hei = that.clientHeight;
           let lim = 50;
           //corners
           if(e.offsetX < lim && e.offsetY < lim)              position = 'top-left';
           else if(e.offsetX > wid-lim && e.offsetY < lim)     position = 'top-right';
           else if(e.offsetX < lim && e.offsetY > hei-lim )    position = 'bottom-left';
           else if(e.offsetX > wid-lim && e.offsetY > hei-lim) position = 'bottom-right';
           //mids
           else if(e.offsetX < lim )     position = 'left';
           else if(e.offsetY < lim )     position = 'top';
           else if(e.offsetX > wid-lim)  position = 'right';
           else if(e.offsetY > hei-lim)  position = 'bottom';
           else                          position = position;

           //final output
           $$.vars.croper_object.border = position;
           switch(position){
             case 'top-left':     classes[0] ='resizable-left';  classes[1]='resizable-top';     break;
             case 'top-right':    classes[0] ='resizable-right'; classes[1]='resizable-top';     break;
             case 'bottom-left':  classes[0] ='resizable-left';  classes[1]='resizable-bottom';  break;
             case 'bottom-right': classes[0] ='resizable-right'; classes[1]='resizable-bottom';  break;
             case 'left':         classes[0] ='resizable-left';   break;
             case 'top':          classes[0] ='resizable-top';    break;
             case 'right':        classes[0] ='resizable-right';  break;
             case 'bottom':       classes[0] ='resizable-bottom'; break;
           }
           if(position != null) that.classList.add(...classes);
           else{
              that.classList.remove('resizable-bottom','resizable-right','resizable-left','resizable-top' );
           }
         }

         that.addEventListener('mousedown', e=>{
             let rect = that.getBoundingClientRect();
             detectBorder(e, that);
             // $$.vars.croper_object.model = e.target.model; //SAVE CURRENT ELEMENT model
             if( $$.vars.croper_object.border != null ){
                 $$.vars.croper_object.active = true;
             }else{
                 return false;
             }
             $$.vars.croper_object.startX = e.clientX;    $$.vars.croper_object.startY = e.clientY;
             $$.vars.croper_object.startW = rect.width;   $$.vars.croper_object.startH = rect.height
             $$.vars.croper_object.startLeft = rect.left; $$.vars.croper_object.startTop = rect.top;
         });
         window.addEventListener('mousemove', e=>{
             let resizeHeight =()=> {
                   let dy = e.clientY - $$.vars.croper_object.startY;
                   that.style.top    = `${$$.vars.croper_object.startTop + dy}px`;
                   that.style.height = `${$$.vars.croper_object.startH - 25 - dy}px`;  //it needs -25 to stay on line and dont move total height
             }
             let resizeWidth=()=> {
                   let rect = qu('.container').getBoundingClientRect();
                   let dx = e.clientX - $$.vars.croper_object.startX;
                   that.style.left  = ($$.vars.croper_object.startX + dx - rect.left ) + 'px';
                   that.style.width = ($$.vars.croper_object.startW - 8.5 - dx) + 'px';
             }     //- leftBar.width -(1)
             let moveX=()=> {  that.style.width  = e.offsetX + 10 + 'px'; that.width = e.offsetX;   }
             let moveY=()=> {  that.style.height = e.offsetY + 10 + 'px'; that.height = e.offsetY;  }

             switch($$.vars.croper_object.border){
                case 'top-left':     resizeHeight();  resizeWidth(); break;  //FIX ALL OF THIS they are not working
                case 'top-right':    resizeHeight();  moveX();       break;
                case 'bottom-left':  moveY();         resizeWidth(); break;
                case 'bottom-right': moveY();         moveX();       break;
                case 'right':        moveX();            break;
                case 'bottom':       moveY();            break;
                case 'left':         resizeWidth();      break;
                case 'top':          resizeHeight();     break;
                default :  break;
             }
         });

         that.addEventListener('dragenter', (e) => {
            e.stopPropagation();  // Prevent the event from reaching the canvas
            e.preventDefault();   // Prevent default behavior
            return false;         // Explicitly return false to ensure no further action
         });

         that.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
            return false;
         });
         // that.addEventListener('mouseleave', e=>{
         //        if( $$.vars.croper_object.active &&
         //            (that.classList.contains('resizable-top') &&
         //             that.classList.contains('resizable-right') ) ){
         //               // $$.vars.ROTATE = true;
         //        }
         // qu('.croper').classList.remove('resizable-bottom', 'resizable-right', 'resizable-left', 'resizable-top');
         // $$.vars.croper_object.active  = false;
         // $$.vars.croper_object.border  = false;
         // });
   },
   imageExport : function(){
         if(!$$.vars.CANVAS_HAS_IMAGE){ $$.popover('Empty canvas. Nothing to export.'); return false; }  //BAD REQUEST

         function exporter(fromCanvas){
                 const file = fromCanvas.toDataURL("image/"+$$.vars.chosenKind, 1.0);
                 //INIT LINK AND URL OBJECT
                 let a_link = dce('a');
                     a_link.href = file;
                     a_link.download = '$$';
                     a_link.hidden = true;
                     a_link.id = 'linker';
                 doc.body.appendChild(a_link);
                //CLICK IT VIRTUALLY
                setTimeout( t=> qu('#linker').click(), 0.25 * 1000);
                //CLEAN AFTER YOURSELF
                setTimeout( t=> qu('#linker').remove(), 1.5 * 1000);
         }

         if(qu('.croper').style.display == 'block') {
            // EXPORT FROM PREVIEWER
            let croper = qu('.croper').getBoundingClientRect();
            $$.grab_ctx(croper.x, croper.y, croper.width, croper.height );
            setTimeout( t=> exporter( qu('.previewer')), 1*1000 );
            ;
         }else{
            // EXPORT FROM MAIN CANVAS
            exporter($$.query.canvas);
         }
   }
}//END OF $$


//MAIN FUNCTION
const main = function(){

      $$.collectQuery();
      $$.createAllCanvases();
      $$.inventoryListing();
      // $$.addCroperResizing();
      $$.createResizableElement( qu('.croper') );
      $$.minimize_me( qu('.console-holder') );

      window.addEventListener('click', e =>{
        switch(e.target.classList[0]){
          case 'reload':      location.reload(); break;
          case 'img-export':  $$.imageExport();  break;
          case 'open':
                qu('#readFile').click();
                $$.readUploadedFile();
          break;
          case 'img-rotate':
                if(!$$.vars.CANVAS_HAS_IMAGE) return false;
                ($$.vars.ROT > 315) ? $$.vars.ROT = 0 : $$.vars.ROT += 45;
                $$.clear_canvas(ctx);
                $$.rotateImage(ctx, $$.vars.IMG_FILE, 0, 0, $$.query.canvas.width, $$.query.canvas.height, $$.vars.ROT);
          break;
          case 'color':
                $$.vars.DRAW_COLOR = e.target.getAttribute('data');
                qu('.draw').style.color = e.target.getAttribute('data');
          break;
          case 'undo':
                $$.getPreviousVersion();
                // $$.redrawCanvasImage();
          break;
          case 'save-console'  :  $$.saveToLocal('viewport-console', qu('.console').innerText.replaceAll(`[x]`, '') ); $$.assignLocal(); break;
          case 'automate'      :  $$.automateConsole($$.vars.Ai.automatation);   break;
          case 'filter-kill'   :  e.target.parentElement.remove();  break;

          case 'to-crop'       :  $$.vars.MODE = 'crop';
                 let canvasRect = $$.query.canvas.getBoundingClientRect();
                 $$.view_croper(0, 0, canvasRect.width, canvasRect.height);


          break;
          case 'to-clear'      :  $$.vars.MODE = 'clear';        break;
          case 'to-clean'      :  $$.clear_canvas(ctx, 0, 0, $$.query.canvas.width, $$.query.canvas.height); break;
          case 'to-grayscale'  :  $$.imageMutation('grayscale'); break;
          case 'to-invert'     :  $$.imageMutation('invert');    break;
          case 'to-fade-out'   :  $$.imageMutation('fade-out');  break;
          case 'to-ghosting'   :  $$.imageMutation('ghosting');  break;
          case 'to-blur'       :  $$.imageMutation('blur');      break;
          case 'to-cartoonize' :  $$.imageMutation('cartoonize'); break;
          case 'to-noise'      :  $$.imageMutation('noise');     break;
          case 'to-glow'       :  $$.imageMutation('glow');      break;
          case 'to-flip'       :  $$.imageFlip();                break;
          case 'add-background':  $$.addBackgroundToImage();     break;
          case 'eraser'        :  $$.vars.MODE = 'eraser';       break;
          case 'draw'          :  $$.vars.MODE = 'draw';         break;
          case 'img-collage'   :  $$.vars.ISCOLLAGE = 'collage';  $$.show_this($$.query.collageWindow, 'block');  break;
          case 'collage-radios':  $$.vars.collageSetup = e.target.value;  break;
          case 'collage-draw'  :  $$.drawCollage($$.vars.collageSetup);   break;
          case 'collage-clear' :  $$.toCollage('clear');                  break;
          case 'watermark'     :  $$.madeOn(ctx, $$.query.canvas.width, $$.query.canvas.height);     break;
          case '-color'        :  qu('#color-picker').click();   break;

          default: return false;  break;
        }

        $$.assignActive(e);
      } , true);
      //WHEN APP LOADS DO THIS
      window.addEventListener('DOMContentLoaded', ()=> {
            Object.freeze($$);
            // CANVAS IS EQUAL AS CONTAINER [FOR IMIDDIATE QUICK DRAW]
            let containerWidth = $$.query.container.clientWidth;

            if(containerWidth <= 700){
               $$.query.container.style.width = containerWidth - (containerWidth /10) + 'px';
            }else{
               $$.query.container.style.width = window.innerWidth / 2 + 'px';
            }
            $$.query.container.style.height = window.innerHeight - (window.innerHeight/10) + 'px';

            $$.query.canvas.width  = $$.query.container.clientWidth;
            $$.query.canvas.height = $$.query.container.clientHeight;

            $$.assignLocal();
      });
      // KEYDOWN
      window.addEventListener('keydown', e =>{
            let C = $$.query.container;
            C.keys = (C.keys || [] );
            C.keys[e.keyCode] = (e.type == "keydown");
            let prevent = (e)=> e.preventDefault();

           if(C.keys && C.keys[27] ) $$.safeAbort(e); //SAFE ABORT
           if(e.key == '§') { $$.popover(`HELP:<br>[⌘ + U]: UNDO `, 10000); }

           if(C.keys && C.keys[91] && C.keys[85] ){
             if($$.vars.previousVersions.length > 1) {
                $$.getPreviousVersion();
                $$.redrawCanvasImage();
              }else return false;
            }  // ⌘ + U   =( UNDO )
      });
      // KEYUP
      window.addEventListener('keyup', e => {
           let C = $$.query.container;
           if(!C.keys) return false; //SAFE
           C.keys[e.keyCode] = (e.type == "keydown");
      });
      //ZOOM IN/OUT
      $$.query.canvas.addEventListener('wheel', e =>{
          if($$.query.canvas != null){
             e.preventDefault();

            $$.query.croper.style.display = 'none';  //HIDE CROPER
            $$.pixelate(true);

            let movingElement = $$.query.container;   //container | canvas
            let deep = $$.vars.DEEP_ZOOM;
            let moveForce = 1;
            let zoomPower = 0.10;
            let zoomMax   = 60;

            let browserLimiter = 133;  //changes from 120 to 133 depending on browser

            (deep.ammount > zoomMax/3 ) ? zoomPower = .5 : zoomPower = .15;


            //ADJUST ZOOM POWER WHEN STARING ZOOM AND WHEN ALLREADY DEEP INTO PAPER ZOOM
            if(e.wheelDeltaY == 133)       {  ($$.vars.DEEP_ZOOM.ammount < zoomMax) ? $$.vars.DEEP_ZOOM.ammount += zoomPower : $$.vars.DEEP_ZOOM.ammount = zoomMax; }
            else if(e.wheelDeltaY == -133) {  ($$.vars.DEEP_ZOOM.ammount > 1) ? $$.vars.DEEP_ZOOM.ammount -= zoomPower : $$.vars.DEEP_ZOOM.ammount = 1;   } //stronger zoom out

            let translatedX = Math.round(e.offsetX);  //PAN X COR
            let translatedY = Math.round(e.offsetY);  //PAN Y COR

            //ZOOM STARING focus a point
            if( e.wheelDeltaY == browserLimiter && deep.ammount < 3){
              movingElement.style.transformOrigin = `0 0`;
              movingElement.style.transformOrigin = `${translatedX}px ${translatedY}px`;
              deep.new_origin_x = translatedX;
              deep.new_origin_y = translatedY;
            //ZOOM CONTINUES  (keep the focus point)
            }else if(e.wheelDeltaY == browserLimiter && deep.ammount > 3){
               movingElement.style.transformOrigin = `${deep.new_origin_x}px ${deep.new_origin_y}px`;
            //ZOOMING OUT BUT still deep into paper zoomed
            }else if(e.wheelDeltaY == -browserLimiter && deep.ammount > 3){
               movingElement.style.transformOrigin = `${deep.new_origin_x}px ${deep.new_origin_y}px`;
            //FULLY ZOOMED OUT
            }else if(e.wheelDeltaY == -browserLimiter && deep.ammount < 3){
              movingElement.style.transformOrigin = `0 0`;
              movingElement.style.transformOrigin = `${translatedX}px ${translatedY}px`;
              deep.new_origin_x = translatedX;
              deep.new_origin_y = translatedY;
            }

            if(e.wheelDeltaY == browserLimiter || e.wheelDeltaY == -browserLimiter){
               movingElement.style.transform = `translate(${deep.translatedToX}px, ${deep.translatedToY}px) scale(${$$.vars.DEEP_ZOOM.ammount})`;
            }

            (deep.ammount <= 1) ? moveForce = 3 : moveForce = 5;  //MOVE FORCE RISES AS WE ZOOM INTO PAPER

            //PAN PART WORKS EXTRA
            if(e.wheelDeltaX < -6 && e.wheelDeltaY > -browserLimiter){
               movingElement.style.transform = `translate(${deep.translatedToX -= moveForce}px, ${deep.translatedToY}px) scale(${deep.ammount})`;  //PAN TO LEFT
            }else if(e.wheelDeltaX > 6 && e.wheelDeltaY < browserLimiter){
               movingElement.style.transform = `translate(${deep.translatedToX += moveForce}px, ${deep.translatedToY}px) scale(${deep.ammount})`;   //PAN TO RIGHT
            }

            if(e.wheelDeltaY < -6 && e.wheelDeltaY > -browserLimiter){
              movingElement.style.transform = `translate(${deep.translatedToX}px, ${deep.translatedToY -=moveForce}px) scale(${deep.ammount})`; //PAN UP
            }else if(e.wheelDeltaY > 6 && e.wheelDeltaY < browserLimiter){
              movingElement.style.transform = `translate(${deep.translatedToX}px, ${deep.translatedToY +=moveForce}px) scale(${deep.ammount})`; //PAN DOWN
            }
          }
      }, {passive: false} );

      $$.query.canvas.addEventListener('mouseout', e=>{
          $$.vars.DRAWING = false;
      });
      $$.query.canvas.addEventListener('mouseover', e=>{
         if($$.vars.MOUSE_IS_DOWN) $$.vars.DRAWING = true;
      });

      //RESET CONTAINER TO CENTAR
      window.document.body.addEventListener('dblclick', e => {
        if(e.target.nodeName == 'BODY') $$.safeAbort(e);
      });

      window.addEventListener('mousemove', e =>{
          let CoffX = e.x,  CoffY = e.y;
          if($$.vars.ZOOM_LEV > 2.25){
              if(CoffX < 35 && CoffY < 35){                                    //top left corner
                 $$.query.container.style.transform = `translate(${$$.vars.translatedToX += 7}px, ${$$.vars.translatedToY += 5}px) scale(${$$.vars.ZOOM_LEV})`;
              }else if(CoffX > window.innerWidth - 35 && CoffY < 35 ){         //top right corner
                 $$.query.container.style.transform = `translate(${$$.vars.translatedToX -= 7}px, ${$$.vars.translatedToY += 5}px) scale(${$$.vars.ZOOM_LEV})`;
              }else if(CoffX < 35 && CoffY > window.innerHeight - 35 ){        //bottom left corner
                 $$.query.container.style.transform = `translate(${$$.vars.translatedToX += 7}px, ${$$.vars.translatedToY -= 5}px) scale(${$$.vars.ZOOM_LEV})`;
              }else if(CoffX > window.innerWidth - 35 && CoffY > window.innerHeight - 35 ){       //bottom right corner
                 $$.query.container.style.transform = `translate(${$$.vars.translatedToX -= 7}px, ${$$.vars.translatedToY -= 5}px) scale(${$$.vars.ZOOM_LEV})`;
              }
           }
      });

      $$.query.canvas.addEventListener('mousedown', e =>{
            $$.vars.MOUSE_IS_DOWN = true;
            $$.vars.mousedown.x = e.offsetX;
            $$.vars.mousedown.y = e.offsetY;
            switch($$.vars.MODE){
              case 'clear':
                    $$.vars.detectedColor = $$.colorDetect(e);
              break;
              case 'eraser': $$.vars.ERASING = true; break;
              case 'draw':   $$.vars.DRAWING = true; $$.vars.CANVAS_HAS_IMAGE = true; break;
            }
      });

      $$.query.canvas.addEventListener('mousemove', e =>{
        switch($$.vars.MODE){
          case 'eraser':
                $$.view_recter(e.offsetX, e.offsetY);
                if($$.vars.ERASING) ctx.clearRect(e.offsetX - $$.vars.DRAW_SIZE /2, e.offsetY -  $$.vars.DRAW_SIZE /2, $$.vars.DRAW_SIZE, $$.vars.DRAW_SIZE);
          break;
          case 'draw':
                if($$.vars.DRAWING){
                   ctx.beginPath();
                   ctx.strokeStyle = $$.vars.DRAW_COLOR;
                   ctx.lineCap = 'round';
                   ctx.lineJoin = 'round';
                   ctx.lineWidth = $$.vars.DRAW_SIZE;
                   ctx.moveTo($$.vars.mousedown.x, $$.vars.mousedown.y);
                   ctx.lineTo(e.offsetX, e.offsetY);
                   ctx.stroke();
                   ctx.closePath();
                   $$.vars.mousedown.x = e.offsetX, $$.vars.mousedown.y = e.offsetY; //RESET TO NEW MOUSEDOWN ALL THE TIME
                }
          break;
          case 'clear':
               if($$.vars.MOUSE_IS_DOWN){   //SOLE VISUAL REASON FOR IT
                let deltaX = e.offsetX - $$.vars.mousedown.x;
                let deltaY = e.offsetY - $$.vars.mousedown.y;
                let normalizedX = Math.log2( Math.abs(deltaX)+1 );
                let normalizedY = Math.log2( Math.abs(deltaY)+1 );
                // log(normalizedX, normalizedY);
                let largerOffset  = bigger(normalizedX)(normalizedY);
                $$.popover(`delta: ${largerOffset.toFixed(1)}`);
              }
          break;
        }
      });

      window.addEventListener('mouseup', e=>{
          $$.vars.MOUSE_IS_DOWN = false;
          if(qu('.croper').style.display != 'none'){
             qu('.croper').classList.remove('resizable-bottom', 'resizable-right', 'resizable-left', 'resizable-top');
             $$.vars.croper_object.active  = false;
             $$.vars.croper_object.border  = false;
          }
      });

     qu('.size-changer').addEventListener('change', e=>{
        if($$.vars.DRAW_SIZE > 1) $$.vars.DRAW_SIZE = parseInt(e.target.value);
     });

      $$.query.canvas.addEventListener('mouseup', e =>{
            $$.vars.MOUSE_IS_DOWN = false;
            $$.saveCanvasImage(); //AUTO SAVE IMAGE
            switch($$.vars.MODE){
               case 'eraser': $$.vars.ERASING = false;  break;
               case 'draw':   $$.vars.DRAWING = false;  break;
               case 'clear':
                              let deltaX = e.offsetX - $$.vars.mousedown.x;
                              let deltaY = e.offsetY - $$.vars.mousedown.y;
                              let normalizedX = Math.log2( Math.abs(deltaX)+1 );
                              let normalizedY = Math.log2( Math.abs(deltaY)+1 );
                              // log(normalizedX, normalizedY);
                              let largerOffset  = bigger(normalizedX)(normalizedY);
                              let colorDetected = $$.colorDetect(e);
                              let colorDetectedCopy = new Array(...colorDetected);

                              let createColorDiv = (arr, additional)=>{
                                  let colorDiv = dce('div');
                                  if(additional){
                                    for(let i = 0; i< arr.length;i++){
                                        arr[i] += parseInt(additional);
                                    }
                                  }
                                  colorDiv.style.background = `rgb(${arr.join(',')})`;
                                  colorDiv.style.width  = 15 + 'px';
                                  colorDiv.style.height = 15 + 'px';
                                  colorDiv.setAttribute('data', arr);
                                  colorDiv.style.borderRadius = 100 + '%';
                                  return colorDiv;
                              }

                              let colorDiv  = createColorDiv(colorDetectedCopy);
                              let colorDiv2 = createColorDiv(colorDetectedCopy, largerOffset);

                              // log(colorDiv.getAttribute('data'), colorDiv2.getAttribute('data'));
                              $$.popover(parseInt(largerOffset) + '::', 5000);
                              let pop = qu('#pop');

                              pop.appendChild(colorDiv);
                              let textNode = doc.createTextNode('::');
                              pop.appendChild(textNode);
                              pop.appendChild(colorDiv2);

                              $$.imageMutation('clearing', colorDetected, largerOffset); //DETECT COLOR YOU ARE LOOKING AT [R,G,B]
               break;
               // case 'crop':   $$.show_this(qu('.croper'), 'none');  break;
            }
        });

        // window.addEventListener('focus', e=>{
        //  (doc.visibilityState == 'visible') ? log(123) : '';
        // });

        window.addEventListener('resize', e =>{
            let a, b;
            a = window.innerWidth - 35;
            b = window.innerHeight - 75;
            $$.vars.initalW = a;
            $$.vars.initalH = b;

            qu('.container').style.width  = a + 'px';
            qu('.container').style.height = b + 'px';

            $$.query.canvas.width  = a;
            $$.query.canvas.height = b;

            if($$.vars.previousVersions.length >= 1) $$.redrawCanvasImage();
        });

        qu('#color-picker').addEventListener('input', e=>{
           $$.vars.DRAW_COLOR = e.target.value;
        });

         $$.query.canvas.addEventListener('drop', $$.quickDropHandler);
         $$.query.canvas.addEventListener('dragover', $$.quickDragOverHandler);
         $$.query.canvas.addEventListener('dragleave', $$.quickDragLeave);
         $$.query.canvas.addEventListener('dragenter', $$.quickDragEnter);
}

main();

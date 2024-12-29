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
    CROP_DIM : {},  //HOLD CROP DATA
    translatedToX : 1,
    translatedToY : 1,
    chosenKind : 'png',
    savedImageData : '',
    previousVersions : [], //HOLD DATA ABOUT SAVED IMAGE
    collageSetup : 'left-right',
        initalW : qu('.container').clientWidth,
        initalH : qu('.container').clientHeight,
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
                     $$.query.container.style.width = $$.vars.IMG_FILE.naturalWidth + 'px';
                     $$.query.container.style.height = $$.vars.IMG_FILE.naturalHeight + 'px';

                     $$.query.wh.innerText = `[↔︎:${$$.query.canvas.width}  ↕︎:${$$.query.canvas.height}]`;
                     $$.vars.CANVAS_HAS_IMAGE = true;
                     $$.saveCanvasImage();
                  break;
                  case 'collage':   $$.toCollage(data);   break
               }
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
                        let reader = new FileReader();
                        e.target.parentElement.classList.remove('net');

                        if(newFile) $$.whenLoaded(reader, newFile);
  },
  //# GRAB CTX for previewer
  grab_ctx : function(x, y , w,  h ){
                   $$.query.previewer.width = $$.vars.CROP_DIM.w, $$.query.previewer.height = $$.vars.CROP_DIM.h;

                   let dataX = $$.query.canvas.toDataURL('image/png', 1); //GRAB ENTIRE CANVAS
                   let IMGX = new Image();                       //CREATE NEW IMAGE
                       IMGX.src = dataX;                         //ASSAIGN  DATA TO IT
                       window.pctx.clearRect(0, 0, $$.query.previewer.width, $$.query.previewer.height); //CLEAR OLD

                    window.pctx.drawImage( IMGX , x, y, w, h,   0, 0, $$.query.previewer.width , $$.query.previewer.height  ); //DRAW CROPPED IMAGE ON mCtx
  },
  //FETCH THIS WHEN PASSED TO YOU JUST LINK
  fetchThis : function(link){
                if(link.search(/[.png|.jpg|.jpeg|.ico]/) > -1 ){
                     fetch(link).then( (x)=>x.text() ).then( (xx)=> { $$.asThis(xx);  });
                }else return false;
  },
  //********************************************************
  quickDragOverHandler : (ev) => { ev.preventDefault(); },
  quickDragEnter : async e => { if(e.target.parentElement.classList.contains('container')) e.target.parentElement.classList.add('net')},
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
              }
              ctx.putImageData(theImage, 0,0);
              $$.saveCanvasImage();
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
  assignActive : function(e, disableAll){
                    //ADD ACTIVE SETTINGS REFERNCE
                   let skippable = ['minus', 'plus'];
                   if(skippable.includes(e.target.classList[0] )) return false;

                   let menu = qu('.menu');
                   for(let i = 0; i < menu.children.length; i++ ){
                       menu.children[i].classList.remove('active');
                   }
                   if(e.target.parentElement.classList.contains('menu') && disableAll != 'disable-all' ){
                      e.target.classList.add('active');
                   }
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
                let W = parseFloat(qu('.mother-width').value);
                let H = parseFloat(qu('.mother-height').value);

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
            $$.assignActive(e, 'disable-all');
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
   createColors : function(){
            let holder = qu('.colors-holder');
            let colors = $$.vars.DRAW_COLOR_ARR;

            for(let i = 0;i < colors.length; i++){
                let div = dce('div');
                    div.classList.add(`color`,`clicker`);
                    div.title = 'CHANGE COLOR FOR PENCIL';
                    if(colors[i] == 'custom'){
                      div.classList.add('rainbow');
                      div.addEventListener('click', e=>{
                          let picker = qu('#color-picker');
                          picker.click();
                      });
                      // div.appendChild(input);
                    }else{
                     div.setAttribute('data', colors[i]);
                    }
                    div.style.background = colors[i];
                    holder.appendChild(div);
            }
   },
   view_croper : function(x, y){
           let croper = $$.query.croper;
           $$.show_this(croper, 'block');
           croper.style.left   = x - $$.vars.DRAW_SIZE /2 + 'px';
           croper.style.top    = y - $$.vars.DRAW_SIZE /2 + 'px';
           croper.style.width  = $$.vars.DRAW_SIZE + 'px';
           croper.style.height = $$.vars.DRAW_SIZE + 'px';
   },
}//END OF $$


//MAIN FUNCTION
const main = function(){

      $$.collectQuery();
      $$.createAllCanvases();
      $$.createColors();

      window.addEventListener('click', (e)=>{
        switch(e.target.classList[0]){
           case 'reload':    location.reload(); break;
           case 'img-export':
                 if(!$$.vars.CANVAS_HAS_IMAGE){ $$.popover('Empty canvas. Nothing to export.'); return false; }
                 const file = $$.query.canvas.toDataURL("image/"+$$.vars.chosenKind, 1.0);

                 //INIT LINK AND URL OBJECT
                 let a_link = dce('a');
                     a_link.href = file;
                     a_link.download = '$$';
                     a_link.hidden = true;
                     a_link.id = 'linker';
                 doc.body.appendChild(a_link);
                //CLICK IT VIRTUALLY
                setTimeout( ()=> qu('#linker').click(), 0.25 * 1000);
                //CLEAN AFTER YOURSELF
                setTimeout( ()=> qu('#linker').remove() , 1.5 * 1000);
          break;
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
          case 'min-size':
                $$.vars.CROP_DIM.x = 30;
                $$.vars.CROP_DIM.y = 30;
                $$.vars.CROP_DIM.w = 200;
                $$.vars.CROP_DIM.h = 100;
                $$.query.croper.style.left   = $$.vars.CROP_DIM.x + 'px';
                $$.query.croper.style.top    = $$.vars.CROP_DIM.y + 'px';
                $$.query.croper.style.width  = $$.vars.CROP_DIM.w + 'px';
                $$.query.croper.style.height = $$.vars.CROP_DIM.h + 'px';
                qu('.min-size').classList.replace('min-size', 'max-size');
          break;

          case 'color':
                $$.vars.DRAW_COLOR = e.target.getAttribute('data');
                qu('.draw').style.color = e.target.getAttribute('data');
          break;
          case 'undo':
                   $$.getPreviousVersion();
                   // $$.redrawCanvasImage();
                   // log(11);
          break;

          case 'to-crop'       :  $$.vars.MODE = 'crop';         break;
          case 'to-clear'      :  $$.vars.MODE = 'clear';        break;
          case 'to-grayscale'  :  $$.imageMutation('grayscale'); break;
          case 'to-invert'     :  $$.imageMutation('invert');    break;
          case 'to-fade-out'   :  $$.imageMutation('fade-out');  break;
          case 'to-ghosting'   :  $$.imageMutation('ghosting');  break;
          case 'to-blur'       :  $$.imageMutation('blur');      break;
          case 'to-flip'       :  $$.imageFlip();                break;
          case 'eraser'        :  $$.vars.MODE = 'eraser';       break;
          case 'draw'          :  $$.vars.MODE = 'draw';         break;
          case 'minus'         :  if($$.vars.DRAW_SIZE > 1) $$.vars.DRAW_SIZE-=1; $$.popover($$.vars.DRAW_SIZE, 2500); break;
          case 'plus'          :  $$.vars.DRAW_SIZE+=1; $$.popover($$.vars.DRAW_SIZE, 2500); break;
          case 'img-collage'   :  $$.vars.ISCOLLAGE = 'collage';  $$.show_this($$.query.collageWindow, 'block');  break;
          case 'collage-radios':  $$.vars.collageSetup = e.target.value;     break;
          case 'collage-draw'  :  $$.drawCollage($$.vars.collageSetup); break;
          case 'collage-clear' :  $$.toCollage('clear');                     break;
          case 'watermark'     :  $$.madeOn(ctx, $$.query.canvas.width, $$.query.canvas.height);     break;
          case '--icon':  let M = qu('.mother-adjuster');
                          (M.style.display == 'block') ? M.style.display = 'none' : M.style.display = 'block';
          default: return false;  break;
        }
        $$.assignActive(e);
      } , true);
      //WHEN APP LOADS DO THIS
      window.addEventListener('DOMContentLoaded', ()=> {
            Object.freeze($$);
            // CANVAS IS EQUAL AS CONTAINER [FOR IMIDDIATE QUICK DRAW]
            $$.query.container.style.width  = window.innerWidth / 2 + 'px';
            $$.query.container.style.height = window.innerHeight - window.innerHeight/10 + 'px';

            $$.query.canvas.width  = $$.query.container.clientWidth;
            $$.query.canvas.height = $$.query.container.clientHeight;
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

            let zoomPower = .10;
            let zoomMax = 60;

            let browserLimiter = 120;  //changes from 120 to 133 depending on browser

            (deep.ammount > zoomMax/3 ) ? zoomPower = .5 : zoomPower = .15;

            //ADJUST ZOOM POWER WHEN STARING ZOOM AND WHEN ALLREADY DEEP INTO PAPER ZOOM
            if(e.wheelDeltaY == browserLimiter)        ($$.vars.DEEP_ZOOM.ammount < zoomMax) ? $$.vars.DEEP_ZOOM.ammount += zoomPower : $$.vars.DEEP_ZOOM.ammount = zoomMax;
            else if(e.wheelDeltaY == -browserLimiter)  ($$.vars.DEEP_ZOOM.ammount > 1) ? $$.vars.DEEP_ZOOM.ammount -= zoomPower : $$.vars.DEEP_ZOOM.ammount = 1;   //stronger zoom out

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
            if(e.wheelDeltaX < -6 && e.wheelDeltaY > - browserLimiter){
               movingElement.style.transform = `translate(${deep.translatedToX -= moveForce}px, ${deep.translatedToY}px) scale(${deep.ammount})`;  //PAN TO LEFT
            }else if(e.wheelDeltaX > 6 && e.wheelDeltaY < browserLimiter){
               movingElement.style.transform = `translate(${deep.translatedToX += moveForce}px, ${deep.translatedToY}px) scale(${deep.ammount})`;   //PAN TO RIGHT
            }

            if(e.wheelDeltaY < -6 && e.wheelDeltaY > - browserLimiter){
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

      //POSITION CROPER
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
                $$.view_croper(e.offsetX, e.offsetY);
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
               case 'crop':   $$.show_this(qu('.croper'), 'none');  break;
            }
        });

        window.addEventListener('resize', e =>{
            //EXXPORTED IMG WILL ALWAYS BE SAME AS CANVAS, RESIZED CANVAS GIVESS YOU SMALLER IMAGE FRAME
            // if(parseFloat(qu('.mother-height').value) > 0) return false;  //EXPORT SHOWS LITTLE BOX IN BOTTOM AND MESSES RESIZE f. SO IF YOU FIXED THE HEIGHT , DONT CHANGE ELSE AUTO CHANGE
            let a, b;
            a = window.innerWidth - 35;
            b = window.innerHeight - 75;
            $$.vars.initalW = a;
            $$.vars.initalH = b;

            qu('.container').style.width  = a + 'px';
            qu('.container').style.height = b + 'px';

            $$.query.canvas.width = a;
            $$.query.canvas.height = b;

            if($$.vars.previousVersions.length >= 1) $$.redrawCanvasImage();
        });

        qu('#color-picker').addEventListener('input', e=>{
           $$.vars.DRAW_COLOR = e.target.value;
        });
}

main();

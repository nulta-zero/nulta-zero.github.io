"use strict"
//FUNC. //UNIVERSAL VARIABLES
if(document.getElementById('canvas') !== null){
   let canvas = document.getElementById('canvas');
   let ctx = canvas.getContext('2d');
}
//FUNC.    //UNIVERSAL BOOLEANS
let PAUSE = false;
let GAME_OVER = false;
let DEV = false;
let INACTIVITY = false;
//FUNC. //GAME-PAUSE FUNC onclick
const pause = function(){
  if (PAUSE == false) {
      PAUSE = true;
      if(window.canvas != null) window.canvas.style.filter = 'brightness(0.4)'; //DIRTY FIX FOR SUNSET EFFECT
    }else{
      PAUSE = false;
      if(window.canvas != null) window.canvas.style.filter = 'inherit';
    }
}
// Create a function for getting a variable value
function style_get(property) {
  const r = document.querySelector(':root');
  const style = getComputedStyle(r);
        style.getPropertyValue(property);
}

// Create a function for setting a variable value
function style_set(now, next) {
  const r = document.querySelector(':root');
        r.style.setProperty(now, next);
}
//FUNC generate svg url address
const encodeSvg =(svg_str)=> "data:image/svg+xml," + encodeURIComponent(svg_str);
//FUNC.
const dce = function(element){ return document.createElement(element) };
//FUNC.
const GAMEON_ADDRESS = '../PUBLICK/sdk/gameon.js'; //DOCUMENT ADDRESS
//FUNC.    //CLEAR CANVAS OF CHOICE
const clear_canvas = function(it, x=0, y=0, w=it.canvas.width, h=it.canvas.height) { it.clearRect(x, y, w, h) }
//FUNC.    //RESET GAME
const reset_game = ()=> window.location.reload();
//FUNC.    //EXIT GAME
const exit_game = ( url )=> window.loation.href = url;
//FUNC.   //RANDOMIZER
let rand = function(){
    if(Math.random() > 0.5) return true;
    else                    return false;
};
const detectEmoji = (str) => (str.search(/\p{Emoji}+/gu) > -1) ? true : false;

// #SQRT
const sqrt = (x)=> x ** 0.5;
const euclidDist = (p =[], q=[])=> {
  let sum = 0;
  if(p.length != q.length) return false;  ///SAFE
  for(let i=0; i< p.length; i++){
     sum += ((p[i] - q[i])** 2); //SUM OF DIFF
 }
  return sum ** 0.5;    //SQRT
}
const euclidDistance = (x1, y1, x2, y2)=> Math.sqrt( ((x2-x1)**2) + ((y2-y1) **2) );
//FUNC.     //CREATE CANVAS
const create_canvas = function(w, h, assaignID, father, bool){  //PRIMARY
  //CREATE CANVAS QUICKLY
  var c = document.createElement('CANVAS');
  c.width = w;
  c.height = h;
  c.id = assaignID;
  father.appendChild(c);
  window.canvas = document.getElementById(assaignID); //BECOME GLOBAL
  window.ctx = window.canvas.getContext('2d',  { alpha: bool });
}
//FUNC.    //ANOTHER CANVAS CREATION
const anotherCanvas = (w, h, assaignID, father) =>{ //SECONDARY, TERNARY...
  //CREATE CANVAS QUICKLY
  let c = doc.createElement('CANVAS');
  c.width = w;  c.height = h;  c.id = assaignID;
  father.appendChild(c);
}
//FUNC.    //CREATE IFRAME
const create_iframe = function(w, h, assaignID, father, diana){   //DIANA SPECIFIC OPTION LAST
  //CREATE IFRAME QUICKLY
  var ifr = document.createElement('IFRAME');
  ifr.width = w;
  ifr.height = h;
  ifr.id = assaignID;
  father.appendChild(ifr);
  window.frame = document.getElementById(assaignID); //BECOME GLOBAL
  //optionaly
  if(typeof diana !== 'undefined'){
    window.frame.style.position = 'fixed';
    window.frame.style.bottom = 0;
    window.frame.style.left = 0;
  }
    // position: fixed;
    // bottom: 0;
    // left: 0;
}
//FUNC.   //ROT MATRIX
const rotMatrix = function(matrix){ // rotMatrix(split_map_rows.reverse()) //FLIPS INNER WALL   rotMatrix(split_map_rows).reverse() works also
  //ROTATE ARRAY IN MATRIX FORM
   let N = matrix.length - 1;
   matrix.map( (row, i) => matrix[N - i] );
   return matrix;
}
//FUNC.   //FLIP MATRIX
const flipMatrix = matrix => (
  //FLIP MATRIX OF ARRAY  ARR = [ [],[],[],[] ]
  matrix[0].map((column, index) => (
    matrix.map(row => row[index])
  ))
);
//FUNC.    //CALCULATE ANGLE
const calcAngleDegrees = function(x, y) {
  //CALCULATE ANGLE IN DEGREES
  return Math.atan2(y, x) * 180 / Math.PI;
}

//ANGLE GLOBALS
const toRadian = Math.PI / 180;
const toDegree = 180 / Math.PI;
//FUNC.
const fromAngle = function(angle, length) {
  if (typeof length === 'undefined') {
    length = 1;
  }
  return new Vec( length * Math.cos(angle), length * Math.sin(angle) );
};
//FUNC.

// DRAW HEXAGON
const draw_hexagon = function(x, y, r=50, color, strokeWidth, strokeColor, fill) {
  ctx.beginPath();
  const a = 2 * Math.PI / 6;
  ctx.fillStyle = color;
  for(let i = 0; i < 6; i++) {
      ctx.lineTo( x+(r)+(r) * Math.cos(a * i),   //ADD TWO r for shape to have [x] the same as in draw_rect(x)
                  y+(r)+(r) * Math.sin(a * i)
                );
  }
  ctx.closePath();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  if(fill) ctx.fill();
}

const draw_rect = function(it, x,y,width,height,color ){
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
}
//FUNC.
const draw_simple_rect = function(it, x,y,w,h, color, thick ){
  //DRAW SIMPLE RECT [JUST STROKE]
  it.strokeStyle = color;
  it.lineWidth = thick || 1;
  it.strokeRect(x, y, w, h);
}
//FUNC.
//INDICATES DOOR
const draw_line = function(it, x1, y1, x2, y2, color, thikness){
  //DRAW LINE ON CANVAS
  it.beginPath();
  it.moveTo(x1, y1);
  it.lineTo(x2, y2);
  it.strokeStyle = color;
  it.lineWidth = thikness;
  it.stroke();

  it.lineWidth = 1; //normalize grid
}
// DRAW LINE WITH ANGLE
const draw_line_with_angle = function(it, x1, y1, angle, length, color, thikness){
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
}
//FUNC.
const draw_circle = function(x,y,radius, color, it, fill){
  //DRAW CIRCLE ON CANVAS
  it.beginPath();
  it.arc(x, y, radius, 0, 2 * Math.PI);

  //SET 2 DIFFERENT METHODs
  if(fill == false){
    //STROKE ONLY
     it.strokeStyle = color;
     it.stroke();
  }else{
    //FILLED
    it.fillStyle = color;
    it.fill();
  }
    it.closePath();
}
//FUNC.
const strokeFillRect = function(it, x, y, w, h, strokeColor, fillColor, lineWidth ){
  it.strokeStyle = strokeColor;
  it.fillStyle = fillColor;
  it.lineWidth = lineWidth || 1;
  it.strokeRect(x, y, w, h);
  it.fillRect(x, y, w, h);
}
const strokeFillCircle = function(it, x,y,radius, strokeColor, fillColor, strokeWidth){
  //DRAW STROKED FILLED CIRCLE ON CANVAS
  it.beginPath();
  it.arc(x, y, radius, 0, 2 * Math.PI);
  it.strokeStyle = strokeColor;
  it.lineWidth = strokeWidth;
  it.stroke();
  it.fillStyle = fillColor;
  it.fill();
  it.closePath();
}
//FUNC.
const upside_rot_triangle = function(it, x, y, w, h, strokeColor, fillColor, strokeWidth, degrees){
  // it.beginPath();
  it.strokeStyle = strokeColor;
  it.lineWidth = strokeWidth;
  it.save();
  it.translate(x+w/2, y+h/2);
  let path = new Path2D();
      path.moveTo(x, y);
      it.rotate( degrees * (Math.PI/180) );
  for(let i = 0;i< 2;i++){
      path.lineTo(x+ (w/2), y+(h/3*2) );
      path.lineTo(x+w, y);
  }
  it.translate(-x-w/2, -y-h/2);
  path.closePath();
  ctx.fillStyle = fillColor;
  ctx.stroke(path);
  ctx.fill(path);

  it.restore();
}
//FUNC.
const draw_text = function(it, text, x, y, color, textSize){
  //DRAW TEXT ON CANVAS
  it.font = `${textSize}px Menlo`;  //TESTING TEXT
  it.fillStyle = color;
  it.fillText(text, x, y);
}
//FUNC.
const rImage = function(it, image, x, y, w, h, degrees, centar){
  //ROTATE ANY IMAGE ON CANVAS
  it.save();
  it.translate(x+w/2, y+h/2);
  it.rotate( degrees * Math.PI/180.0 );
  // it.rotate(radians, )
  it.translate(-x-w/2, -y-h/2);
  it.drawImage(image, x, y, w, h);
  it.restore();
}
//FUNC.
const rotate = function(it, x, y, w, h, color, degrees){
  //ROTATE ANY RECT OBJECT ON CANVAS
    it.save();
  it.translate(x+w/2, y+h/2);              //translate to center of shape
  it.rotate( (Math.PI / 180) * degrees);   //rotate 25 degrees.
  it.translate(-x-w/2, -y-h/2);            //translate center back to 0,0

  it.fillStyle = color;
  it.fillRect(x, y, w, h);
  it.restore();
}
//FUNC.
const rotate_stroke = function(it, x, y, w, h, fillColor, strokeColor, lineWidth, degrees){
  //ROTATE ANY RECT OBJECT ON CANVAS
    it.save();
  it.translate(x+w/2, y+h/2);              //translate to center of shape
  it.rotate( (Math.PI / 180) * degrees);   //rotate 25 degrees.
  it.translate(-x-w/2, -y-h/2);            //translate center back to 0,0

  it.strokeStyle = strokeColor;
  it.fillStyle = fillColor;
  it.lineWidth = lineWidth || 1;

  it.fillStyle = fillColor;
  it.strokeRect(x, y, w, h);
  it.fillRect(x, y, w, h);
  it.restore();
}
//FUNC.
const detect_overlapping = function(a, b){
  //DETECT OVERLAPPING AMONG ELEMENTS ON CANVAS
    for(let i = 0; i < b.length; i++){
  if( a.y > b[i].y &&
      a.x < b[i].x + b[i].w &&
      a.x > b[i].x &&
      a.y < b[i].y + b[i].h ){
        a.x += 1;
        a.y += 1;
      }
    }
}
//FUNC.
const mouse_over = function(a, b){
  //MOUSE IS OVER ELEMENT ON CANVAS
  for(let i = 0; i < b.length; i++){
  if( a.y > b[i].y &&
    a.x < b[i].x + b[i].w &&
    a.x > b[i].x &&
    a.y < b[i].y + b[i].h ){
      return true;
    }
  }
}
//FUNC.
const ctx_shadow = function(it, x, y, blur, color){
  //ADD SHADOW TO ELEMENT
  it.shadowColor = color; it.shadowBlur = blur;
  it.shadowOffsetX = x;   it.shadowOffsetY = y;
}
//FUNC.
const create_shadow = function(){
    //CREATE SHADOW WITH CANVAS-HOLDER DIV
    let div = document.createElement('DIV');

    div.innerHTML = '🔦';           div.style.position = 'absolute';
    div.style.width = 100 +'%';     div.style.height = canvas.height + 'px';
    div.style.zIndex = 110; div.id = 'shadowLight'; div.style.transition = '.8s';
    div.style.color = '#000';      div.style.textAlign = 'right';

    //APPEND
    if(document.querySelector('.canvas-holder') !== null){
       canvas_holder.insertBefore(div, canvas);
    }else{
      console.warn('create canvas-holder div');
      return false;
    }

  }
//FUNC.
let _c = 0, source; //HOLDS SHADOW DATA
const shadowLightSystem = function(){
  //SHADOW LYGHT SYSTEM
        //CREATION
       create_shadow();

         //START SHADOW SYSTEM [on 7 second]
        setInterval( ()=>{
          let move_to = Math.random() * 120; //OUTER
              ///SMALL INTERVAL very quick
           let transSpot = setInterval( ()=> { //INNER
             _c++; //:)

             if( _c > move_to) { //RESET
                 clearInterval(transSpot);  _c = move_to;
               }else if(!PAUSE) update_shadowLight( _c );

               if(PAUSE) show_this(source, false); //HIDE IT IF PAUSE TURNED ON
               else show_this(source, true)

               if(GAME_OVER) show_this(source, false); //HIDE IT ON GAME-OVER

           }, 30);

        }, 7000);

}

//FUNC.
let flashlight; //HOLDS EVENT
const flashlight_on = function(){
  //FLASHLIGHT ON
  create_shadow();
  //MANUAL
  window.addEventListener('mousemove', flashlight = (e)=>{
        update_shadowLight(e.clientX, e.clientY);
  } );

}
//FUNC.
const flashlight_off = function(){
  // FLASHLIGHT OFF
  source.remove();
  window.removeEventListener('mousemove', flashlight);
}
//FUNC.

//UPDATING LIGHTING SYSTEM
const update_shadowLight = function(x, y){
    //SHADOW SYSTEM
    if(document.getElementById('shadowLight') !== null){
        source = document.getElementById('shadowLight')
        source.style.background = `radial-gradient(at ${x}px ${y}px, #bfbf9e12 0, #1b19199e, #000000b8 95%)`;
    }else{
      //DO NOTHING
    }
}
//FUNC.
const show_this = function(it, mechanism){
   //EXAMPLE OF USING THIS FUNC      show_this( invertory_holder, true/false )
  if(mechanism) {
    it.style.display = mechanism || 'block';
  }else {
    it.style.display = 'none';}
}
//FUNC.
const animate = function(it, img, spriteW, spriteH, x, y,  frames ){
  ////ANIMATE ANY IMAGE AS SPRITE ON CANVAS
    let cycle = 0;
    let inter = setInterval(() => {
      it.clearRect(x, y, spriteW* 2, spriteH* 2);
      // flipHorizontally(cx, 100 + spriteW / 2);
      it.drawImage(img,
                   // source rectangle
                   cycle * spriteW, 0, spriteW, spriteH,
                   // destination rectangle
                   x,               y, spriteW *2, spriteH*2);
      cycle = (cycle + 1) % frames;
      if(cycle == frames -1) {
        clearInterval(inter);
        it.clearRect(x, y, spriteW* 2, spriteH* 2);
      }
    }, 60);

}
//FUNC.
// let anime = 0;
const fAnimate = function(it, img, spriteW, spriteH, x, y, w, h, frames){
  //DIFFERENT IMPLEMENTATION OF ANIMATION
    let anime = 0;
  // if(anime > spriteW * frames ) anime = 0;
    let inter = setInterval(() => {
        anime += spriteW;
    if(anime > spriteW * frames ) {
       anime = 0; clearInterval(inter);
     }
    else  it.drawImage( img, anime, 0, spriteW, spriteH , x, y, w, h );
  });

}
//FUNC.
const _longestString = function(arr){
  //FIND LONGEST STRING IN ARRAY OF STRINGS
   let res = [];
     arr.forEach( (x)=>{
         res.push(x.length)
     });
       return Math.max(...res);
}
//FUNC.
const compas = function(it, img, x, y , w ,h , navTo, navFrom ){
  //NAVIGATION COMPAS
   let angleDeg = Math.atan2(navTo.y - navFrom.y, navTo.x - navFrom.x) * 180 / Math.PI;
       ctx_shadow(ctx, 0, 2, 3, 'black');
   rImage(it, img, x, y, w, h, angleDeg );
       ctx_shadow(ctx, 0, 0, 0, 'transparent');
}
//FUNC.
const create_doom_invertory = function( father ){
  //CREATE DOOM INVERTORY [6col]

  //ADD .INVERTORY HOLDER DIV AND default_items {object}
  for(let i = 0; i < (12 / 2); i++){
    let div = document.createElement('DIV');
    let title = document.createElement('H6');
    let icon = document.createElement('IMG');
    icon.classList.add('icons');
    div.classList.add('col-sm-2');

    //SAFETY MECHANISM
    if(typeof default_items !== 'undefined'){
     if(typeof Object.keys(default_items)[i] !== 'undefined'){
        icon.src = `${default_items[Object.keys(default_items)[i]]}`;
        title.innerHTML = `${Object.keys(default_items)[i]}`;
       }else{
        title.innerHTML = `ITEM${i}`;
    }
  }
    //APPEND
    div.appendChild(title);
    div.appendChild(icon);
    father.appendChild(div);
  }

}
//FUNC.
//SHORT CSS ANIMATION through CLASS
 const addAnimBrifly = (on, what, duration)=>{
   on.classList.add(what);
   on.style.animationIterationCount = duration;
   setTimeout( ()=> on.classList.remove(what), 2* 1000);
 }
//FUNC.
//LISTEN FOR PAUSE [on:P]
// window.addEventListener( 'keyup', (e)=> (e.keyCode == 80) ? pause() : '' );
//FUNC.
//POPOVER for Notification With FADE - OUT EFFECT  [POPOVER NEEDS STYLE AND HTML for REF / change that for unique style]
const popover = (newContent, disappear)=>  {
    if(document.getElementById("pop") != null) document.getElementById("pop").remove();  //ONLY ONCE pop AT THE TIME remove old
    let doc = document;
    let pop = doc.createElement('DIV');
    pop.id = 'pop';
    disappear = disappear || 4130; //can be not set it will use default value

    //DEFINE INNER CONTENT OF POP DIV
    pop.innerHTML = newContent;
    doc.body.appendChild(pop); //ADD POP TO DOCUMENT

    let hide = () => {pop.style.opacity = '0'}

    setTimeout(hide, disappear) //FADE OUT EFFECT
    setTimeout( t=> pop.remove(), disappear + 300) //REMOVE OLD POP
};
//FUNC.
//OTHER POPOVER IF NEEDED TWO IN SAME APP different design and patern
const noti = (newContent, disappear)=>  {
    if(document.getElementById("noti") != null) document.getElementById("noti").remove();  //ONLY ONCE pop AT THE TIME remove old
    let noti = dce('DIV');
    noti.id = 'noti';
    disappear = disappear || 4130; //can be not set it will use default value

    //DEFINE INNER CONTENT OF POP DIV
    noti.innerHTML = newContent;
    document.body.appendChild(noti); //ADD POP TO DOCUMENT

    let hide = () => {noti.style.opacity = '0'}

    setTimeout(hide, disappear) //FADE OUT EFFECT
    setTimeout( t=> noti.remove(), disappear + 300) //REMOVE OLD POP
};
//FUNC.
const are_test_available = function(position){
  //TEST CREATOR [ADD TESTS.JS in your game BOX ]
  fetch('tests.js').then( (r)=> {
    if(r.status == 200){
      let first_script = document.getElementsByTagName('script')[0];
      let test_script = document.createElement('SCRIPT');
      test_script.src = 'tests.js';
      if(position == 'before'){
         first_script.parentNode.insertBefore(test_script, first_script );
      }else{
       document.body.appendChild(test_script);
     }
      console.log('%c Initiating Tests', 'font-size: 13px; color: indigo;border: 1px solid indigo; border-radius: 5px;padding: 0 5px;');
      setTimeout( ()=> __tests__(), 700);
   }else{
     console.warn('No Test Available');
  }
  });

}
//FUNC.
const u_confirm = function(question, result, native ){
  //PAUSES GAME FOR USER CHOICE // MY VERSION OF CONFIRM // example:   u_confirm('Are you a man ? ', ()=>{ log('YES') } );

  if(document.getElementById("u_confirm_box")!= null) return false;  //ONLY ONCE BOX AT THE TIME

  var final;
  let div, yes, no, N, Y;
    function init_choice(){
      div = document.createElement('div');
      div.id ="u_confirm_box";

      //ASSIGN NATIVE AS FALSE TO USE SPECIFIC STYLE FROM OTHER APP
      if(native == true || native == null){
          div.style.width = 250 + 'px';      div.style.height = 150 + 'px';
          div.style.position = 'absolute';   div.style.display = 'grid';
          div.style.left = 35 + '%';         div.style.padding = 2 + '%';
          div.style.top = 20 + '%';          div.style.boxShadow = `1px 1px 6px black`;
          div.style.borderRadius = 3 + 'px';
      }

       //EVALUATE QUESTION AS STRING
     if(typeof question == 'string'){
          pause()
          div.innerHTML = question;  //ACCEPTS FORMATING OF QUESTION
       }else{
          return false;
      }

      yes = document.createElement('button');
      no = document.createElement('button');

      yes.type = 'button';
      no.type = 'button';

      yes.value = 'YES';
      no.value = 'NO'

      yes.innerText = 'YES';
      no.innerText = 'NO'

      yes.id = 'yes';

      div.appendChild(yes);
      div.appendChild(no);

      document.body.appendChild(div);
      document.getElementById('yes').focus();

    } init_choice(); //CALLED IMIDIATLY

    //LISTENING FOR ANSWER
    div.addEventListener('click', async function(e){

          if(e.srcElement.value == "YES")  {
             await e;
             pause();
             div.remove();
             return result();
           }else{
             pause();
             div.remove();
             return false;
          }

       });

}
//FUNC.
const u_pick = function(question, valA, valB,  resultA, resultB ){
  //PAUSES GAME FOR USER CHOICE // MY VERSION OF CONFIRM // example:   u_confirm('Are you a man ? ', ()=>{ log('YES') } );

  if(document.getElementById("u_pick_box")!= null) return false;  //ONLY ONCE BOX AT THE TIME

  var final;
  let div, A, B;
    function init_choice(){
      div = document.createElement('div');
      div.id ="u_pick_box";

      div.style.width = 250 + 'px';      div.style.height = 150 + 'px';
      div.style.position = 'absolute';   div.style.display = 'grid';
      div.style.left = 35 + '%';         div.style.padding = 3 + '%';
      div.style.top = 20 + '%';          div.style.boxShadow = `1px 1px 6px black`;
      div.style.borderRadius = 3 + 'px';


       //EVALUATE QUESTION AS STRING
     if(typeof question == 'string'){
          pause()
          div.innerHTML = question;  //ACCEPTS FORMATING OF QUESTION
       }else{
          return false;
      }

      A = document.createElement('button');
      B = document.createElement('button');

      A.type = 'button';
      B.type = 'button';

      A.value = 'A';
      B.value = 'B'

      A.innerText = valA;
      B.innerText = valB;

      A.id = 'A';

      div.appendChild(A);
      div.appendChild(B);

      document.body.appendChild(div);
      document.getElementById('A').focus();

    } init_choice(); //CALLED IMIDIATLY

    //LISTENING FOR ANSWER
    div.addEventListener('click', async function(e){

          if(e.srcElement.value == "A")  {
             await e;
             pause();
             div.remove();
             return resultA();
           }else{
             pause();
             div.remove();
             return resultB();
          }

       });

}
//FUNC.
const u_prompt = function(question, result, back ){
  //PAUSES GAME FOR USER CHOICE // MY VERSION OF CONFIRM // example:   u_confirm('Are you a man ? ', ()=> answer = doc.getElementById('A').value );

  if(document.getElementById("u_prompt_box") != null) return false;  //ONLY ONCE BOX AT THE TIME

  var final;
  let div, yes, no, N, Y, answer;
    function init_choice(){
      div = document.createElement('div');
      div.id =  'u_prompt_box';

      //NOT EVERY APP HAS THIS  add >    --back as third paramater
      let backDiv = null;
      if(back != null){
         backDiv = document.createElement('div');
         backDiv.style.cssText =`
                         position: fixed;
                         bottom: 0;
                         top: 0;
                         left: 0;
                         right: 0;
                         width: 100%;
                         height: 100%;
                         z-index: -1;
                         background: #000000bf;
                       `;
      }

       //EVALUATE QUESTION AS STRING
     if(typeof question == 'string'){
          pause()
          div.innerHTML = question;
       }else{
          return false;
      }
      //ANSWER STYLE
      answer = document.createElement('input');
      answer.id = 'A';  //THIS WILL HOLD VALUE OF ANSWER
      answer.setAttribute('autocomplete', "off");
      answer.style.background = 'silver';           answer.style.border = '1px solid';
      answer.style.outline = '1px solid #131211';   answer.style.marginBottom = 7 +'px';

      yes = document.createElement('button');
      no = document.createElement('button');

      yes.type = 'button';
      no.type = 'button';

      yes.value = 'ok';
      no.value = 'cancel'

      yes.innerHTML = 'ok';
      no.innerHTML = 'cancel';

      // yes.focus();
      yes.id = 'ok';
      if(backDiv != null) div.appendChild(backDiv);  //BLURS background with special div
      div.appendChild(answer);
      div.appendChild(yes);
      div.appendChild(no);

      document.body.appendChild(div);
      // document.getElementById('ok').focus();
      answer.focus();

    } init_choice(); //CALLED IMIDIATLY

    //LISTENING FOR ANSWER VIRTUAL
    div.addEventListener('click', async function(e){
          if(e.srcElement.value == "ok")  {
             await e;
             pause();
             result();
             return div.remove();
           }else if (e.srcElement.value == 'cancel'){
             pause();
             div.remove();
             return false;
          }

       });
     //LISTENING FOR ANSWER PHYSICAL
    div.addEventListener('keydown', (e)=>{
           // ENTER PRESSED
           if(e.keyCode == 13){
             pause();
             result();
             return  div.remove();
           }

            //ESCAPED PRESS
           if(e.keyCode == 27){
             pause();
             div.remove();
             return false;
           }
    });

}
//FUNC.
const rotateCounterClockwise = function(a){
  //ROTATION OF ARRAY clockwise
        var n=a.length;
        for (var i=0; i<n/2; i++) {
            for (var j=i; j<n-i-1; j++) {
                var tmp=a[i][j];
                a[i][j]=a[j][n-i-1];
                a[j][n-i-1]=a[n-i-1][n-j-1];
                a[n-i-1][n-j-1]=a[n-j-1][i];
                a[n-j-1][i]=tmp;
            }
        }
        return a;
    }

  const rotate_clockwise = function(a) {
    //ROTATION OF ARRAY counterClockwise
      var n=a.length;
      for (var i=0; i<n/2; i++) {
          for (var j=i; j<n-i-1; j++) {
              var tmp=a[i][j];
              a[i][j]=a[n-j-1][i];
              a[n-j-1][i]=a[n-i-1][n-j-1];
              a[n-i-1][n-j-1]=a[j][n-i-1];
              a[j][n-i-1]=tmp;
          }
      }
      return a;
  }
//FUNC.
  const monteCarloPlus = function(){
    //RANDOMNESS GENERATOR  -= MONTE CARLO =-
    while(true){
      let r1 = Math.random();
      let prob = r1;
      let r2 = Math.random();

      if(r2 < prob){
          return r2;
       }
    }
  }
//FUNC.

const generate_sky = function( amount, maxHeight, color ){
  //GENERATES SKY, SPACE STARS, FALLING SNOW...
  let _x,  _y , _r;
  for(let i = 0; i < amount; i++){
    _x = Math.random() * canvas.width;
    _y = Math.random() * maxHeight;
    _r = monteCarloPlus() * 1.5;
    draw_circle( _x, _y, _r , color, ctx, true);
  }
}
//FUNC.
const arrayNestSum = function(A){
  //GET MAX OF NESTED ARRAY
  let _ = 0
  A.forEach( (item)=> _ += item.length );
     return _;
}
//-------------------------------------------------------------------
  ///////////////////////////////////////MORE ROTATIONS IF YOU NEED
  // const rotateMatrix = matrix => (
  //   flipMatrix(matrix.reverse())
  // );
  //
  // const rotateMatrixCounterClockwise = matrix => (
  //   flipMatrix(matrix).reverse()
  // );
  //
  // const flipMatrixCounterClockwise = matrix => (
  //   rotateMatrix(matrix).reverse()
  // );

//**************************************************
//ELEMENT ON DOCUMENT LIKE HEALTH, COINS, KM ....
const visual_element = (type, _class, monitor, where)=>{
      type = doc.createElement(type);    type.classList.add( _class );
      type.innerText = monitor;          where.appendChild( type );
}
//**************************************************
//BIG TITTLE AT START
const narator = ( text, time )=>{
 let elem = doc.createElement('div'); elem.innerHTML = text;  elem.classList.add('narator'); doc.body.appendChild(elem);
     setTimeout( t=> {
       if(doc.querySelector('.narator') != null) doc.querySelector('.narator').remove();
     }, (time || 1) * 1000); //DEFAULTs to FAST
}
// const trueMiniMax = (a, b, rounded)=>{
//       let val;
//       if(a < 0 || b < 0)  val = b + (Math.random() * a);
//       else                val = (Math.random() * b);
//
//       return (rounded) ? Math.round(val) : val;
// }
//FUNC.
const minMax =(a, b, floored)=> {      //BETTER VERSION
    let input = Math.random() * b;

    while(input != null){
       if(input > a && input < b && input != null){
          return (floored != null) ? Math.floor(input) : input;
        }else{
          input = Math.random() * b;
        }
     }
  }
const minMaxRand = function(min, max){  //OFTEN undefined
  //RETURN RANDOM FROM between min - max
  let rand = Math.random() * max;
      if(max == 0) return 0; //SAFETY MECHANISM IF 0 MAX RETURN 0 not undefined

  while(rand < min){
    rand = Math.random() * max;
  }

  if( rand > min ) return rand;

}
//FUNC.
const create_dummy_div = function(){
  //CREATE DUMMY DIV
 document.body.style.textAlign = 'center';
 let dc = document.createElement('DIV');
 dc.style.textAlign = 'center'; dc.style.height = 200 + 'px';
 dc.style.fontSize = 25 + 'px'; dc.style.marginTop = 20 + 'px';
 dc.id = 'dummyDiv';
 document.body.appendChild(dc);
}
//FUNC.
 const intro = function( arr = [] ){
   //INTRO FUNCTION
     create_dummy_div();
     if(arguments.length > 0){
       let wait = 2000;
       arr.forEach( (item, i) => {
            setTimeout( ()=> document.getElementById('dummyDiv').innerHTML = item, wait + (i * wait) );
       });
     }else return false;
 }
//FUNC.
const setCookie = function(key, value) {
  //SET COOKIE
 var expires = new Date();
 expires.setTime(expires.getTime() + (1 * 1 * 60 * 60 * 1000)); // 1 hour
 document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  //GET COOKIE
 var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
 return keyValue ? keyValue[2] : null;
}

var deleteCookie = function(name) {
  //DELETE COOKIE
 document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};


const _disable_right_click = function(){
  //DISABLE RIGHT CLICK
         document.addEventListener('contextmenu', event => event.preventDefault());
}
//FUNC.
// const detect_device = function(){   //OLD OUTDATED USER AGENT VERSION
//   //DETECT MOBILE DEVICE    ADD MAC if you need it
//   const positives = [
//        /Android/gi,
//        /webOS/gi,
//        /iPhone/gi,
//        /iPad/gi,
//        /iPod/gi,
//        /BlackBerry/gi,
//        /Windows Phone/gi,
//    ];
//
//    let final;
//    for(let i = 0; i <positives.length; i++){
//      if(navigator.userAgent.match(positives[i])) return final = 'mobile';
//      else final = 'desktop';
//    }
//   return final;
// }
const detect_device = function(){    //NEW
      let current;
      const devices = ['iPhone','webOS','Android','BlackBerry','iPad','iPod','Windows Phone'];   ///CAN IPAD BE LESS THEN 601 ??  GOOD I SHOULD ESCAPE IPAD FOR MOBILE UX
      // let N = navigator.appVersion;
      function twoChecks(){
        if(navigator.userAgentData){
           let navi = navigator.userAgentData;
              if(navi.mobile == true) current = 'mobile';   //BROWSERS ARE MISSING IPhone checks stil, android detection great
              else                    current = 'desktop';
        }else{
          //BACKUP CHECK
            let N = navigator.userAgentData;
            if(N.includes(devices[0]) || N.includes(devices[1]) || N.includes(devices[2]) ||
               N.includes(devices[3]) || N.includes(devices[4]) || N.includes(devices[5]) || N.includes(devices[6]) ){
                 current = 'mobile';
            }else current = 'desktop';
       }
    }
    twoChecks();

    return (window.innerWidth < 601 && current == 'mobile') ? 'mobile' : 'desktop';
}
//FUNC.
const round_rect = function(it, x, y, w, h , radius, color, fill){
  //ROUNDED RECT WITH FILL IN OPTION
  let r = x + w;
  let b = y + h;
  it.beginPath();
  it.strokeStyle= color;
  it.lineWidth="3";
  it.moveTo(x+radius, y);
  it.lineTo(r-radius, y);
  it.quadraticCurveTo(r, y, r, y+radius);
  it.lineTo(r, y+h-radius);
  it.quadraticCurveTo(r, b, r-radius, b);
  it.lineTo(x+radius, b);
  it.quadraticCurveTo(x, b, x, b-radius);
  it.lineTo(x, y+radius);
  it.quadraticCurveTo(x, y, x+radius, y);

   //FILL OR NOT FOR ROUNDED SHAPE
  if(fill == true){
     it.closePath();
     it.fill();
  }else{
    it.stroke();
  }

}
//FUNC.
const cartesian = function( it ){
  //CARTESIAN SYSTEM ON ANY CANVAS
   it.setLineDash([6]);
   draw_line(it, it.canvas.width / 2, 0, it.canvas.width / 2, it.canvas.height,   '#eee' );
   draw_line(it, 0, it.canvas.height / 2,  it.canvas.width, it.canvas.height / 2, '#eee' );
 }
 //FUNC.
 //FORCE INSERT NEE STYLE INTO LOADED CSS FILE
 const addNewStyleToCss = function(){
   let sheet = doc.getElementsByTagName('link')[1].sheet; //0 is cloak 1 is home style
   let styles = '@-webkit-keyframes scroll-reverse {';
       styles += '100%{ background-position: 70px 70px';
       styles += '} }';
       sheet.insertRule(styles, sheet.cssRules.length); //INSERT
 }
 //FUNC.
 // Euclid's algorithm for greatest common divisor
 let euclidAlgorithm = function(a, b){
      let A = Math.abs(a);
      let B = Math.abs(b);
      while (B != 0){
           while (A>B) A=A-B;
           B=B-A;
      }
      return A;
 }
//FUNC.
//CREATE ICON LOGO IN ANY APP TO SHOW IN RIGHT-TOP CORNER
const createIconLogo = ()=>{
    let img = doc.createElement('img');
           if(window.document.head.getElementsByTagName('link')[0].getAttribute('rel') != "shortcut icon") return false;
        img.src = window.document.head.getElementsByTagName('link')[0].href;
        img.classList.add('--icon');
        img.style.filter = 'opacity(0.6)';
        img.style.position = 'fixed';
        img.style.right = '1%';
        img.style.top = '1%';
        img.style.width = 25 + 'px';
        img.style.height = 25 + 'px';
        doc.body.appendChild(img);
}
//FUNC.
const getRandomArr = (x, y)=>{
  var data = new Uint8Array((x || 10) * (y || 10));
  return crypto.getRandomValues(data);
}
//FUNC.
let BRAVE;  //THIS WILL BE VARIABLE true OR false
const detectBrave = async function(){
    const request = new XMLHttpRequest()
    await request.open('GET', 'https://api.duckduckgo.com/?q=useragent&format=json', true);

    request.onload = function () {
      let data = JSON.parse(this.response)
      let isBrave = data['Answer'].includes('Brave');
      if(isBrave){
        return BRAVE = isBrave;
      }else return BRAVE = false;
    }

    request.send();
}
//FUNC.
//SOME SECURITY IMPLEMENTATIONS
//NO POSISBILITY OF POPUS
const secureEnviroment = function(){
      window.alert = null;
      window.confirm = null;
      window.prompt = null;
}

//MAKE WINDOW CLEAN [DELETES ALL added FUNCTIONS like setTimeout, navigator...]
const objectCleaner = function(object, val, mod){
       if(object == null ) return false;  //OBJECT IS NULL   -> SAFE RETURN
       switch(mod){
         case 'multi':   //DELETE ALL FROM HUGE OBJECT
                let BIG = Object.keys(object);
                 for(let i = 0; i < BIG.length; i++){
                     delete object[ BIG[i] ];
                 }
         break;
                        //DELETE SEGMENT OF OBJECT
         default:   delete  object[val];
       }
 }
 //FUNC.
// GET HEADERS OF FILE, LINK, HREF...
 const getHeaders = function(link, reason, all){
   fetch(link).then(x => {
       switch(all){
         case true:
               for (let [key, value] of x.headers) {
                 log(`${key} = ${value}`);
               }
         break;
         default:
               let specific = x.headers.get(reason);   //'last-modified'
               x.text();

               setTimeout( ()=> log(specific), 1* 1000);
         break;
       }
   })
 }
//REMOVE ALL COMMENTS FROM JS CODE
const stripComments = function(code) {
  return code.replace(/\/\/.*|\/\*[^]*?\*\//g, "");
}
 //FUNC.
//ROUND NUMBER TO FIXED DECIMAL  [RETURNS INTEGER]
const roundTo = function(num, fix){
      if(isNaN(num) == false ) return parseFloat( parseFloat(num).toFixed(fix) );
}
//FUNC.
//MAKE STAMP SIGNATURE ON CANVAS
const madeOnRos = function( it, x, y){
     const sign = new Image();
     sign.src = '../PUBLIC/sign/made_on_ros.png';
     sign.addEventListener('load', ()=> it.drawImage(sign, x, y ) );
}
//FUNC.
//ADD QUICK ANIMATION, THEN REMOVE
const addQucikAnime = function(it, anime, time){
      it.style.animation = anime;
      it.style.animationDuration = time + 's';
      setTimeout( ()=> {
            it.style.animation = '';
      }, ((time * 1000) * 1.5) );
}
//FUNC.
//DO NOT LET RM GO OUTSIDE OF WINDOW VIEW
const keepMeInsideWindow = function(target){
        let rect = target.getClientRects()[0];
        if(rect.x > window.innerWidth - rect.width){
           target.style.left = (window.innerWidth - rect.width) + 'px';
        }
        if(rect.y + rect.height > window.innerHeight - rect.height){
           target.style.top = (window.innerHeight - rect.height) + 'px';
        }
}
//FUNC.
//# HEX TO RGB
const hexToRGB = function(hex){
            let RGB = [];
            if(hex == null) return false;
            for( let i=0; i < hex.length; i++) {
                if(i % 2 == 1){
                  const splited = hex[i] + hex[i+1];
                  RGB.push(parseInt(splited, 16));
               }
            }
            return RGB;
          }
const rgbToHex = function(rgb){
                 let hex = Number(rgb).toString(16);
                 if(hex.length < 2) hex = '0' + hex;
                 return hex;
          }
//# FULL HEX
const fullHex = function (r, g ,b){
                  let R = rgbToHex(r), G = rgbToHex(g), B = rgbToHex(b);
                  return '#'+ R + G + B;
}
//FUNC.
const oppositeTextColor = function(hex, element){
   let rgb = hexToRGB(hex); //array
   let textColor = [];
   for(let i = 0; i < rgb.length; i++){
       if(rgb[i]> 100 && rgb[i] < 125)                textColor.push(22); //most problematic grey part
       else if(rgb[i]> 125 || isNaN(rgb[i]) == true ) textColor.push(60);
       else if(rgb[i]<125)                            textColor.push(200);
   }
   return element.style.color = `rgb(${textColor.join(' ')})`;
}
//FUNC.
const getPseudo = function(el, pseudo, specific){   //example =>    getPseudo('.container' , ':before', 'font-size')
    const style = window.getComputedStyle(
	         (el || document.querySelector(el)), pseudo
         ).getPropertyValue(specific);
    return style;
}
function style_set(now, next) {
  const r = document.querySelector(':root');
        r.style.setProperty(now, next);
}

//FUNC.
//# BUILT IN TO PROTOTYPE CORE INSERT INSTEAD OF UNSHIFT
const _insert = function(that, el){ if(Array.isArray(that)) return that.unshift(el); }
const _joiner = function(arr, char){
            let str = ""; char = char || ''; //SAFE
            for(let i = 0; i < arr.length;i++){
                 str += (arr[i] + char);
               }
            return str;     //RETURN SIMPLEST STRING
          }
//# BUILT IN TRIM
const _trimer = function(str){
          let ARR = []; let firstCh;
           for(let i = 0; i < str.length;i++){
               if((str[i] != ' ' ) ){
                 ARR.push(str[i]);
                 if(str[i+1] == ' ' && str[i+2] != ' '){
                   ARR.push(' ');
                  }
                }
           }
           return _joiner(ARR, '');     //RETURN ARRAY
        }
//# BUILT INT SPLITER   replaces  .split();
const  _spliter = function(text, char){
                    //PART A
                    let count = 0, words=[], spliters=[0];
                    for(let i = 0; i< text.length;i++){
                      switch(char){
                        case '': //SPLIT BY CHAR
                            count+=1;
                            if(i != 0) spliters.push(i);
                        break;
                        default:
                            if(text[i] == char) { //SPLIT BY CONDITION
                               count+=1;
                               if(i != 0) spliters.push(i);
                               break;
                             }
                      }
                    }
                    //PART B
                    for(let i=0; i< spliters.length;i++){
                      if(i < spliters.length ){
                        let str = text.slice(spliters[i], spliters[i+1] );
                        let trimed = _trimer(str);
                        words.push( trimed );
                      }
                     }
                  //ARRAY RESULT
                  return words;
               }
//FUNC.
//CREATE DBL CLICK EVENT
const dblClick = function(target){
  const clickEvent = document.createEvent ('MouseEvents');
  clickEvent.initEvent ('dblclick', true, true);
  target.dispatchEvent (clickEvent);
}
//FUNC.
const u_help = function(question, result, native){
  //HELP MENU FILLED WITH CONTENT FROM APP AND STYLED PER APP // example:   u_help('content ', ()=>{ log(for exit) } );
  if(document.getElementById("u_help_box") != null) return false;  //ONLY ONCE BOX AT THE TIME

    let div, buttonsDiv, exit;
    function init_choice(){
      div        = document.createElement('div');
      buttonsDiv = document.createElement('div');
      buttonsDiv.classList.add('flex');
      div.id     = "u_help_box";

      //ASSIGN NATIVE AS FALSE TO USE SPECIFIC STYLE FROM OTHER APP
      if(native == true || native == null){
          div.style.width    = 250 + 'px';    div.style.height    = 150 + 'px';
          div.style.position = 'absolute';    div.style.display   = 'grid';
          div.style.left     = 35 + '%';      div.style.padding   = 3 + '%';
          div.style.top      = 20 + '%';      div.style.boxShadow = `1px 1px 6px black`;
          div.style.borderRadius = 3 + 'px';
      }

       //EVALUATE QUESTION AS STRING
     if(typeof question == 'string'){
        pause();
        div.innerHTML = question;  //ACCEPTS FORMATING OF QUESTION with html
     }else{
        return false;
     }

      exit = document.createElement('button');
      exit.classList.add('btn');
      exit.type  = 'button';
      exit.value = 'EXIT'
      exit.innerText = 'EXIT'
      exit.id = 'EXIT';

      buttonsDiv.appendChild(exit);
      div.appendChild(buttonsDiv);

      document.body.appendChild(div);
    }
    init_choice(); //CALLED IMIDIATLY

    //LISTENING FOR ANSWER
    div.addEventListener('click', async function(e){
      //U_HELP can have callback on exit if assigned
          if(e.srcElement.value == "EXIT")  {
             await e;
             pause();
             div.remove();
             return result();
           }else return false;
       });
}
//FUNC.
// SPLIT BY INDEX chose innerText OR innerHTML from outside
const splitByIndex = function(target, index){
      if(target[index] == null) return false;
      let A = target.slice(0, index);
      let B = target.slice(index, target.length);
      let arr = [];
      arr.push(A);
      arr.push(B);
      return arr;
}
//FUNC.
//OUR MAIN ERROR CONSOLE NOTIFICATION
const u_error = function(err){
  console.log(`%c${err}`,`color: indianred`);
  console.log(new Error(err));
}
//FUNC.
const getEvents = function(obj, index){   //get by passing query traverse
  if(index == null) return getEventListeners(document.querySelector(obj) );
  else return Object.keys(getEventListeners(document.querySelector(obj)))[index] ;
}
//FUNC.
//DETERMINE IF ADDRESS/PATH IS FOLDER OR NOT
const isValidFolder = function(str){
   let arr = str.split('/');   //split by /
   let unvalid = 0;
   for(let i=0; i< arr.length;i++) {
       if(arr[i].search(/(\.\.)/) < 0 && arr[i][0] != '.' ){  //find .. and where . is not on first index
          if(arr[i].split('.').length > 1){ //all other words should be under length 1, aka just one string, cannot be splited
             unvalid +=1;
          }
       }
     }
    if(unvalid > 0) return false;
    else            return true;
}
//FUNC.
// LAMBDA CALCULUS inspired
const FETCH = link => fetch(link).then( x=> x.text()).then( xx=> log(xx) ); //quick fetch test

//FUNC.
//GET IP ADDRESS
async function getIP(){
    let r  = await fetch("https://peerip.glitch.me/");
    let data = await r.json();
    return data.ip;
}
//FUNC.
//ADD ANIMATION then quickly remove it so we can do this again
const injectAnimation = function(that, anim, time){
                that.style.animation = anim;
                that.style.animationDuration = time+'s';
                setTimeout( ()=>{
                  that.style.animation = '';
                    // that.style.animationDuration = 1+'s';
                }, (time || 0.2) * 1000);
}
//FUNC.
const arrayFrom = function(char, max){
      if( isNaN(max) ) return [char];
      let future = new Array();
      for(let i =0; i < parseInt(max); i++) future.push(char);

      return future;
}
//FUNC.
const lockFunctions = function( grandObject ){  //SEEMS NOT TO HAVE ANY DIFFERENCE
               let props = Object.getOwnPropertyNames(grandObject), i =0;
                  do{
                    i+=1;
                    if( typeof grandObject[ props[i] ] == 'function' ){
                        Object.freeze( grandObject[ props[i] ] );
                    }
                  }while(i< props.length)
}
//FUNC.
// FLIP SCREEN OR ELEMENT
const flipMe = function(el){ el.style.transform = "matrix(-1,0,0,1,0,0)"; }

// TRANSFORM CTX
const normalize = function(){ ctx.setTransform(1,0,0,1,0,0); }
const transform = function(it, [Horizontal_scaling, Vertical_skewing, Horizontal_skewing, Vertical_scaling , Horizontal_translation, Vertical_translation]){
      ctx.setTransform( Horizontal_scaling, Vertical_skewing, Horizontal_skewing, Vertical_scaling , Horizontal_translation, Vertical_translation);
      //reset to default    [1,0,0,1,0,0]
}
//************** RANDOMNESS SECTION ******************
//POSSIBLE OUTCOMES TRUE , FALSE AND NULL         usage: conditionalRand(new Date().getMiliseconds(), 2, 0.75);
const conditionalRand = function(rand, mod, prob){
    if( isNaN(rand) == false ){
       if(rand % mod == 0) {
         let newRand = (Math.random() * rand) | 0;   //floor result
             // let len = (Math.log10(newRand) | 0) + 1; //math calc of length [not used currenlty, maybe in future]
         let arr = (newRand).toString().split('');
            let len = arr.length;

            for(let i =0;i< len;i++){
                (i == 0) ? arr[i] = 1
                         : arr[i] = 0;
            }
            arr.push(0); //ADD ONE MORE

            let int = parseInt(arr.join(''));
            // console.log(newRand, int, (newRand / int) ); //TEST
            return ( (newRand / int) > prob ) ? true : false;
        }else return null;
      }
}
//FUNC.
const dirtyRand = ( rand=Date.now()  )=> Math.log10( rand / Math.random() * Math.random() ) | 0;    //DEFAULT IS DATE NOW OR PASS YOUR VAR
//FUNC.
const sleep = function(x){
  let d = Date.now();
  let state = true;
   while(state){
    let time = ((Date.now() - d) / 1000) | 0;
    if(time >= x){
        state = false;
        return x;
       }
   }
}
const interval = function(max, second= second | 0, action){
  // let rand = (Math.random() * 50) | 0;
  for(let i = 0; i< max; i++){
      if(sleep(second) == second) {
        if(typeof action == 'function') action();
      }
  }
  // return rand;
}
//FUNC.
//MATHC ALL INSTANCES INSIDE str example:   count all case statements from function
const matchThese = function(str, from){
  let a = new RegExp(str, 'g');
  return from.toString().match(a).length;
}
//FUNC.
//RETURN ONE VALID RESULT EXCLUDING SPECIFIC VALUE
const randWithout = function(arr, forbiden){
      let validArr =[], output;
      arr.map( (x,i)=> (x != forbiden) ? validArr.push( i ) : '' ); //compute valids
      if(Math.random() > 0.5) output = validArr[0];
      else                    output = validArr[validArr.length - 1];
      return output;
}
//FUNC.
//COMPARE TWO ARRAYS ->are they same
const compareArray = function(a, b){
      if(Array.isArray(a) == false || Array.isArray(b) == false) return false;
      let longer = a, shorter = b;
      if(a.length == b.length) { longer = a; shorter = b; }
      if(a.length > b.length)  { longer = a; shorter = b; }
      else                     { longer = b; shorter = a; }
      let output = true;

        for(let i = 0; i < longer.length;i++){
            if( longer[i] != shorter[i]){ output = false; break; }
        }
  return output;
 }

//FUNC.
//SORT ARRAY
let sortArray = function(arr, type){
  //swap MUST BE passed with arr
    function swap(a, b, arr){
      let temp = arr[a];
      arr[a] = arr[b];
      arr[b] = temp;
    }
    for (let i=0; i < arr.length-1; i++){
      for (let j=0; j< arr.length-i-1; j++){
          switch(type){
             //FROM SMALLEST TO LARGEST
             case '>':
                  if(arr[j] > arr[j+1]) swap(j, j+1, arr);
             break;
             //FROM LARGEST TO SMALLEST
             case '<':
                  if(arr[j] < arr[j+1]) swap(j, j+1, arr);
             break;
          }
        }
    }
}
//FUNC.
//RETURN ALL VALID PRIME FACTORISATION NUMBERS   (factoring(1 000 000)) //is treashold test for javascript
const factoring = function(max){
let primes = [2];
for(let i =2;i< max;++i){
  let deci = (( Math.sqrt(i)).toString().indexOf('.') > -1); //its decimal num
  // let deci = Number.isInteger(Math.sqrt(i));
   if(i % 2 == 1 && deci) {
     let unvalid = false;
       for(let j = 0;j< primes.length;j++){
           if(i % primes[j] == 0) unvalid = true;
        }
    if(unvalid == false) primes.push(i); //return only if cannot be divised by current primes
    }
  }
 return primes; //valid primes
}
//FUNC.
const rootIs = function(num){
 //RETURN ONLY PERFECT ROOT OR FALSE (2, 3, 4, 5, 6, 7, 8, 9...) none -> 11.81...
 let odd = [];
 for(let i = 0;i< num;i++) if(i % 2 == 1 ) odd.push(i);

 let start = num;
 let inc = 0;

  for(let i = 0;i< odd.length;i++){
     start = start - odd[i];
     inc +=1;
     if(start == 0) break;
     if(start < 0) return false; //Unperfect root == false
  }
 return inc;
}
//FUNC.
//3n +1
//n / 2
//COLLATTZ CONJECTURE
const collatzConj = function(n=2){
    let arr = [];
     let end = 1;
      while(n != end ){
       if(n % 2 == 1) {
          n = (3 * n)+1;
       }else if(n % 2 == 0){
          n = n / 2
       }
       arr.push(n);
    }
    return arr;
}
//FUNC.
const modulo = function(baza, mod){
  //MY VERSION OF baza % mod == REM
  let REM = 0;
  if(baza < mod) REM = baza;
  else{
        let rstr = (baza / mod).toString();
        if(rstr.indexOf(".") > -1 ) REM = baza - ( ((baza / mod) | 0 ) * mod);
        else REM = REM;
      }
  return REM;
}
//FUNC.
//GO TO statement break ANY LOOP
const goto = (b)=> b;

//--------- RECURSION SPECIALS------------------
//POWER TO
let pow = (i, n)=>{
  if(n == 1) return i;
  else       return i * pow(i, n-1);
}
//SUM TO
let sumTo =(n)=> {
    if(n < 1) return n;
    else      return n + sumTo(n-1);
}
//EXAMPLE
// let end = 100;
// for(let i = 0;i< end;i++ ){
//   for(let j = 0;j< 50;j++){
//     if(j > 10 ) i = goto(end);
//     else console.log(i, j);
//    }
//  }

//FUNC.
const defineBool = (that)=>{ //always get bool
   let str = String(that);
   if(that === false || that == 'false')    return false;
   else if(str.search(/[1-9]/gi) > -1)      return true;
   else if(str.search(/[a-z|A-Z]/gi) > -1)  return true;
   else                                     return false;
}
//FUNC.
const binary = (num)=>{ // produce binary number
   let bin = '';
     while(num > 0){
         if(num % 2 == 0) bin += '0';
         else             bin += '1';
         num = parseInt(num/2);
     }
     return bin.split('').reverse().join('');
}
//FUNC.
const decimal = (bin)=>{  //produce decimal from any binary
  let radix = 2;
  let arr = bin.toString().split('').map( x=> x*1); //integers

  let current = 0;
  for(let i = 0;i< arr.length;i++){
      current = (current * radix) + arr[i];
  }
  return current;
}
//FUNC.
// FIZED SIZE HASH
const hash = (string)=>{
    let hash = 0;
    if (string.length == 0) return hash;
    for(let i = 0; i<string.length; i++) {
        let ch = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash |= 0;      //hash & hash;
    }
    return Math.abs(hash);
}
//FUNC.
//HASH ALHORITHM FROM STACK OVERFLOW  //seems all positives
const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
         let ch = str.charCodeAt(i);
         h1 = Math.imul(h1 ^ ch, 2654435761);
         h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};
//FUNC.
//TURN TO HEXADECIMAL AND TO NUMBER
let toNumber = (hex, radix)=>{
    return parseInt( hex, radix)
}
//FUNC.
let toHex  = (num, radix)=>{
    return num.toString(16);
}
//FUNC.
//BITWISE
let odd = (x)=> (x & 1) ? true : false;   //odd or even
let shiftToRight = (x, n)=> (x >> n) == (x / (2**n)); //this is same operation
let shiftToleft  = (x, n)=> (x << n) == (x * (2**n)); //this is same
let toOdd = (x) => x | 1;  //PRODUCE ALWAYS ODD

const removeEmojis = function(str){
    let emojiRE = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    return str.replace(emojiRE, '');
}
//FUNC.
//EVEN MORE SIMPLE WAY TO DETECT BRAVE
// !!navigator.brave
//FUNC.

//DIFFERENT CONTROLS TYPES
// window.addEventListener('keydown', (e)=>{
//    if(e.keyCode == 87) {player.y -= .5; MOVEMENT = 'UP'}  //UP       [W]
//    if(e.keyCode == 83) {player.y += .5; MOVEMENT = 'DOWN'}  //DOWN   [S]
//    if(e.keyCode == 65) {player.x -= .5; MOVEMENT = 'LEFT'}  //LEFT   [A]
//    if(e.keyCode == 68) {player.x += .5; MOVEMENT = 'RIGHT'}  //RIGHT [D]
//
// });


// //NEW CONTROLS ADDED ROTATION
// window.addEventListener('keydown', function (e) {
//      e.preventDefault();
//      canvas.keys = (canvas.keys || [] );
//      canvas.keys[e.keyCode] = (e.type == "keydown");
//    });
// window.addEventListener('keyup', function (e) {
//      canvas.keys[e.keyCode] = (e.type == "keydown");
//     });

// window.addEventListener( 'keydown', (e)=>{
// //NO MULTIPLE KEYS
// // if(e.keyCode == 74 ) {  player.newAngPos(); player.moveAngle = - 3; }
// // if(e.keyCode == 76 ) {  player.newAngPos(); player.moveAngle =  3;  }
// // if(e.keyCode == 73 ) {  player.updatePosWithAng();  player.speed = 0.25; }
// // if(e.keyCode == 75 ) {  player.updatePosWithAng();  player.speed = -0.25; }
//
// //WITH MULTIPLE KEYS
// if( canvas.keys && canvas.keys[65] ) {  player.newAngPos(); player.moveAngle = - 3; }
// if( canvas.keys && canvas.keys[68] ) {  player.newAngPos(); player.moveAngle =  3;  }
// if( canvas.keys && canvas.keys[87] ) {  player.updatePosWithAng();  player.speed = 0.25; }
// if( canvas.keys && canvas.keys[83] ) {  player.updatePosWithAng();  player.speed = -0.25; }
// });
//
// //STOP MOVING ON KEYUP
// window.addEventListener( 'keyup', ()=>{
// player.speed = 0;
// });




// popover('ISPRAVI LEĐA...');


//------------------------------------------------------------
//NOT TESTED

// function rotate(cx, cy, x, y, angle) {
//     var radians = (Math.PI / 180) * angle,
//         cos = Math.cos(radians),
//         sin = Math.sin(radians),
//         nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
//         ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
//     return [nx, ny];
// }

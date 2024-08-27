const doc = document, body = doc.body, log =(...x)=> console.log(x), qu = (Q)=> doc.querySelector(Q); //HELPERS

const CALC = {
  vars : {
        OOS_W : 200,
        OOS_H : 400,    //PRE DEFINED OOS WIDTH && HEIGHT  (I think this is not used)
        CARRY : true,
        HISTORY : [],
        CELL : {
          width  : window.innerWidth / 4,
          height : window.innerHeight / 5.1,
        },
        COMP : {
          A : 0,
          operation : '',
          B : 0
        },  //HOLD COMPUTATION FROM CALCULATOR
        G1 : "mousedown",
  },
  query : {},
  collectQuery : function(){
         CALC.query = {
           container : qu('.container'),
           calcTable : qu('.calc-table'),
           sliders   : doc.querySelectorAll('.sliders'),
           output    : qu('.output'),
           H_holder  : qu('.history-holder'),
           H_list    : qu('.history-list'),
           historyBtn: qu('.historyBtn'),
           carryBtn  : qu('.carryBtn'),
         }
  },
  //NEW EVENT
  newValueEvent : function(a){
        a.addEventListener(CALC.vars.G1, ()=>{
          let val = a.getAttribute('val');
          if(val == "=")                { CALC.vars.COMP.B = parseFloat(CALC.query.output.innerText), CALC.calculation();  CALC.resetOrCarry(); }
          else if(isNaN(val) == false)               CALC.query.output.innerText += val;
          else if(isNaN(val) == true  && val == ".") CALC.dotComp();
          else if(isNaN(val) == true  && val == "C") CALC.ACreset();
          else if(isNaN(val) == true  && val != "C") CALC.operationSwitch(), CALC.vars.COMP.operation = val;
        });
  },
  //SWITCH BETWEEN COMP OBJECT  A - B   -> DIVIDES COMPUATION IN TWO PARTS BEFORE OPERATION AND AFTER
  operationSwitch : function(){
         (CALC.vars.COMP.operation == "") ? CALC.vars.COMP.A = parseFloat(CALC.query.output.innerText) : CALC.vars.COMP.B = parseFloat(CALC.query.output.innerText);
         CALC.query.output.innerText = '';
  },
  //CARRY RESULT OR RESET ON EVERY =
  resetOrCarry : function(){ return (CALC.vars.CARRY == true) ? CALC.vars.COMP.A = CALC.vars.HISTORY[CALC.vars.HISTORY.length -1] : false; }, //CARRY LAST CALC.calculation
  //PERFORM CALCULATION
  calculation : function(){
          if( CALC.vars.COMP.A < 0.0000000001 || CALC.vars.COMP.B < 0.0000000001 || CALC.vars.COMP.operation.length < 1 ) return false; //DOES NOT CALCULATES BELLOW THIS NUMBERS, UP THE LIMIT IF NEEDED
          let res;
          switch(CALC.vars.COMP.operation){
            case "+":  res= CALC.vars.COMP.A + CALC.vars.COMP.B;  break;
            case "-":  res= CALC.vars.COMP.A - CALC.vars.COMP.B;  break;
            case "/":  res= CALC.vars.COMP.A / CALC.vars.COMP.B;  break;
            case "*":  res= CALC.vars.COMP.A * CALC.vars.COMP.B;  break;
          }
          // let deciamls = CALC.vars.COMP.A.toString().split('.')[1].length;   //NOT USED FOR NOW
          CALC.query.output.innerText = parseFloat(res.toFixed(3));           //RESULT
          CALC.query.output.setAttribute('full-result', res);                 //REMMEMBER FULL RESULT AS ATTRIBUTE
          CALC.vars.HISTORY.push(res);                  //TO HISTORY
          CALC.addElement('li', res, 'hist-calc', 'block', '.history-list' );
     },
  //PERFORM DOT COMPUATION
  dotComp : function() { if(CALC.query.output.innerText.includes('.') == false) CALC.query.output.innerText += '.'; },
  //RESET
  ACreset : function() { return CALC.query.output.innerText = '', CALC.vars.COMP.A = 0, CALC.vars.COMP.B = 0, CALC.vars.COMP.operation = ""},
  //CREATE CLICKABLE TD NUMBERS
  createAllTDS : function(){
          const cells = [ "~","~","~", "+",
                           7, 8, 9   , "-",
                           4, 5, 6   , "/",
                           1, 2, 3   , "*",
                         "C", 0 ,"." , "=" ];

          for(let i = 0; i < 5; i++){
            let TR = dce("tr"); //CREATE ROW

            let index;  let max;
            (i > 0) ? index = (4*i) : index = i;
            (i > 0) ? max = 4 : max = 2;
            if(i != 0){
              TR.classList.add('sliders'); //ADD CLASS FOR SLIDING
              }

            for(let j = index; j < (index + 4); j++){
              let TD = dce('td'); //CREATE TD
                  TD.setAttribute("inputmode", "none");

                if(cells[j] == '~' && j > 1) TD.classList.add('output');   // OUTPUT AREA  TD.setAttribute('contenteditable', true)
                else if(j > 2)  TD.innerText = cells[j], TD.setAttribute('val', cells[j]), CALC.newValueEvent(TD);           //CLICKABLES
                else   TD.classList.add('dead');                                               //JUST FOR DESIGN PURPOSES DEAD CELLS

                //SIZE
                TD.style.width = CALC.vars.CELL.width  + 'px';   TD.style.width = (CALC.vars.CELL.width * 2.99) + 'px';  TD.style.height = CALC.vars.CELL.height  + 'px';

                //APPEND PART
                TR.appendChild(TD);
                }
             qu('.calc-table').appendChild(TR);
            }
   },
   goThroughAll : function(){
         let a = doc.querySelectorAll('TD');
         for(let i = 0; i < a.length;i++){
           a[i].style.height = (window.innerHeight / 5) + 'px';
         }
   },
   resizeNums : function(){
         CALC.vars.CELL.width = window.innerWidth / 4;
         CALC.vars.CELL.height = window.innerHeight / 5.1;
         qu('.output').style.fontSize = (CALC.vars.CELL.height - (CALC.vars.CELL.height / 3)) + 'px';
   },
   addElement : function(type, innerText, className, defaultsTo, appendTo){
           const el = dce(type);
           el.innerText = innerText;
           el.classList.add(className);
           el.style.display = defaultsTo;
           qu(appendTo).appendChild(el);
   },
   showMe : function(t, s){ t.style.display = s; },
   slidersSlide : function(){
          for(let i = 0; i< CALC.query.sliders.length;i++){
            if(CALC.query.sliders[i].style.display == 'none') {
               CALC.showMe(CALC.query.sliders[i], 'table-row'), CALC.showMe(CALC.query.H_holder,'none');
             }else{
               CALC.showMe(CALC.query.sliders[i], 'none'), CALC.showMe(CALC.query.H_holder,'block');
             }
          }
          if(CALC.query.sliders[0].style.display == 'none') qu('[val="+"]').style.display = 'none';
          else                                              qu('[val="+"]').style.display = 'table-cell';
   },
   //TURN ON CARRY
   switchCARRY :  function(){
     if(CALC.vars.CARRY == true) {
        CALC.vars.CARRY = false;   CALC.query.carryBtn.classList.remove('on');
     }else{
        CALC.vars.CARRY = true,    CALC.query.carryBtn.classList.add('on')
     }
   },


};  //END OF CALC OBJECT

const main = ()=>{
  CALC.createAllTDS();
  CALC.resizeNums();

  CALC.addElement('span', 'history', 'historyBtn','block', '.span-holder');
  CALC.addElement('span', 'ca', 'carryBtn','block', '.span-holder');
  CALC.addElement('div', '', 'history-holder', 'none', '.container');
  CALC.addElement('ul', '', 'history-list', 'block', '.history-holder' );

  qu('.output').setAttribute("inputmode", "none");

  (detect_device() == 'mobile') ? CALC.vars.G1 = 'touchstart' : CALC.vars.G1 = 'mousedown'; //CHECK EVENT TRIGER

  qu('.history-holder').style.maxHeight = (CALC.vars.CELL.height * 4) + 'px';
  qu('.carryBtn').classList.add('on');
  qu('.carryBtn').title="Carry calculation";

  //ADJUST SIZE OF CELL AS WELL AS FONT SIZE IN OUTPUT AREA
  window.addEventListener('resize', ()=>{
     CALC.query.output.style.width = (CALC.vars.CELL.width * 2.99) + 'px';
     CALC.query.output.style.height = CALC.vars.CELL.height + 0.1  + 'px';
     CALC.goThroughAll();
     CALC.resizeNums();
   });
  //NO RIGHT CLICK IN CALC
  window.addEventListener('contextmenu', e => e.preventDefault() );

  qu('.historyBtn').addEventListener(CALC.vars.G1, CALC.slidersSlide );
  qu('.carryBtn').addEventListener(CALC.vars.G1, CALC.switchCARRY );

  qu('.output').addEventListener(CALC.vars.G1, (e)=>{
    e.preventDefault();
    switch(e.keyCode){
      case 13:   if(CALC.query.output.innerText == 'OFF' || CALC.query.output.innerText == 'off') location.reload();  break;  //ENTER
    }
  });
  //DBL CLICK COPIES RESULT
  qu('.output').addEventListener('dblclick', (e)=>{
     if(qu('.output').getAttribute('full-result') == null) return false; //SAFE
     qu('.output').innerText = parseFloat( qu('.output').getAttribute('full-result'));
     if(navigator.clipboard) { navigator.clipboard.writeText(parseFloat( qu('.output').innerText)); //COPY TO clipboard
                               popover('copied');
                             }
  });
  CALC.collectQuery();
}

main();

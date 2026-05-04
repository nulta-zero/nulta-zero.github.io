"use strict";
const doc = document,
      log   = (...x)=> console.log(x),
      dce   = (x)=>    doc.createElement(x),
      qu    = (Q)=>    doc.querySelector(Q),
      quAll = (Q)=>    doc.querySelectorAll(Q),
      appendAll = (arr, parent)=> arr.map( x=> parent.appendChild(x) ),
      show_this = (it, mechanism)=> { (mechanism) ? it.style.display = mechanism || 'block' : it.style.display = 'none'; }; //EXAMPLE OF USING THIS FUNC      show_this( invertory_holder, true/false )

const $$ = {
  vars : {
      heightOffset : 85,
      RESPONSE : null,
      LISTE : {},
      activeListName : null,
      FILE : 'list.json',
      colors  : ['--atomWorkspace','--earth', '--teal','--babyBlue','--magicMint', '--mint','--lavander','--beige', '--softGold',
                '--apricot',
                '--lemonChiffon',
                '--peach',
                '--roseQuartz',
                '--dustyRose',
                '--sage',
                '--linen',
                '--paleAqua',
                '--pistachio',
                '--thistle',
                '--skyMist',
      ],
      activeTask : null, //will be index

      list_views : {
        index : 0,
        map : {
            0 : 'list-view',
            1 : 'grid-view',
            2 : 'table-view',
          },
      },

      dragged : {
        source : { item : null, index : null, },
        target : { item : null, index : null }
      }

  },
  query : {},
  collectQuery : function(){
          $$.query = {
              container : qu('.container'),
              mainDiv   : qu('.main-div'),
              subDiv    : qu('.sub-div'),
              mainList  : qu('.main-list'),
              subList   : qu('.sub-list'),
              noti      : qu('.noti'),
              plannerHolder : qu('.planner-holder'),
            }
          },
  getIndex : (el)=> parseInt(el.getAttribute('data')) || 0,
  taskIs : function(state, el ){
            let myTask = el.parentElement.querySelector('.to-edit');
             switch(state){
               case 'done':  el.innerText = '◼︎';  myTask.classList.add('done');     break;
               default :     el.innerText = '◻︎';  myTask.classList.remove('done');  break;
             }
             $$.fullListUpdate();
          return state;
  },
  updateListState : function(provided, data){
        let inc = provided.parentElement.getAttribute('data') || 0;
        if( $$.vars.LISTE[$$.vars.activeListName][ inc ] == null)  $$.vars.LISTE[$$.vars.activeListName][ inc ] = {}; //if it does not exist create new

        $$.vars.LISTE[$$.vars.activeListName][ inc ].content = data || provided.querySelector('.to-edit').textContent; //data is used when droping file
  },
  fullListUpdate : function(){
        let list = $$.vars.LISTE[$$.vars.activeListName];
        let arr = quAll('.sub-li');
        for(let i=0;i<arr.length;i++){
            if(list[i] == null) list[i] = {};
            list[i].content = arr[i].querySelector('.to-edit').textContent;
            list[i].color   = arr[i].style.background.replaceAll(/var\(|\)/gi, '');
            list[i].size    = arr[i].style.gridColumn;
            list[i].status  = arr[i].querySelector('.to-edit').classList.contains('done') ? 'done' : '';
        }
  },
  copyEvent : async function(btn, textToCopy){
        try {
          await navigator.clipboard.writeText(textToCopy);
          await $$.notification('Copied to clipboard!');
        } catch (err) {
          $$.notification('Failed to copy...');
        }
  },
  randomEmoji : function(index=null){
        let emojis = ['o_o', '-_-', '  +_+', '  * ^ *', '  #_#', '  0_o', '  `_`', '  ~_~', '  :=_=:',' ♥︎_♥︎', '⧸⧸⧼⧽⋰', '౨ৎ', '୨ৎ', '𝒢𑄺', '𝜗⍴', '𝜗ৎ', '𝜗𐑞', '𝜗𝜚', '>_<', "'_'" ,'x_x'
, '._.' ,'.__.', '•_•', 'ˆ_ˆ', ];
        if(index && emojis[index] != null) return emojis[index];  //you can pass desired emoji index
        return emojis[Math.ceil(Math.random() * emojis.length)] || emojis[0]; 
  },
  addReorderDrag : function(item, zone){
        // On the draggable item
        item.addEventListener('dragstart', e => {
          if(e.target.classList.contains('sub-li') == false) return false;
          e.dataTransfer.effectAllowed = 'move';
          $$.vars.dragged.source.item = e.target;
          $$.vars.dragged.source.index = e.target.getAttribute('data');
        });
        item.setAttribute('draggable', true);
  },
  addReorderDropZone : function(zone){
      const refresh = ()=>{
         $$.reasignIndexes();
         $$.fullListUpdate();
      }
      zone.addEventListener('dragover', e => e.preventDefault()); // required!
      zone.addEventListener('drop', e => {
          e.preventDefault();
          if(e.target.classList.contains('sub-list')){
             e.target.appendChild($$.vars.dragged.source.item);  //no children in list (all pinned) allow return to list
             $$.adjustTextSizePerLength($$.vars.dragged.source.item.querySelector('.to-edit'));
             return refresh();
          }
          if(e.target.classList.contains('sub-li') == false) {
             return false;
          }
          let dra = $$.vars.dragged;
              dra.target.item  = e.target;
              dra.target.index = e.target.getAttribute('data');

          let targetIndex = parseInt(dra.target.index);
          let sourceIndex = parseInt(dra.source.index);
          if(targetIndex === sourceIndex) return false; //SAME POS, AKA sub-li did not move,  do nothing

          if(sourceIndex < targetIndex) zone.insertBefore(dra.source.item, dra.target.item.nextSibling);   //drag toward (right | larger index)
          else                          zone.insertBefore(dra.source.item, dra.target.item); //drag toward (left | smaller index)
          refresh();
      });
  },
  addPinDropZone : function(zone){
          zone.addEventListener('dragover', e => e.preventDefault()); // required!
          zone.addEventListener('drop', e => {
              e.preventDefault();
              let dra = $$.vars.dragged;
              dra.target.item  = e.target;
              dra.target.index = e.target.getAttribute('data');
              e.target.appendChild(dra.source.item);
              e.target.classList.remove('net');
              $$.adjustTextSizePerLength(dra.source.item.querySelector('.to-edit'), 3); //sub-li is passed here
          });
          zone.addEventListener('dragenter', $$.dropEnter);
          zone.addEventListener('dragleave', $$.dropLeave);
  },
  dropEnter : async e => {
          e.preventDefault();
          e.stopPropagation();
          e.target.classList.add('net');
  },
  dropLeave : e => { e.target.classList.remove('net') },

  reasignIndexes : function(arr){
          arr = arr || quAll('.sub-li');
          for(let i=0;i<arr.length;i++){
              arr[i].setAttribute('data', i);
              arr[i].querySelector('.cal-task').textContent = $$.seeDate(i);  //reasign calendar also
          }
  },
  futureDate : function(days){
          let d = new Date();
          // Add days to the future (milliseconds * seconds * minutes * hours * days)
          return d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  },
  seeDate : (days)=> new Date($$.futureDate(days)).toDateString(), //from today
  //TASK inside LIST[?]...
  addTask : function(OK, content, status){

          let li = dce('li');
              li.classList.add('sub-li');
          let inc = quAll('.sub-li').length || 0;

              li.setAttribute('data', inc);
          let text_div = dce('div');
              text_div.classList.add('to-edit');
              text_div.setAttribute('contenteditable', true);

              text_div.addEventListener('paste', $$.onlyPlainText);

              let whiteSpace = qu('.sub-list').classList.contains('table-view') ? ' ' : '  ';

              if(OK == null) text_div.innerText =  whiteSpace + $$.randomEmoji();
              else           text_div.innerText = content;

              text_div.addEventListener('drop',      $$.quickDropHandler     );
              text_div.addEventListener('dragover',  $$.quickDragOverHandler );
              text_div.addEventListener('dragleave', $$.quickDragLeave       );
              text_div.addEventListener('dragenter', $$.quickDragEnter       );
              text_div.setAttribute('draggable', false); //prevent dragging from to-edit

              // STATUS OF TASK, DONE or NOT
          let square = dce('div');
              square.innerText = '◻︎';
              square.classList.add('is-done', 'btn');

              //AUTO RECOGNIZE ALREADY SET COLOR, when RECREATING TASK
              let colorWas = $$.vars.LISTE[$$.vars.activeListName][ inc] != null ? $$.vars.LISTE[$$.vars.activeListName][ inc ].color : '';
              li.style.background = `var(${colorWas})`;

              let sizeWas = $$.vars.LISTE[$$.vars.activeListName][ inc] != null ? $$.vars.LISTE[$$.vars.activeListName][ inc ].size : '';
              li.style.gridColumn = `${sizeWas}`;

          let del = dce('div');
              del.innerText = '⤬';
              del.classList.add('delete-task', 'btn');

          let taskMenu = dce('div');
              taskMenu.classList.add('task-menu');
          let copyTask = dce('span');
              copyTask.classList.add('copy-task', 'btn');
              copyTask.textContent = "⧉";

          let calTask = dce('span');
              calTask.classList.add('cal-task');
          let date = $$.seeDate(inc);
              calTask.textContent = date; //must be like this
          let preSetup = dce('span');
              preSetup.classList.add('pre-task', 'btn');
              preSetup.textContent = "≔";

              appendAll([square, text_div, del], li);
              appendAll([copyTask, preSetup, calTask], taskMenu);
              li.appendChild(taskMenu);

            $$.adjustTextSizePerLength(text_div);
            $$.addPlanner(Math.floor(window.innerWidth / 200));

         //INIT
         $$.query.subList.appendChild(li);
         $$.addReorderDrag(li, li.parentElement);
         $$.fullListUpdate();

         //RETURN STATUS
         if(status == 'done') $$.taskIs('done', square);
  },
  //ADD LIST1, LIST2, LIST3...
  addList : function( data ){
            let inc = quAll('.main-li').length;
            let possible_name = "LIST " + (inc+=1);

            let li = dce('li');
                li.classList.add('main-li');

            let list_name_span = dce('span');
                list_name_span.classList.add('list-name');
                list_name_span.innerText = data || possible_name;

            let micro_holder = dce('div');
                micro_holder.classList.add('micro-holder');

            li.setAttribute('data', data || possible_name );
            let del = dce('span');
                del.innerText = '⤬';
                del.classList.add('delete-sub-list');
            li.appendChild(list_name_span);
            li.appendChild(micro_holder);
            li.appendChild(del);
          $$.query.mainList.appendChild(li);

          // ADD TO LISTE OBJECT
          if(data == null) $$.vars.LISTE[possible_name] = {};  //CREATE NEW LIST OR if data provided recreate from old data
  },
  //# PASTE JUST PLAIN TEXT
  onlyPlainText : function(e){
                  e.preventDefault(); let format = 'text/plain';
                  const text = (e.clipboardData || window.clipboardData).getData(format);
                  const selection = window.getSelection();

                  if (selection.rangeCount) {
                    selection.deleteFromDocument();
                    selection.getRangeAt(0).insertNode(document.createTextNode(text))
                  }
  },
  addTaskColoring : function(){
      // ADD COLORING OPTIONS
      let myColors = dce('div');
          myColors.classList.add('task-colors-holder');
          for(let i = 0; i < $$.vars.colors.length; i++){
              let small_div = dce('div');
              small_div.style.background = `var(${$$.vars.colors[i]})`;
              small_div.setAttribute('color-data' , `${$$.vars.colors[i]}`);
              small_div.classList.add('color-div', 'minimal-btn');
              myColors.appendChild(small_div);
          }

          myColors.addEventListener('click', e=>{
             let colorIs = e.target.getAttribute('color-data');
             let inc = parseInt($$.vars.activeTask) || 0;

             let task = quAll('.sub-li')[inc];
                 task.style.background = `var(${colorIs})`;

             let ToEdit = task.querySelector('.to-edit');
             if( isNaN(inc) == false && $$.vars.LISTE[$$.vars.activeListName][ inc ] == null) {
                 $$.vars.LISTE[$$.vars.activeListName][ inc ] = {};
                 if( ToEdit.innerText.length > 1 ) $$.vars.LISTE[$$.vars.activeListName][ inc ].content =  ToEdit.innerText;   //ALTERNATIVE TO UPDATE LIST STATE
             }
             if($$.vars.LISTE[$$.vars.activeListName][ inc ] != null) $$.vars.LISTE[$$.vars.activeListName][ inc ].color = colorIs;
          });

          qu('.top-form').appendChild(myColors);
  },
  adjustTextSizePerLength : function(el, coef=1){
         let text = el.textContent;
         let parent = el.parentElement;
         let W = parent.clientWidth;
         let ratio = ((W / (text.length) || 1) * 100)/coef;
         if(ratio > 35) ratio = 35; //dont make it grande
         if(ratio < 15) ratio = 15; //dont make it tiny
         el.style.fontSize = ratio + 'px';
  },
  changeView : function(){
         let list_views = $$.vars.list_views;
             list_views.index +=1;
         let map = list_views.map;
         let OK = Object.keys(map);
         if(list_views.index > parseInt(OK[OK.length-1]) ) list_views.index = 0;

         qu('.sub-list').classList.remove('list-view', 'grid-view', 'table-view');
         let view = list_views.map[list_views.index];
         qu('.sub-list').classList.add(view);
         $$.notification(view);
  },
  referenceTasksPerList : function(){
        let OK = Object.keys($$.vars.LISTE);
        for(let i = 0; i < OK.length; i++){
            let name = OK[i];
            let tasks = Object.values($$.vars.LISTE[name]);

            qu(`[DATA='${name}']`).querySelector('.micro-holder').innerHTML = '';  //CLEAR OLD
            // tasks.length
            for(let j = 0; j < tasks.length; j++){
                // $$.vars.LISTE[name][j];
                let micro = dce('span');
                micro.innerText = '▢';
                micro.classList.add('micro');
                qu(`[DATA='${name}']`).querySelector('.micro-holder').appendChild(micro);
                // qu(`[DATA='${name}']`).insertBefore(ref_span, qu(`[DATA='${name}']`).querySelector('.delete-me'));
            }
        }
  },
  fetchAndParse: async function(link){
          fetch(link).then( x=> x.text() ).then( xx=> {
             if(xx.search(/\{/) < 0) return $$.vars.LISTE = {};  //SAFE EXIT
             else if(JSON.parse(xx).constructor == Object ) $$.vars.LISTE = JSON.parse(xx)
             else                                           $$.vars.LISTE = {};
            });
  },
  //SUB LIST IS RE-READ FROM LISTE OBJECT   [different from addTask so it must be re-implemented]
  recreateTasks : function(){
               let active_list_name = $$.vars.activeListName;
               let Ob = $$.vars.LISTE[active_list_name];
                    let OK = Object.keys(Ob); //['A', 'B']
                    let OV = Object.values(Ob); //[{}, {}]
                    for(let i =0; i< OK.length; i++){
                        $$.addTask(OK[i], OV[i].content, OV[i].status );     //OK[i].split(/\s/)[1]
                    }
   },
   extendGridTableColumn : function(el){
        if(el == null) return false;
        let rowMax = Math.floor(window.innerWidth / 200);
        let index = Math.floor(el.getBoundingClientRect().x / 200);
        let divider = parseInt(el.getAttribute('extended') || 1);
            divider+=1;
        if(divider > rowMax-Math.abs(index%rowMax) ) divider = null;      //7-(4 % 7)
        if(divider == null) { el.removeAttribute('extended'); return el.style.gridColumn = ''; }

        el.style.gridColumn = `span ${divider}`;
        el.setAttribute('extended', divider);
   },
   disappearingAttribute : function(el, att, content){
        el.addEventListener('click', e=>{
           if(el.getAttribute(att) == '') el.setAttribute(att, content);
           else                           el.setAttribute(att, '');
        });
   },
   addPlanner : function(rowMax){
        let total = quAll('.planner-field').length;
        for(let i=0; i<3; i++){
            let plannerField = dce('div');
            plannerField.classList.add('planner-field');
            plannerField.setAttribute('slot', total);
            // plannerField.textContent = total;
            if(i == 0 && total < 2){
               plannerField.classList.add('help-field');
               plannerField.setAttribute('help-text', "Pin any task to planner (in list view)");
               $$.disappearingAttribute(plannerField, 'help-text', "Pin any task to planner (in list view)");
            }
            if(total === 9){
              plannerField.classList.add('help-field');
              plannerField.setAttribute('help-text', "Double-tap task to expand it (in table view)");
              $$.disappearingAttribute(plannerField, 'help-text', "Double-tap task to expand it (in table view)");
            }
            $$.query.plannerHolder.appendChild(plannerField);
            $$.addPinDropZone(plannerField);
            total = quAll('.planner-field').length;
         }
   },
   //RECREATE LISTS FROM .json file
  recreateLists : function( obj ){
               let OK = Object.keys( obj );
               if(typeof obj != 'object') return false; //SAFE

               for(let i = 0;i<OK.length; i++) { $$.addList(OK[i]); }
   },
  switchTO : function(that){
            switch(that){
              case 'main-div':  show_this( qu('.main-div'), 'block' );
                                show_this( qu('.sub-div'), 'none' );
                                $$.fullListUpdate(); //update before you leave
                                qu('.sub-list').innerHTML = '';
                                $$.query.plannerHolder.innerHTML = '';
              break;
              case 'sub-div':   show_this( qu('.main-div'), 'none' );
                                show_this( qu('.sub-div'), 'grid' );
                                if(typeof $$.vars.LISTE == 'object' &&
                                   Object.keys($$.vars.LISTE[$$.vars.activeListName]).length > 0) $$.recreateTasks();
              break;
            }
  },
  autoShow : function(){
            let ML = qu('.main-list').children, SL = quAll('.sub-li');
            if(ML.length > 0 && SL.length > 0)  show_this(qu('.top-form'), 'flex');
            else                                show_this(qu('.top-form'), 'none');
  },
  //ADD ANIMATION -> wait -> DELETE
  animate : function(that, anim, time, remove){
                that.style.animation = anim;
                that.style.animationDuration = time+'s';
                setTimeout( ()=>{
                  if(remove == true) that.remove();  //only if assigned remove element

                  that.style.animation = ''; //Always remove animation attribute
                }, (time || 0.2) * 1000);
  },
  resizeList : function(){
              // qu('.sub-list').style.height  = window.innerHeight -$$.vars.heightOffset + 'px';
              qu('.main-list').style.height = window.innerHeight -$$.vars.heightOffset * 1.5 + 'px';
  },
  generateHeaders : function(link){
              return fetch(link).then( x=> { true;
                    let ARR = [];
                    for(let [key, value] of x.headers)  ARR.push(`${key} = ${value}`);

                    return ARR;   //GET ARR BACK
               });
  },
  readHeaders : function(){
                let promise = $$.generateHeaders($$.vars.FILE);
                promise.then( arr=> {
                    let mod = null;
                      for(let i = 0; i < arr.length;i++){
                        if(arr[i].includes('last-modified')) mod = arr[i]; break;
                      }
                      if(mod == null) return false; //SAFE EXIT
                      let date = mod.split('=')[1].replace('GMT','');
                      qu('.modified-date').innerText = date;
                });
  },
  //SEND REQUEST TO PHP
  php_request : async function(content, callback ){
                  let xr = new XMLHttpRequest();
                  let link = location.href;
                  let url =  link + "./transmiter.php"; //NOW DONT CHANGE WHEN LIVE
                  xr.open("POST", url, true);
                  xr.setRequestHeader("Content-Type", "application/json");
                     xr.onreadystatechange = function () {
                        if(xr.readyState == 4 && xr.status === 200) {
                                // console.log('%c ->ok', 'color: darkcyan'); //ALL GOOD
                                $$.vars.RESPONSE = xr.responseText;
                                if(typeof callback != "undefined") callback();
                      }else return false;   // console.log('%c _', 'color:crimson'); //REJECTED
                   }
                  //ALL DATA PASSED TO PHP SHOULD BE stringify IF STRING (NUMBERS CAN BE PASSED DIRECTLY)
                  let data = JSON.stringify(content);
                  await xr.send(data);
                },
  scrollIntoView : function(el){
      setTimeout( t=> el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }), .7 * 1000);  //CHECK IF WORKS
  },
  saveToLocal   : (name, data, action)=> { localStorage.setItem(name, data);  if(action != null) action(); },
  pullFromLocal : (name)=> localStorage.getItem(name),
  checkLocal    : (name)=> (localStorage.getItem(name) != null) ? localStorage.getItem(name) : null,
  deleteLocal   : (name, action)=> { localStorage.removeItem(name);  if(action != null) action(); },

  local_request : function(mode, name){
       switch(mode){
               case 'save':    $$.saveToLocal(name, JSON.stringify($$.vars.LISTE), action=> {
                                    $$.animate(qu('.sub-list'), 'understood ease-out', 1.5);
                                    $$.vars.RESPONSE = $$.vars.LISTE;
                               });
               break;
               case 'delete':  $$.deleteLocal(name,  acion=> { $$.animate(doc.body, 'shake', 0.25); location.reload();  });          break;
               case 'get':
                            let checked = $$.checkLocal(name);
                            (checked != null) ? $$.vars.LISTE = JSON.parse(checked) : $$.vars.LISTE = {};   break;
       }
  },
  checkServer : async function(){
        let promise = await $$.generateHeaders('../');
            for(let i = 0; i<promise.length;i++){
              if(promise[i] && promise[i].search(/PHP/gi) > -1) $$.vars.SERVER = 'PHP';
              else                                              $$.vars.SERVER = 'null';
            }
    if($$.vars.SERVER == 'PHP') $$.fetchAndParse('list.json');
    else                        $$.local_request('get', 'mnemonic-liste');
  },
  quickDragOverHandler : (e) => { e.preventDefault(); },
  quickDragEnter : async e => {
          e.preventDefault();
          e.stopPropagation();
          if(e.target.classList.contains('to-edit') == false) return false;
          e.target.classList.add('net');
  },
  quickDragLeave : e => { e.target.classList.remove('net') },
  //QUICK DROP OF ELEMENT TO GET DATA ON QUICKMENU[RIGHT MOUSE CLICK]
  quickDropHandler : function(e) {
          e.preventDefault();
          e.target.classList.remove('net');

          let newFile = e.dataTransfer.files[0]; //FILE;
          if(newFile == null ) return false;
          if(e.target.classList.contains('to-edit') == false) return false; //only allow on to-edit

          let reader = new FileReader();

          if(newFile.type.search('text') < 0) return $$.notification('Wrong file format.\nOnly text files.');
          if(newFile) $$.whenLoaded(reader, newFile, e );
  },
  whenLoaded : function(that, file, dropEvent ){
            //APPEND
           that.addEventListener('load', ()=>{
              let _type= file.name;

              dropEvent.target.innerText = that.result;
              $$.adjustTextSizePerLength(dropEvent.target);
              $$.updateListState(dropEvent.target, that.result);
           });
             //READ
             if(file) { that.readAsText(file); } //RESET BORDER WHEN LOADED  //ONCE IN, REVEAL IT
  },
  notification : function(text, action){
       let noti = $$.query.noti;
           noti.textContent = text;
       show_this(noti, 'block');
       // if(action && typeof action === 'function') action(); //IMIDIATLY invoked action if passed

       setTimeout(t=> show_this(noti, 'none'), 5 * 1000);
  },
  createPresets : function(){
       let preset_holder = dce('select');
           preset_holder.name = 'presets';
           preset_holder.classList.add('preset-holder');

        //ADD DISABLED OPTION
        let first_option = dce('option');
            first_option.classList.add('preset');
            first_option.value = '';
            first_option.disabled = true;
            first_option.selected = true;
            first_option.innerText = 'presets';
            preset_holder.appendChild(first_option);
       //ADD PRESETS
       let Ok = Object.keys(PRESETS);
       for(let i = 0; i < Ok.length; i++){
           let option = dce('option');
               option.classList.add('preset');

           let preset_name    = Ok[i];
           let preset_content = PRESETS[preset_name];

               option.value = preset_content;
               option.innerText = preset_name;
               preset_holder.appendChild(option);
       }
       qu('.top-form').appendChild(preset_holder);
       //PRESET EVENT
       preset_holder.addEventListener('input', e=>{
           $$.addTask();
           let all_edits = quAll('.to-edit');
           let last_to_edit = all_edits[all_edits.length-1];
               last_to_edit.innerText = e.target.value;
           $$.adjustTextSizePerLength(last_to_edit, 2);
           $$.scrollIntoView(quAll('.sub-li')[quAll('.sub-li').length-1] );
           quAll('.preset')[0].selected = true; //Return back to default
       });
  },
} //END OF $$ACI OBJECT

const main = function(){
    $$.checkServer();   //IMIDIATLY CHECK IF PHP IS THERE SO WE CAN USE IT OR STICK WITH localStorage
    $$.collectQuery();
    $$.addTaskColoring();
    $$.createPresets();
    window.addEventListener('mousedown', e=>{
         if(e.target.classList.contains('to-edit') == false && e.detail > 1){ e.preventDefault(); }// Prevents selection on double-click and beyond, but not on to-edit field

         let the_class = e.target.classList[0];
         let inc = 0;
         let parentElement = e.target.parentElement;
         let EditField = parentElement.parentElement.querySelector('.to-edit');
         switch(the_class){
               case "plus-list":   $$.addList();              break;
               case "plus-task":   $$.addTask();  $$.scrollIntoView(quAll('.sub-li')[quAll('.sub-li').length-1] );  break;
               case "back":        $$.switchTO('main-div');   $$.referenceTasksPerList();  break;
               case 'reload':      location.reload(); break;
               case 'save':
                           if($$.vars.SERVER == 'PHP') { $$.php_request($$.vars.LISTE , php=> $$.animate(qu('.sub-list'), 'understood ease-out', 1.5) ); log('php');}
                           else                        { $$.local_request('save', 'mnemonic-liste'); log('js'); }
               break;
               case 'delete':
                            if($$.vars.SERVER == 'PHP') $$.php_request("{}" , php=> { $$.animate(doc.body, 'shake', 0.25); location.reload(); });
                            else                        $$.local_request('delete', 'mnemonic-liste');
               break;  //transmit EMPTY OBJECT aka delete
               case 'view':        $$.changeView();           break;

               case 'sub-li': case 'to-edit':
                      if(e.target.nodeName == "LI"){
                        $$.vars.activeTask = e.target.getAttribute('data');
                      }else{
                        $$.vars.activeTask = e.target.parentElement.getAttribute('data');
                      }
               break;
               case 'is-done':  //SET DONE
                     inc = parentElement.getAttribute('data');
                     let status = 'done';

                     if(parentElement.querySelector('.to-edit').classList.contains('done')) $$.taskIs('', e.target);
                     else                                                                   $$.taskIs(status, e.target);

                     let the_list = $$.vars.LISTE[$$.vars.activeListName][ inc ];
                     if(the_list) the_list.status = status;
               break;
               case 'delete-task':  //DELETE TASK
                    inc = parentElement.getAttribute('data');
                    parentElement.style.background = 'indianred';
                    $$.animate(parentElement, 'deletedFromRight linear forwards', .66, true);
                    delete $$.vars.LISTE[$$.vars.activeListName][ inc ];
               break;
               case 'cal-task': e.target.style.opacity = (e.target.style.opacity === '0') ? '1' : '0'; break; //HIDE CAL if not needed by user
               case 'pre-task':
                    if(parentElement.parentElement.classList.contains('pre-struct') == false){
                       parentElement.parentElement.classList.add('pre-struct');
                    }else parentElement.parentElement.classList.remove('pre-struct');
               break;

               case 'delete-sub-list':   //DELETE LIST
                    parentElement.style.background = 'indianred';
                    $$.animate(parentElement, 'deletedFromRight linear forwards', .66, true);  //true is remove();
                    delete $$.vars.LISTE[ parentElement.getAttribute('data') ]; //NEWLY FORMED TASK OBJECT
               break;

               case 'list-name': //OPEN LIST
                   $$.vars.activeListName = e.target.parentNode.getAttribute('data');
                   $$.switchTO('sub-div');
               break;
               case 'copy-task':
                     $$.copyEvent(e.target, EditField.textContent);
               break;
           }
         $$.autoShow();
     });
     window.addEventListener('dblclick', e=>{
         let cl = e.target.classList[0];
         switch(cl){
           case 'sub-li':
                 if(e.target.parentElement.classList.contains('table-view') == false) return false;
                 $$.extendGridTableColumn(e.target);
           break;
         }

     });

     window.addEventListener('DOMContentLoaded', e=> {

                                                       $$.resizeList();
                                                       $$.readHeaders();
                                                           setTimeout( t=> {
                                                             $$.autoShow();
                                                             $$.recreateLists($$.vars.LISTE);
                                                             $$.addReorderDropZone(qu('.sub-list'));
                                                             $$.referenceTasksPerList();
                                                           }, .5* 1000);  //be late
                                                     });
     window.addEventListener('resize', e=> $$.resizeList() );

     Object.freeze($$);  //FREEZE FOREVER

}

main();

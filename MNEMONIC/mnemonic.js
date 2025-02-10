const doc = document,
      log   = (...x)=> console.log(x),
      dce   = (x)=>    doc.createElement(x),
      qu    = (Q)=>    doc.querySelector(Q),
      quAll = (Q)=>    doc.querySelectorAll(Q),
      show_this = (it, mechanism)=> { (mechanism) ? it.style.display = mechanism || 'block' : it.style.display = 'none'; }; //EXAMPLE OF USING THIS FUNC      show_this( invertory_holder, true/false )

const $$ = {
  vars : {
      heightOffset : 85,
      RESPONSE : null,
      LISTE : {},
      activeListName : null,
      FILE : 'list.json',
      colors  : ['', '--mint', '--teal','--babyBlue','--magicMint','--earth','--lavander','--beige', '--softGold'],
  },
  query : {},
  collectQuery : function(){
          $$.query = {
              container : qu('.container'),
              mainDiv   : qu('.main-div'),
              subDiv    : qu('.sub-div'),
              mainList  : qu('.main-list'),
              subList   : qu('.sub-list'),
            }
          },
  taskIs : function(state, el ){
            let myTask = el.parentElement.querySelector('.to-edit');
             switch(state){
               case 'done':  el.innerText = '◼︎';  myTask.classList.add('done');     break;
               default :     el.innerText = '◻︎';  myTask.classList.remove('done');  break;
             }
          return state;
  },
  updateListState : function(e, data){
        let inc = e.target.parentElement.getAttribute('data');
        if( $$.vars.LISTE[$$.vars.activeListName][ inc ] == null)  $$.vars.LISTE[$$.vars.activeListName][ inc ] = {}; //if it does not exist create new

        $$.vars.LISTE[$$.vars.activeListName][ inc ].content = data || e.target.innerText; //data is used when droping file
  },
  //TASK inside LIST[?]...
  addTask : function(OK, content, status){
          let li = dce('li');
              li.classList.add('sub-li');
              inc = quAll('.sub-li').length || 0;

              li.setAttribute('data', inc);
          let text_div = dce('div');
              text_div.classList.add('to-edit');
              text_div.setAttribute('contenteditable', true);

              text_div.addEventListener('paste', $$.onlyPlainText);

              if(OK == null) text_div.innerText = '/';
              else           text_div.innerText = content;

              //REMEMBER CONTENT
              text_div.addEventListener('keyup', $$.updateListState );

              text_div.addEventListener('drop',      $$.quickDropHandler     );
              text_div.addEventListener('dragover',  $$.quickDragOverHandler );
              text_div.addEventListener('dragleave', $$.quickDragLeave       );
              text_div.addEventListener('dragenter', $$.quickDragEnter       );

              // STATUS OF TASK, DONE or NOT
          let square = dce('span');
              square.innerText = '◻︎';
              square.classList.add('is-done');

              square.addEventListener('mousedown', e=>{
                     inc = li.getAttribute('data'); //RESET
                     let status = 'done';
                     if(text_div.classList.contains('done')) $$.taskIs('', square);
                     else                                    $$.taskIs('done', square);

                  $$.vars.LISTE[$$.vars.activeListName][ inc ].status = status;
              });
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
                 let myToEdit = e.target.parentElement.parentElement.querySelector('.to-edit');
                     myToEdit.style.background = (colorIs == '') ? '' : `var(${colorIs})`;
                 inc = parseInt( myColors.parentElement.getAttribute('data'));
                 // $$.updateListState(myColors, myToEdit.innerText );
                 if( isNaN(inc) == false && $$.vars.LISTE[$$.vars.activeListName][ inc ] == null) {
                     $$.vars.LISTE[$$.vars.activeListName][ inc ] = {};
                     if( myToEdit.innerText.length > 1 ) $$.vars.LISTE[$$.vars.activeListName][ inc ].content =  myToEdit.innerText;   //ALTERNATIVE TO UPDATE LIST STATE
                 }
                 if($$.vars.LISTE[$$.vars.activeListName][ inc ] != null) $$.vars.LISTE[$$.vars.activeListName][ inc ].color = colorIs;
              });

              //AUTO RECOGNIZE ALREADY SET COLOR, when RECREATING TASK
              let colorWas = $$.vars.LISTE[$$.vars.activeListName][ inc] != null ? $$.vars.LISTE[$$.vars.activeListName][ inc ].color : '';
              text_div.style.background = (colorWas == '') ? '' : `var(${colorWas})`;

          let del = dce('span');
                  del.innerText = '⤬';
                  del.classList.add('delete-me');
                  //DELETE TASK
                  del.addEventListener('mousedown', e=>{
                      inc = li.getAttribute('data');
                      li.style.background = 'indianred';
                          $$.animate(li, 'deletedFromRight linear forwards', .66, true);
                          delete $$.vars.LISTE[$$.vars.activeListName][ inc ];
                  });
            li.appendChild(square);
            li.appendChild(myColors);
            li.appendChild(text_div);
            li.appendChild(del);

            $$.adjustTextSizePerLength(text_div);

         //INIT
         $$.query.subList.appendChild(li);

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
            list_name_span.innerText = data || possible_name;

            let micro_holder = dce('div');
            micro_holder.classList.add('micro-holder');

            li.setAttribute('data', data || possible_name );
            let del = dce('span');
                del.innerText = '⤬';
                del.classList.add('delete-me');
                //DELETE LIST
                del.addEventListener('mousedown', e=>{
                    li.style.background = 'indianred';
                    $$.animate(li, 'deletedFromRight linear forwards', .66, true);  //true is remove();
                    delete $$.vars.LISTE[ li.getAttribute('data') ]; //NEWLY FORMED TASK OBJECT
                });
            li.appendChild(list_name_span);
            li.appendChild(micro_holder);
            li.appendChild(del);
            //OPEN LIST
            list_name_span.addEventListener('mousedown', e=>{
                $$.vars.activeListName = e.target.parentNode.getAttribute('data');
                $$.switchTO('sub-div');
            });
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
  adjustTextSizePerLength : function(el){
         let text = el.innerText;
         let ratio = (350 / text.length) * 100;
         if(ratio > 40) ratio = 40; //dont make it grande
         if(ratio < 12) ratio = 12; //dont make it tiny
         el.style.fontSize = ratio + 'px';
  },
  changeView : function(){
        //find active sub-list
        let sub_lists = quAll('.sub-list');
        let list_with_children = null;
        for(let i = 0; i<sub_lists.length; i++){
          if(sub_lists[i].children.length > 0) {list_with_children = sub_lists[i]; break;}
        }
        // CHANGE VIEW
        if(list_with_children.classList.contains('grid-view')) list_with_children.classList.remove('grid-view');
        else                                                   list_with_children.classList.add('grid-view');
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
                micro.innerText = '·';
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
  //SUB LIST IS RE-READ FROM LISTE OBJECT   [different from addTask so it must be reimplemented]
  recreateTasks : function(){
               let active_list_name = $$.vars.activeListName;
               let Ob = $$.vars.LISTE[active_list_name];
                    let OK = Object.keys(Ob); //['A', 'B']
                    let OV = Object.values(Ob); //[{}, {}]
                    for(let i =0; i< OK.length; i++){
                        $$.addTask(OK[i], OV[i].content, OV[i].status );     //OK[i].split(/\s/)[1]
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
                                qu('.sub-list').innerHTML = '';
              break;
              case 'sub-div':   show_this( qu('.main-div'), 'none' );
                                show_this( qu('.sub-div'), 'block' );
                                if(typeof $$.vars.LISTE == 'object' &&
                                   Object.keys($$.vars.LISTE[$$.vars.activeListName]).length > 0) $$.recreateTasks();
              break;
            }
  },
  autoShow : function(){
          let ML = qu('.main-list').children, SL = qu('.sub-list').children
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
              qu('.sub-list').style.height  = window.innerHeight -$$.vars.heightOffset + 'px';
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
          // log(e);
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

          if(newFile.type.search('text') < 0) return $$.popover('Wrong file format.\nOnly text files.');
          if(newFile) $$.whenLoaded(reader, newFile, e );
  },
  whenLoaded : function(that, file, dropEvent ){
                //APPEND
               that.addEventListener('load', ()=>{
                  let _type= file.name;

                  dropEvent.target.innerText = that.result;
                  $$.adjustTextSizePerLength(dropEvent.target);
                  $$.updateListState(dropEvent, that.result);
               });
                 //READ
                 if(file) { that.readAsText(file); } //RESET BORDER WHEN LOADED  //ONCE IN, REVEAL IT
  },
  popover : (newContent, disappear, action)=>  {
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

          pop.addEventListener('click', e=>{
            // log('he literally clicked me...');
            if(action){
               action();
            }
          });
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
           $$.adjustTextSizePerLength(last_to_edit);
           $$.scrollIntoView(quAll('.sub-li')[quAll('.sub-li').length-1] );
           quAll('.preset')[0].selected = true; //Return back to default
       });
  }
} //END OF $$ACI OBJECT

const main = function(){
    $$.checkServer();   //IMIDIATLY CHECK IF PHP IS THERE SO WE CAN USE IT OR STICK WITH localStorage
    $$.collectQuery();
    $$.createPresets();
    window.addEventListener('mousedown', e=>{
         let the_class = e.target.classList[0];
          switch(the_class){
               case "plus-list":   $$.addList();              break;
               case "plus-task":   $$.addTask();  $$.scrollIntoView(quAll('.sub-li')[quAll('.sub-li').length-1] );            break;
               case "back":        $$.switchTO('main-div');   $$.referenceTasksPerList();  break;
               case 'save':
                                   if($$.vars.SERVER == 'PHP') { $$.php_request($$.vars.LISTE , php=> $$.animate(qu('.sub-list'), 'understood ease-out', 1.5) ); log('php');}
                                   else                        { $$.local_request('save', 'mnemonic-liste'); log('js'); }
               break;
               case 'delete':
                                  $$.popover('Confirm delete action by clicking me', 5000, action=>{
                                     if($$.vars.SERVER == 'PHP') $$.php_request("{}" , php=> { $$.animate(doc.body, 'shake', 0.25); location.reload(); });
                                     else                        $$.local_request('delete', 'mnemonic-liste');
                                  });
               break;  //transmit EMPTY OBJECT aka delete
               case 'view':        $$.changeView();           break;
           }
         $$.autoShow();
     });

     window.addEventListener('DOMContentLoaded', e=> {
                                                       $$.resizeList();
                                                       $$.readHeaders();
                                                           setTimeout( t=> {
                                                             $$.autoShow();
                                                             $$.recreateLists($$.vars.LISTE);
                                                             $$.referenceTasksPerList();
                                                           }, .5* 1000);  //be late
                                                     });
     window.addEventListener('resize', e=> $$.resizeList() );

     Object.freeze($$);  //FREEZE FOREVER

}

main();

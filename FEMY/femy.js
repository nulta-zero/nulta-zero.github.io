"use strict";
const doc = document,
      log   = (...x)=> console.log(...x),
      dce   = (x)=>    doc.createElement(x),
      qu    = (Q)=>    doc.querySelector(Q),
      quAll = (Q)=>    doc.querySelectorAll(Q),
      appendAll = (arr, parent)=> arr.map( x=> parent.appendChild(x) ),
      randomize = (to)=> Math.floor(Math.random() * to),
      escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      show_this = (it, mechanism)=> { (mechanism) ? it.style.display = mechanism || 'block' : it.style.display = 'none'; }; //EXAMPLE OF USING THIS FUNC      show_this( invertory_holder, true/false )

const $$ = {
  vars : {
      notiAction : null,
      mouse : {x:0, y:0},
      heightOffset : 85,
      SESSION_HISTORY : {},
      RESPONSE : null,
      LISTE : {},
      activeListName : null,
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
      },
      marker_color_is : 'yellow',
      markerColors    : ['yellow', 'pink', 'green', 'orange'],    //['#fffacd', '#ff149370', '#a8fbba'],
      MARKER : false,
      MOUSEDOWN : false,
  },
  query : {},

  collectClasses : function(){
    const classCounts = {};
      // 1. Grab every element with a class and count them
      document.querySelectorAll('[class]').forEach(el => {
        el.classList.forEach(className => {
          classCounts[className] = (classCounts[className] || 0) + 1;
        });
      });

      // 2. Filter for classes that appear exactly 1 time
      const originalUniqueClasses = Object.keys(classCounts).filter(
        className => classCounts[className] === 1
      );

      return originalUniqueClasses;
  },
  collectQuery : function(){
      let arr = $$.collectClasses();
      for(let i=0; i<arr.length; i++){
          if(arr[i].search('no-') > -1) continue;
          let name = arr[i].search('-') > -1 ? arr[i].replaceAll('-', '_') : arr[i];
          $$.query[name] = qu('.'+arr[i]);
      }
  },
  getIndex : (el)=> parseInt(el.getAttribute('data')) || 0,
  taskIs : function(state, el){
            let sub_li = el.parentElement;
            let myTask = sub_li.querySelector('.to-edit');
             switch(state){
               case 'done':  el.innerText = '◼︎';  sub_li.setAttribute('done', true);   break;
               default :     el.innerText = '◻︎';  sub_li.removeAttribute('done');  break;
             }
             $$.fullListUpdate();
          return state;
  },
  updateListState : function(provided, data){
        let inc = provided.parentElement.getAttribute('data') || 0;
        if( $$.vars.LISTE[$$.vars.activeListName][ inc ] == null)  $$.vars.LISTE[$$.vars.activeListName][ inc ] = {}; //if it does not exist create new

        $$.vars.LISTE[$$.vars.activeListName][ inc ].content = data || provided.querySelector('.to-edit').textContent; //data is used when droping file
  },
  getMarkCoordinates : function(editor) {
    const marks = [];
    let currentTextLength = 0;

    // TreeWalker only looks at Text nodes and <mark> elements
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

    let node;
    while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Add length of plain text to our counter
            currentTextLength += node.textContent.length;
        } else if (node.tagName === 'MARK') {
            // Found a mark! Its start is the current count
            const start = currentTextLength;
            const textInside = node.textContent;
            const end = start + textInside.length;

            marks.push({ start, end });

            // Crucial: The TreeWalker will now enter the text inside the <mark>.
            // We don't add to currentTextLength here because the next loop
            // will catch the text node INSIDE the mark and add it there.
        }
    }
    return marks;
  },
  markerDataMap : function(el){
        let marks = el.querySelectorAll('mark');
        if(marks.length === 0) return '';
        let output = {};
        let markersPos = $$.getMarkCoordinates(marks[0].parentElement);
        for(let i = 0; i<marks.length; i++){
            output[i] = {};
            output[i].class      = marks[i].classList[0];
            output[i].startIndex = markersPos[i].start;
            output[i].endIndex   = markersPos[i].end;
        }
        return output;
  },
  fullListUpdate : function(){
        let list = $$.vars.LISTE[$$.vars.activeListName];
        let arr  = quAll('.sub-li');
        for(let i=0; i<arr.length; i++){
            if(list[i] == null) list[i] = {};
            list[i].content = arr[i].querySelector('.to-edit').innerText;  //$$.htmlToContent(
            list[i].color   = arr[i].style.background.replaceAll(/var\(|\)/gi, '');
            list[i].size    = arr[i].style.gridColumn;
            list[i].status  = arr[i].querySelector('.to-edit').classList.contains('done') ? 'done' : '';
            list[i].pinned  = arr[i].parentElement.classList.contains('planner-field') ? arr[i].parentElement.getAttribute('slot') : '';
            list[i].markers = $$.markerDataMap(arr[i].querySelector('.to-edit'));
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
  checkSelection : function(){
        const selection = window.getSelection();
        // Check if text is currently selected within this element
        if(selection.toString().length > 0)  return true;
  },
  addReorderDrag : function(item, zone){
        // On the draggable item
        item.addEventListener('dragstart', e => {
          if(item.classList.contains('full-screen')) { e.preventDefault(); return false; }
          if( $$.checkSelection() ){ e.preventDefault(); return false;   }
          if(e.target.classList.contains('sub-li') == false) return false;
             e.dataTransfer.effectAllowed = 'move';
             $$.vars.dragged.source.item  = e.target;
             $$.vars.dragged.source.index = e.target.getAttribute('data');
             // e.dataTransfer.setDragImage($$.vars.dragged.source.item, 25, 25);
             $$.deepCloneDraggedImage(e);
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
  // ISOLATES DRAGGED IMAGE, SO ONLY element is dragged not parent parts
  deepCloneDraggedImage : function(e){
          let item = e.target;
          const dragPreview = item.cloneNode(true);

          // 2. Inject explicit standalone styling to prevent invisible text
          dragPreview.style.width = `${item.offsetWidth}px`;
          dragPreview.style.height = `${item.offsetHeight}px`;
          dragPreview.style.backgroundColor = window.getComputedStyle(item).backgroundColor || '#ffffff';
          dragPreview.style.listStyle = 'none'; // Strips default bullets
          dragPreview.style.margin = '0';

          // 3. Move off-screen but keep visible in DOM for the browser to capture
          dragPreview.style.position = 'absolute';
          dragPreview.style.top = '-9999px';
          dragPreview.style.left = '-9999px';
          document.body.appendChild(dragPreview);

          // 4. Set the exact coordinates of the mouse click point
          e.dataTransfer.setDragImage(dragPreview, e.offsetX, e.offsetY);

          // 5. Clean up the DOM immediately after the frame renders
          setTimeout( t => {
              dragPreview.remove();
          }, 0);
  },
  addPinDropZone : function(zone){
          zone.addEventListener('dragover', e => e.preventDefault()); // required!
          zone.addEventListener('drop', e => {
              e.preventDefault();
              let dra = $$.vars.dragged;
              dra.target.item  = e.target;
              dra.target.index = e.target.getAttribute('data');
              if(dra.target.item.classList.contains('planner-field') == false ) {    //FINISH THIS
                  e.target.classList.remove('net');
                 return false;  //do nothing on same point drop
              }
              e.target.appendChild(dra.source.item);
              e.target.classList.remove('net');
              $$.adjustTextSizePerLength(dra.source.item.querySelector('.to-edit'), 3); //sub-li is passed here
          });
          zone.addEventListener('dragstart', e => {
              $$.deepCloneDraggedImage(e);
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
              text_div.setAttribute('contenteditable', 'plaintext-only');
          let whiteSpace = qu('.sub-list').classList.contains('table-view') ? '\u200B ' : '\u200B  ';

              if(OK == null) text_div.innerText =  whiteSpace + $$.randomEmoji();
              else           text_div.innerText = content;

              text_div.addEventListener('paste',     $$.onlyPlainText        );
              text_div.addEventListener('drop',      $$.quickDropHandler     );
              text_div.addEventListener('dragover',  $$.quickDragOverHandler );
              text_div.addEventListener('dragleave', $$.quickDragLeave       );
              text_div.addEventListener('dragenter', $$.quickDragEnter       );
              // COMPLEX yet needed event to prevent mark elements to be swaped for font,spans if user deletes all of its content
              text_div.addEventListener('beforeinput', $$.preventMarkSwap);
              text_div.designMode = "on";
              text_div.setAttribute('draggable', false); //prevent dragging from to-edit

              // STATUS OF TASK, DONE or NOT
          let square = dce('div');
              square.innerText = '◻︎';
              square.classList.add('is-done', 'btn');

              //AUTO RECOGNIZE ALREADY SET COLOR, when RECREATING TASK
              let historyTask = $$.vars.LISTE[$$.vars.activeListName][inc];
              let colorWas = historyTask != null ? historyTask.color : '';
              li.style.background = `var(${colorWas})`;

              let sizeWas = historyTask != null ? historyTask.size : '';
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
              preSetup.textContent = "⟛";
          let fullScreen = dce('span');
              fullScreen.textContent = "⇿";
              fullScreen.classList.add('full-screen-mode', 'btn');

              appendAll([square, text_div, del], li);
              appendAll([copyTask, preSetup, calTask, fullScreen], taskMenu);
              li.appendChild(taskMenu);

            $$.adjustTextSizePerLength(text_div);
            $$.addPlanner(Math.floor(window.innerWidth / 200));
            // $$.animate(li, 'slideFromRight', 1);

         //INIT
         $$.query.sub_list.appendChild(li);
         $$.addReorderDrag(li, li.parentElement);

         //RETURN STATUS
         if(status == 'done') $$.taskIs('done', square);
  },
  repinTasks : function(){
         let arr = quAll('.sub-li');
         let LISTE = $$.vars.LISTE[$$.vars.activeListName];
         for(let i = 0;i< arr.length;i++){
             let inc = LISTE[i].pinned;
             let pinField = qu(`[slot="${inc}"]`);
             if(arr[i].querySelector('.to-edit').innerText != LISTE[i].content) continue;  //missmatch, test this
             if(inc != '' && pinField) pinField.appendChild(arr[i]);
         }
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
          $$.query.main_list.appendChild(li);

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
          for(let i = 0; i < $$.vars.colors.length; i++){
              let small_div = dce('div');
              small_div.style.background = `var(${$$.vars.colors[i]})`;
              small_div.setAttribute('color-data' , `${$$.vars.colors[i]}`);
              small_div.classList.add('color-div', 'minimal-btn');
              $$.query.tasks_colors_holder.appendChild(small_div);
          }

          $$.query.tasks_colors_holder.addEventListener('click', e=>{
             let colorIs = e.target.getAttribute('color-data');
             let inc = parseInt($$.vars.activeTask) || 0;

             let tasks = quAll('.sub-li');
                 tasks = new Array(...tasks);
             let task = tasks.filter( x=> x.getAttribute('data') == inc )[0];
               if(task == '') return

                 task.style.background = `var(${colorIs})`;
                 $$.invertColorSameTone(task);

             let ToEdit = task.querySelector('.to-edit');
             if( isNaN(inc) == false && $$.vars.LISTE[$$.vars.activeListName][ inc ] == null) {
                 $$.vars.LISTE[$$.vars.activeListName][ inc ] = {};
                 if( ToEdit.innerText.length > 1 ) $$.vars.LISTE[$$.vars.activeListName][ inc ].content =  ToEdit.innerText;   //ALTERNATIVE TO UPDATE LIST STATE
             }
             if($$.vars.LISTE[$$.vars.activeListName][ inc ] != null) $$.vars.LISTE[$$.vars.activeListName][ inc ].color = colorIs;
          });
  },
  addMarkerColoring : function(){
      let markerColorsHolder = dce('div');
          markerColorsHolder.classList.add('marker-colors-holder');
      let colors = $$.vars.markerColors;
      for(let i = 0; i<colors.length; i++){
          let small_div = dce('div');
          small_div.setAttribute('marker-color-data', `${colors[i]}`);
          small_div.classList.add('marker-color-div', 'minimal-btn', 'marker-'+colors[i] );
          markerColorsHolder.appendChild(small_div);
      }
      $$.query.tools_holder.appendChild(markerColorsHolder);

      markerColorsHolder.addEventListener('click', e=>{
          let colorIs = e.target.getAttribute('marker-color-data');
          $$.vars.marker_color_is = colorIs;
          $$.stripClass(markerColorsHolder.children, 'active');
          qu('.marker-'+colorIs).classList.add('active');
      });
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
  //SUB LIST IS RE-READ FROM LISTE OBJECT   [different from addTask so it must be re-implemented]
  recreateTasks : function(){
               let active_list_name = $$.vars.activeListName;
               let Ob = $$.vars.LISTE[active_list_name];
                    let OK = Object.keys(Ob); //['A', 'B']
                    let OV = Object.values(Ob); //[{}, {}]
                    for(let i =0; i< OK.length; i++){
                        $$.addTask(OK[i], OV[i].content, OV[i].status );     //OK[i].split(/\s/)[1]
                        let markers = Ob[i].markers;
                        if(markers != ''){
                          let markersArr = Object.values(markers);
                          for(let j=0; j<markersArr.length; j++){
                              qu('.marker-color-div.' + markersArr[j].class).click();
                              $$.manuallySelectText(quAll('.sub-li')[i].querySelector('.to-edit'), markersArr[j].startIndex, markersArr[j].endIndex);
                           }
                        }
                    }
                $$.repinTasks();  //if it was pinned, pin again
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
               plannerField.setAttribute('help-text', "Pin any task to planner...");
               $$.disappearingAttribute(plannerField, 'help-text', "Pin any task to planner...");
            }
            if(total === 9){
              plannerField.classList.add('help-field');
              plannerField.setAttribute('help-text', "Double-tap task to expand it (in table view)");
              $$.disappearingAttribute(plannerField, 'help-text', "Double-tap task to expand it (in table view)");
            }
            $$.query.planner_holder.appendChild(plannerField);
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
              case 'main-div':  show_this( $$.query.main_div, 'block' );
                                show_this( $$.query.sub_div, 'none' );
                                show_this( $$.query.sub_list_adjuster, 'none' );
                                $$.fullListUpdate(); //update before you leave
                                qu('.sub-list').innerHTML = '';
                                $$.query.planner_holder.innerHTML = '';
              break;
              case 'sub-div':   show_this( $$.query.main_div, 'none' );
                                show_this( $$.query.sub_div, 'grid' );
                                show_this( $$.query.sub_list_adjuster, 'block' );
                                if(typeof $$.vars.LISTE == 'object' &&
                                   Object.keys($$.vars.LISTE[$$.vars.activeListName]).length > 0) $$.recreateTasks();
              break;
            }
  },
  autoShow : function(){
            let ML = qu('.main-list').children, SL = quAll('.sub-li');
            if(ML.length > 0 && SL.length > 0)  show_this($$.query.sidebar, 'grid');
            else                                show_this($$.query.sidebar, 'none');
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
  tempShakeAnimation : function(el){

          // 1. Find and cancel the existing running animation
          const activeAnims = el.getAnimations();
          activeAnims.forEach(anim => anim.cancel());

          // 2. Play your temporary animation via JS
          const tempAnim = el.animate(
            [ { transform: 'translate(1px, 1px) rotate(0deg)',    offset : 0 },
              { transform: 'translate(-1px, -2px) rotate(-1deg)', offset : 0.1 },
              { transform: 'translate(-3px, 0px) rotate(1deg)',   offset : 0.2 },
              { transform: 'translate(3px, 2px) rotate(0deg)',    offset : 0.3 },
              { transform: 'translate(1px, -1px) rotate(1deg)',   offset : 0.4 },
              { transform: 'translate(-1px, 2px) rotate(-1deg)',  offset : 0.5 },
              { transform: 'translate(-3px, 1px) rotate(0deg)',   offset : 0.6 },
              { transform: 'translate(3px, 1px) rotate(-1deg)',   offset : 0.7 },
              { transform: 'translate(-1px, -1px) rotate(1deg)',  offset : 0.8 },
              { transform: 'translate(1px, 2px) rotate(0deg)',    offset : 0.9 },
              { transform: 'translate(0px, 0px) rotate(0deg)',    offset : 1   }
            ],{ duration: 900, iterations: 1 }
          );

          // 3. Wait for the temporary animation to finish, then safely allow future interactions
          // tempAnim.onfinish = () => {
            // The element is now clear. Future interactions will trigger the original CSS animation fresh.
          // };
  },
  flowAnimation : function(arr){
           arr = arr || quAll('.sub-li:not(.full-screen), .planner-field');
           let i = 0;
           let inter = setInterval( t=>{
               if(i > arr.length-1) { clearInterval(inter); $$.notification('🧡: Saved'); return; }

               if(arr[i] != null) { $$.tempShakeAnimation(arr[i]); }
               i+=1;
            }, 0.1 * 1000);
  },
  resizeList : function(){
              // qu('.sub-list').style.height  = window.innerHeight -$$.vars.heightOffset + 'px';
              qu('.main-list').style.height = window.innerHeight -$$.vars.heightOffset * 1.5 + 'px';
  },
  htmlToContent : function(from){
        let rawHtml = from.innerHTML;
        // Regex to replace <br>, <div> (start of new line), and <p> with \n
        let cleanText = rawHtml
            .replace(/<br\s*\/?>/gi, '\n')      // Replace <br> with newline
            .replace(/<\/div><div>/gi, '\n')    // Replace div gaps with newline
            .replace(/<div>/gi, '\n')           // Handle start of new divs
            .replace(/<[^>]+>/g, '');           // Strip any remaining HTML tags
        return cleanText;
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
               case 'save':
                           $$.fullListUpdate();
                           $$.saveToLocal(name, JSON.stringify($$.vars.LISTE), action=> {
                                $$.flowAnimation();
                                $$.vars.RESPONSE = $$.vars.LISTE;
                           });
               break;
               case 'delete':
                           $$.deleteLocal(name,  acion=> {
                                $$.animate(doc.body, 'shake', 0.25);
                           });
               break;
               case 'get':
                           let checked = $$.checkLocal(name);
                           (checked != null) ? $$.vars.LISTE = JSON.parse(checked) : $$.vars.LISTE = {};   break;
       }
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

          let newFile = e.dataTransfer.files[0];
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
       if(action && typeof action === 'function') $$.vars.notiAction = action; //IMIDIATLY invoked action if passed
       else  $$.vars.notiAction = null;

       setTimeout(t=> show_this(noti, 'none'), 5 * 1000);
  },
  createPresets : function(){
       let preset_selector = dce('select');
           preset_selector.name = 'presets';
           preset_selector.classList.add('preset-selector', 'matrix');
           preset_selector.title = 'PRESETS (templates)';

        //ADD DISABLED OPTION
        let first_option = dce('option');
            first_option.classList.add('preset');
            first_option.value = '';
            first_option.disabled = true;
            first_option.selected = true;
            first_option.innerText = 'p';
            preset_selector.appendChild(first_option);
       //ADD PRESETS
       let Ok = Object.keys(PRESETS);
       for(let i = 0; i < Ok.length; i++){
           let option = dce('option');
               option.classList.add('preset');

           let preset_name    = Ok[i];
           let preset_content = PRESETS[preset_name];

               option.value = preset_content;
               option.innerText = preset_name;
               preset_selector.appendChild(option);
       }
       $$.query.presets_holder.appendChild(preset_selector);
       //PRESET EVENT
       preset_selector.addEventListener('input', e=>{
           $$.addTask();
           let all_edits = quAll('.to-edit');
           let last_to_edit = all_edits[all_edits.length-1];
               last_to_edit.innerText = e.target.value;
           $$.adjustTextSizePerLength(last_to_edit, 2);
           $$.scrollIntoView(quAll('.sub-li')[quAll('.sub-li').length-1] );
           quAll('.preset')[0].selected = true; //Return back to default
       });
  },
  getRandomBetween : function(x, y) {  //you can flip, x=more, y =less
        const min = Math.min(x, y);
        const max = Math.max(x, y);

        // Instantly calculates a valid floored integer in the range
        return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  markerClipDesign : function(mark){
        let map  = { x1:0,y1:0,  x2:100,y2:0,  x3:100,y3:100,  x4:0,y4:100 };
        let vals = Object.values(map);
        let keys = Object.keys(map);

        for(let i=0; i<vals.length; i++){
            let m = vals[i];
            if(m > 90) map[keys[i]] = $$.getRandomBetween(m, m - randomize(2) + 0.5 );
            else       map[keys[i]] = $$.getRandomBetween(m, m + randomize(2) + 0.5 );
        }

        mark.style.clipPath = `polygon(${map.x1}% ${map.y1}%, ${map.x2}% ${map.y2}%, ${map.x3}% ${map.y3}%, ${map.x4}% ${map.y4}%)`;
  },
  // SIMPLE INSPECTION
  inspectSelectionSimple : function(range){
        const clonedContents = range.cloneContents(); // Creates a DocumentFragment

        const tempDiv = dce("div");
              tempDiv.appendChild(clonedContents);

        return tempDiv.innerHTML;
  },
  inspectSelectionComplex : function(){
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return [];

        const range = selection.getRangeAt(0);
        const nodes = [];

        // Set up a walker starting at the common parent of the selection
        const walker = doc.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_ALL, // Looks at both Elements and Text nodes
            {
                acceptNode: function(node) {
                    // Only accept nodes that physically intersect with the user's selection
                    if (range.intersectsNode(node)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );

        let currentNode;
        while (currentNode = walker.nextNode()) {
            nodes.push(currentNode);
        }

        return nodes; // Returns an array of actual Text nodes and Element nodes (like HTMLMarkElement)
  },
  clearOldMarks : function(){
        let inspection = $$.inspectSelectionComplex();
        let filtered = inspection.filter(x => x.nodeName == "MARK");
        if(filtered.length > 0){
          for(let i = 0;i<filtered.length;i++){
              let oldMarkElement = filtered[i];
              oldMarkElement.replaceWith(...oldMarkElement.childNodes);
          }
        }
  },
  attemptedMultilineMarking : function(range){
        range.commonAncestorContainer.normalize();   // Merge split text nodes in the parent container to fix the DOM structure
        const rects = range.getClientRects();
        // Filter out zero-width trailing rectangles caused by linebreaks or white space
        const visibleLines = Array.from(rects).filter(rect => rect.width > 0);
        // If the selection spans more than 1 visible line, abort and return false
        if(visibleLines.length > 1) {
           log($$.vars.MOUSEDOWN);
           if($$.vars.MARKER && $$.vars.MOUSEDOWN ) { log('da ovde'); $$.notification("🧡: Multiline marking is prevented."); }
           return true;
        }
  },
  markSelection : function(e, backend){
        const selection = window.getSelection();
        // Ensure something is actually selected
        if (!selection.rangeCount || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        if( $$.attemptedMultilineMarking(range) ) return false;


        $$.clearOldMarks(); //if existing

        const mark = dce('mark');
        const name = 'marker-'+$$.vars.marker_color_is;
              mark.classList.add(name);
              mark.title = '💜: DOUBLE CLICK ME TO UNMARK';

        if(e){
          if(e.clientX > $$.vars.mouse.x) mark.style.backgroundImage = `linear-gradient(${45}deg, rgb(198 172 172 / 26%), transparent)`;  //toward right marking
          else                            mark.style.backgroundImage = `linear-gradient(${-45}deg, rgb(198 172 172 / 26%), transparent)`;   //toward left marking
        }

        $$.markerClipDesign(mark);  //randomize clip design for human messy effect

        mark.appendChild(range.extractContents()); // Move the selected content inside the <mark> tag
        range.insertNode(mark);                    // Insert the mark tag back into the original spot
        selection.removeAllRanges();               // Optional: Clear selection highlight after marking
   },
   stripMarked : function(e){
        if(e.target.tagName === 'MARK') {
           const markElement = e.target;
           markElement.replaceWith(...markElement.childNodes);    // Replace the <mark> element with its own text (or children)
        }
   },
   captureMouse : function(e, type){
        $$.vars.mouse.x = type == 'offset' ? e.offsetX : e.clientX;
        $$.vars.mouse.y = type == 'offset' ? e.offsetY : e.clientY;
   },
   stripClass : function(arr, className){
        for(let i=0; i<arr.length; i++){
            if(arr[i].classList.contains(className)) arr[i].classList.remove(className);
        }
   },
   unpackVar : function(varName){
        const root = document.documentElement;
        const styles = getComputedStyle(root);

        // 3. Extract the specific variable value
        const value = styles.getPropertyValue(varName).trim();
        return value;
   },
   //# HEX TO RGB
   hexToRGB : function(hex){
               let arr = [];
               for( let i=0; i < hex.length; i++) {
                   if(i % 2 == 1){
                     const splited = hex[i] + hex[i+1];
                     arr.push(parseInt(splited, 16));
                  }
               }
        return arr.join(' ');
   },
   invertColorSameTone : function(el){
        let varName = el.style.background.replaceAll(/var\(|\)/gi, '');
        let hex = $$.unpackVar(varName);
        let rgb = $$.hexToRGB(hex);
        let arr = rgb.split(' ');
            arr = arr.map( x=> parseInt(x));
        let futureRgb = [];
        for(let i=0; i<arr.length; i++){
            switch(i){
              case 0: if(arr[i] > 100) futureRgb[i] = arr[i] - 105;
                      else             futureRgb[i] = arr[i] + 105;  break;
              case 1: if(arr[i] > 150) futureRgb[i] = arr[i] - 100;
                      else             futureRgb[i] = arr[i] + 100;  break;
              case 2: if(arr[i] > 125) futureRgb[i] = arr[i] - 90
                      else             futureRgb[i] = arr[i] + 90;   break;
            }
        }
        el.style.color = `rgb(${futureRgb.join(',')})`;
   },
   preventMarkSwap : function(e){
       const selection = window.getSelection();
       if (!selection.rangeCount) return;

       const range = selection.getRangeAt(0);
       const rangeContainer = range.startContainer;

       // Find if we are inside a <mark> tag
       const mark = rangeContainer.parentElement.closest('mark');

       if (mark && (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward')) {
         // Check if the mark will be empty after this keystroke
         if (mark.textContent.length <= 1) {
           e.preventDefault(); // Stop the browser's default "preservation" logic

           // Manually remove the mark and replace it with an empty text node
           const textNode = doc.createTextNode('');
           mark.parentNode.replaceChild(textNode, mark);

           // Place the cursor exactly where the mark was
           const newRange = doc.createRange();
           newRange.setStart(textNode, 0);
           newRange.collapse(true);
           selection.removeAllRanges();
           selection.addRange(newRange);
         }
       }
   },
  manuallySelectText : function(container, start, end) {
        const range = doc.createRange();
        const sel   = window.getSelection();

        // This helper finds the actual Text Node and local offset
        const startPos = $$.getTextNodeAtOffset(container, start);
        const endPos   = $$.getTextNodeAtOffset(container, end);

        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);

        sel.removeAllRanges();
        sel.addRange(range);

        $$.markSelection();
  },
  // Helper to navigate through child nodes to find the correct Text Node
  getTextNodeAtOffset : function(parent, targetOffset) {
        let currentOffset = 0;
        const walker = doc.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
        let node;

        while (node = walker.nextNode()) {
            const nextOffset = currentOffset + node.length;
            if (targetOffset <= nextOffset) {
                return { node: node, offset: targetOffset - currentOffset };
            }
            currentOffset = nextOffset;
        }
        return { node: parent, offset: 0 };
  },
  setActiveTask : (el)=> $$.vars.activeTask = el.getAttribute('data'),
  exportData : function(){
        //ASSIGN FIRST
        let file = new Blob([JSON.stringify($$.vars.LISTE)], {type: 'txt'});

        //INIT LINK AND URL OBJECT
        let a_link = dce('a');
            a_link.href = URL.createObjectURL(file);

        a_link.download = 'femy_export_'+ $$.seeDate(0).replaceAll(/ +/gi, '_');
        a_link.hidden = true;
        a_link.id = 'linker';
        doc.body.appendChild(a_link);
        //CLICK IT VIRTUALLY
        setTimeout( t=> doc.querySelector('#linker').click(), 0.25 * 1000);
        //CLEAN AFTER YOURSELF
        setTimeout( t=> doc.querySelector('#linker').remove(), 1.5 * 1000);
 },
 //READ UPLOADED FILE
 readUploadedFile : async function(){
         let file = doc.querySelector('#readFile');

         file.onchange = async function(){
              //ALL GOOD NOW CREATE NEW IMAGE ON SCREEN
              let newFile = file.files[0];
              let reader = new FileReader();

               //APPEND
              await reader.addEventListener('load', async ()=>{
                let _type= newFile.name;

                //LOAD BY TYPE
                if(_type.search('.txt') > -1){
                   $$.vars.LISTE = await JSON.parse(reader.result);
                   $$.query.main_list.innerHTML = '';
                   $$.recreateLists($$.vars.LISTE);
                   setTimeout( $$.referenceTasksPerList, 1*1000);
                }else{
                   $$.notification('❤️‍🩹: Failed to load');
                }

                file.value = ""; //CLEAN AFTER YOURSELF
              });
              //READ
              if(newFile) reader.readAsText(newFile);
          };
   },
 importData : function(){
        doc.querySelector('#readFile').click();
        $$.readUploadedFile();
 },
 preserveChangeHistory : function(data){
        let actList = $$.vars.activeListName;
        let actTask = $$.vars.activeTask;
        let history = $$.vars.SESSION_HISTORY;
        if(history[actList] == null) history[actList] = {};

        let dataChange = data || qu(`[data="${actTask}"]`).querySelector('.to-edit').innerHTML;

        if(history[actList][actTask] == null) history[actList][actTask] = [dataChange];
        else history[actList][actTask].push(dataChange);
 },
 loadPreservedHistory : function(){
       let actList = $$.vars.activeListName;
       let actTask = $$.vars.activeTask;
       let history = $$.vars.SESSION_HISTORY;
       // if(history[actList] == null) history[actList] = {};

       let who = qu(`[data="${actTask}"]`).querySelector('.to-edit');

       if(history[actList] != null && history[actList][actTask] != null) {
          let hist = history[actList][actTask];
          let last = hist[hist.length-1];
          if(last == null) return $$.notification('🧡: History empty.');  //nothing inside anymore
          who.innerHTML = last;
          history[actList][actTask].pop();
       }
 },
} //END OF $$ OBJECT

const main = function(){
    $$.local_request('get', 'femy-liste');
    $$.collectQuery();
    $$.addTaskColoring();
    $$.addMarkerColoring();
    $$.createPresets();
    window.addEventListener('mousedown', e=>{
         $$.vars.MOUSEDOWN = true;
         $$.captureMouse(e);
         if(e.target.classList.contains('to-edit') == false && e.detail > 1){ e.preventDefault(); }// Prevents selection on double-click and beyond, but not on to-edit field

         let the_class = e.target.classList[0];
         let inc = 0;
         let parentElement = e.target.parentElement;
         let EditField = parentElement.parentElement?.querySelector('.to-edit');
         switch(the_class){
               case "plus-list":    $$.addList();              break;
               case "plus-task":    $$.addTask();  $$.scrollIntoView(quAll('.sub-li')[quAll('.sub-li').length-1] );    break;
               case "back":         $$.switchTO('main-div');   $$.referenceTasksPerList();  break;
               case 'reload':       location.reload();         break;
               case 'save':         $$.local_request('save', 'femy-liste');   break;
               case 'delete':       $$.local_request('delete', 'femy-liste'); break;  //transmit EMPTY OBJECT aka delete
               case 'export':       $$.exportData();  break;
               case 'import':       $$.importData();  break;
               case 'view':         $$.changeView();  break;
               case 'replacer-mode': ($$.query.replacer.style.display == 'grid') ? show_this($$.query.replacer, 'none') : show_this($$.query.replacer, 'grid'); break;
               case 'undo-history': $$.loadPreservedHistory(); break;

               case 'sub-li': case 'to-edit':
                     if(e.target.nodeName == "LI") $$.setActiveTask(e.target);
                     else                          $$.setActiveTask(e.target.parentElement);
               break;
               case 'is-done':  //SET DONE
                     inc = parentElement.getAttribute('data');
                     let status = 'done';

                     if(parentElement.getAttribute('done') == 'true') $$.taskIs('', e.target);
                     else                                             $$.taskIs(status, e.target);

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
                        $$.adjustTextSizePerLength(EditField, 3);
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
               case 'full-screen-mode':
                     parentElement.parentElement.classList.toggle('full-screen');
                     if(parentElement.parentElement.classList.contains('full-screen')){
                        $$.setActiveTask(parentElement.parentElement);
                     }
               break;
               case 'noti': if($$.vars.notiAction != null && typeof $$.vars.notiAction == 'function') $$.vars.notiAction();  break;
           }
         $$.autoShow();
     });
     window.addEventListener('input', e=>{
         switch(e.target.classList[0]){
           case 'marker-mode':  (e.target.checked) ? $$.vars.MARKER = true : $$.vars.MARKER = false;  break;
         }
         switch(e.target.getAttribute('name')){
           case 'sub-list-pattern':
                 switch(e.target.value){
                   case 'boxes':    $$.query.sub_list.style.backgroundSize = "10px 10px, 220px 200px, 220px 10px"; break;
                   case 'columns':  $$.query.sub_list.style.backgroundSize = "10px 10px, 0px 10px, 220px 10px";    break;
                   case 'cells':    $$.query.sub_list.style.backgroundSize = "10px 10px, 10px 50px, 220px 10px";   break;
                 }
            break;
         }
     });
     $$.query.r_output.addEventListener('keydown', e=>{
           let inputText  = $$.query.r_input.value.trim();
           let outputText = $$.query.r_output.value.trim();
           let toEdit = qu(`[data="${$$.vars.activeTask}"]`).querySelector('.to-edit');
           let newText = null;
           switch(e.key){
               case 'Enter':
                    let regex = new RegExp(escapeRegex(inputText) + "(?=[^>]*?(<|$))", "g");
                    newText = toEdit.innerHTML.replaceAll(regex, outputText);
                    if(newText) {
                      $$.preserveChangeHistory();
                      toEdit.innerHTML = newText;
                    }
               break;
           }
     });
     window.addEventListener('dblclick', e=>{
         let cl = e.target.classList[0];
         switch(cl){
           case 'sub-li':
                 if(e.target.parentElement.classList.contains('table-view') == false) return false;
                 $$.extendGridTableColumn(e.target);
           break;
           // Strip marker
           case 'marker-yellow': case 'marker-pink': case 'marker-green': case 'marker-orange':
                $$.stripMarked(e);
           break;
         }
     });
     window.addEventListener('DOMContentLoaded', e=> {
                               $$.resizeList();
                               $$.autoShow();
                               $$.recreateLists($$.vars.LISTE);
                               $$.addReorderDropZone(qu('.sub-list'));
                               $$.referenceTasksPerList();
                               setTimeout( t=> {$$.animate($$.query.main_list, 'expandHeight', 0.5); doc.body.style.filter = ""; },  1*1000);
                            });
     window.addEventListener('resize', e=> $$.resizeList() );

     // Trigger this on mouseup or a button click
     document.addEventListener('mouseup', e=>{
             if($$.vars.MARKER) $$.markSelection(e);
             $$.vars.MOUSEDOWN = false;
     });

     Object.freeze($$);  //FREEZE FOREVER
}

main();

"use strict";
// Built over a lifetime of choosing not to collapse.
const doc = document,
      log   = (...x)=> console.log(...x),
      dce   = (x)=>    doc.createElement(x),
      qu    = (Q)=>    doc.querySelector(Q),
      quAll = (Q)=>    doc.querySelectorAll(Q),
      appendAll = (arr, parent)=> arr.map( x=> parent.appendChild(x) ),
      randomize = (to)=> Math.floor(Math.random() * to),
      escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      camelCase = (str) => str[0].toUpperCase() + str.slice(1),
      acronym = (str, deli=' ')=> str.split(deli).map(x=> x[0]).join(''),
      show_this = (it, mechanism)=> { (mechanism) ? it.style.display = mechanism || 'block' : it.style.display = 'none'; };

const $$ = {
  vars : {
      mover : {
        holding    : null,
        placing_at : null
      },
      resizeTimer : null,
      notiAction : null,
      mouse : {x:0, y:0},
      heightOffset : 85,
      SESSION_HISTORY : {},
      RESPONSE : null,
      LISTE : {},
      activeListName : null,
      colors  : ['--atomWorkspace','--glassAtomBack','--earth', '--teal','--babyBlue','--magicMint', '--mint','--lavander','--beige', '--softGold',
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
                '--japNoteBlueDark',
                '--japNotePurple',
      ],
      activeTask : null, //will be index

      list_views : {
        index : 0,
        map : {
            0 : 'table-view',
            1 : 'pillar-view',
            2 : 'list-view',
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
  debouncer : function(func){
      clearTimeout( $$.vars.resizeTimer );
      $$.vars.resizeTimer = setTimeout( t => {
          if(typeof func === 'function' ) func();
      }, 250);
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
  collectEditsAndClones : function(from, type){
     let arr = from.querySelectorAll('.to-edit');
     let map = [];
     arr.forEach( x=> map.push(type == 'HTML' ? x.innerHTML : x.innerText) );
     return map;
  },
  fullListUpdate : function(){
        let list = $$.vars.LISTE[$$.vars.activeListName];
        let arr  = quAll('.sub-li');
        for(let i=0; i<arr.length; i++){
            if(list[i] == null) list[i] = {};
            list[i].content = $$.collectEditsAndClones(arr[i], 'text'); //you could grab HTML if needed
            list[i].color   = arr[i].style.backgroundColor.replaceAll(/var\(|\)/gi, '');
            list[i].size    = arr[i].style.gridColumn;
            list[i].status  = arr[i].querySelector('.to-edit').classList.contains('done') ? 'done' : '';
            list[i].pinned  = arr[i].parentElement.classList.contains('planner-field') ? arr[i].parentElement.getAttribute('slot') : '';
            list[i].markers = $$.markerDataMap( arr[i].querySelector('.to-edit') );  //this should collect from all .to-edits ! Fix this!
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
          doc.body.appendChild(dragPreview);

          // 4. Set the exact coordinates of the mouse click point
          e.dataTransfer.setDragImage(dragPreview, e.offsetX, e.offsetY - item.offsetHeight/2 );  //its need this additional offset on Y axis     //+ qu('.planner-holder').getBoundingClientRect().bottom

          // 5. Clean up the DOM immediately after the frame renders
          setTimeout( t => {
              dragPreview.remove();
          }, 0);
  },
  addPinDropZone : function(zone){
          zone.addEventListener('dragover', e => {
            e.preventDefault();  //required
          });
          zone.addEventListener('drop', e => {
              e.preventDefault();
              let dra = $$.vars.dragged;
              dra.target.item  = e.target;
              dra.target.index = e.target.getAttribute('data');
              let attemptedStacking = false;
              let addTo = e.target;
              // CONDENSE SPACE TO PLACE MORE SUB-LI's into planner-field
              if(dra.target.item && dra.target.item.classList.contains('sub-li')){
                 attemptedStacking = true;
                 addTo = e.target.parentElement;
                 e.target.classList.remove('net');
              }
              if(dra.target.item.classList.contains('planner-field') == false && attemptedStacking == false){
                 e.target.classList.remove('net');
                 return false;  //do nothing on same point drop
              }
              addTo.appendChild(dra.source.item);
              // if(addTo.children.length > 2){
                // addTo.classList.add('super-condense');
                $$.condensePlannerField(dra.target.item.parentElement);
              // }
              addTo.classList.remove('net');
              $$.adjustTextSizePerLength(dra.source.item.querySelector('.to-edit'), 3); //sub-li is passed here
              // ASSIGN DATE ON PIN
              $$.addDateToTask(dra.target.item, dra.source.item);
          });
          zone.addEventListener('dragstart', e => {
              $$.deepCloneDraggedImage(e);
              if(e.target.parentElement.classList.contains('super-condense')){
                if(e.target.parentElement.children.length == 3){
                  e.target.parentElement.classList.remove('super-condense');
                }
              }
          });
          zone.addEventListener('dragenter', $$.elementDropEnter );
          zone.addEventListener('dragleave', $$.elementDropLeave );
  },
  addDateToTask : function(holded, placed_at){
         let slot = placed_at.getAttribute('slot');
         let date = $$.seeDate(slot);
             holded.querySelector('.cal-task').textContent = date;
  },
  elementDropEnter : async e => {
          e.preventDefault();
          e.stopPropagation();
          if(e.target.classList.contains('to-edit') == false) return false; //skip this drop on
          e.target.classList.add('net');
  },
  elementDropLeave : e => { e.target.classList.remove('net') },

  reasignIndexes : function(arr){
          arr = arr || quAll('.sub-li');
          for(let i=0;i<arr.length;i++){
              arr[i].setAttribute('data', i);  //this must happen
              // arr[i].querySelector('.cal-task').textContent = $$.seeDate(i);  //reasign calendar also , this is optional
          }
  },
  futureDate : function(days){
          let d = new Date();
          // Add days to the future (milliseconds * seconds * minutes * hours * days)
          return d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  },
  seeDate : (days)=> new Date($$.futureDate(days)).toDateString(), //from today
  //TASK inside LIST[?]...
  addTask : function(blueprint){
          let li = dce('li');
              li.classList.add('sub-li');
          let inc = quAll('.sub-li').length || 0;

              li.setAttribute('data', inc);
          let editableWrapper = dce('div');
              editableWrapper.classList.add('editable-wrapper');
          let text_div = dce('div');
              text_div.classList.add('to-edit');
              text_div.setAttribute('contenteditable', 'plaintext-only');
              text_div.setAttribute('placeholder', 'Start your magical journey here...');
          let whiteSpace = qu('.sub-list').classList.contains('table-view') ? '\u200B ' : '\u200B  ';

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
              let colorWas = (blueprint && blueprint.color != null) ? blueprint.color : '--atomWorkspace';
              li.style.backgroundColor = `var(${colorWas})`;

              if(colorWas == '--glassAtomBack') li.classList.add('glass');

              let sizeWas = (blueprint && blueprint.size != null) ? blueprint.size : '';
              li.style.gridColumn = `${sizeWas}`;

          let del = dce('div');
              del.innerText = '⤬';
              del.classList.add('delete-task', 'btn');

          let taskMenu = dce('div');
              taskMenu.classList.add('task-menu');

          let copyTask = dce('div');
              copyTask.classList.add('copy-task', 'btn');
              copyTask.textContent = "⧉";
              copyTask.title= "COPY TASK CONTENT";
          let duplicate = dce('div');
              duplicate.classList.add('duplicate-task', 'btn');
              duplicate.textContent = "❑²";
              duplicate.title = "DUPLICATE TASK";
          let calTask = dce('div');
              calTask.classList.add('cal-task');  //create just slot
              calTask.textContent = ''; //date;
              calTask.title = "CALENDAR FOR PINED TASKS";
          let preSetup = dce('div');
              preSetup.classList.add('pre-task', 'btn');
              preSetup.textContent = "⟛";
              preSetup.title = "PRE FORMAT";
          let fullScreen = dce('div');
              fullScreen.textContent = "⇿";
              fullScreen.title = "FULL-SCREEN";
              fullScreen.classList.add('full-screen-mode', 'btn');
          let monther = dce('div');
              monther.textContent = '⠾⠿⠇';
              monther.classList.add('monther', 'btn');
              monther.title = "PRINT MONTH CALENDAR TO TEXT";
          let markedList = dce('div');
              markedList.classList.add('marked-list');
              markedList.textContent = "≔";
              markedList.title = "SUM ALL MARKED TEXT";
          let bulletSelection = dce('div');
              bulletSelection.classList.add('bullet-selection');
              bulletSelection.textContent = "✻✻";
              bulletSelection.title = "BULLET THE SELECTION";

              editableWrapper.appendChild(text_div);
              appendAll([square, editableWrapper, del], li);
              appendAll([copyTask, duplicate, preSetup, calTask, monther, markedList, bulletSelection,, fullScreen], taskMenu);
              li.appendChild(taskMenu);

         //INIT
         $$.query.sub_list.appendChild(li);
         $$.addReorderDrag(li, li.parentElement);
         $$.invertColorSameTone(li);

         //RETURN STATUS
         if(blueprint && blueprint.status) $$.taskIs(blueprint.status, square);
         $$.adjustTextSizePerLength(text_div);

        // CONTENT
        if(blueprint == null) text_div.innerText = whiteSpace + $$.randomEmoji();
        else{
          let content = blueprint.content;
          text_div.innerText = content.join('\n');
          if(Array.isArray(content) && content.length > 1) $$.spreadContentToColumns(text_div, content.length-1);
        }
  },
  getLevenshteinDistance : function(a, b) {
          let matrix = [];
          for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
          for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
          for (let i = 1; i <= b.length; i++) {

          for(let j = 1; j <= a.length; j++) {
              if(b.charAt(i - 1) === a.charAt(j - 1)) {
                 matrix[i][j] = matrix[i - 1][j - 1];
              }else{
                 matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
              }
            }
          }
          return matrix[b.length][a.length];
  },
  cleanString : function(str) {
      let cleaned = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      cleaned = cleaned.replace(/[^a-z0-9\s]/g, "");
      cleaned = cleaned.replace(/\b(professional makeup|makeup|cosmetics|london|paris|beauty|naturkosmetik|collection|professionals)\b/g, "");
      return cleaned.replace(/\s+/g, " ").trim();
  },
  findBrand : function(userInput) {
        let cleanInput = $$.cleanString(userInput);
        let inputWords = cleanInput.split(" ");
        let db_brands = MAKEUP_BRANDS;

        for(let i = 0; i < db_brands.length; i++) {
          let currentBrand = db_brands[i];
          let cleanBrand = $$.cleanString(currentBrand);

          if (cleanBrand.length === 0) continue;

          // Step 1: Strict Exact Word Regex Test (Safe from typos)
          let regex = new RegExp("\\b" + cleanBrand + "\\b", "i");
          if (regex.test(cleanInput)) {
            return currentBrand;
          }

          // Step 2: Strict Levenshtein Backup Layer
          for(let w = 0; w < inputWords.length; w++) {
            let currentWord = inputWords[w];

            // Strict Guards: Words must be similar lengths, and must share the same starting letter
            if (currentWord.length < 4 || currentWord[0] !== cleanBrand[0]) continue;

            let distance = $$.getLevenshteinDistance(currentWord, cleanBrand);
            let maxLength = Math.max(currentWord.length, cleanBrand.length);
            let similarity = (maxLength - distance) / maxLength;

            // Must be at least 75% identical to be considered a match
            if(similarity >= 0.75) {
              return currentBrand;
            }
          }
        }
        return null;
  },
  detectLinewithMarkedContent : function(parent, this_mark){
        let marks = parent.querySelectorAll('mark');
        let map = {};
        let arr = parent.innerHTML.split(/<br>|<br\/>|<br \/>/);  //<br>, <br/>, or <br />

        for(let i = 0; i< arr.length; i++){
            if(this_mark == null){
              // FULL SEARCH
                for(let j= 0; j < marks.length; j++){
                    if(arr[i].includes( marks[j].outerHTML)){
                       map[marks[j].innerText] = i;
                    }
                }
            }else{
              // MARKED PROVIDED, limited search
              if(arr[i].includes( this_mark.outerHTML )){
                 map[this_mark.innerText] = i;
              }
            }
        }
        return map;
  },
  detectBrands : function(parent){
        if(parent == null) return;
        let arr = parent.innerHTML.split(/<br>|<br\/>|<br \/>/);
        let brand_map = [];
        for(let i = 0; i< arr.length; i++){
            let brandCosmeticRecognized = $$.findBrand(arr[i]);
            if(brandCosmeticRecognized != null){
               brand_map.push(brandCosmeticRecognized);
            }
        }
        return brand_map;
  },
  generateMarkedList : function(el){
      let marked = el.querySelectorAll('mark');
      let ul = $$.query.for_marked_list_ul;
          $$.clearNode(ul);  //clear old nodes
      for(let i = 0; i< marked.length; i++){
          let li = dce('li');
          let info_span = dce('span');
              info_span.classList.add('info-span');
          let line_map = $$.detectLinewithMarkedContent(marked[i].parentElement, marked[i]);
              li.innerText = marked[i].innerText;
              li.classList.add('marker-list-li');
          info_span.innerText = 'Line:' + line_map[marked[i].innerText];
              li.style.backgroundColor = $$.extractCss(marked[i], 'backgroundColor');
              li.appendChild(info_span);
              if(marked[i].parentElement.getAttribute('clone') === "true"){
                 let info_span_2 = dce('span');
                     info_span_2.classList.add('info-span');
                     info_span_2.textContent = 'Clone';
                     li.appendChild(info_span_2);
              }
          ul.appendChild(li);
      }

     // DETECT ANY COSMETICS USER WROTE, OFFER HEALTH CHECK
      let brand_map = $$.detectBrands(el);
      if(brand_map.length > 0){
        let cosmetics = dce('div');
            cosmetics.textContent = "Cosmetics detected: ";
            cosmetics.title = "Research cosmetics for toxic ingredients";
        for(let i = 0;i< brand_map.length; i++){
            let info_span_3 = dce('a');
                info_span_3.classList.add('info-link');
                info_span_3.textContent = brand_map[i];
                info_span_3.setAttribute('target','_blank');
                info_span_3.href = `https://www.ewg.org/skindeep/search/?search=${ brand_map[i] }`;
                cosmetics.appendChild(info_span_3);
        }
        ul.appendChild(cosmetics);
      }

      show_this(ul.parentElement, 'block');
      ul.parentElement.style.left = $$.vars.mouse.x + 'px';
      ul.parentElement.style.top  = $$.vars.mouse.y+20 + 'px';
      let parentBack = el.style.backgroundColor;
      // log(parentBack);
      ul.parentElement.style.backgroundColor = parentBack;
  },
  extractCss : function(el, property){
      let style = window.getComputedStyle(el);
      return style[property];
  },
  repinTasks : function(){
         let arr = quAll('.sub-li');
         let LISTE = $$.vars.LISTE[$$.vars.activeListName];
         for(let i = 0;i< arr.length;i++){
             let inc = LISTE[i].pinned;
             let pinField = qu(`[slot="${inc}"]`);
             if(arr[i].querySelector('.to-edit').innerText != LISTE[i].content) continue;  //missmatch, test this
             if(inc != '' && pinField) {
                pinField.appendChild(arr[i]);
                // ASSIGN DATE ON PIN
                let date = $$.seeDate(inc);
                    arr[i].querySelector('.cal-task').textContent = date;
              }
         }
  },
  // USE OFFSET if YOU WANT NEXT MONTH OR ANY INLCUDING PREVIOUS  -1,-2, 1,2...
  createMonthTextCalendar : function(offset=0){
       let date = new Date();
       // Month is 0-indexed, so getMonth() + 1 moves to the next month.
       // Day 0 returns the last day of the previous month (the current month).
       let y = date.getFullYear();
       let m = date.getMonth();
       let d = date.getDate();
       const daysInLastMonth = new Date(y, m + offset, 0).getDate();
       const daysInMonth = new Date(y, m + 1+offset, 0).getDate();
       let previousMonthLastDay = new Date(`${y}-${m+offset}-${daysInLastMonth}`);
       let dayName = previousMonthLastDay.toString().split(' ')[0];

       let map = {'Mon' : 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6 };
       let firstWeekSpace = map[dayName];

       let output =`Mo Tu We Th Fr Sa Su\n....................\n`;

       function markToday(x){
           return (x == d) ? '['+x+']' : x.toString();
       }

        // ADD one week from prior month
        for(let j = 0; j<firstWeekSpace; j++){
            output += '   '; //spaces from previous month last week
        }
        let base = 7 - (firstWeekSpace+1);
                       output += daysInLastMonth; //add last day from previous month
        if(base === 0) output += '\n';  //only if 0 IMIDIATLY end week with new line

        for(let i = 1; i<daysInMonth+1; i++){
            switch( i.toString().length){
                 case 2:  output += markToday(i) + ' ';       break;
                 case 1:
                      let today = markToday(i);
                      if(today.search(/\[/gi) > -1) output += today;
                      else                          output += ' ' + today + ' ';
                 break;
             }

         if(i === base) { output += '\n'; continue; }
         if( (i-base) % (7) == 0 & i != 0) output += ' ' + '\n';
        }
        output += '\n';
        return output;
  },
  insertTextAtCursor : function(text) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        let range = selection.getRangeAt(0);
        range.deleteContents();
        let textNode = doc.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
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
              small_div.title = `${camelCase($$.vars.colors[i].replaceAll(/\-/gi, ''))}`;
              $$.query.tasks_colors_holder.appendChild(small_div);
          }
  },
  changeTaskColor : function(e){
      let colorIs = e.target.getAttribute('color-data');
      let inc = parseInt($$.vars.activeTask) || 0;

      // let tasks = quAll(`[data="${inc}"]`);
      let task = qu(`[data="${inc}"]`);
          if(task == '') return

          task.style.backgroundColor = `var(${colorIs})`;
          $$.invertColorSameTone(task);
      // SPECIAL GLASS MODE
      if(colorIs == '--glassAtomBack') task.classList.add('glass');
      else                             task.classList.remove('glass');


      let ToEdit = task.querySelector('.to-edit');
      // if( isNaN(inc) == false && $$.vars.LISTE[$$.vars.activeListName][ inc ] == null) {
      //     $$.vars.LISTE[$$.vars.activeListName][ inc ] = {};
      //     if( ToEdit.innerText.length > 1 ) $$.vars.LISTE[$$.vars.activeListName][ inc ].content =  ToEdit.innerText;   //ALTERNATIVE TO UPDATE LIST STATE
      // }
      if($$.vars.LISTE[$$.vars.activeListName][ inc ] != null) $$.vars.LISTE[$$.vars.activeListName][ inc ].color = colorIs;
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

         if(ratio > 25) ratio = 25; //dont make it grande
         if(ratio < 15) ratio = 15; //dont make it tiny

         el.style.fontSize = ratio + 'px';
  },
  changeView : function(){
         let list_views = $$.vars.list_views;
             list_views.index +=1;
         let map = list_views.map;
         let OK = Object.keys(map);
         if(list_views.index > parseInt(OK[OK.length-1]) ) list_views.index = 0;

         qu('.sub-list').classList.remove('list-view', 'pillar-view', 'table-view');
         let view = list_views.map[list_views.index];
         qu('.sub-list').classList.add(view);
         $$.notification(view);
  },
  referenceTasksPerList : function(){
        let OK = Object.keys($$.vars.LISTE);
        for(let i = 0; i < OK.length; i++){
            let name = OK[i];
            let tasks = Object.values($$.vars.LISTE[name]);

            qu(`[DATA='${name}']`).querySelector('.micro-holder').textContent = '';  //CLEAR OLD
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
                    // let OV = Object.values(Ob); //[{}, {}]
                    for(let i =0; i< OK.length; i++){
                        $$.addTask(Ob[i]);     //OK[i].split(/\s/)[1]
                        let markers = Ob[i].markers;
                        if(markers != ''){
                          let markersArr = Object.values(markers);
                          for(let j=0; j<markersArr.length; j++){
                              $$.vars.MARKER = true;
                              qu('.marker-color-div.' + markersArr[j].class).click();
                              $$.manuallySelectText(quAll('.sub-li')[i].querySelector('.to-edit'), markersArr[j].startIndex, markersArr[j].endIndex);
                           }
                        }
                    }
                $$.repinTasks();  //if it was pinned, pin again
                $$.vars.MARKER = false;
   },
   extendGridTableColumn : function(el, dir=1){
            if(el == null) return false;
            let rowMax = Math.floor(window.innerWidth / 200);
            let index  = Math.floor(el.getBoundingClientRect().x / 200);
            let divider = parseInt(el.getAttribute('extended') || 1);
                divider += (dir || 1);
                divider = divider || 1; //dont let it go bellow 0
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
   clearNode: function(node) {
            if(node == null) return;
            if(node.replaceChildren) return node.replaceChildren();
            while(node.lastChild) {
                  node.removeChild(node.lastChild);
            }
   },
   addPlanner : function(len){
        //FIRST CLEAR OLD ONE
        let oldOccupied = quAll('.planner-field > .sub-li');
        if(oldOccupied.length > 0){
          for(let i = 0; i< oldOccupied.length; i++){
              $$.query.sub_list.appendChild(oldOccupied[i]);  //drop them all to not get destroyed
          }
        }
        $$.clearNode($$.query.planner_holder);  //clear old nodes

        // START BUILDING NEW PLANNER
        let rands = {};
        let helps = ['Double-tap task to expand', "Pin any task to planner...", "Move: ◀︎ ▶︎ ▲ ▼",
                     "\"=shrink, |=expand", "?=hold, shift=place-at", "Esc=Exit full-screen", "Shift=Open full-screen",
                     'Double-tap(2) marked to clear',
                     "Double-double-tap(4) to select entire text",
                     "Tap help=(hide/show)",
                     "Fem-y knows cosmetics brands",
                    ];
        for(let i = 0; i<helps.length; i++){
            rands[Math.floor(Math.random() * len)] = helps[i];
        }

        function implementHelp(to, helpText){
                 to.classList.add('help-field');
                 to.setAttribute('help-text', helpText);
                 $$.disappearingAttribute(to, 'help-text', helpText);
                 to.title = "Click to hide help-text";
        }
        let OK = Object.keys(rands);
        let total = quAll('.planner-field').length;
        for(let i=0; i<len; i++){
            let plannerField = dce('div');

            plannerField.classList.add('planner-field');
            plannerField.setAttribute('slot', total);
            if(rands[i]){
               implementHelp(plannerField, rands[i] );
            }
            $$.query.planner_holder.appendChild(plannerField);
            $$.addPinDropZone(plannerField);
            total = quAll('.planner-field').length;
         }
         $$.determinePlannerHeight();
   },
   //RECREATE LISTS
  recreateLists : function( obj ){
               let OK = Object.keys( obj );
               if(typeof obj != 'object') return false; //SAFE

               for(let i = 0;i<OK.length; i++) { $$.addList(OK[i]); }
   },
   plannerSpace : function(){
         let holder = qu('.planner-holder');
         if(holder == null) return;
         let rows = holder.clientHeight / 200;
         let columns = Math.floor(holder.clientWidth / 200);
         return { rows:rows, columns:columns, total : rows*columns }
  },
  switchTO : function(that){
            switch(that){
              case 'main-div':  $$.fullListUpdate(); //update before you leave, and update first before 'none'
                                show_this( $$.query.main_div, 'block' );
                                show_this( $$.query.sub_div, 'none' );
                                show_this( $$.query.sub_list_adjuster, 'none' );

                                $$.clearNode($$.query.sub_list);  //clear old nodes
                                $$.clearNode($$.query.planner_holder);  //clear old nodes
              break;
              case 'sub-div':   show_this( $$.query.main_div, 'none' );
                                show_this( $$.query.sub_div, 'grid' );
                                show_this( $$.query.sub_list_adjuster, 'block' );
                                let space = $$.plannerSpace();
                                $$.addPlanner(space.total);
                                $$.resizeMovingWindow();
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

          // 2. Temporary animation via JS
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

          // 3. Safely allow future interactions
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
                     (checked != null) ? $$.vars.LISTE = JSON.parse(checked) : $$.vars.LISTE = {};
               break;
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
          if(newFile.type.search('text') < 0)                 return $$.notification('Wrong file format.\nOnly text files.');

          let reader = new FileReader();
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
               option.innerText = acronym(preset_name, '_');
               option.title = preset_name;
               preset_selector.appendChild(option);
       }
       $$.query.presets_holder.appendChild(preset_selector);
  },
  createColumnsMode : function(){
    let columns_selector = dce('select');
        columns_selector.name = 'columns-mode';
        columns_selector.classList.add('columns-selector', 'matrix');
        columns_selector.title = 'EDITABLE COLUMNS';
        //ADD DISABLED OPTION
        let first_option = dce('option');
            first_option.classList.add('columns');
            first_option.value = '';
            first_option.disabled = true;
            first_option.selected = true;
            first_option.innerText = '𐌎';
            columns_selector.appendChild(first_option);
        for(let i = 1; i< 10; i++){
             let option = dce('option');
             option.classList.add('columns');

             option.value = i;
             option.innerText = i;
             columns_selector.appendChild(option);
        }
      $$.query.columns_holder.appendChild(columns_selector);
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
          if($$.vars.MARKER && $$.vars.MOUSEDOWN ) { $$.notification("🧡: Multiline marking is prevented."); }
          return true;
        }
  },
  markSelection : function(e, backend){
        const selection = window.getSelection();
        // Ensure something is actually selected
        if (!selection.rangeCount || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        if(backend == null && $$.attemptedMultilineMarking(range) ) return false;

        $$.clearOldMarks(); //if existing

        const mark = dce('mark');
        const name = 'marker-'+$$.vars.marker_color_is;
              mark.classList.add(name);
              mark.title = '💜: DOUBLE CLICK ME TO UNMARK';

        if(e){
          if(e.clientX > $$.vars.mouse.x) mark.style.backgroundImage = `linear-gradient(${45}deg, rgb(198 172 172 / 26%), transparent)`;  //toward right marking by user
          else                            mark.style.backgroundImage = `linear-gradient(${-45}deg, rgb(198 172 172 / 26%), transparent)`;   //toward left marking by user
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
        let varName = el.style.backgroundColor.replaceAll(/var\(|\)/gi, '');
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
   // USED FOR RE-MARKING of data upon re-creation of tasks, so we pass empty object and true
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

        $$.markSelection({}, true);  //
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
  setActiveTask : function(el){
        $$.stripClass(quAll('.active-task'), 'active-task');
        el.classList.add('active-task');
        $$.vars.activeTask = el.getAttribute('data');
        $$.readColumnsCounter();
  },
  readColumnsCounter : function(){   //old solution, you could now just read clones if any
        let activeLi = quAll('.sub-li')[$$.vars.activeTask];
        if(activeLi != null ){
           let cc = activeLi.getAttribute('columns-counter');
           if(cc) qu('.columns-selector').value = Math.floor(cc);
           else   qu('.columns-selector').value = 1;
        }
  },
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
                   $$.clearNode($$.query.main_list);  //clear old nodes
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

       let who = qu(`[data="${actTask}"]`).querySelector('.to-edit');

       if(history[actList] != null && history[actList][actTask] != null) {
          let hist = history[actList][actTask];
          let last = hist[hist.length-1];
          if(last == null) return $$.notification('🧡: History empty.');  //nothing inside anymore
          who.innerHTML = last;
          history[actList][actTask].pop();
       }
 },
 adjustCssVarible : function(name, newValue){
        const root = document.documentElement;
        root.style.setProperty(name, newValue);
 },
 switchDesignMode : function(mode){
        switch(mode){
           case 'atom':
                 $$.adjustCssVarible('--themeBackground', 'var(--atomWorkspace)');
                 $$.adjustCssVarible('--themeLines', 'var(--atomLines)');
                 $$.adjustCssVarible('--themeColor', 'var(--nextTextColor)');
           break;
           case 'gentle-rose':
                 $$.adjustCssVarible('--themeBackground', 'var(--roseBackground)');
                 $$.adjustCssVarible('--themeLines', 'var(--roseLines)');
                 $$.adjustCssVarible('--themeColor', 'var(--roseText)');
           break;
        }
 },
 resizeSubListBackground : function(e){
       let columnWidth = Math.floor(qu('.sub-list').clientWidth / 200);  //|| 220.8;
       let val = '';

      if(e == null){
         let arr = new Array(...quAll('[name="sub-list-pattern"]'));
             val = arr.filter(x=> x.checked)[0].value;
      }else{
         val = e.target.value;
      }

       switch(val){
         case 'boxes':    $$.query.sub_list.style.backgroundSize = `10px 10px, 220px 200px, calc(100% / ${columnWidth}) 10px`;   break;
         case 'columns':  $$.query.sub_list.style.backgroundSize = `10px 10px, 0px 10px,    calc(100% / ${columnWidth}) 10px`;   break;
         case 'cells':    $$.query.sub_list.style.backgroundSize = `10px 10px, 10px 50px,   calc(100% / ${columnWidth}) 10px`;   break;
       }
 },
 resizeMovingWindow : function(){
       $$.query.moving_window.style.width = qu('.planner-field').clientWidth + 'px';
 },
 forceReflow : function(arr){
    for(let i = 0;i< arr.length;i++){
        let el = arr[i];
        if(el) {
         //force the browser to recalculate column positions
           el.style.display = 'none';
           el.offsetHeight; // Triggers a forced reflow
           el.style.display = 'block';
       }
    }
},
 cornersActions : function(e){
     let m = $$.vars.mouse;
     let limit = 30;
     if(qu('.full-screen') == null) return;  //ONLY IN FULL SCREEN MODE
     if(m.x < limit && m.y > window.innerHeight - limit){
        $$.notification('💜');
        // if(qu('.full-screen') != null) qu('.full-screen').classList.toggle('full-screen');
     }else if(m.x > window.innerWidth - limit && m.y > window.innerHeight - limit){
        $$.notification('🧡');
     }
 },
 splitInnerHTML : function(html, splits){
     let arr = html.split('<br>');
     let segment = Math.floor(arr.length / splits);
     let sliced = [];
     for(let i = 0; i<splits; i++){
         sliced.push( arr.slice(i*segment, (i+1)*segment) );
     }
     return sliced;
 },
 cloneNode : function(originalElement){
     const duplicate = originalElement.cloneNode(true);
          duplicate.setAttribute('clone', true);
     return originalElement.parentNode.insertBefore(duplicate, originalElement.nextSibling);
 },
 spreadContentToColumns : function(originalElement, times){
     let parentWrapper = originalElement.parentElement;
     let clones = parentWrapper.querySelectorAll('[clone="true"]');
     let Data = {
         0 : parentWrapper.querySelectorAll('[contenteditable="plaintext-only"]')[0].innerHTML,
     };
     clones.forEach( (x, i)=> Data[i+1] = x.innerHTML );
     if(clones.length > 0) $$.removeClones(originalElement);

     for(let i = 0; i<times; i++){
         $$.cloneNode(originalElement);
     }
     let OV = Object.values(Data);
     let joined = OV.join('<br>');
     let sliced = $$.splitInnerHTML(joined, times+1);

     let all = parentWrapper.querySelectorAll('[contenteditable="plaintext-only"]');
     for(let i = 0;i< all.length;i++){
         $$.clearNode(all[i]);  //clear old nodes
         all[i].innerHTML = sliced[i].join('<br>'); //update
     }
 },
 removeClones : function(originalElement){
      let parentWrapper = originalElement.parentElement;
      let clones = parentWrapper.querySelectorAll('[clone="true"]');
      for(let i = 0;i< clones.length;i++){
          clones[i].remove();
      }
 },
 trackDoubleClicks : function(e){
     const clickCount = e.detail;
     if(e.target.classList[0] != 'to-edit') return;

     switch(clickCount){
       case 2:  ;  break;  //ordinary double click
       case 4:  $$.notification("Double-double-click detected! (4 clicks) : Selecting entire element text.");  $$.selectText(e.target); break;
       case 6:  ;  break;  //Triple-double-click detected! (6 clicks);
     }
 },
 selectText : function(element) {
      const selection = window.getSelection();    // 1. Get the global selection object
      const range = doc.createRange();      // 2. Create a new visual range
      range.selectNodeContents(element);    // 3. Set the boundaries of the range to cover the element
      selection.removeAllRanges();    // 4. Clear any existing user selections
      selection.addRange(range);  // 5. Apply the new selection to the screen
 },
 movingWindowControls : function(e, control_type){
     if(e.target.nodeName != 'BODY') return;
     let m_win = qu('.moving-window');
     if(qu('.full-screen')) return false;  //dont allow in full-screen
     if(qu('.main-div').style.display == 'block') return false;

     let map = {
         y : m_win.offsetTop,
         x : m_win.offsetLeft,
         h : m_win.clientHeight,
         w : m_win.clientWidth,
         max_rows : Math.floor(window.innerHeight / m_win.clientHeight),
         max_columns : Math.floor(window.innerWidth / m_win.clientWidth),
     }

     let detected = null;
     let mover = $$.vars.mover;

     let minVertical = ()=> { if(map.y < map.h) return m_win.style.top = 0 +'px'; }
     let maxVertical = ()=> { if(map.y >= (map.max_rows-1) * map.h) return m_win.style.top = (map.max_rows-1) * map.h +'px'; }

     let minHorizontal = ()=> { if(map.x < map.w) return m_win.style.left = 0 + 'px'; }
     let maxHorizontal = ()=> { if(map.x >= (map.max_columns-1) * map.w) return m_win.style.left = (map.max_columns-1) * map.w +'px'; }

     switch(control_type){
       case 'movements':
          switch(e.key){
             case 'ArrowUp':     m_win.style.top  = (map.y - map.h) + 'px';  minVertical();    break;
             case 'ArrowDown':   m_win.style.top  = (map.y + map.h) + 'px';  maxVertical();    break;
             case 'ArrowLeft':   m_win.style.left = (map.x - map.w)  + 'px'; minHorizontal();  break;
             case 'ArrowRight':  m_win.style.left = (map.x + map.w)  + 'px'; maxHorizontal();  break;
          }
       break;

       case 'controls':
           switch(e.key){
             case '/':
                   let old = qu('[holded="true"]');
                   if(old) old.removeAttribute('holded'); //remove old if existing
                   $$.underMovingWindow('pick-up');
                   if(mover.holding) mover.holding.setAttribute('holded', true);
             break;
             case 'Shift':
                   $$.underMovingWindow('put-down');
                   if(mover.placing_at != null && mover.holding != null) {
                      $$.moverHandling();
                      mover.holding.removeAttribute('holded');
                      mover.placing_at = null;
                      mover.holding    = null;
                      $$.reasignIndexes();
                    }
                   if(mover.placing_at != null && mover.placing_at.classList[0] == 'sub-li' && mover.holding == null){
                      mover.placing_at.querySelector('.full-screen-mode').click();
                   }
             break;
             case 'Backspace':
                   $$.underMovingWindow('pick-up');
                   if(mover.holding) mover.holding.querySelector('.delete-task').click();

             break;
             case "'":
                   if(qu('.sub-list').classList.contains('table-view') == false) return false;
                   $$.underMovingWindow('pick-up');
                   if(mover.holding) $$.extendGridTableColumn(mover.holding, -1);
             break;
             case "\\":
                   if(qu('.sub-list').classList.contains('table-view') == false) return false;
                   $$.underMovingWindow('pick-up');
                   if(mover.holding) $$.extendGridTableColumn(mover.holding);
             break;
           }
       break;
     }
 },
 condensePlannerField : function(field){
       if(field == null) return;
       if(field.classList.contains('planner-field') && field.children.length > 2){
          field.classList.add('super-condense');
          $$.query.moving_window.classList.add('micro-window');
          $$.query.moving_window.style.top = field.offsetTop + 'px';
       }else{
          field.classList.remove('super-condense');
          $$.query.moving_window.classList.remove('micro-window');
       }
 },
 moverHandling : function(){
      let mover = $$.vars.mover;
      if(mover.placing_at == null && mover.holding == null) return;
      let plannerField = null;

      if(mover.placing_at.classList[0] == 'planner-field'){
        mover.placing_at.appendChild(mover.holding);
        $$.addDateToTask(mover.placing_at, mover.holding);
        $$.condensePlannerField(mover.placing_at);

      }else if(mover.placing_at.classList[0] == 'sub-list'){
        plannerField = mover.holding.parentElement;
        mover.placing_at.appendChild(mover.holding);
        $$.condensePlannerField(plannerField);
      }else if(mover.placing_at.classList[0] == 'sub-li'){
        let sourceIndex = parseInt(mover.holding.getAttribute('data'));
        let targetIndex = parseInt(mover.placing_at.getAttribute('data'));;
        if(sourceIndex < targetIndex) qu('.sub-list').insertBefore(mover.holding, mover.placing_at.nextSibling);
        else                          qu('.sub-list').insertBefore(mover.holding, mover.placing_at);
      }
      // log(mover.placing_at, mover.holding);
 },
 underMovingWindow : function(mode){
     let all = quAll('.sub-li');
     let moving_window = qu('.moving-window');
     let m_win_rect = moving_window.getBoundingClientRect();
     let output = null;
     switch(mode){
       case 'pick-up':
             for(let i = 0; i<all.length; i++){
                 let rect = all[i].getBoundingClientRect();
                 if(m_win_rect.x > rect.x - 10 && m_win_rect.x < rect.x + rect.width - 10 &&
                    m_win_rect.y > rect.y - 10 && m_win_rect.y < rect.y + rect.height - 10){
                    $$.vars.mover.holding = all[i];
                    break;
                 }
             }
       break;
       case 'put-down':
             all = quAll('.planner-field, .sub-list > .sub-li, .sub-list');
             for(let i = 0; i<all.length;i++){
                 let rect = all[i].getBoundingClientRect();
                 if(m_win_rect.x > rect.x - 10 && m_win_rect.x < rect.x + rect.width - 10 &&
                    m_win_rect.y > rect.y - 10 && m_win_rect.y < rect.y + rect.height - 10){
                    $$.vars.mover.placing_at = all[i];
                 }
             }
       break
     }
   return output;
 },
 determinePlannerHeight : function(){
     let sample = qu('.planner-field');
     let rows = Math.ceil( (window.innerHeight/ 2) / sample.clientHeight);
     qu('.planner-holder').style.height = rows * sample.clientHeight + 'px';

     let spaceForSubList = window.innerHeight - (rows * sample.clientHeight);
     qu('.sub-list').style.height = spaceForSubList + 'px';
 },
 findObjectMinMax : function(ob, mode){
     let OV = Object.values(ob);
     let OK = Object.keys(ob);
     let index = null;
     switch(mode){
       case 'max': default:
             let maxIndex = Math.max(...OV);
             index = OV.indexOf(maxIndex);
             return OK[index];
       break;
       case 'min':
             let minIndex = Math.min(...OV);
             index = OV.indexOf(minIndex);
             return OK[index];
       break;
     }
     return index;
 },
 bulletTextSelection : function(){
      let map = {};
      let selection = window.getSelection();
      let sel_text = selection.toString();
      let edit = null;

      if(selection.anchorNode.nodeName == '#text' ) edit = selection.anchorNode.parentElement;
      else if(selection.anchorNode.nodeName == 'DIV' && selection.anchorNode.classList.contains('.to-edit')) edit = selection.anchorNode;

      let selArr = sel_text.split('\n');
          selArr = selArr.filter(x=> x.length > 0 ); //reject empty lines to not found them on every line in double loop
      for(let i=0; i<selArr.length; i++){
          let prep = selArr[i].trim();
          let char = prep[0];
          if(char == "" || char == " " || char == null) continue;
          let code = char.charCodeAt(0);
          if(char && code >= 65) continue; //allow only special chars to be recognized bellow Alphabet
          if(char && code >= 48 && code <= 57 ) { char = 'numbers'; }
          if(map[char] == null) map[char] = 1;
          else map[char] += 1;
      }
      let commonBullet = $$.findObjectMinMax(map, 'max') || '◼︎';
      let arr = edit.innerHTML.split(/<br>|<br\/>|<br \/>/);

      for(let i = 0; i < arr.length;i++){
          for(let j = 0; j< selArr.length;j++){
            if(selArr[j].length < 1 ) continue;
            if(arr[i].includes(selArr[j])){
              let line_arr = arr[i].trim().split(' ');
              if(line_arr[0] != commonBullet && commonBullet != 'numbers') line_arr.unshift(commonBullet);
              if(commonBullet == 'numbers') {
                let line_index = j+1;
                line_arr[0].search(/[0-9]|\S/) > -1 ? line_arr[0] = line_index + '.' : line_arr.unshift(line_index + '.');
               }
              arr[i] = line_arr.join(' ');
            }
          }
      }
      edit.innerHTML = arr.join('<br>');
 }
} //END OF $$ OBJECT

const main = function(){
    $$.local_request('get', 'femy-liste');
    $$.collectQuery();
    $$.addTaskColoring();
    $$.addMarkerColoring();
    $$.createPresets();
    $$.createColumnsMode();

    window.addEventListener('click', e=> {
      let parentElement = e.target.parentElement;
      let grandParent   = parentElement.parentElement;
      let EditField = (parentElement) ? parentElement.parentElement?.querySelector('.to-edit') : null;
      let inc = 0;
      switch(e.target.classList[0]){
              case 'delete-task':  //DELETE TASK
                    inc = parentElement.getAttribute('data');
                    parentElement.style.backgroundColor = 'indianred';
                    $$.animate(parentElement, 'deletedFromRight linear forwards', .66, true);
                    delete $$.vars.LISTE[$$.vars.activeListName][ inc ];
              break;
              case 'is-done':  //SET DONE
                    inc = parentElement.getAttribute('data');
                    let status = 'done';

                    if(parentElement.getAttribute('done') == 'true') $$.taskIs('', e.target);
                    else                                             $$.taskIs(status, e.target);

                    let the_list = $$.vars.LISTE[$$.vars.activeListName][ inc ];
                    if(the_list) the_list.status = status;
              break;
              case 'copy-task':
                    $$.copyEvent(e.target, EditField.textContent);
              break;
              case 'duplicate-task':
                    $$.addTask($$.vars.LISTE[$$.vars.activeListName][grandParent.getAttribute('data')]);
                    $$.fullListUpdate();
              break;
              case 'cal-task': e.target.style.opacity = (e.target.style.opacity === '0') ? '1' : '0'; break; //HIDE CAL if not needed by user
              case 'pre-task':
                    if(grandParent.classList.contains('pre-struct') == false) grandParent.classList.add('pre-struct');
                    else                                                      grandParent.classList.remove('pre-struct');
              break;
              case 'monther':
                    e.preventDefault();
                    $$.insertTextAtCursor( $$.createMonthTextCalendar() );
              break;
              case 'marked-list':
                    $$.generateMarkedList(e.target.parentElement.parentElement);
              break;
              case 'full-screen-mode':
                    grandParent.classList.toggle('full-screen');
                    if(grandParent.classList.contains('full-screen')){
                       $$.setActiveTask(grandParent);
                       show_this( $$.query.moving_window, 'none');
                    }else{
                       show_this( $$.query.moving_window, 'block');
                    }
              break;
              case 'bullet-selection': $$.bulletTextSelection();  break;
              case 'delete-sub-list':   //DELETE LIST
                    parentElement.style.backgroundColor = 'indianred';
                    $$.animate(parentElement, 'deletedFromRight linear forwards', .66, true);  //true is remove();
                    delete $$.vars.LISTE[ parentElement.getAttribute('data') ]; //NEWLY FORMED TASK OBJECT
              break;
              case 'color-div': $$.changeTaskColor(e); break;
      }
      $$.trackDoubleClicks(e);
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
          case 'body': ; break;
        }
    });

    window.addEventListener('mousedown', e=>{
         $$.vars.MOUSEDOWN = true;
         $$.captureMouse(e);
         $$.cornersActions(e);
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
               case 'replacer-mode':($$.query.replacer.style.display == 'grid') ? show_this($$.query.replacer, 'none') : show_this($$.query.replacer, 'grid'); break;
               case 'undo-history': $$.loadPreservedHistory(); break;

               case 'sub-li': case 'editable-wrapper': case 'to-edit': case 'task-menu':

                     switch(the_class){
                       case 'sub-li':            $$.setActiveTask(e.target); break;
                       case 'editable-wrapper':  $$.setActiveTask(e.target.parentElement); break;
                       case 'to-edit':           $$.setActiveTask(e.target.parentElement.parentElement); break;
                       case 'task-menu':         $$.setActiveTask(e.target.parentElement); break;
                     }
                         // log('active', $$.vars.activeTask);
               break;
               case 'list-name': //OPEN LIST
                     $$.vars.activeListName = e.target.parentNode.getAttribute('data');
                     $$.switchTO('sub-div');
               break;

               case 'noti': if($$.vars.notiAction != null && typeof $$.vars.notiAction == 'function') $$.vars.notiAction();  break;
           }
         $$.autoShow();

         let allowedForMarkerList = ['marker-list-li', 'marked-list', 'for-marked-list', 'for-marked-list-ul', 'info-span', 'info-link'];
         if(allowedForMarkerList.includes(the_class) == false ){
            show_this($$.query.for_marked_list, 'none');
         }
     });
     window.addEventListener('input', e=>{
        let subLi = qu(`[data="${$$.vars.activeTask}"]`);
        let toEdit = (subLi != null) ? subLi.querySelector('.to-edit') : null;

         switch(e.target.classList[0]){
           case 'marker-mode':    (e.target.checked) ? $$.vars.MARKER = true : $$.vars.MARKER = false;  break;
           case 'theme-changer':  $$.switchDesignMode(e.target.value);  break;
           case 'columns-selector':
                 let val = e.target.value;
                 switch(val){
                   case '1':  subLi.classList.remove('book-pager'); $$.spreadContentToColumns(toEdit, 0);  $$.notification(`🧡: No columns`);     subLi.removeAttribute('columns-counter');   break;
                   default:   subLi.classList.add('book-pager');    $$.spreadContentToColumns(toEdit, val-1);  $$.notification(`🧡: ${val} columns`); subLi.setAttribute('columns-counter', val); break;
                 }
           break;
           case 'preset-selector': $$.insertTextAtCursor(e.target.value); break;
           case 'to-edit':   if( e.target.textContent.length === 0) e.target.classList.add('is-empty')
                             else                                   e.target.classList.remove('is-empty');
           break;
         }
         switch(e.target.getAttribute('name')){
           case 'sub-list-pattern': $$.resizeSubListBackground(e);  break;
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
     window.addEventListener('keyup', e=>{
         $$.movingWindowControls(e, 'controls');
         switch(e.key){
           case 'Escape': if(qu('.full-screen')) qu('.full-screen').querySelector('.full-screen-mode').click();  break;
         }
     });
     window.addEventListener('keydown', e=>{
       switch(e.target.classList[0]){
         case 'body':
              switch(e.key){
                  case 'ArrowUp':   case "ArrowDown":
                  case 'ArrowLeft': case 'ArrowRight':
                        e.preventDefault(); $$.movingWindowControls(e, 'movements');
                  break;
               }
         break;
       }
     });
     window.addEventListener('DOMContentLoaded', e=> {
                               $$.autoShow();
                               $$.recreateLists($$.vars.LISTE);
                               $$.addReorderDropZone(qu('.sub-list'));
                               $$.referenceTasksPerList();
                               $$.resizeSubListBackground();
                               setTimeout( t=> {$$.animate($$.query.main_list, 'expandHeight', 0.5); doc.body.style.filter = ""; },  1*1000);
                            });
     window.addEventListener('resize', e=> {
            $$.resizeSubListBackground();
            $$.resizeMovingWindow();
            $$.debouncer(  t=>{
               let space = $$.plannerSpace();
               $$.addPlanner(space.total);
            });

     });

     // Trigger this on mouseup or a button click
     document.addEventListener('mouseup', e=>{
             if($$.vars.MARKER) $$.markSelection(e);
             $$.vars.MOUSEDOWN = false;
     });

     Object.freeze($$);  //FREEZE FOREVER
}

main();

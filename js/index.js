;(function (db) {
  let yp = { 
    // 视图切换 
    view_switch: document.getElementById('view_switch'), // 视图切换按钮
    rank_switch: document.getElementById('rank_switch'), // 排序切换按钮
    viewBtns: view_switch.children, // 视图切换按钮
    rankBtns: rank_switch.children, // 排序切换按钮
    reName: document.getElementById('reName'), // 重命名
    deleteFile: document.getElementById('deleteFile'), // 删除文件
    moveTo: document.getElementById('moveTo'), // 移动到
    newFolder: document.getElementById('newFolder'),

    wrapper: document.getElementById('wrapper_wrapper'), // 整个内容区域
    viewThumbnail: document.getElementById('thumbnail'), // ul
    viewThumbnailItems: document.getElementById('thumbnail').children,
    checkAll: document.getElementsByClassName('checkAll')[0], // 全选框
    noSelected: document.getElementsByClassName('noSelected')[0], // 工具栏右侧，没有文件被选中时的视图
    selectedFolder: document.getElementsByClassName('selected-folder')[0], // 工具栏右侧，有文件被选中时的视图
    // selectedNum: 0, // 文件被选中时的个数
    currentListId: 0, // 当前文件的id
    listInfo: document.getElementById('listInfo'),
    breadcrumb: document.getElementById('breadcrumb'),
    checkedBuffer: {length: 0}, // 当前选中的文件，以及选中的个数
    currentListBuffer: [], // 当前文件下所有的子文件
    len: 0,
    moveTargetId: 0,
    message: document.getElementById('message'), // 信息提示框
    alertInfo: document.getElementById('alertInfo'), //信息提示框信息
    modal: document.getElementById('modal'),

    btnsBox: document.querySelector('.nav-bar-right'),
    emptyInfo: document.getElementById('emptyInfo'),
    contextMenu: document.getElementById('context_menu'),

    view:'thumbnail',
    rank: 'name',
  };

  // 结构初始化
  init(yp.currentListId, yp.view, yp.rank);

  // 进入新界面
  function init(currentListId, view, rank) {
    initchecked();
    yp.currentListBuffer = view === 'thumbnail'?createFileList(db, currentListId, yp.rank):createTableList(db, yp.currentListId, yp.rank);
    yp.len = yp.currentListBuffer.length;
    yp.breadcrumb.innerHTML = creatBreadcrumb(db, currentListId);
    showEmptyInfo();
    console.log("hello");
  }

  // 生成缩略图视图函数
  function createFileList(db, currentListId, rankKey="name") {
    yp.viewThumbnail.innerHTML = '';
    var data = getChildrenById(db, currentListId);
    
    if(rankKey === "name") {
      // 按中文首字符的拼音进行排序
      data.sort(function (a, b){
        return a.name[0].localeCompare(b.name[0], 'zh');
      });
    } else if(rankKey === "time") {
      rankTime(data);
    }

    data.forEach(function(item) {
      yp.viewThumbnail.appendChild(creatFile(item));
    })
    return data;
  }

  function rankTime(data) {
    data.sort(function (a, b){
      let aTime = toArr(a.time);
      let bTime = toArr(b.time);
      for(let i=0; i<aTime.length;i++) {
        if(aTime[i] !== bTime[i]) {
          return bTime[i] - aTime[i];
        }
      }
    });
  }

  function toArr(str) {
    let data = str.split(' ')[0].split('-').concat(str.split(' ')[1].split(':'));
    for(let i=0; i<data.length;i++) {
      data[i] = data[i]*1;
    }
    return data;
  }

  // 点击面包屑
  yp.breadcrumb.addEventListener('click', function(e) {
    const target = e.target;
    if(target.dataset.id !== undefined && target.dataset.id*1 !== yp.currentListId) {
      yp.currentListId = target.dataset.id*1;
      yp.viewBtns[0].classList.remove('active');
      yp.viewBtns[1].classList.add('active');
      init(yp.currentListId, yp.view, yp.rank);;
    }
  })

  // 生成表格视图函数
  function createTableList(db, currentListId, rankKey="name") {
    yp.listInfo.innerHTML = '';
    var data = getChildrenById(db, currentListId);
    
    if(rankKey === "name") {
      // 按中文首字符的拼音进行排序
      data.sort(function (a, b){
        return a.name[0].localeCompare(b.name[0], 'zh');
      });
    } else if(rankKey === "time") {
      rankTime(data);
    }

    data.forEach(function(item,i) {
      yp.listInfo.appendChild(creatTable(item));
    })
    return data;
  }
  
  // 视图切换按钮：视图切换函数调用
   switchFn(yp.viewBtns,viewSwitch);
   switchFn(yp.rankBtns,rankSwitch);// 待添加回调函数
  function switchFn(data,cb) {
    for(let i=0; i<data.length; i++) {
      data[i].onclick = function (){
        Array.from(data).forEach(function(item) {
          item.classList.remove('active');
        });
        this.classList.add('active');
        cb&&cb(i);
      }
    }
  }
  // 视图切换函数
  function viewSwitch(i){
    if(i === 0) {
      yp.view = 'list';
      yp.wrapper.firstElementChild.style.display = 'none';
      yp.wrapper.firstElementChild.nextElementSibling.style.display = 'block';
    } else if (i === 1) {
      yp.view = 'thumbnail';
      yp.wrapper.firstElementChild.style.display = 'block';
      yp.wrapper.firstElementChild.nextElementSibling.style.display = 'none';
    }
    init(yp.currentListId, yp.view, yp.rank);
  }
  function rankSwitch(i) {
    yp.rank = i === 0?'time':'name';
    init(yp.currentListId, yp.view, yp.rank);
  }

  // 点击文件夹 进入子文件 切换checked
  yp.viewThumbnail.addEventListener("click", function (e) {
    let target = e.target;
    // 点击文件夹 进入子文件
    let currentId = yp.currentListId;
    if(target.classList.contains('folder-icon') || target.classList.contains('icon-folder') || target.classList.contains('item')) {
      currentId = target.classList.contains('icon-folder')?target.parentNode.fileId: target.fileId;
      if(db[currentId].type === 'folder') {
        yp.currentListId = currentId;
        // 进入新界面，调用初始化函数
        init(yp.currentListId, yp.view, yp.rank);;
      }
    }
    // 点击切换 checked
    if(target.classList.contains('file-check-click')) {
      checkNodeData(target.parentNode);
    }
  });

  yp.listInfo.addEventListener("click", function (e) {
    let target = e.target;
    if(target.classList.contains('name-text') || target.classList.contains('icon-folder')) {
      let currentId = target.parentNode.parentNode.parentNode.fileId;
      if(db[currentId].type === 'folder') {
        yp.currentListId = currentId;
        // 进入新界面，调用初始化函数
        init(yp.currentListId, yp.view, yp.rank);;
      }
    }
    if(target.classList.contains('icon-checkbox')) {
      checkNodeData(target.parentNode.parentNode.parentNode);
    }
  });

  // 单选和全选
  function checkNodeData(checkNode) {
    const {fileId} = checkNode;
    const {checkedBuffer, view, viewThumbnail, listInfo, selectedFolder, noSelected, checkAll} = yp;
    const checked = checkNode.classList.toggle('checked');
    let len = view === 'thumbnail'?viewThumbnail.children.length: listInfo.children.length;

    if(checked){
      checkedBuffer[fileId] = checkNode;
      checkedBuffer.length++;
      // 切换工具栏右侧
      if(checkedBuffer.length === 1) {
        dblSetCls(selectedFolder,noSelected, 'show');
      }
    } else {
      delete checkedBuffer[fileId];
      checkedBuffer.length--;
      // 切换工具栏右侧
      if(!checkedBuffer.length) {
        dblSetCls(noSelected, selectedFolder,'show'); 
      }
    }
    checkAll.classList.toggle('checked', checkedBuffer.length === len);
  }

  // 全选按钮
  yp.checkAll.onclick = function () {
    let isChecked = this.classList.toggle("checked");
    toggleCheckAll(isChecked);
  }

  // 全选函数
  function toggleCheckAll(isChecked) {
    const {checkedBuffer, selectedFolder, noSelected, viewThumbnailItems, listInfo, view} = yp;
    if(isChecked) {
      checkedBuffer.length = viewThumbnailItems.length;
      dblSetCls(selectedFolder,noSelected, 'show'); 
    } else {
      yp.checkedBuffer = {length: 0};
      dblSetCls(noSelected, selectedFolder, 'show');
    }

    // 循环里不能使用yp对象里的len，新建文件夹之后，len并没有变
    if(view === 'thumbnail') {
      for(let i=0; i<yp.viewThumbnail.children.length; i++) {
        const item = yp.viewThumbnail.children[i];
        const {fileId} = item;
        item.classList.toggle("checked", isChecked); 
        if(isChecked && !checkedBuffer[fileId]) {
          checkedBuffer[fileId] = item;
        }
      }
    } else {
      const list = listInfo.children;
      for(let i=0; i<list.length; i++) {
        const item = list[i];
        const {fileId} = item;
        item.classList.toggle("checked", isChecked); 
        if(isChecked && !checkedBuffer[fileId]) {
          checkedBuffer[fileId] = item;
        }
      }
    }
    
  }

  // 初始化选框函数
  function initchecked() {
    yp.checkAll.classList.remove('checked');
    if(yp.checkedBuffer.length > 0) {
      toggleCheckAll(false);
    }
  }

  // 同时切换两个节点的 class 函数
  function dblSetCls(show, hidden, cls){
    show.classList.add(cls);
    hidden.classList.remove(cls);
  }
  
  // 重命名
  yp.reName.addEventListener('click', function(e) {
    const {checkedBuffer} = yp;
    const len = checkedBuffer.length;
    if(len > 1) {
      return alertMessage('只能选中一个文件', 'error');
    }
    if(len === 0) {
      return alertMessage('尚未选中文件', 'error');
    }
    setFileItemName(checkedBuffer,true);
  });

  function setFileItemName(checkedBuffer, showMessage, successFn) {
    canUseAllBtns(true);
    const checkedFile = getCheckedFileFromBuffer(checkedBuffer)[0];
    const {fileId, fileNode} = checkedFile;

    const nameText = fileNode.querySelector('.name-text');
    const nameInput = fileNode.querySelector('.name-input');

    dblSetCls(nameInput, nameText, 'show');

    const oldName = nameInput.value = nameText.innerHTML;
    nameInput.focus();

    nameInput.onblur = function () {
      let newName = this.value.trim();
      if(!newName) {
        this.select();
        return alertMessage('文件(夹)名不能为空，请输入文件名称', 'error');
      }
      if(newName === oldName) {
        if(newName === '新建文件夹'){
          if(nameCanUse(db, yp.currentListId, newName)){
            dblSetCls(nameText, nameInput, 'show');
            this.onblur = null;
            canUseAllBtns(false);
            successFn&&successFn(newName);
            return;
          } else {
            this.select();
            return alertMessage('命名冲突', 'error');
          }
        }
        dblSetCls(nameText, nameInput, 'show');
        this.onblur = null;
        canUseAllBtns(false);
        return;
      }
      if(!nameCanUse(db, yp.currentListId, newName)) {
        this.select();
        return alertMessage('命名冲突', 'error');
      }
      nameText.innerHTML = newName;
      dblSetCls(nameText, nameInput, 'show');

      // 修改数据
      setItemById(db, fileId, {name: newName, time: clock()});
    
      showMessage&&alertMessage('命名成功', 'success');
      this.onblur = null;
      canUseAllBtns(false);
      successFn&&successFn(newName);
    }
    window.onkeyup = function (e){
      if(e.keyCode === 13){
        nameInput.blur();
        this.onkeyup = null;
      }
    };
  };

  // 删除文件
  yp.deleteFile.addEventListener('click', function(e) {
    const {checkedBuffer} = yp;
    const checkedLen = checkedBuffer.length;
    
    if(!checkedLen){
      return alertMessage('未选中任何文件', 'error');
    }
    deleteFile&&deleteFile(e, db, sureFn, cancelFn);
  });

  function deleteFile(e, db, sureFn, cancelFn) {
    const {checkedBuffer, viewThumbnail, modal, checkAll} = yp;

    modal.appendChild(createDialogHTML({
      title: '删除',
      txt: '已删除的文件可以在回收站找回'
    }));

    modal.classList.add('modal-show');
    
    const cancel = document.getElementById('cancel');
    const sure = document.getElementById('sure');
    const close = document.querySelector('.icon-modal-close');
    
    cancel.addEventListener('click', function(e) {
      cancelFn&&cancelFn(e);
    });
    sure.addEventListener('click', function(e) {
      sureFn&&sureFn(e, checkedBuffer, yp.view, db);
    })
    close.addEventListener('click', function(e) {
      cancelFn&&cancelFn(e);
    });
  }

  function sureFn(e, checkedBuffer, view, db) {
    
    let checkedNum = checkedBuffer.length;
    const data = getCheckedFileFromBuffer(checkedBuffer);

    console.log(data);

    modal.removeChild(modal.lastElementChild);
    modal.classList.remove('modal-show');

    for(let i=0; i<data.length; i++) {
      const item = data[i];
      const fileId = item.fileId*1;
      view === 'thumbnail'? yp.viewThumbnail.removeChild(item.fileNode): yp.listInfo.removeChild(item.fileNode);
      deleteItemById(db, fileId);
      checkedNum--;
    }
    if(!checkedNum) {
      yp.checkedBuffer = {length: 0};
    }
    // console.log(yp.checkedBuffer);
    initchecked();
    showEmptyInfo();
    alertMessage('删除成功', 'success');
    dblSetCls(yp.noSelected, yp.selectedFolder, 'show');
  }

  function cancelFn(e) {
    modal.classList.remove('modal-show');
    modal.removeChild(e.target.parentNode.parentNode);
    alertMessage('取消删除', 'cancel')
  }

  // 新建文件夹
  yp.newFolder.addEventListener('click', addNewFolder);
  function addNewFolder() {
    // 初始化选框
    initchecked();
    let {currentListId, view, viewThumbnail, listInfo, checkedBuffer, checkAll} = yp;
    let data = {
                  id: Date.now(),
                  pId: currentListId,
                  time: clock(),
                  name: '新建文件夹',
                  size: '--',
                  type: 'folder'
                }
    let newFile;
    if(view === 'thumbnail') {
      newFile = creatFile(data);
    } else {
      newFile = creatTable(data);
    }
    newFile.classList.add('checked');
    const {fileId} = newFile;
    
    if(view === 'thumbnail') {
      viewThumbnail.appendChild(newFile);
    } else {
      listInfo.appendChild(newFile);
    }
    checkedBuffer[fileId] = newFile;
    checkedBuffer.length++;
    showEmptyInfo();

    // 调用重命名函数
    setFileItemName(checkedBuffer, false, (newName) => {
      data.name = newName;
      addOneData(db, data);
      showEmptyInfo();
      alertMessage('新建文件夹成功', 'success');
    });
  }

  // 移动到
  yp.moveTo.addEventListener('click', function(e) {
    const {checkedBuffer} = yp;
    const len = checkedBuffer.length;

    if(!len){
      return alertMessage('尚未选中文件', 'error');
    }

    setMoveFileDialog(sureFun, cancelFun);
    
    function sureFun() {
      const {viewThumbnail} = yp;
      const checkedEles = getCheckedFileFromBuffer(checkedBuffer);
      
      let canMove = true;
      for(let i=0, len=checkedEles.length; i<len; i++){
        const {fileId, fileNode} = checkedEles[i];
        const ret = canMoveData(db, fileId, yp.moveTargetId);
        if(ret === 2){
          return alertMessage('已经在当前目录', 'error');
          canMove = false;
        }
        if(ret === 3){
          return alertMessage('不能移动到子文件夹中', 'error');
          canMove = false;
        }
        if(ret === 4){
          return alertMessage('存在同名文件', 'error');
          canMove = false;
        }
      }

      if(canMove) {
        checkedEles.forEach(function(item, i) {
          const {fileId, fileNode} = item;
          moveDataToTarget(db, fileId, yp.moveTargetId);
          if(yp.view === 'thumbnail') {
            yp.viewThumbnail.removeChild(fileNode);
          } else {
            yp.listInfo.removeChild(fileNode);
          }
        });
        initchecked()
        showEmptyInfo();
      }

    }

    function cancelFun() {
      alertMessage('取消移动文件', 'cancel');
    }
  })

  function setMoveFileDialog(sureFun, cancelFun){
    const {modal, currentListId} = yp;

    const treeListNode = createFileMoveDialog(createTreeList(db, 0, currentListId));
    modal.appendChild(treeListNode);
    modal.classList.add('modal-show');

    const fileMoveWrap = document.querySelector('.moveFile-dialog');

    fileMoveWrap.style.left = (fileMoveWrap.parentNode.clientWidth - fileMoveWrap.offsetWidth) / 2 + 'px'; 
    fileMoveWrap.style.top = (fileMoveWrap.parentNode.clientHeight - fileMoveWrap.offsetHeight) / 2 + 'px'; 
    setTimeout(function() {
      dragEle({
        downEle: document.querySelector('.modal-dialog-hd'),
        moveEle: fileMoveWrap
      });
    }, 200);

    const listTreeItems = document.querySelectorAll('.file-tree-container div');

    for(let i=0, len=listTreeItems.length; i<len; i++){
      listTreeItems[i].onclick = function (){
        for(let i=0; i<listTreeItems.length; i++) {
          listTreeItems[i].classList.remove('active');
        }
        this.classList.add('active');
        yp.moveTargetId = this.dataset.fileid * 1;
      };
      listTreeItems[i].firstElementChild.firstElementChild.onclick = function (){
        const allSibling = this.parentNode.parentNode.nextElementSibling;
        
        if(allSibling){
          allSibling.classList.toggle('treeview-collapse');
        }
        this.classList.toggle('open');
        this.parentNode.parentNode.classList.toggle('open');
      }
    }
    const sureBtn = document.getElementById('sure');
    const cancelBtn = document.getElementById('cancel');
    const closeBtn = document.getElementsByClassName('icon-modal-close')[0];
    
    sureBtn.onclick = function (){
      sureFun&&sureFun();
      closeTreeList();
    };
    cancelBtn.onclick = closeBtn.onclick = function (e){
      cancelFun&&cancelFun();
      closeTreeList();
    };
    closeBtn.onmousedown = function (e){
      e.stopPropagation();
    };
    
    function closeTreeList(){
      yp.modal.classList.remove('modal-show');
      yp.modal.removeChild(fileMoveWrap);
    }

  }

  // 鼠标画框
  yp.wrapper.onmousedown = function (e){
    e.stopPropagation();
    if(parseInt(yp.contextMenu.style.top) > 0) return;
    if(e.target.classList.contains('item') || e.target.parentNode.classList.contains('item') || e.target.parentNode.parentNode.classList.contains('item') || e.target.parentNode.parentNode.parentNode.classList.contains('item')){
      return;
    }
    const {wrapper,viewThumbnail,checkedBuffer,selectedFolder,noSelected,checkAll, len, listInfo, view} = yp;

    const div = document.createElement('div');
    div.className = 'kuang';
    wrapper.appendChild(div);

    let startX = e.pageX;
    let startY = e.pageY - 130;

    let first = true;

    wrapper.onmousemove = function (e){
      let x = e.pageX, y = e.pageY;
      
      let l = Math.min(x, startX);
      let t = Math.min(y - 130, startY);
      let w = Math.abs(x - startX);
      let h = Math.abs(y - 130 - startY);

      let content = view === 'thumbnail'?viewThumbnail.children:listInfo.children;

      for(let i=0; i<content.length; i++){
        const {fileId} = content[i];
        if(duang(div, content[i])){
          if(first) {
            initchecked();
            first = false;
          }
          content[i].classList.add('checked');
          if(!yp.checkedBuffer[fileId]) {
            yp.checkedBuffer[fileId] = content[i];
            yp.checkedBuffer.length++;
          }
          // 切换工具栏右侧
          if(yp.checkedBuffer.length === 1) {
            dblSetCls(selectedFolder,noSelected, 'show');
          }
          // console.log(yp.checkedBuffer);
          checkAll.classList.toggle('checked', yp.checkedBuffer.length === content.length);
        }
      }
  
      div.style.left = l + 'px';
      div.style.top = t + 'px';
      div.style.width = w + 'px';
      div.style.height = h + 'px';
    }
    document.onmouseup = function (e){
      wrapper.removeChild(div);
      this.onmouseup = wrapper.onmousemove = null;
    }
  }

  // 右键菜单
  yp.wrapper.addEventListener('contextmenu',function(e) {
    e.preventDefault();
    var x = e.pageX, y = e.pageY;
    const bubble = document.querySelector('.mod-bubble-menu');
    const menuWidth = yp.contextMenu.offsetWidth, menuHeight = yp.contextMenu.offsetHeight;

    const list = document.querySelector('.menu-list-out');
    const listChildren = document.querySelectorAll('#context_menu ul ul li');
    if(yp.view === 'thumbnail') {
      listChildren[0].firstElementChild.classList.remove('act');
      listChildren[0].nextElementSibling.firstElementChild.classList.add('act');
    } else {
      listChildren[0].firstElementChild.classList.add('act');
      listChildren[0].nextElementSibling.firstElementChild.classList.remove('act');
    }

    if(window.innerWidth - x < menuWidth*2) {
      bubble.style.left = '-180px';
    }
    if(x < menuWidth || window.innerWidth - x >= menuWidth*2) {
      bubble.style.left = '';
    }
    if(window.innerWidth - x < menuWidth){
      x = window.innerWidth - menuWidth;
    }
    
    if(window.innerHeight - y < menuHeight){
      y = window.innerHeight - menuHeight;
    }

    yp.contextMenu.style.left = x + 'px';
    yp.contextMenu.style.top = (y - 130) + 'px';

    list.firstElementChild.onclick = function () {
      init(yp.currentListId, yp.view, yp.rank);
    };
    list.lastElementChild.onclick = function () {
      addNewFolder();
    };
    listChildren[0].onclick = function () {
      this.firstElementChild.classList.add('act');
      this.nextElementSibling.firstElementChild.classList.remove('act');
      viewSwitch(0);
      yp.viewBtns[0].classList.add('active');
      yp.viewBtns[1].classList.remove('active');
    };
    listChildren[1].onclick = function () {
      this.firstElementChild.classList.add('act');
      this.previousElementSibling.firstElementChild.classList.remove('act');
      viewSwitch(1);
      yp.viewBtns[1].classList.add('active');
      yp.viewBtns[0].classList.remove('active');
    };
    yp.wrapper.addEventListener("click",function(e) {
      yp.contextMenu.style.left = '';
      yp.contextMenu.style.top = '';      
    }); 
  })

  //----------------------------------------------------------------

  // 将选中的元素缓存转成数组
  function getCheckedFileFromBuffer(checkedBuffer){
    let data = [];
    for(let key in checkedBuffer){
      if(key !== 'length'){
        const currentItem = checkedBuffer[key];
        data.push({
          fileId: key,
          fileNode: currentItem
        });
      }
    }
    return data;
  }


  // 信息提示功能
  function alertMessage(text, type) {
    clearTimeout(alertMessage.timer);
    const {message, alertInfo} = yp;
    alertInfo.innerHTML = text;
    message.classList.add(type);
    animation({
      el: message,
      attrs: {
        top: 5
      },
      cb(){
        alertMessage.timer = setTimeout(function () {
          animation({
            el: message,
            attrs: {
              top: -52
            },
            cb(){                
              alertInfo.innerHTML = '';
              message.classList.remove(type);
            }
          });
          alertInfo.innerHTML = '';
          message.classList.remove(type);
        }, 2000);
      }
    });
  }

  // 禁用所有按钮函数
  function canUseAllBtns(abled){
    const { btnsBox } = yp;
    btnsBox.classList.toggle('disabled', abled);
  }

  // 是否显示目录为空的提示
  function showEmptyInfo(){
    yp.emptyInfo.classList.toggle('show', !yp.viewThumbnailItems.length);
  }

})(db);
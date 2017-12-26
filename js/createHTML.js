// 生成缩略图视图文件函数
function creatFile(fileData) {
  var file = document.createElement('li');
  file.className = 'item';
  file.fileId = fileData.id;
  file.innerHTML = `<div class="folder-icon">
                      <i class="icon-folder"></i>
                    </div>
                    <div class="file-name">
                      <span class="name-text show" value="${fileData.name}">${fileData.name}</span>
                      <input class="name-input" type="text" value="">
                    </div>
                    <div class="file-check">
                      <i class="icon icon-checkbox"></i>
                    </div>
                    <div class="file-check-click"></div>`;

  var addFilesIdItems = file.querySelectorAll('div');
  // console.log(addFilesIdItems);
  for(var i=0; i<addFilesIdItems.length; i++){
    addFilesIdItems[i].fileId = fileData.id;
  }
  // console.log(Array.from(file.children));
  return file;
}

// 面包屑函数
function creatBreadcrumb(db, currentListId) {
  var breadcrumbList = getAllParents(db, currentListId);
  var str = '';
  for(let i=0; i<breadcrumbList.length; i++) {
    let item = breadcrumbList[i];
    if(i === 0) {
      str +=  `<li><a href="#" data-id=${item.id}>${item.name}</a></li>`;
    } else {
      str += `<li>
                  <i class="icon-break-next"></i>
                  <a href="#" data-id=${item.id}>${item.name}</a>
                </li>`;
    } 
  }
 return str;
}

// 生成 list 试图的函数
function creatTable(fileData) {
  var file = document.createElement('tr');
  file.className = 'item';
  file.fileId = fileData.id;
  file.innerHTML = `<td>
                      <div class="check">
                        <i class="icon icon-checkbox"></i>
                      </div>
                    </td>
                    <td>
                      <div class="file-icon">
                        <i class="icon-folder"></i>
                      </div>
                      <div class="file-name">
                        <span class="name-text show" value="${fileData.name}">${fileData.name}</span>
                        <input class="name-input" type="text" value="">
                      </div>
                    </td>
                    <td>${fileData.time}</td>
                    <td>${fileData.size}</td>`;
  return file;
}

// 生成对话框
function createDialogHTML(prop) {
  const {title, txt}= prop;
  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog alert-dialog';
  dialog.innerHTML =  `<div class="modal-dialog-hd clearfix">
                      <h4 class="modal-dialog-title">${title}文件</h4>
                      <button class="icon btn-icon icon-modal-close"></button>
                    </div>
                    <div class="modal-dialog-bd clearfix">
                      <a href="javascript:;"><i class="icon icon-pop-info"></i></a>
                      <p class="title">确定要${title}选中的文件？</p>
                      <p class="txt">${txt}</p>
                    </div>
                    <div class="modal-dialog-ft clearfix">
                      <button id="cancel"  class="btn">取消</button>
                      <button id="sure" class="btn active">确认</button>
                    </div>`;
  return dialog;
}

// 生成移动到模态对话框

function createTreeList(db, id = 0, currentListId) {
  const data = db[id];
  const allParents = getAllParents(db, id);
  const floorIndex = allParents.length;
  const children = getChildrenById(db, id);
  const len = children.length;

  if (data.type === 'folder'){
    let str = '';
    str +=`<li>
              <div class="treeview-node treeview-node-on ${id <= 3? 'open': ''} ${currentListId === data.id ? 'active' : ''}" data-fileId="${data.id}" style="padding-left:${(floorIndex-1)*15}px;">
                <span class="treeview-node-handler" data-fileId="${data.id}">
                  <i class="treeview-icon icon-file-open ${id <= 3? 'open': ''}" data-fileId="${data.id}"></i>
                  <i class="treeview-icon icon-file"></i>
                  <span class="treeview-txt" data-fileId="${data.id}">${data.name}</span>
                </span>
              </div>`

    if(len && children.some(function(item){return item.type === 'folder';})){
      str += `<ul class="treeview treeview-content ${id > 3? 'treeview-collapse': ''}">`;
      for(let i=0; i<len; i++){
        str += createTreeList(db, children[i].id, currentListId);
      }
      str += '</ul>';
    }
      
    return str += `</li>`;
  } else {
    return '';
  };
}

function createFileMoveDialog(treeListHtml){
  const fileMove = document.createElement('div');
  fileMove.className = 'modal-dialog moveFile-dialog';
  fileMove.innerHTML = `<div class="modal-dialog-hd clearfix">
                            <h4 class="modal-dialog-title">移动到</h4>
                            <button class="icon btn-icon icon-modal-close"></button>
                          </div>
                          <div class="modal-dialog-bd clearfix">
                            <div class="file-tree-container">
                              <ul class="treeview treeview-content">
                                ${treeListHtml}
                              </ul>
                            </div>
                          </div>
                          <div class="modal-dialog-ft clearfix">
                            <button id="cancel"  class="btn">取消</button>
                            <button id="sure" class="btn active">确认</button>
                          </div>`;
  return fileMove;
}

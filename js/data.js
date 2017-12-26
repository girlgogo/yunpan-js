const db = {
	"0": {
    id: 0,
    time: '2017-10-10 13:04:01',
    name:"我的微云",
    size: '200M',
    type: 'folder'
  },
  "1": {
    id: 1,
    pId: 0,
    time: '2017-10-10 14:04:01',
    name:"音乐",
    size: '60M',
    type: 'folder'
  },
  "2": {
    id: 2,
    pId: 0,
    time: '2017-10-10 13:04:05',
    name:"电影",
    size: '100M',
    type: 'folder'
  },
  "3": {
    id: 3,
    pId: 0,
    time: '2017-10-10 13:04:03',
    name:"图库",
    size: '40M',
    type: 'folder'
  },
  "4": {
    id: 4,
    pId: 1,
    time: '2017-10-10 15:04:01',
    name:"儿歌",
    size: '40M',
    type: 'folder'
  },
  "5": {
    id: 5,
    pId: 1,
    time: '2017-10-10 14:20:01',
    name:"轻音乐",
    size: '20M',
    type: 'folder'
  },
  "6": {
    id: 6,
    pId: 3,
    time: '2017-10-10 17:04:01',
    name:"我的照片",
    size: '30M',
    type: 'folder'
  },
  "7": {
    id: 7,
    pId: 3,
    time: '2017-10-10 16:04:01',
    name:"我的童年",
    size: '10M',
    type: 'folder'
  },
  "8": {
    id: 8,
    pId: 7,
    time: '2017-10-10 18:04:01',
    name:"1.png",
    size: '400k',
    type: 'file'
  },
  "9": {
    id: 9,
    pId: 6,
    time: '2017-10-10 19:04:01',
    name:"2.png",
    size: '3M',
    type: 'file'
  },
  "10": {
    id: 10,
    pId: 6,
    time: '2017-10-10 20:04:01',
    name:"3.png",
    size: '1018K',
    type: 'file'
  },
  "11": {
    id: 11,
    pId: 4,
    time: '2017-10-10 21:04:01',
    name:"I'm A Little Teapot.mp3",
    size: '5.4M',
    type: 'file'
  },
  "12": {
    id: 12,
    pId: 4,
    time: '2017-10-10 22:04:01',
    name:"小星星.mp3",
    size: '6.75M',
    type: 'file'
  },
  "13": {
    id: 13,
    pId: 5,
    time: '2017-10-10 23:04:01',
    name:"Week.mp3",
    size: '8.45M',
    type: 'file'
  },
  "14": {
    id: 14,
    pId: 5,
    time: '2017-10-10 23:20:01',
    name:"Vow to Virtue.mp3",
    size: '6.78M',
    type: 'file'
  },
  "15": {
    id: 15,
    pId: 2,
    time: '2017-10-10 23:20:01',
    name:"My Movie",
    size: '60M',
    type: 'folder'
  },
}

// 根据id获得当前对象的id
function getId(db, id) {
  return db[id];
}

// 根据id设置指定的数据
function setItemById(db, id, data){   // setItemById(db, 0, {name: '123'})
  const item = db[id];
  // for(let key in data){
  //   item[key] = data[key];
  // }

  return item && Object.assign(item, data);  // 合拼对象里面的属性
}

// 根据id获得所有子级
function getChildrenById(db, id){
  let data = [];
  for(let key in db) {
    const item = db[key];
    if(item.pId === id) {
      data.push(item);
    }
  }
  return data;
}

// 根据id获得所有父级
function getAllParents(db, id){
  let data = [];
  let current = db[id];
  if(current) {
    data.push(current);
    data = getAllParents(db, current.pId).concat(data);
  }
  return data;
}

// 根据id删除指定数据和其子集
function deleteItemById(db, id) {
  if(!id) return false;
  delete db[id];
  let children = getChildrenById(db, id);
  // console.log(children);
  if(children.length) {
    for(let i=0; i<children.length; i++) {
      deleteItemById(db, children[i].id)
    }
  }
  return true;
}

// 判断名字是否可用
function nameCanUse(db, id, text){
  const currentData = getChildrenById(db, id);
  return currentData.every(item => item.name !== text);
}

// 添加一条数据
function addOneData(db, data){
  return db[data.id] = data;
}

// 判断可否移动数据
function canMoveData(db, currentId, targetId){
  const currentData = db[currentId];
  
  const targetParents = getAllParents(db, targetId);
  
  if(currentData.pId === targetId){
    return 2; // 移动到自己所在的目录
  }
  
  if(targetParents.indexOf(currentData) !== -1){
    return 3;   // 移动到自己的子集
  }
  if(!nameCanUse(db, targetId, currentData.name)){
    return 4; // 名字冲突
  }
  
  return 1;
}

function moveDataToTarget(db, currentId, targetId){
  db[currentId].pId = targetId;
}



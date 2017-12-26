// 当前生成时间函数
function clock(){
	var now = new Date();
	var y = now.getFullYear();
	var m = now.getMonth() + 1;
	var d = now.getDate();
	var hours = now.getHours();
	var mins = now.getMinutes();
	var secs = now.getSeconds();

	var timeStr = y + '-' + m + '-' + d + ' ' + add0(hours) + ':' + add0(mins) + ':' + add0(secs);
	return timeStr;
}

// 补0函数
function add0(n){
  return n < 10 ? '0' + n : '' + n;
}
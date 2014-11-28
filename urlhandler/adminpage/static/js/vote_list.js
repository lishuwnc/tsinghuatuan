/**
*User:Sunshine
*Date:14-11-27
*/

function clearVotes(){
	$('#tbody-votes').html('');
}

function getSmartStatus(vot){
	if (vot.status == 0){
		return '未发布'；
	} else if (vot.status == 1) {
        var now = new Date();
        if (now < vot.start_time){
        	return '等待投票';
        }else if (now < vot.end_time){
        	return '正在投票';
        }else{
        	return '已结束';
        }
    }else{
    	return '未知';
    }
}

function wrapTwoDigit(num) {
    if (num < 10) {
        return '0' + num;
    } else {
        return num;
    }
}

function getChsDate(dt) {
    return wrapTwoDigit(dt.getDate()) + '日';
}

function getChsMonthDay(dt) {
    return wrapTwoDigit(dt.getMonth() + 1) + '月' + getChsDate(dt);
}

function getChsFullDate(dt) {
    return dt.getFullYear() + '年' + getChsMonthDay(dt);
}

function getChsDay(dt) {
    var dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return dayMap[dt.getDay()];
}

function getTimeStr(dt) {
    return wrapTwoDigit(dt.getHours()) + ':' + wrapTwoDigit(dt.getMinutes());
}

function isSameYear(d1, d2) {
    return d1.getFullYear() == d2.getFullYear();
}

function isSameMonth(d1, d2) {
    return isSameYear(d1, d2) && (d1.getMonth() == d2.getMonth());
}

function isSameDay(d1, d2) {
    return isSameYear(d1, d2) && isSameMonth(d1, d2) && (d1.getDate() == d2.getDate());
}

function getSmartTimeRange(start_time, end_time) {
    var result = getChsFullDate(start_time) + ' ' + getChsDay(start_time) + ' ' + getTimeStr(start_time) + ' - ';
    if (isSameDay(start_time, end_time)) {
        result += getTimeStr(end_time);
    } else if (isSameMonth(start_time, end_time)) {
        result += getChsDate(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    } else if (isSameYear(start_time, end_time)) {
        result += getChsMonthDay(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    } else {
        result += getChsFullDate(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    }
    return result;
}

function getTd(para) {
    return $('<td class="td-' + para + '"></td>');
}

function expand_long_text(dom) {
    var newhtml = '', par = $(dom).parent(), refdata = par.text();
    dom = $(dom);
    refdata = refdata.substring(0, refdata.length - 3);
    newhtml = dom.attr('ref-data') + ' <a style="cursor:pointer;" ref-data="' + refdata + '" ref-hint="' + dom.text() + '" onclick="expand_long_text(this);">' + dom.attr('ref-hint') + '</a>';
    par.html(newhtml);
}

/***************************************主体部分*****************************************************/
var duringVote = new Array;
var beforeVote = new Array;
var afterVote = new Array;

var tdMap = {
	'status':'status',
	'name':'text',
	'description':'longtext',
	'start_time':'time',
	'end_time':'time',
	'operations':'operation_links',
	'delete':'deletelink'
};

var operationMap = {
	'export':function(vot){
		return true;
	},
	'detail':function(vot){
		return true;
	}
};

var tdActionMap = {
	'status':function(vot, key){
		return getSmartStatus(vot);
	},
	'text':function(vot, key){
		return vot[key];
	},
	'longtext':function(vot, key){
		var str = vot[key];
		if (str.length > 55){
			str = str.substr(0, 55) + '... <a style="cursor:pointer;" ref-data="' + vot[key] + '" ref-hint="收起" onclick="expand_long_text(this);">展开</a>';
		}
		return str;
	},
	'time':function(vot, key){
		return smartTimeMap[key](vot);
	},
	'operation_links':function(vot,key){
        var links = vot[key], result = [], i, len;
        for (i in links) {
            if (operationMap[i](vot)) {
                result.push('<a href="' + links[i] + '" target="' + operations_target[i] + '"><span class="glyphicon glyphicon-' + operations_icon[i] + '"></span> ' + operations_name[i] + '</a>');
            }
        }
        return result.join('<br/>');
    },
    'deletelink':function(vot, key){
    	if (typeof vot[key] == 'undefined'){
    		return;
    	}
    	var now = new Date();
    	if (now < getDateByObj(vot.start_time)){
    		beforeVote.push(vot[key]);
    		return '<span id="del'+vot[key]+'" class="td-ban glyphicon glyphicon-ban-circle" ></span>';
    	}
    	else if(now < getDateByObj(vot.end_time)){
    		duringVote.push(vot[key]);
    		return '<span id="del'+vot[key]+'" class="td-ban glyphicon glyphicon-ban-circle" ></span>';
    	}
    	else{
    		afterVote.push(vot[key]);
    		return '<a href="javascript:void(0);" id="'+vot[key]+'" onclick="deleteact('+vot[key]+')"><span class="glyphicon glyphicon-trash"></span></a>';
    	}
    }
};

var smartTimeMap = {
	'start_time':function(vot){
		return getChsFullDate(vot.start_time);
	}
	'end_time':function(vot){
		return getChsFullDate(vot.end_time);
	}
};

function getDateByObj(obj) {
    return obj;
}

function deletevot(votid){
	var i, len, curvot;
	for (i = 0, len = votes.length; i < len; ++i){
		if (votes[i].delete == votid){
			curvot = votes[i];
			break;
		}
	}
	var content = '确认删除<span style="color:red">'+getSmartStatus(curvot)+'</span>投票：<span style="color:red">'+curvot.name+'</span>？';
    $('modalcontent').html(content);
    $('#'+votid).css("background-color","#FFE4C4");
    $('#deleteid').val(votid);
    $('#delModal').modal({
      keyboard: false,
      backdrop:false
    });
    return;
}

function delConfirm(){
	var delid = $('#deleteid').val();
	var tmp = "/delete/";
	$.post(tmp,{'voteId':delid}, function(ret) {
        $('#'+delid).css("background-color","#FFF");
        window.location.href="/list/"
    });
}

function delCancel(){
	var delid = $('#deleteid').val();
	$('#'+delid).css('background-color',"#FFF");
}

function createtips(){
	var id;
	for (id in duringVote){
		$('#del'+duringVote[id]).popover({
			html:true,
			placement:'top',
			title:'',
			content:'<span style="color:red;">正在投票中，不能删除！</span>',
			trigger:'hover',
			container:'body'
		});
	}
}

function appendVot(vot){
	var tr = $('<tr' + ((typeof vot.delete != "undefined") ? (' id="'+vot.delete+'"') : '') + '></tr>'), key;
    for (key in tdMap) {
        getTd(key).html(tdActionMap[tdMap[key]](vot, key)).appendTo(tr);
    }
    $('#tbody-votes').append(tr);
}

function initialVotes(){
	var i;
	for (i = 0; i < votes.length; i++){
		appendVot();
	}
	createtips();
}

clearVotes();
initialVotes();

function filter_0402(f) // label (ㄱ,ㄴ,ㄷ,...) 클릭했을 때 검사하는 함수
{
	console.log(f);
    var trs = $('tr[class=datas]');
	// label 색 선택
	for (i = 0; i <= 14; i++)
		$('#label'+i).removeClass('label-inverse');
	$('#labelall').removeClass('label-inverse');
	$('#labeletc').removeClass('label-inverse');
	$('#labelwork').removeClass('label-inverse');
	$('#labelexit').removeClass('label-inverse');
    $('#label'+f).addClass('label-inverse');
	
	if (f == 'all') {
		for (i = 0; i < trs.length; i++)
			trs[i].style.display="";
	} else if(f == 'etc') {
		for (var i = 0; i < trs.length; i++) {
			if (iSound($($(trs[i]).children()[1]).text()[0]) == -1)
				trs[i].style.display="";
			else
				trs[i].style.display="none";
		}
    } else if(f == 'work') {
		for (var i = 0; i < trs.length; i++) {
			if ($($(trs[i]).children()[5]).text() == "재직")
				trs[i].style.display="";
			else
				trs[i].style.display="none";
		}
    } else if(f == 'exit') {
		for (var i = 0; i < trs.length; i++) {
			if ($($(trs[i]).children()[5]).text() == "퇴사")
				trs[i].style.display="";
			else
				trs[i].style.display="none";
		}
    }
	else {
		for (var i = 0; i < trs.length; i++) {
			if (iSound($($(trs[i]).children()[1]).text()[0]) == Number(f))
				trs[i].style.display="";
			else
				trs[i].style.display="none";
		}
	}
}

function iSound(a) // 한 글자의 '초성'으로 idx 구하기
{
	var res = new Array(0,2,3,5,6,7,9,11,12,14,15,16,17,18);
	var r = parseInt( (a.charCodeAt(0) - parseInt('0xAC00',16)) / 588 );
//	var t = String.fromCharCode(r + parseInt('0x1100',16));

	for (var i = 0; i < res.length; i++)
		if (res[i] == r)
			return i;
	return -1;
}

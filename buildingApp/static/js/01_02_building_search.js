function SearchAll()
{
	var data = {};
	data['sType'] = 2;
	data['name'] = '';
	data['number'] = '';
	data['type'] = '';
	data['manager'] = '';
	data['sFloor'] = '';
	data['sRoomNum'] = '';
	data['parkingNum'] = '';
	doAjax(2, data);
}

function Search()
{
	// 건물명, 호실, 임차인 항목에서만 검색하는 부분.
	var data = {};
	data['sType'] = 0;
	data['keyword'] = $('#searchWord').val().trim();
	if (data['keyword'] == '') {
		alert('검색어를 입력해주세요.');
		return;
	}
	doAjax(0, data);
}

function SearchDetail()
{
	var data = {};

	data['sType'] = 1;
	data['name'] = $('#search_name').val().trim();
	data['number'] = $('#search_number').val().trim();
	data['type'] = $('#search_type').val().trim();
	data['manager'] = $('#search_manager').val().trim();
	
	sFloor_ko = $('#search_startFloor').val().trim();
	eFloor_ko = $('#search_endFloor').val().trim();
	sFloor = $('#search_startFloorNumber').val().trim();
	eFloor = $('#search_endFloorNumber').val().trim();
	if (!((sFloor_ko == '' && eFloor_ko == '' && sFloor == '' && eFloor == '') || (sFloor_ko != '' && eFloor_ko != '' && sFloor != '' && eFloor != ''))) {
		alert('건물 층수를 제대로 입력해 주세요.');
		return;
	}
	data['sFloor'] = '';
	data['eFloor'] = '';
	if (sFloor_ko != '') { // 건물 층수를 입력했다면,
		data['sFloor'] = (sFloor_ko == '지하') ? Number(-sFloor) : Number(sFloor);
		data['eFloor'] = (eFloor_ko == '지하') ? Number(-eFloor) : Number(eFloor);
		if (data['sFloor'] > data['eFloor']) {
			alert('건물 층수를 제대로 입력해 주세요.');
			return;
		}
	}

	data['sRoomNum'] = $('#search_numRoomStart').val();
	data['eRoomNum'] = $('#search_numRoomEnd').val();
	if ((data['sRoomNum'] != '' && data['eRoomNum'] == '') ||
		(data['sRoomNum'] == '' && data['eRoomNum'] != '')) {
		alert('방 개수를 제대로 입력해 주세요.');
		return;
	}
	if (data['sRoomNum'] > data['eRoomNum']) {
		alert('방 개수를 제대로 입력해 주세요.');
		return;
	}

	data['parkingNum'] = $('#search_parkingNum').val();
	
	doAjax(1, data);
}

function InitSearchDetail()
{
	$('#search_name').val('');
	$('#search_number').val('');
	$('#search_type').val('');
	$('#search_manager').val('');
	$('#search_startFloor').val('');
	$('#search_startFloorNumber').val('');
	$('#search_endFloor').val('');
	$('#search_endFloorNumber').val('');
	$('#search_numRoomStart').val('');
	$('#search_numRoomEnd').val('');
	$('#search_parkingNum').val('');
}


var doAjax = function(type, postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 

	$.ajax({
		type : 'POST',
		url : '/building/search/',
		data : postData,
		success : function(result) {
			$('#search_result').show();
			var color = {};
			if (postData['sType'] == 0) {
				color['name'] = '';
				color['number'] = '';
				color['type'] = '';
				color['manager'] = '';
				color['floor'] = '';
				color['numRoom'] = '';
				color['numParking'] = '';
				// 하나만 보고 column의 color를 결정한다.
				for (i = 0; i < result.length; i++) {
					if (result[i].name == postData['keyword'])
						color['name'] = '#ffa07a';
					if (result[i].number == postData['keyword'])
						color['number'] = '#ffa07a';
					if (result[i].manager == postData['keyword'])
						color['manager'] = '#ffa07a';
				}
			}
			else {
				color['name'] = (postData['name'] == '') ? '' : '#ffa07a"';
				color['number'] = (postData['number'] == '') ? '' : '#ffa07a"';
				color['type'] = (postData['type'] == '') ? '' : '#ffa07a"';
				color['manager'] = (postData['manager'] == '') ? '' : '#ffa07a"';
				color['floor'] = (postData['sFloor'] == '') ? '' : '#ffa07a"';
				color['numRoom'] = (postData['sRoomNum'] == '') ? '' : '#ffa07a"';
				color['numParking'] = (postData['parkingNum'] == '') ? '' : '#ffa07a"';
			}

			var template = new EJS({url : '/static/ejs/01_02_building_search.ejs'}).render({'result' : result, 'color' : color});
			$('#search_result_content').html(template);

			$('.showDetail').click(function() {
				var id = $(this).attr('id');
				$(location).attr('href', '/building/contents/'+id);
			});
		},
		error : function(msg) {
			alert('다시 시도해 주세요...');
		},
	});	
}




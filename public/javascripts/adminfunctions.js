var alertSpan;
var bufferTop;
var BufferBottom;

window.addEventListener('load', function(e) {
	document.querySelector('#readerSearch').addEventListener('click', ajaxFindReader);
	document.querySelector('#submitLevel').addEventListener('click', ajaxChangeLevel);

	alertSpan = document.querySelector('#returnText');
	bufferTop = document.querySelector('#bufferTop');
	bufferBottom = document.querySelector('#bufferBottom');
});

function ajaxFindReader(e) {
	console.log('find clicked');
	var readerToFind = document.querySelector('#readerFindName').value;

	if (badName(readerToFind)) { return; }

	$.ajax({
		type: 'POST',
		url: '/findReader',
		data: {rName: readerToFind},
		success: function(data) {
			if (data.error) {
				alertSpan.innerHTML = data.error;
				badBuffer();
			} else {
				alertSpan.innerHTML = 'Found them! Name: ' + data.readerName + '. Nickname: ' + data.readerNickname + '. Level: ' + data.level;
				alertSpan.style.color = '#1F26F0';
				goodBuffer();
			}
		}
	});
}

function ajaxChangeLevel(e) {
	var readerToFind = document.querySelector('#readerFindName').value;
	var newLevel = document.querySelector('#readerNewLevel').value;

	if (badName(readerToFind)) { return; }

	if (newLevel == undefined || newLevel == '') {
		alertSpan.innerHTML = 'You gotta put in a new number to change a reader\'s number';
		alertSpan.style.color = '#FA0C38';
		document.querySelector('#readerNewLevel').style.outline = '#FA0C38 solid 2px';
		badBuffer();
		return;
	}

	var newLevelAsNumber = parseInt(newLevel);
	if (newLevelAsNumber == NaN) {
		alertSpan.innerHTML = 'The new level needs to actually be a number. Preferably 1, 2, 3 or 4.';
		alertSpan.style.color = '#FA0C38';
		document.querySelector('#readerNewLevel').style.outline = '#FA0C38 solid 2px';
		badBuffer();
		return;
	}
	if (newLevelAsNumber <= 1) {
		alertSpan.innerHTML = 'The new Level is too small! A reader\'s level can only be 1, 2, 3 or 4.';
		alertSpan.style.color = '#FA0C38';
		document.querySelector('#readerNewLevel').style.outline = '#FA0C38 solid 2px';
		badBuffer();
		return;
	}
	if (newLevelAsNumber >= 10) {
		alertSpan.innerHTML = 'The new Level is too big! A reader\'s level can only be 1, 2, 3 or 4.';
		alertSpan.style.color = '#FA0C38';
		document.querySelector('#readerNewLevel').style.outline = '#FA0C38 solid 2px';
		badBuffer();
		return;
	}
	
	$.ajax({
		type: 'POST',
		url: '/changeLevel/' + readerToFind + '/' + newLevel,
		success: function(data) {
			if (data.error) {
				alertSpan.innerHTML = data.error;
				badBuffer();
			}
			alertSpan.innerHTML = data.readerName + '\'s level changed to ' + data.readerLevel + '!';
			alertSpan.style.color = '#1F26F0';
			goodBuffer();
		}
	});
}

function ajaxChangeNickname(e) {
	var readerToFind = document.querySelector('#readerFindName').value;
	var newNickname = document.querySelector('#readerNewNickname').value;

	if (badName(readerToFind)) { return; }
	if (badName(newNickname)) { return; }
}

function ajaxCanonizeChapter(e) {
	
}

function badName(name) {
	if (name == '' || name == undefined || name == ' ') {
		alertSpan.innerHTML = 'Bad Name!! Put in a non-null thing. Like seriously.';
		alertSpan.style.color = '#FA0C38';
		badBuffer();
		return true;
	}
	return false;
}

function goodBuffer() {
	bufferTop.innerHTML = '##############';
	bufferTop.style.color = '#00A806'
	bufferBottom.innerHTML = '##############';
	bufferBottom.style.color = '#00A806';
}
function badBuffer() {
	bufferTop.innerHTML = '';
	bufferTop.style.color = '#FFFFFF'
	bufferBottom.innerHTML = '';
	bufferBottom.style.color = '#FFFFFF';
}
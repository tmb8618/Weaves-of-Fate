var content = $('#content');

$(document).ready(function() {

	$("#content").on("load", function(event {
		$.ajax({
			url: '../public/stories/knightquest.json',
			type: 'GET',
			success: function(data) {
				createTemplates(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {}
		});
	}));
	
});
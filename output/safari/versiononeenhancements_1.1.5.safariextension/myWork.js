(function() {
	window.addEventListener('SentOptions', function(event) {
		options = event.detail;

		injectStyle(options.baseUrl + 'myWork.css');
	});

	var backupFunc = V1.HttpRequest._CompleteHandler;
	V1.HttpRequest._CompleteHandler = function(a, b) {
		backupFunc(a, b);
		if (typeof a.response === 'string' && a.response.indexOf('MyHome_Mywork_WorkitemSummary_Grid') !== -1) {
			makeEnhancement();
		}
	};

	makeEnhancement();

	function makeEnhancement() {
		$.each($('.MyHome_Mywork_WorkitemSummary_Grid .dd-table'), function() {
			var element = $(this).closest('tr[href]');
			var status = $(this).text().toLowerCase();

			element.addClass('__' + status.replace(/ /g, '-'));
		});
	}
})();
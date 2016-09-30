(function() {
	var options = JSON.parse(document.querySelector('body').dataset.options);

	var backupFunc = V1.HttpRequest._CompleteHandler;
	V1.HttpRequest._CompleteHandler = function(a, b) {
		backupFunc(a, b);
		if (typeof a.response === 'string' && a.response.indexOf('MyHome_Mywork_WorkitemSummary_Grid') !== -1) {
			makeEnhancement();
		}
	};

	injectStyle(options.baseUrl + 'myWork.css');
	makeEnhancement();

	function makeEnhancement() {
		$.each($('.MyHome_Mywork_WorkitemSummary_Grid .dd-table'), function() {
			var element = $(this).closest('tr[href]');
			var status = $(this).text().toLowerCase();

			element.addClass('__' + status.replace(/ /g, '-'));
		});
	}
})();
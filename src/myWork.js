(function() {
	var options = JSON.parse(document.querySelector('body').dataset.options);

	injectStyle(options.baseUrl + 'myWork.css');
	makeEnhancement();
	document.addEventListener('voe.completeHandler', makeEnhancement);

	function makeEnhancement() {
		$.each($('.MyHome_Mywork_WorkitemSummary_Grid .dd-table'), function() {
			var element = $(this).closest('tr[href]');
			var status = $(this).text().toLowerCase();

			element.addClass('__' + status.replace(/ /g, '-'));
		});
	}
})();

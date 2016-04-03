(function() {
	window.addEventListener('SentOptions', function(event) {
		options = event.detail;

		injectStyle(options.baseUrl + 'typography.css');
	});

	var backupFunc = V1.Html.Window.OpenLightbox;
	var isOpenLightbox = false;

	$(document).on('ajaxComplete', function() {
		if (isOpenLightbox) {
			isOpenLightbox = false;
			typographyEnhancement();
		}
	});

	V1.Html.Window.OpenLightbox = function(a, b) {
		backupFunc(a, b);
		isOpenLightbox = true;
	};

	typographyEnhancement();

	function typographyEnhancement() {
		$('.rich-text p').filter(function() {return $(this).html() === '&nbsp;'}).addClass('hide');
	}
})();

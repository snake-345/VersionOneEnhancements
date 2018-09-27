(function() {
	patchCompleteHandler();
	patchOpenLightBox();

	function patchCompleteHandler () {
		var backupFunc = V1.HttpRequest._CompleteHandler;

		V1.HttpRequest._CompleteHandler = function(a, b) {
			backupFunc(a, b);
			document.dispatchEvent(new Event('voe.completeHandler'));
		};
	}

	function patchOpenLightBox() {
		var isOpenLightbox = false;
		var backupFunc = V1.Html.Window.OpenLightbox;

		$(document).on('ajaxComplete', function() {
			if (isOpenLightbox) {
				isOpenLightbox = false;
				document.dispatchEvent(new Event('voe.openLightBox'));
			}
		});

		V1.Html.Window.OpenLightbox = function(a, b) {
			backupFunc(a, b);
			isOpenLightbox = true;
		};
	}
})();

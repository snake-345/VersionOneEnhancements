(function() {
	var options = JSON.parse(document.querySelector('body').dataset.options);
	var backupFunc = V1.Html.Window.OpenLightbox;
	var isOpenLightbox = false;

	typographyEnhancement();
	injectStyle(options.baseUrl + 'typography.css');

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

	function typographyEnhancement() {
		if (options.removeExtraTags) {
			$('.rich-text p').filter(function () {return $(this).html() === '&nbsp;'}).addClass('hide');
			$('.rich-text br').filter(checkExtraBr).addClass('hide');
		}
	}

	function checkExtraBr() {
		return this.nextSibling &&
			this.nextSibling.nodeType === 3 &&                               // if nextSibling is text
			/^\r|\n$/.test(this.nextSibling.textContent) &&                  // if nextSibling is \r or \n
			this.nextSibling.nextSibling &&
			this.nextSibling.nextSibling.nodeName.toLowerCase() === 'br';    // if br after br
	}
})();

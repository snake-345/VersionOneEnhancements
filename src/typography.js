(function() {
	var options = JSON.parse(document.querySelector('body').dataset.options);

	typographyEnhancement();
	document.addEventListener('voe.openLightBox', typographyEnhancement);

	injectStyle(options.baseUrl + 'typography.css');

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

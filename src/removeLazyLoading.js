(function() {
	loadLazyAssets();
	document.addEventListener('voe.openLightBox', loadLazyAssets);

	function loadLazyAssets() {
		var $panelScroller = $('.main-panel-scroller');

		$panelScroller.trigger('scroll.detail-summary');
	}
})();

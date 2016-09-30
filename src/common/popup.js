KangoAPI.onReady(function() {
	document.getElementById('visible').addEventListener('click', function() {
		kango.browser.tabs.getCurrent(function(tab) {
			tab.dispatchMessage('visibleCapture', null);
		});
	});

	document.getElementById('fullscreen').addEventListener('click', function() {
		kango.browser.tabs.getCurrent(function(tab) {
			tab.dispatchMessage('fullscreenCapture', null);
		});
	});
});
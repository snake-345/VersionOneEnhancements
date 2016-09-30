(function() {
	document.getElementById('visible').addEventListener('click', function() {
		chrome.windows.getCurrent(function(window){
			chrome.tabs.query({windowId:window.id, active:true},function(tabs) {
				if(tabs.length<=0) {
					return;
				}

				chrome.tabs.sendMessage(tabs[0].id, {action: 'visibleCapture'});
			});
		});
	});

	document.getElementById('fullscreen').addEventListener('click', function() {
		chrome.windows.getCurrent(function(window){
			chrome.tabs.query({windowId:window.id, active:true},function(tabs) {
				if(tabs.length<=0) {
					return;
				}

				chrome.tabs.sendMessage(tabs[0].id, {action: 'fullscreenCapture'});
			});
		});
	});
}());
(function() {
	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

	chrome.runtime.onMessage.addListener(function (request) {
		var pixelRatio = isFirefox ? 1 : window.devicePixelRatio;
		if (request.action === 'visibleCapture') {
			chrome.runtime.sendMessage({action: 'cleanCaptured'});
			chrome.runtime.onMessage.addListener(function captured(request) {
				if (request.action === 'captured') {
					chrome.runtime.sendMessage({action: 'openEdit'});
					chrome.runtime.onMessage.removeListener(captured);
				}
			});
			chrome.runtime.sendMessage({
				action: 'capture',
				data: {
					sX: 0,
					sY: 0,
					sW: window.innerWidth * pixelRatio,
					sH: window.innerHeight * pixelRatio,
					x:  0,
					y:  0,
					w:  window.innerWidth,
					h:  window.innerHeight
				}
			});
		}
	});

	chrome.runtime.onMessage.addListener(function (request) {
		var pixelRatio = isFirefox ? 1 : window.devicePixelRatio;
		if (request.action === 'fullscreenCapture') {
			chrome.runtime.sendMessage({action: 'cleanCaptured'});
			var scrollHeight = document.documentElement.scrollHeight;
			var scrollWidth  = document.documentElement.scrollWidth;
			var winHeight = window.innerHeight;
			var winWidth  = window.innerWidth;

			document.body.style.overflow = 'hidden';
			window.scroll(0, 0);
			setTimeout(function() {
				chrome.runtime.sendMessage({action: 'capture', data: {
					sX: 0,
					sY: 0,
					sW: winWidth * pixelRatio,
					sH: winHeight * pixelRatio,
					x:  window.scrollX,
					y:  window.scrollY,
					w:  winWidth,
					h:  winHeight
				}});
			}, 150);

			chrome.runtime.onMessage.addListener(function captured(request) {
				if (request.action === 'captured') {
					var y = window.scrollY + winHeight;
					window.scroll(0, y);

					setTimeout(function() {
						if (request.isLastCapture) {
							document.body.style.overflow = '';
							chrome.runtime.sendMessage({action: 'openEdit'});
							chrome.runtime.onMessage.removeListener(captured);
							return;
						}

						if (window.scrollY + winHeight < scrollHeight) {
							chrome.runtime.sendMessage({action: 'capture', data: {
								sX: 0,
								sY: 0,
								sW: winWidth * pixelRatio,
								sH: winHeight * pixelRatio,
								x:  window.scrollX,
								y:  y,
								w:  winWidth,
								h:  winHeight
							}});
						} else {
							chrome.runtime.sendMessage({action: 'capture', isLastCapture: true, data: {
								sX: 0,
								sY: (winHeight - scrollHeight + y) * pixelRatio,
								sW: winWidth * pixelRatio,
								sH: (scrollHeight - y) * pixelRatio,
								x:  window.scrollX,
								y:  y,
								w:  winWidth,
								h:  scrollHeight - y
							}});
						}
					}, 300);
				}
			});
		}
	});
}());
(function() {
	var pixelRatio = window.devicePixelRatio;

	chrome.runtime.onMessage.addListener(function (request) {
		if (request.action = 'visibleCapture') {
			chrome.runtime.sendMessage({action: 'cleanCaptured'});
			chrome.runtime.sendMessage({action: 'capture', data: {
				sX: 0,
				sY: 0,
				sW: window.innerWidth * pixelRatio,
				sH: window.innerHeight * pixelRatio,
				x:  0,
				y:  0,
				w:  window.innerWidth,
				h:  window.innerHeight
			}});
			chrome.runtime.sendMessage({action: 'openEdit'});
		}
	});

	chrome.runtime.onMessage.addListener(function (request) {
		if (request.action = 'fullscreenCapture') {
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
							chrome.runtime.sendMessage({action: 'capture', data: {
								sX: 0,
								sY: (winHeight - scrollHeight + y) * pixelRatio,
								sW: winWidth * pixelRatio,
								sH: (scrollHeight - y) * pixelRatio,
								x:  window.scrollX,
								y:  y,
								w:  winWidth,
								h:  scrollHeight - y
							}});

							chrome.runtime.onMessage.removeListener(captured);
							document.body.style.overflow = '';
							chrome.runtime.sendMessage({action: 'openEdit'});
						}
					}, 150);
				}
			});
		}
	});
}());
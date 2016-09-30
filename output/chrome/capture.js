// ==UserScript==
// @include http://*
// @include https://*
// ==/UserScript==
(function() {
	var pixelRatio = window.devicePixelRatio;

	kango.addMessageListener('visibleCapture', function() {
		kango.dispatchMessage('cleanCaptured');
		kango.dispatchMessage('capture', {
			sX: 0,
			sY: 0,
			sW: window.innerWidth * pixelRatio,
			sH: window.innerHeight * pixelRatio,
			x:  0,
			y:  0,
			w:  window.innerWidth,
			h:  window.innerHeight
		});
		kango.dispatchMessage('openEdit');
	});

	kango.addMessageListener('fullscreenCapture', function() {
		kango.dispatchMessage('cleanCaptured');
		var scrollHeight = document.documentElement.scrollHeight;
		var scrollWidth  = document.documentElement.scrollWidth;
		var winHeight = window.innerHeight;
		var winWidth  = window.innerWidth;

		document.body.style.overflow = 'hidden';
		window.scroll(0, 0);
		setTimeout(function() {
			kango.dispatchMessage('capture', {
				sX: 0,
				sY: 0,
				sW: winWidth * pixelRatio,
				sH: winHeight * pixelRatio,
				x:  window.scrollX,
				y:  window.scrollY,
				w:  winWidth,
				h:  winHeight
			});
		}, 150);

		kango.addMessageListener('captured', function captured() {
			var y = window.scrollY + winHeight;
			window.scroll(0, y);

			setTimeout(function() {
				console.log(window.scrollY + winHeight < scrollHeight);
				if (window.scrollY + winHeight < scrollHeight) {
					kango.dispatchMessage('capture', {
						sX: 0,
						sY: 0,
						sW: winWidth * pixelRatio,
						sH: winHeight * pixelRatio,
						x:  window.scrollX,
						y:  y,
						w:  winWidth,
						h:  winHeight
					});
				} else {
					kango.dispatchMessage('capture', {
						sX: 0,
						sY: (winHeight - scrollHeight + y) * pixelRatio,
						sW: winWidth * pixelRatio,
						sH: (scrollHeight - y) * pixelRatio,
						x:  window.scrollX,
						y:  y,
						w:  winWidth,
						h:  scrollHeight - y
					});

					kango.removeMessageListener('captured', captured);
					document.body.style.overflow = '';
					kango.dispatchMessage('openEdit');
				}
			}, 150);
		});
	});
}());
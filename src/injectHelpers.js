function injectScript(url, callback) {
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', url);

	if (callback) {
		script.onload = callback;
	}

	document.head.appendChild(script);
}

function injectStyle(url, callback) {
	var style = document.createElement('link');
	style.setAttribute('rel', 'stylesheet');
	style.setAttribute('type', 'text/css');
	style.setAttribute('href', url);

	if (callback) {
		style.onload(callback);
	}

	document.head.appendChild(style);
}

// ==UserScript==
// @include *://*.v1host.com/*
// ==/UserScript==
var defaultOptions = {
	replaceTinyMCE: true,
	minHeightTinyMCE: 200,
	maxHeightTinyMCE: 0,
	typography: true,
	expand: true,
	myWorkEnhancement: true
};

window.addEventListener('load', function() {
	var script = document.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", kango.io.getResourceUrl('ckeditor/ckeditor.js'));
	script.onload = function () {
		var customEvent = new CustomEvent('sendBaseUrl', {
			detail: kango.io.getResourceUrl('ckeditor/')
		});
		window.dispatchEvent(customEvent);
		injectScript();
	};
	document.head.appendChild(script);
});
// window.addEventListener('load', function() {
// 	injectScript();
// });

kango.addMessageListener('OptionsToContent', function(event) {
	kango.storage.setItem('options', event.data);
});

function injectScript() {
	var script = document.createElement("script");
	var options = kango.storage.getItem('options');
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", kango.io.getResourceUrl('injected.js'));
	script.onload = function() {
		var customEvent = new CustomEvent('sendOptions', {
			detail: extend(defaultOptions, options ? options : {})
		});
		window.dispatchEvent(customEvent);
	};

	document.head.appendChild(script);
}

function extend(obj, targetObj) {
	for (var i in targetObj) {
		if (targetObj.hasOwnProperty(i)) {
			obj[i] = targetObj[i];
		}
	}

	return obj;
}

// promise.then(function() {
// 	fetch(chrome.extension.getURL('/injected.js'))
// 		.then(function(response) {
// 			if (response.status !== 200) {
// 				console.log('Не загрузился файл injected.js');
// 				return;
// 			}
//
// 			return response.text();
// 		})
// 		.then(function(response) {
// 			var script = document.createElement("script");
// 			script.setAttribute("type", "text/javascript");
// 			script.innerHTML = response;
// 			document.head.appendChild(script);
//
// 			chrome.storage.sync.get({
// 				replaceTinyMCE: true,
// 				minHeightTinyMCE: 200,
// 				maxHeightTinyMCE: 0,
// 				typography: true,
// 				expand: true,
// 				myWorkEnhancement: true
// 			}, function(items) {
// 				var customEvent = new CustomEvent('sendOptions', {
// 					detail: items
// 				});
// 				window.dispatchEvent(customEvent);
// 			});
// 		});
// });
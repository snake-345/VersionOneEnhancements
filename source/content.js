/**
 * Created by snake on 22.03.16.
 */

var promise = new Promise(function(resolve, reject) {
	var script = document.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", "//gsnake.s3-eu-west-1.amazonaws.com/ckeditor_sheet/ckeditor.js");
	script.onload = function() {
		resolve();
	};
	document.head.appendChild(script);
});

promise.then(function() {
	fetch(chrome.extension.getURL('/injected.js'))
		.then(function(response) {
			if (response.status !== 200) {
				console.log('Не загрузился файл injected.js');
				return;
			}

			return response.text();
		})
		.then(function(response) {
			var script = document.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.innerHTML = response;
			document.head.appendChild(script);

			chrome.storage.sync.get({
				replaceTinyMCE: true,
				heightTinyMCE: 400,
				typography: true,
				expand: true,
				myWorkEnhancement: true
			}, function(items) {
				var customEvent = new CustomEvent('sendOptions', {
					detail: items
				});
				window.dispatchEvent(customEvent);
			});
		});
});
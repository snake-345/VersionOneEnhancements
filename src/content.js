chrome.runtime.sendMessage({action: 'getOptions'});

chrome.runtime.onMessage.addListener(function(request) {
	if (request.action === 'OptionsToContent') {
		var options = request.data;

		injectScript(chrome.extension.getURL('injectHelpers.js'), function() {
			document.querySelector('body').dataset.options = JSON.stringify(options);

			if (options.replaceWysiwyg) {
				injectScript(chrome.extension.getURL('replaceWysiwyg.js'));
			}

			if (options.typography) {
				injectScript(chrome.extension.getURL('typography.js'));
			}

			if (options.expand) {
				injectStyle(chrome.extension.getURL('expand.css'));
			}

			if (options.myWorkEnhancement) {
				injectScript(chrome.extension.getURL('myWork.js'));
			}
		});
	}
});
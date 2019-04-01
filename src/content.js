chrome.storage.sync.get(['options', 'baseUrl'], function(data) {
	var options = data.options;

	options.baseUrl = data.baseUrl;

	injectScript(chrome.extension.getURL('injectHelpers.js'), function() {
		document.querySelector('body').dataset.options = JSON.stringify(options);

		injectScript(chrome.extension.getURL('monkeyPatcher.js'));

		if (options.replaceWysiwyg) {
			injectScript(chrome.extension.getURL('replaceWysiwyg.js'));
		}

		if (options.expand) {
			injectStyle(chrome.extension.getURL('expand.css'));
		}

		if (options.myWorkEnhancement) {
			injectScript(chrome.extension.getURL('myWork.js'));
		}

		if (options.showPullRequestInfo) {
			injectScript(chrome.extension.getURL('showPullRequestInfo.js'));
		}
	});
});

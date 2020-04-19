chrome.storage.sync.get(['options', 'baseUrl'], function(data) {
	var options = data.options;

	options.baseUrl = data.baseUrl;
	options.componentsUrl = data.baseUrl + 'components/';

	injectScript(chrome.extension.getURL('injectHelpers.js'), function() {
		document.querySelector('body').dataset.options = JSON.stringify(options);

		injectScript(chrome.extension.getURL('monkeyPatcher.js'));

		if (options.replaceWysiwyg) {
			injectScript(chrome.extension.getURL('components/replaceWysiwyg/script.js'));
		}

		if (options.expand) {
			injectStyle(chrome.extension.getURL('components/expand/styles.css'));
		}

		if (options.removeLazyLoading) {
			injectScript(chrome.extension.getURL('components/removeLazyLoading/script.js'));
		}

		if (options.myWorkEnhancement) {
			injectScript(chrome.extension.getURL('components/myWorkEnhancement/script.js'));
		}

		if (options.highlightId) {
			injectStyle(chrome.extension.getURL('components/highlightId/styles.css'));
		}

		if (options.showPullRequestInfo) {
			injectScript(chrome.extension.getURL('components/showPullRequestInfo/script.js'));
		}
	});
});

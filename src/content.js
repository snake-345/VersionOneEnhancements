var defaultOptions = {
	replaceWysiwyg: true,
	minHeightWysiwyg: 200,
	maxHeightWysiwyg: 0,
	typography: true,
	removeExtraTags: true,
	expand: true,
	myWorkEnhancement: true
};
var options;

chrome.runtime.onMessage.addListener(function(request) {
	if (request.action === 'OptionsToContent') {
		localStorage.option = JSON.stringify(request.data);
	}
});

options = JSON.parse(localStorage.options || '{}');
options = extend(defaultOptions, options ? options : {});
options.baseUrl = chrome.extension.getURL('content.js').replace('content.js', '');

injectScript(chrome.extension.getURL('injectHelpers.js'), function() {
	sentOptions();

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

function sentOptions() {
	document.querySelector('body').dataset.options = JSON.stringify(options);
}

function extend(obj, targetObj) {
	for (var i in targetObj) {
		if (targetObj.hasOwnProperty(i)) {
			obj[i] = targetObj[i];
		}
	}

	return obj;
}
// ==UserScript==
// @include *://*.v1host.com/*
// @require injectHelpers.js
// ==/UserScript==
var defaultOptions = {
	replaceWysiwyg: true,
	minHeightWysiwyg: 200,
	maxHeightWysiwyg: 0,
	typography: true,
	expand: true,
	myWorkEnhancement: true
};
var options;

kango.addMessageListener('OptionsToContent', function(event) {
	kango.storage.setItem('options', event.data);
});


options = kango.storage.getItem('options');
options = extend(defaultOptions, options ? options : {});
options.baseUrl = kango.io.getResourceUrl('content.js').replace('content.js', '');

injectScript(kango.io.getResourceUrl('injectHelpers.js'), function() {
	if (options.replaceWysiwyg) {
		injectScript(kango.io.getResourceUrl('replaceWysiwyg.js'), sentOptions);
	}

	if (options.typography) {
		injectScript(kango.io.getResourceUrl('typography.js'), sentOptions);
	}

	if (options.expand) {
		injectStyle(kango.io.getResourceUrl('expand.css'));
	}

	if (options.myWorkEnhancement) {
		injectScript(kango.io.getResourceUrl('myWork.js'), sentOptions);
	}
});

function sentOptions() {
	var customEvent = new CustomEvent('SentOptions', {
		detail: options
	});
	window.dispatchEvent(customEvent);
}

function extend(obj, targetObj) {
	for (var i in targetObj) {
		if (targetObj.hasOwnProperty(i)) {
			obj[i] = targetObj[i];
		}
	}

	return obj;
}
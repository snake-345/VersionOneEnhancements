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
var captured = [];

options = JSON.parse(localStorage.options || '{}');
options = extend(defaultOptions, options ? options : {});
options.baseUrl = chrome.extension.getURL('content.js').replace('content.js', '');

chrome.runtime.onMessage.addListener(function (request) {
	switch (request.action) {
		case 'saveOptions':
			saveOptions(request);
			break;
		case 'getOptions':
			getOptions(request);
			break;
		case 'cleanCaptured':
			cleanCaptured(request);
			break;
		case 'capture':
			capture(request);
			break;
		case 'editReady':
			sendCapture(request);
			break;
		case 'openEdit':
			openEdit(request);
			break;
		case 'openDefectEditing':
			openDefectEditing(request);
			break;
	}
});

function cleanCaptured() {
	captured = [];
}

function capture(event) {
	var params = event.data;

	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(data) {
		captured.push({
			url: data,
			params: params
		});

		chrome.windows.getCurrent(function(window){
			chrome.tabs.query({windowId:window.id, active:true},function(tabs) {
				if(tabs.length<=0) {
					return;
				}

				chrome.tabs.sendMessage(tabs[0].id, {action: 'captured', isLastCapture: event.isLastCapture});
			});
		});
	});
}

function sendCapture() {
	chrome.runtime.sendMessage({action: 'sendCaptured', data: captured});
}

function openEdit() {
	chrome.tabs.create({url: 'edit.html'});
}

function openDefectEditing(event) {
	chrome.windows.getCurrent(function(window){
		chrome.tabs.query({windowId:window.id, active:true},function(tabs) {
			if(tabs.length<=0) {
				return;
			}

			chrome.tabs.remove(tabs[0].id);
			chrome.tabs.create({url: event.data});
		});
	});
}

function saveOptions(event) {
	var newOptions = event.data;
	newOptions.baseUrl = chrome.extension.getURL('content.js').replace('content.js', '');

	localStorage.options = JSON.stringify(newOptions);
	options = newOptions;
}

function getOptions() {
	chrome.windows.getCurrent(function(window){
		chrome.tabs.query({windowId:window.id, active:true},function(tabs) {
			if(tabs.length<=0) {
				return;
			}

			chrome.tabs.sendMessage(tabs[0].id, {action: 'OptionsToContent', data: options});
		});
	});
}

function extend(obj, targetObj) {
	for (var i in targetObj) {
		if (targetObj.hasOwnProperty(i)) {
			obj[i] = targetObj[i];
		}
	}

	return obj;
}
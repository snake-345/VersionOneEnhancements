var captured = [];

chrome.runtime.onMessage.addListener(function (request) {
	switch (request.action) {
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

		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.sendMessage(tab.id, {action: 'captured'});
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
	chrome.tabs.getCurrent(function(tab) {
		chrome.tabs.remove(tab.id);
	});

	chrome.tabs.create({url: event.data});
}

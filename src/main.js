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

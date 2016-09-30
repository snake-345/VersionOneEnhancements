var captured = [];

kango.addMessageListener('cleanCaptured', cleanCaptured);
kango.addMessageListener('capture', capture);
kango.addMessageListener('editReady', sendCapture);
kango.addMessageListener('openEdit', openEdit);
kango.addMessageListener('openDefectEditing', openDefectEditing);

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

		kango.browser.tabs.getCurrent(function(tab) {
			tab.dispatchMessage('captured', null);
		});
	});
}

function sendCapture() {
	kango.dispatchMessage('sendCaptured', captured);
}

function openEdit() {
	kango.browser.tabs.create({url: 'edit.html'});
}

function openDefectEditing(event) {
	kango.browser.tabs.getCurrent(function(tab) {
		tab.close();
	});

	kango.browser.tabs.create({url: event.data});
}

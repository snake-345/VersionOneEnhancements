var defaultOptions = {
	replaceWysiwyg: true,
	fontSizeWysiwyg: 15,
	minHeightWysiwyg: 200,
	maxHeightWysiwyg: 0,
	expand: true,
	removeLazyLoading: true,
	myWorkEnhancement: true,
	highlightId: true,
	showPullRequestInfo: true,
	showCopyLinkToClipboard: true,
	showCopyListOfStories: true,
	templateForRelease: '<% assets.forEach(asset => { _%>\n<%- asset.name %>\t<%- asset.link %>\t<%- team %>\tNo\n<% }); %>',
	templateForReview: '<% var points = assets.reduce((sum, asset) => sum + asset.points , 0) _%>\n' +
		'<% var doneStatuses = [\'Pending Merge\', \'Ready to Release\', \'Released\', \'Resolved\']; _%>\n' +
		'<% var donePoints = assets.reduce((sum, asset) => doneStatuses.includes(asset.status) ? sum + asset.points : sum, 0) _%>\n' +
		'<% var splittedPoints = points - donePoints _%>\n' +
		'<% var doneAssets = assets.filter(asset => doneStatuses.includes(asset.status)); _%>\n' +
		'<% var splittedAssets = assets.filter(asset => !doneStatuses.includes(asset.status)); _%>\n' +
		'Done:\n' +
		'<% doneAssets.forEach(function(asset) { _%>\n' +
		'<%= asset.type === \'defect\' ? \'[D]\' : \'\' %><%- asset.name %>\n' +
		'<% }); _%>\n' +
		'\n' +
		'Splitted:\n' +
		'<% splittedAssets.forEach(function(asset) { _%>\n' +
		'<%= asset.type === \'defect\' ? \'[D]\' : \'\' %><%- asset.name %>\n' +
		'<% }); _%>\n' +
		'\n' +
		'Planned:\n' +
		'<%= assets.length %> Stories\n' +
		'<%= points %> pts\n' +
		'\n' +
		'Split:\n' +
		'<%= splittedAssets.length %> Stories\n' +
		'<%= splittedPoints %> pts\n' +
		'\n' +
		'Completed:\n' +
		'<%= doneAssets.length %> Stories\n' +
		'<%= donePoints %> pts',
	templateForBacklog: '<% assets.forEach(asset => { _%>\n<%- asset.name %>\t<%- asset.link %>\n<% }); %>',
};
var captured = [];

chrome.storage.sync.get('options', function(data) {
	chrome.storage.sync.set({
		options: extend(defaultOptions, data.options),
		baseUrl: chrome.extension.getURL('content.js').replace('content.js', '')
	});
});

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
	chrome.tabs.create({url: 'storyEditPage/index.html'});
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

function extend(obj, targetObj) {
	for (var i in targetObj) {
		if (targetObj.hasOwnProperty(i)) {
			obj[i] = targetObj[i];
		}
	}

	return obj;
}

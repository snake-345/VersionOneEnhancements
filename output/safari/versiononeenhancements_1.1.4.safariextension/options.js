KangoAPI.onReady(function() {
	var defaultOptions = {
		replaceTinyMCE: true,
		minHeightTinyMCE: 200,
		maxHeightTinyMCE: 0,
		typography: true,
		expand: true,
		myWorkEnhancement: true
	};

	restore_options();
	document.getElementById('save').addEventListener('click', save_options);

	// Saves options to chrome.storage
	function save_options() {
		var status = document.getElementById('status');
		var options = {
			replaceTinyMCE: document.getElementById('replaceTinyMCE').checked,
			minHeightTinyMCE: +document.getElementById('minHeightTinyMCE').value,
			maxHeightTinyMCE: +document.getElementById('maxHeightTinyMCE').value,
			typography: document.getElementById('typography').checked,
			expand: document.getElementById('expand').checked,
			myWorkEnhancement: document.getElementById('myWorkEnhancement').checked
		};

		kango.storage.setItem('options', options);
		kango.browser.tabs.getAll(function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				tabs[i].dispatchMessage('OptionsToContent', options);
			}
		});

		status.textContent = 'Options saved.';
		setTimeout(function () {
			status.textContent = '';
		}, 750);
	}

	// Restores select box and checkbox state using the preferences
	// stored in chrome.storage.
	function restore_options() {
		var options = kango.storage.getItem('options');
		options = extend(defaultOptions, options ? options : {});

		document.getElementById('replaceTinyMCE').checked = options.replaceTinyMCE;
		document.getElementById('minHeightTinyMCE').value = options.minHeightTinyMCE;
		document.getElementById('maxHeightTinyMCE').value = options.maxHeightTinyMCE;
		document.getElementById('typography').checked = options.typography;
		document.getElementById('expand').checked = options.expand;
		document.getElementById('myWorkEnhancement').checked = options.myWorkEnhancement;
	}

	function extend(obj, targetObj) {
		for (var i in targetObj) {
			if (targetObj.hasOwnProperty(i)) {
				obj[i] = targetObj[i];
			}
		}

		return obj;
	}
});
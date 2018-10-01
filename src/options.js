(function() {
	var defaultOptions = {
		replaceWysiwyg: true,
		fontSizeWysiwyg: 15,
		minHeightWysiwyg: 200,
		maxHeightWysiwyg: 0,
		expand: true,
		myWorkEnhancement: true
	};

	restore_options();
	document.getElementById('save').addEventListener('click', save_options);

	// Saves options to chrome.storage
	function save_options() {
		var status = document.getElementById('status');
		var options = {
			replaceWysiwyg: document.getElementById('replaceWysiwyg').checked,
			fontSizeWysiwyg: +document.getElementById('fontSizeWysiwyg').value,
			minHeightWysiwyg: +document.getElementById('minHeightWysiwyg').value,
			maxHeightWysiwyg: +document.getElementById('maxHeightWysiwyg').value,
			expand: document.getElementById('expand').checked,
			myWorkEnhancement: document.getElementById('myWorkEnhancement').checked
		};

		chrome.runtime.sendMessage({action: 'saveOptions', data: options});

		status.textContent = 'Options saved.';
		setTimeout(function () {
			status.textContent = '';
		}, 750);
	}

	// Restores select box and checkbox state using the preferences
	// stored in chrome.storage.
	function restore_options() {
		var options = JSON.parse(localStorage.options || '{}');
		options = extend(defaultOptions, options ? options : {});

		document.getElementById('replaceWysiwyg').checked = options.replaceWysiwyg;
		document.getElementById('fontSizeWysiwyg').value = options.fontSizeWysiwyg;
		document.getElementById('minHeightWysiwyg').value = options.minHeightWysiwyg;
		document.getElementById('maxHeightWysiwyg').value = options.maxHeightWysiwyg;
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
}());

(function() {
	var _exampleData = {
		team: 'Team Name',
		assets: [
			{
				id: 'B-66699',
				type: 'story',
				name: 'Name of Story',
				link: 'https://google.com',
				owners: ['Owner 1', 'Owner 2'],
				status: 'Pending Merge',
				points: 3,
				priority: 'P1',
				epic: 'Epic Name',
			},
			{
				id: 'D-66699',
				type: 'defect',
				name: 'Name of Defect',
				link: 'https://google.com',
				owners: ['Owner 1', 'Owner 2'],
				status: 'Code Review',
				points: 5,
				priority: 'P2',
				epic: 'Another Epic Name',
			},
			{
				id: 'B-99666',
				type: 'story',
				name: 'Name of Story',
				link: 'https://google.com',
				owners: ['Owner 1', 'Owner 2'],
				status: 'Pending Merge',
				points: 3,
				priority: 'P1',
				epic: 'Another Epic Name',
			},
			{
				id: 'D-99666',
				type: 'defect',
				name: 'Name of Defect',
				link: 'https://google.com',
				owners: ['Owner 1', 'Owner 2'],
				status: 'Code Review',
				points: 5,
				priority: 'P2',
				epic: 'Epic Name',
			},
		],
	};

	restore_options();
	document.getElementById('save').addEventListener('click', save_options);
	allowTabIndent();
	handleExamples();
	handleTemplatesField();

	// Saves options to chrome.storage
	function save_options() {
		var status = document.getElementById('status');
		var options = {
			replaceWysiwyg: document.getElementById('replaceWysiwyg').checked,
			fontSizeWysiwyg: +document.getElementById('fontSizeWysiwyg').value,
			minHeightWysiwyg: +document.getElementById('minHeightWysiwyg').value,
			maxHeightWysiwyg: +document.getElementById('maxHeightWysiwyg').value,
			expand: document.getElementById('expand').checked,
			removeLazyLoading: document.getElementById('removeLazyLoading').checked,
			myWorkEnhancement: document.getElementById('myWorkEnhancement').checked,
			highlightId: document.getElementById('highlightId').checked,
			showPullRequestInfo: document.getElementById('showPullRequestInfo').checked,
			showCopyListOfStories: document.getElementById('showCopyListOfStories').checked,
			templateForRelease: document.getElementById('templateForRelease').value,
			templateForReview: document.getElementById('templateForReview').value,
		};

		chrome.storage.sync.set({ options: options });

		status.textContent = 'Options saved.';
		setTimeout(function () {
			status.textContent = '';
		}, 750);
	}

	// Restores select box and checkbox state using the preferences
	// stored in chrome.storage.
	function restore_options() {
		chrome.storage.sync.get('options', function(data) {
			document.getElementById('replaceWysiwyg').checked = data.options.replaceWysiwyg;
			document.getElementById('fontSizeWysiwyg').value = data.options.fontSizeWysiwyg;
			document.getElementById('minHeightWysiwyg').value = data.options.minHeightWysiwyg;
			document.getElementById('maxHeightWysiwyg').value = data.options.maxHeightWysiwyg;
			document.getElementById('expand').checked = data.options.expand;
			document.getElementById('removeLazyLoading').checked = data.options.removeLazyLoading;
			document.getElementById('myWorkEnhancement').checked = data.options.myWorkEnhancement;
			document.getElementById('highlightId').checked = data.options.highlightId;
			document.getElementById('showPullRequestInfo').checked = data.options.showPullRequestInfo;
			document.getElementById('showCopyListOfStories').checked = data.options.showCopyListOfStories;
			document.getElementById('templateForRelease').value = data.options.templateForRelease;
			document.getElementById('templateForRelease').dispatchEvent(new Event('keyup'));
			document.getElementById('templateForReview').value = data.options.templateForReview;
			document.getElementById('templateForReview').dispatchEvent(new Event('keyup'));
		});
	}

	function handleExamples() {
		document.querySelector('.show-template-examples').addEventListener('click', event => {
			var examples = document.querySelector('.template-examples');

			examples.style.display = examples.style.display !== 'none' ? 'none' : 'block';

			event.preventDefault();
		});

		document.querySelectorAll('.template-example').forEach(example => {
			var input = example.querySelector('.template-example-input');
			var output = example.querySelector('.template-example-output');

			output.innerText = ejs.render(input.innerText, _exampleData);
		});
	}

	function handleTemplatesField() {
		document.querySelectorAll('.template-field').forEach(field => {
			var textarea = field.querySelector('.template-field-textarea');
			var output = field.querySelector('.template-field-output');

			textarea.addEventListener('keyup', function() {
				renderTemplateFieldOutput(textarea, output, _exampleData);
			});

			textarea.addEventListener('change', function() {
				renderTemplateFieldOutput(textarea, output, _exampleData);
			});
		});
	}

	function renderTemplateFieldOutput(textarea, output, data) {
		try {
			output.innerText = ejs.render(textarea.value, data);
		} catch (error) {
			output.innerText = error;
		}
	}

	function allowTabIndent() {
		var textareas = document.querySelectorAll('textarea');
		var count = textareas.length;

		for (var i = 0; i < count; i++) {
			textareas[i].onkeydown = function(e) {
				if(e.keyCode==9 || e.which==9){
					e.preventDefault();
					var s = this.selectionStart;
					this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
					this.selectionEnd = s + 1;
				}
			}
		}
	}
}());

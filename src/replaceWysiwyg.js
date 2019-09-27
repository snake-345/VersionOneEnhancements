(function () {
	var _options = JSON.parse(document.querySelector('body').dataset.options);
	var _oidToken, _uploadUrl, _contentsCss;
	var _isDarkTheme = document.body.classList.contains('dark');
	var _isEditorReplaced = false;

	injectStyle(_options.baseUrl + 'replaceWysiwyg.css');
	injectStyle(_options.baseUrl + 'replaceWysiwyg' + (_isDarkTheme ? 'Dark' : 'Light') + 'Theme.css');

	window.addEventListener('load', function() {
		injectDefaultFontSize(document.head);
		replaceEditor();
	});
	document.addEventListener('voe.onFloatingGadgetShown', replaceEditor);
	document.addEventListener('voe.openLightBox', replaceEditor);
	document.addEventListener('voe.refresh', replaceEditor);

	function replaceEditor() {
		var toggleThemeBackup = V1Next.entryPoints.Admin.ToggleTheme;

		V1Next.entryPoints.Admin.ToggleTheme = function(context) {
			toggleThemeBackup(context);

			document.head.querySelector('link[href*="replaceWysiwyg' + (_isDarkTheme ? 'Dark' : 'Light') + 'Theme.css"]').remove();
			_isDarkTheme = !_isDarkTheme;
			injectStyle(_options.baseUrl + 'replaceWysiwyg' + (_isDarkTheme ? 'Dark' : 'Light') + 'Theme.css');

			if (_isEditorReplaced) { setTimeout(function() { window.location.reload(); }, 500); }
		};

		if (!window.tinyMCE || !tinyMCE.editors.length) return;

		_oidToken = tinyMCE.settings.oidToken;
		_uploadUrl = tinyMCE.settings.postUrl;
		_contentsCss = tinyMCE.settings.content_css;

		if (window.CKEDITOR) {
			replace();
			return;
		}

		window.CKEDITOR_BASEPATH = _options.baseUrl + 'dependencies/ckeditor4/';
		injectScript(_options.baseUrl + 'dependencies/ckeditor4/ckeditor.js', function () {
			CKEDITOR.disableAutoInline = true;

			var interval = setInterval(function () {
				if (CKEDITOR.status === 'loaded') {
					clearInterval(interval);
					replace();
				}
			}, 100);
		});
	}

	function injectDefaultFontSize(place) {
		var style = document.createElement('style');

		style.type = 'text/css';
		style.appendChild(document.createTextNode('.cke_editable, .rich-text { font-size: ' + _options.fontSizeWysiwyg + 'px }'));
		place.appendChild(style);
	}

	function replace() {
		for (var i = 0, l = tinyMCE.editors.length; i < l; i++) {
			(function () {
				var textarea = tinyMCE.editors[0].getElement();
				var textareaContainer = textarea.parentNode;

				tinyMCE.editors[0].destroy();

				if (textareaContainer.classList.contains('inline-edit-content')) {
					var checkbox = addCheckboxForEditing(textarea.closest('.value'));

					textarea.setAttribute('contenteditable', 'false');

					textarea.addEventListener('blur', function() {
						textarea.closest('.rich-text-content').classList.remove('isEditing');
					});

					checkbox.addEventListener('change', function() {
						if (this.checked) {
							ininInlineCKEditor(textarea);
						} else {
							textarea.setAttribute('contenteditable', 'false');

							CKEDITOR.instances[textarea.id].destroy();

							if (!textarea.dataset.isChanged) { return; }

							delete textarea.dataset.isChanged;

							V1.Topics.Publish('RichText/Blur', {
								target: {id: textarea.id}
							});
						}
					});
				} else {
					initCKEditor(textarea, {
						change: function () {
							this.updateElement();
							V1.Html.Event.Fire(this.element.$, "change");
						},
						instanceReady: function (e) {
							e.editor.on('simpleuploads.startUpload', function (e) {
								e.data.extraFields = {
									oidToken: _oidToken
								};
							});

							e.editor.on('simpleuploads.serverResponse', function (e) {
								e.data.url = e.data.xhr.responseText.match(/"Url":"([^"]*)/i)[1];
							});

							e.editor.on('simpleuploads.finishedUpload', function () {
								this.updateElement();
								V1.Html.Event.Fire(this.element.$, "change");
							});
						}
					});
				}
			}());
		}

		_isEditorReplaced = true;
	}

	function ininInlineCKEditor(textarea) {
		textarea.setAttribute('contenteditable', 'true');
		initCKEditor(textarea, {
			blur: function (e) {
				var id = this.element.$.id;

				if (!e.editor.element.$.dataset.isChanged || e.editor.element.$.dataset.isDialogShown) { return; }

				// destroy and reinit for clean garbage from image widget
				e.editor.destroy();

				V1.Topics.Publish('RichText/Blur', {
					target: {id: id}
				});

				ininInlineCKEditor(textarea);
			},
			dialogShow: function(e) {
				e.editor.element.$.dataset.isDialogShown = '1';
			},
			dialogHide: function(e) {
				delete e.editor.element.$.dataset.isDialogShown;
			},
			change: function(e) {
				e.editor.element.$.dataset.isChanged = '1';
			},
			key: function (e) {
				V1.Topics.Publish('RichText/Keyup', e.data.domEvent.$);
			},
			instanceReady: function (e) {
				e.editor.on('simpleuploads.startUpload', function (e) {
					e.data.extraFields = {
						oidToken: _oidToken
					};
				});

				e.editor.on('simpleuploads.serverResponse', function (e) {
					e.data.url = e.data.xhr.responseText.match(/"Url":"([^"]*)/i)[1];
				});
			}
		}, true);
	}

	function initCKEditor(element, on, isInline) {
		var config = {
			height: _options.minHeightTinyMCE,
			autoGrow_minHeight: _options.minHeightTinyMCE,
			autoGrow_maxHeight: _options.maxHeightTinyMCE,
			filebrowserUploadUrl: _uploadUrl,
			filebrowserImageUploadUrl: _uploadUrl,
			coreStyles_strike: {
				element: 'span',
				attributes: {'style': 'text-decoration: line-through;'},
				overrides: 'strike'
			},
			stylesSet: [
				{name: 'Red text', element: 'span', attributes: {class: 'voe-red-color'}},
				{name: 'Blue text', element: 'span', attributes: {class: 'voe-blue-color'}},
				{name: 'Green text', element: 'span', attributes: {class: 'voe-green-color'}},
				{name: 'Yellow highlight', element: 'span', attributes: {class: 'voe-yellow-highlight'}},
				{name: 'Green highlight', element: 'span', attributes: {class: 'voe-green-highlight'}},
				{name: 'Blue highlight', element: 'span', attributes: {class: 'voe-blue-highlight'}}
			],
			simpleuploads_inputname: 'image',
			disallowedContent: '*{color}',
			toolbarGroups: [
				{name: 'clipboard', groups: ['clipboard', 'undo']},
				{name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
				{name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']},
				{name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
				{name: 'links', groups: ['links']},
				{name: 'insert', groups: ['insert', 'addImage']},
				{name: 'forms', groups: ['forms']},
				{name: 'document', groups: ['mode', 'document', 'doctools']},
				{name: 'others', groups: ['others']},
				{name: 'styles', groups: ['styles']},
				{name: 'colors', groups: ['colors']},
				{name: 'about', groups: ['about']},
				{name: 'tools', groups: ['tools']}
			],
			removeButtons: 'Subscript,Superscript,addImage,Source,Blockquote,About,addFile',
			on: on || {}
		};

		var sharedPanel, editingCheckbox, instance;

		if (document.body.classList.contains('dark')) {
			config.skin = 'moono-dark';
		}

		config.contentsCss = [
			'https://fonts.googleapis.com/css?family=Cabin:400,400i,500,500i,600,600i,700,700i&display=swap',
			_options.baseUrl + 'replaceWysiwyg.css',
			_options.baseUrl + 'replaceWysiwyg' + (_isDarkTheme ? 'Dark' : 'Light') + 'Theme.css',
		];

		if (isInline) {
			sharedPanel = addPlaceForSharedPanel(element.closest('.value'));
			editingCheckbox = sharedPanel.parentNode.parentNode.querySelector('.voe-inline-editor-checkbox');

			instance = CKEDITOR.inline(element, Object.assign({
					extraPlugins: 'sharedspace',
					sharedSpaces: {
						top: sharedPanel.id
					}
				}, config));

			instance.on('instanceReady', function() {
				editingCheckbox.classList.add('voe-inline-editor-checkbox_shown');
				sharedPanel.parentNode.style.top = sharedPanel.clientHeight + 'px';
				editingCheckbox.style.top = sharedPanel.clientHeight + 'px';

				window.addEventListener('resize', function () {
					sharedPanel.parentNode.style.top = sharedPanel.clientHeight + 'px';
					editingCheckbox.style.top = sharedPanel.clientHeight + 'px';
				});
			});
			instance.on('beforeDestroy', function() {
				editingCheckbox.style.top = 0 + 'px';
				editingCheckbox.classList.remove('voe-inline-editor-checkbox_shown');
				document.querySelector('#' + sharedPanel.id).parentNode.remove();
			});
		} else {
			instance = CKEDITOR.replace(element, config);
			instance.on('instanceReady', function(e) {
				injectDefaultFontSize(e.editor.document.getHead().$);
			});
		}
	}

	function addCheckboxForEditing(place) {
		var wrapper = document.createElement('div');

		wrapper.classList.add('voe-inline-editor-checkbox');
		wrapper.innerHTML = '' +
			'<div class="voe-inline-editor-checkbox__inner">' +
				'<label>' +
					'<input type="checkbox"> Editing' +
				'</label>' +
			'</div>';
		place.prepend(wrapper);

		return wrapper.querySelector('input');
	}

	function addPlaceForSharedPanel(place) {
		var wrapper = document.createElement('div');

		wrapper.classList.add('voe-inline-editor-shared-panel');
		wrapper.innerHTML = '<div class="voe-inline-editor-shared-panel__inner" id="sharedPanel' + (new Date().getTime()) + '"></div>';
		place.prepend(wrapper);

		return wrapper.querySelector('.voe-inline-editor-shared-panel__inner');
	}
})();

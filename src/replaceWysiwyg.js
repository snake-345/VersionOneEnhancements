(function () {
	var _options = JSON.parse(document.querySelector('body').dataset.options);
	var _oidToken, _uploadUrl, _contentsCss;

	window.addEventListener('load', replaceEditor);
	document.addEventListener('voe.openLightBox', replaceEditor);
	document.addEventListener('voe.refresh', replaceEditor);

	function replaceEditor() {
		if (!window.tinyMCE || !tinyMCE.editors.length) return;

		_oidToken = tinyMCE.settings.oidToken;
		_uploadUrl = tinyMCE.settings.postUrl;
		_contentsCss = tinyMCE.settings.content_css;

		if (window.CKEDITOR) {
			replace();
			return;
		}

		window.CKEDITOR_BASEPATH = _options.baseUrl + 'ckeditor4/';
		injectScript(_options.baseUrl + 'ckeditor4/ckeditor.js', function () {
			CKEDITOR.disableAutoInline = true;

			var interval = setInterval(function () {
				if (CKEDITOR.status === 'loaded') {
					clearInterval(interval);
					replace();
				}
			}, 100);
		});
	}

	function replace() {
		for (var i = 0, l = tinyMCE.editors.length; i < l; i++) {
			(function () {
				var textarea = tinyMCE.editors[0].getElement();
				var textareaContainer = textarea.parentNode;

				tinyMCE.editors[0].destroy();

				if (textareaContainer.classList.contains('inline-edit-content')) {
					// addButtonForEditing(textareaContainer);
					textarea.setAttribute('contenteditable', 'false');
					textarea.addEventListener('focus', function () {
						textarea.setAttribute('contenteditable', 'true');

						initCKEditor(textarea, {
							blur: function (e) {
								var id = this.element.$.id;

								$('.main-panel-scroller').off('scroll');

								textarea.setAttribute('contenteditable', 'false');
								e.editor.destroy();

								V1.Topics.Publish('RichText/Blur', {
									target: {id: id}
								});
							},
							key: function (event) {
								V1.Topics.Publish('RichText/Keyup', event.data.domEvent.$);
							},
							instanceReady: function (e) {
								setupFloatPanel(e);

								e.editor.on('simpleuploads.startUpload', function (ev) {
									ev.data.extraFields = {
										oidToken: oidToken
									};
								});

								e.editor.on('simpleuploads.serverResponse', function (ev) {
									ev.data.url = ev.data.xhr.responseText.match(/"Url":"([^"]*)/i)[1];
								});
							}
						}, true);
					});
				} else {
					initCKEditor(textarea, {
						change: function () {
							this.updateElement();
							V1.Html.Event.Fire(this.element.$, "change");
						},
						instanceReady: function (e) {
							e.editor.on('simpleuploads.startUpload', function (ev) {
								ev.data.extraFields = {
									oidToken: _oidToken
								};
							});

							window.editor = e.editor;

							e.editor.on('simpleuploads.serverResponse', function (ev) {
								ev.data.url = ev.data.xhr.responseText.match(/"Url":"([^"]*)/i)[1];
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
	}

	function setupFloatPanel(e) {
		var $editor = $(e.editor.element.$);
		var $panel = $(document.getElementById('cke_' + $editor.attr('id')));

		$panel.css('maxWidth', $editor.outerWidth() + 'px');

		var $scroller = $('.main-panel-scroller');
		var panelHeight = $panel.outerHeight();
		var editorHeight = $editor.outerHeight();
		var scrollerOffset = $scroller.offset().top;

		$panel.offset({
			top: $editor.offset().top - $panel.outerHeight(),
			left: $editor.offset().left
		});

		setPanelPosition();
		$scroller.on('scroll', function () {
			debouncedSetPanelPosition();
		});

		function debounce(f, ms) {

			var timer = null;

			return function (...args) {
				const onComplete = () => {
					f.apply(this, args);
					timer = null;
				}

				if (timer) {
					clearTimeout(timer);
				}

				timer = setTimeout(onComplete, ms);
			};
		}

		var debouncedSetPanelPosition = debounce(setPanelPosition, 50);

		function setPanelPosition() {
			var editorOffset = $editor.offset().top;
			var editorOffsetBottom = editorOffset + editorHeight;
			var panelOffset = editorOffset - panelHeight;

			if (panelOffset <= scrollerOffset && editorOffsetBottom >= scrollerOffset) {
				$panel.animate({top: scrollerOffset, left: $editor.offset().left, opacity: 1}, 150);
			} else if (editorOffsetBottom < scrollerOffset) {
				$panel.animate({top: scrollerOffset, left: $editor.offset().left, opacity: 0}, 150);
			} else {
				$panel.animate({top: panelOffset, left: $editor.offset().left, opacity: 1}, 150);
			}
		}
	}

	function addButtonForEditing(container) {
		var button = document.createElement('div');
		button.classList.add('voe-inline-editor-button');
		button.classList.add('voe-inline-editor-button_hidden');
		container.appendChild(button);
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
				{name: 'Red text', element: 'span', styles: {'color': 'red'}},
				{name: 'Blue text', element: 'span', styles: {'color': 'blue'}},
				{name: 'Green text', element: 'span', styles: {'color': 'green'}},
				{name: 'Yellow highlight', element: 'span', styles: {'background-color': 'yellow'}},
				{name: 'Light green highlight', element: 'span', styles: {'background-color': 'lightgreen'}},
				{name: 'Light blue highlight', element: 'span', styles: {'background-color': 'lightblue'}}
			],
			extraPlugins: 'simpleuploads,justify,autogrow,keystrokes,notification',
			simpleuploads_inputname: 'image',
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
			removeButtons: 'Subscript,Superscript,Image,Source,Blockquote,About,addFile',
			on: on || {}
		};

		if (isInline) {
			CKEDITOR.inline(element, config);
		} else {
			config.contentsCss = [_options.baseUrl + 'proximaNova.css', _options.baseUrl + 'typography.css'];
			CKEDITOR.replace(element, config);
		}
	}
})();

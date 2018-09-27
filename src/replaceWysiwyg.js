(function () {
	var options = JSON.parse(document.querySelector('body').dataset.options);

	window.addEventListener('load', function() {
		var oldFindEditorByTextareaId = V1.Html.RichText._FindEditorByTextareaId;

		V1.Html.RichText._FindEditorByTextareaId = function(id) {
			var oldElement = oldFindEditorByTextareaId(id);
			var element = document.getElementById(id);

			if (oldElement) {
				return oldElement;
			}

			if (element && element.classList.contains('cke_editable')) {
				return {
					target: document.getElementById(id),
					getContent: function() {
						return document.getElementById(id).innerHTML;
					},
					load: function () {}
				};
			}

			return null;
		};
		replaceEditor();
	});
	document.addEventListener('voe.openLightBox', replaceEditor);

	function replaceEditor() {
		if (window.tinyMCE && tinyMCE.editors.length) {
			window.CKEDITOR_BASEPATH = options.baseUrl + 'ckeditor4/';
			injectScript(options.baseUrl + 'ckeditor4/ckeditor.js', function() {
				CKEDITOR.disableAutoInline = true;

				var interval = setInterval(function() {
					if (CKEDITOR.status === 'loaded') {
						clearInterval(interval);
						replace(options);
					}
				}, 100);
			});
		}
	}

	function replace(options) {
		var oidToken = tinyMCE.settings.oidToken;
		var uploadUrl = tinyMCE.settings.postUrl;

		for (var i = 0, l = tinyMCE.editors.length; i < l; i++) {
			var textarea = tinyMCE.editors[0].getElement();
			var $textareaContainer = $(textarea).parent();

			tinyMCE.editors[0].destroy();

			if ($textareaContainer.hasClass('inline-edit-content')) {
				$(textarea).attr('contenteditable', 'true');
				CKEDITOR.inline(textarea, {
					startupFocus: false,
					height: options.minHeightTinyMCE,
					autoGrow_minHeight: options.minHeightTinyMCE,
					autoGrow_maxHeight: options.maxHeightTinyMCE,
					filebrowserUploadUrl: uploadUrl,
					filebrowserImageUploadUrl: uploadUrl,
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
					on: {
						blur: function() {
							V1.Topics.Publish('RichText/Blur', {
								target: { id: this.element.$.id }
							});
							// console.log(this.element.$);
						},
						change: function () {
							console.log('on change', this.element.$);
							// this.updateElement();
							V1.Html.Event.Fire(this.element.$, "change");
						},
						instanceReady: function (e) {
							e.editor.on('simpleuploads.startUpload', function (ev) {
								ev.data.extraFields = {
									oidToken: oidToken
								};
							});

							window.editor = e.editor;

							e.editor.on('simpleuploads.serverResponse', function (ev) {
								ev.data.url = ev.data.xhr.responseText.match(/"Url":"([^"]*)/i)[1];
							});

							e.editor.on('simpleuploads.finishedUpload', function () {
								// this.updateElement();
								V1.Html.Event.Fire(this.element.$, "change");
							});
						}
					},
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
					removeButtons: 'Subscript,Superscript,Image,Source,Blockquote,About,addFile'
				});
			} else {
				CKEDITOR.replace(textarea, {
					height: options.minHeightTinyMCE,
					autoGrow_minHeight: options.minHeightTinyMCE,
					autoGrow_maxHeight: options.maxHeightTinyMCE,
					filebrowserUploadUrl: uploadUrl,
					filebrowserImageUploadUrl: uploadUrl,
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
					on: {
						change: function () {
							this.updateElement();
							V1.Html.Event.Fire(this.element.$, "change");
						},
						instanceReady: function (e) {
							e.editor.on('simpleuploads.startUpload', function (ev) {
								ev.data.extraFields = {
									oidToken: oidToken
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
					},
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
					removeButtons: 'Subscript,Superscript,Image,Source,Blockquote,About,addFile'
				});
			}
		}
	}
})();

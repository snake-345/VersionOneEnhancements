(function() {
	var options;

	window.addEventListener('SentOptions', function(event) {
		options = event.detail;
	});

	window.addEventListener('load', function() {
		if (window.tinyMCE && tinyMCE.editors.length) {
			window.CKEDITOR_BASEPATH = options.baseUrl + 'ckeditor/';
			injectScript(options.baseUrl + 'ckeditor/ckeditor.js', function() {
				var interval = setInterval(function() {
					if (CKEDITOR.status === 'loaded') {
						clearInterval(interval);
						replace(options);
					}
				}, 100);
			});
		}
	});

	function replace(options) {
		var oidToken = tinyMCE.settings.oidToken;
		var uploadUrl = tinyMCE.settings.postUrl;

		for (var i = 0, l = tinyMCE.editors.length; i < l; i++) {
			var textarea = tinyMCE.editors[0].getElement();
			tinyMCE.editors[0].destroy();

			CKEDITOR.replace(textarea, {
				height: options.minHeightTinyMCE,
				autoGrow_minHeight: options.minHeightTinyMCE,
				autoGrow_maxHeight: options.maxHeightTinyMCE,
				filebrowserUploadUrl: uploadUrl,
				filebrowserImageUploadUrl: uploadUrl,
				coreStyles_strike: {
					element: 'span',
					attributes: { 'style': 'text-decoration: line-through;' },
					overrides: 'strike'
				},
				extraPlugins: 'simpleuploads,justify,autogrow,keystrokes,notification',
				on: {
					change: function() {
						this.updateElement();
						V1.Html.Event.Fire(this.element.$, "change");
					},
					instanceReady: function(e) {
						e.editor.on( 'simpleuploads.startUpload' , function(ev) {
							ev.data.extraFields = {
								oidToken: oidToken
							};
						});

						window.editor = e.editor;

						e.editor.on('simpleuploads.serverResponse', function(ev) {
							ev.data.url = ev.data.xhr.responseText.match(/"Url":"([^"]*)/i)[1];
						});

						e.editor.on('simpleuploads.finishedUpload', function() {
							this.updateElement();
							V1.Html.Event.Fire(this.element.$, "change");
						});
					}
				},
				simpleuploads_inputname: 'image',
				toolbarGroups: [
					{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
					{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
					{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
					{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
					{ name: 'links', groups: [ 'links' ] },
					{ name: 'insert', groups: [ 'insert', 'addImage' ] },
					{ name: 'forms', groups: [ 'forms' ] },
					{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
					{ name: 'others', groups: [ 'others' ] },
					{ name: 'styles', groups: [ 'styles' ] },
					{ name: 'colors', groups: [ 'colors' ] },
					{ name: 'about', groups: [ 'about' ] },
					{ name: 'tools', groups: [ 'tools' ] }
				],
				removeButtons: 'Subscript,Superscript,Image,Source,Blockquote,Styles,About,addFile'
			});
		}
	}
})();
/**
 * Created by snake on 22.03.16.
 */

if (tinyMCE && tinyMCE.editors.length) {
	var oidToken = tinyMCE.settings.oidToken;
	var uploadUrl = tinyMCE.settings.postUrl;

	for (var i = 0, l = tinyMCE.editors.length; i < l; i++) {
		var textarea = tinyMCE.editors[0].getElement();
		tinyMCE.editors[0].destroy();

		CKEDITOR.replace(textarea, {
			filebrowserImageUploadUrl: uploadUrl,
			extraPlugins: 'simpleuploads',
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
			removeButtons: 'addFile,Styles,about,Source',
			removePlugins: 'image,blockquote,Styles,about,Source'
		});
	}
}
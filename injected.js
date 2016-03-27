/**
 * Created by snake on 22.03.16.
 */
(function() {
	var promise = new Promise(function(resolve, reject) {
		window.addEventListener('sendOptions', function(ev) {
			resolve(ev.detail);
		});
	});

	promise.then(function(options) {
		console.log(options);
		if (options.replaceTinyMCE)
			replaceTinyMCE();
		if (options.expand)
			expandFields();
		if (options.typography)
			addTypographyCss();
		if (options.myWorkEnhancement)
			myWorkEnhancement();
	});

	function replaceTinyMCE() {
		if (window.tinyMCE && tinyMCE.editors.length) {
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
	}

	function expandFields() {
		var expandFieldsStyle = document.createElement('style');
		expandFieldsStyle.setAttribute('type', 'text/css');
		expandFieldsStyle.innerHTML = `
			.expander {
				display: none !important;
			}

			.collapsed-text {
				max-height: none !important;
			}
		`;

		document.head.appendChild(expandFieldsStyle);
	}

	function addTypographyCss() {
		var typographyStyle = document.createElement('style');
		typographyStyle.setAttribute('type', 'text/css');
		typographyStyle.innerHTML = `
			.rich-text h1,
			.rich-text h2,
			.rich-text h3,
			.rich-text h4,
			.rich-text h5,
			.rich-text h6 {
				font-weight: bold;
			}

			.rich-text {
				font-size: 15px;
				line-height: 1.4;
				max-width: 1100px !important;
				margin: 0 auto !important;
				border: 0 !important;
				padding-left: 0 !important;
			}
			
			.rich-text p {
				margin: 10px 0;
				line-height: inherit !important;
			}
		`;

		document.head.appendChild(typographyStyle);
	}

	function myWorkEnhancement() {
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.innerHTML = `
			.__in-progress {
				background: #FBFBEB !important;
			}

			.__completed {
				background: #EDFFEB !important;
			}
			
			.__blocked {
				background: #FFF2F2 !important;
			}
		`;

		document.head.appendChild(style);
		makeEnhancement();

		var backupFunc = V1.HttpRequest._CompleteHandler;
		V1.HttpRequest._CompleteHandler = function(a, b) {
			backupFunc(a, b);
			if (typeof a.response === 'string' && a.response.indexOf('MyHome_Mywork_WorkitemSummary_Grid') !== -1) {
				makeEnhancement();
			}
		};

		function makeEnhancement() {
			$.each($('.MyHome_Mywork_WorkitemSummary_Grid .dd-table'), function() {
				var element = $(this).closest('tr[href]');
				var status = $(this).text().toLowerCase();

				element.addClass('__' + status.replace(' ', '-'));
			});
		}
	}
})();
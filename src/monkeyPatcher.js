(function() {
	patchCompleteHandler();
	patchRefresh();
	patchOpenLightBox();
	patchFindEditorByTextareaId();
	patchOnFloatingGadgetShown();

	function patchCompleteHandler () {
		var backupFunc = V1.HttpRequest._CompleteHandler;

		V1.HttpRequest._CompleteHandler = function(a, b) {
			backupFunc(a, b);
			document.dispatchEvent(new Event('voe.completeHandler'));
		};
	}

	function patchRefresh() {
		var backupFunc = V1.Gadgets._Refresh;

		V1.Gadgets._Refresh = function() {
			backupFunc.apply(V1.Gadgets, arguments);
			document.dispatchEvent(new Event('voe.refresh'));
		};
	}

	function patchOpenLightBox() {
		var isOpenLightbox = false;
		var backupFunc = V1.Html.Window.OpenLightbox;

		$(document).on('ajaxComplete', function() {
			if (isOpenLightbox) {
				isOpenLightbox = false;
				document.dispatchEvent(new Event('voe.openLightBox'));
			}
		});

		V1.Html.Window.OpenLightbox = function(a, b) {
			backupFunc(a, b);
			isOpenLightbox = true;
		};
	}

	function patchFindEditorByTextareaId() {
		var backupFunc = V1.Html.RichText._FindEditorByTextareaId;

		V1.Html.RichText._FindEditorByTextareaId = function(id) {
			var oldElement = backupFunc(id);
			var element = document.getElementById(id);

			if (oldElement) {
				return oldElement;
			}

			return {
				target: element,
				getContent: function() {
					return element.innerHTML;
				},
				load: function () {},
				remove: function() {},
				save: function() {},
				isNotDirty: false,
				isDirty: function() { return !this.isNotDirty; },
			};
		};
	}

	function patchOnFloatingGadgetShown() {
		var backupFunc = V1.Gadgets.FloatingGadget._OnFloatingGadgetShown;

		V1.Gadgets.FloatingGadget._OnFloatingGadgetShown = function(a, b) {
			document.dispatchEvent(new Event('voe.onFloatingGadgetShown'));
			backupFunc(a, b);
		}
	}

	(function () {
		var backupFunc = V1.Gadgets.Grid.Initialize;

		V1.Gadgets.Grid.Initialize = function() {
			backupFunc.apply(this, arguments);
			document.dispatchEvent(new Event('voe.gridRendered'));
		}
	}());

	// Use it if you wanna find place which you can monkey patched
	function logAllFunctionCallingInObject(obj) {
		Object.keys(obj).forEach(function(key) {
			if (typeof obj[key] === 'function') {
				var backupFunc = obj[key];

				obj[key] = function() {
					console.log('Call ' + key);
					backupFunc.apply(this, arguments);
				}
			}
		});
	}
})();

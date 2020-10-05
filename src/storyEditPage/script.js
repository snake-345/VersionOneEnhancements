(function() {
	var editor;
	var canvas;
	var fieldsData = {};

	NodeList.prototype.forEach = Array.prototype.forEach;

	chrome.runtime.sendMessage({action: 'editReady'});
	chrome.runtime.onMessage.addListener(function(request) {
		if (request.action === 'sendCaptured') {
			var images = request.data;
			canvas = new fabric.Canvas('editor');

			canvas.setWidth(images[0].params.w);
			canvas.setHeight(images.reduce(function(height, image) {
				return height + image.params.h;
			}, 0));

			imagesLoaded(images, function(images) {
				var ctx = canvas.getContext();

				images.forEach(function(image) {
					var params = image.params;

					ctx.drawImage(image.img, params.sX, params.sY, params.sW, params.sH, params.x, params.y, params.w, params.h);
				});

				fabric.Image.fromURL(canvas.lowerCanvasEl.toDataURL(), function(oImg) {
					oImg.width      = canvas.getWidth();
					oImg.height     = canvas.getHeight();
					oImg.selectable = false;
					canvas.setBackgroundImage(oImg);
				});

				editor = new Editor(canvas);
				editor.initEditor();
			});
		}
	});

	initSelectors();
	initRelations();
	initForm();

	function imagesLoaded(images, cb) {
		var count        = images.length;
		var loadedImages = 0;
		var result       = [];

		images.forEach(function(image, index) {
			var img = new Image();
			result[index] = image;

			img.onload = function() {
				result[index].img = img;
				if (count === ++loadedImages) {
					cb(result);
				}
			};

			img.src = image.url;
		});
	}

	function Editor(fabricCanvas) {
		var self = this;
		var canvas = fabricCanvas;
		this.color = 'red';
		this.fontSize = 20;
		this.lineWidth = 4;
		this.action = null;
		this.arrowAddWidth = 8;

		this.initEditor = function() {
			window.canvas = canvas;

			document.querySelectorAll('.js-editor-action').forEach(function(actionBtn) {
				actionBtn.addEventListener('click', actionHandler);
			});

			document.querySelectorAll('.js-editor-color').forEach(function(color) {
				color.addEventListener('click', function(event) {
					self.setColor(event.currentTarget.dataset.value);
				});
			});

			document.querySelectorAll('.js-editor-line-width').forEach(function(color) {
				color.addEventListener('click', function(event) {
					self.setLineWidth(+event.currentTarget.dataset.value);
				});
			});

			document.querySelector('.js-hide-btn').addEventListener('click', function(event) {
				document.body.classList.toggle('hided-create-defect-panel');
			});

			document.addEventListener("keyup", function(event) {
				if (event.keyCode === 8 || event.keyCode === 46) {
					var activeGroup = canvas.getActiveGroup();
					var activeObject = canvas.getActiveObject();

					if (activeGroup) {
						activeGroup.forEachObject(function(obj) {
							canvas.remove(obj);
						});
						canvas.discardActiveGroup();
						canvas.renderAll();
					}

					if (activeObject && !activeObject.isEditing) {
						canvas.remove(activeObject);
						canvas.renderAll();
					}
				}
			});

			fabric.Group.prototype._controlsVisibility =
			fabric.Object.prototype._controlsVisibility = {
				tl: false,
				tr: false,
				br: false,
				bl: false,
				ml: false,
				mt: false,
				mr: false,
				mb: false,
				mtr: true
			};
			fabric.Object.prototype.cornerSize = 8;
			fabric.Object.prototype.cornerStyle = 'circle';

			canvas.on('text:changed', function() {
				canvas.renderTop();
			});

			canvas.on('text:editing:exited', function(obj) {
				if (!obj.target.text) {
					canvas.remove(obj.target);
				}
			});

			this.startDrawing();
		};

		this.startLine = function() {
			var line;
			var isDown = false;

			newAction('line');
			deactivateAllObjects();
			canvas.defaultCursor = 'crosshair';
			canvas.hoverCursor = 'crosshair';

			canvas.on('mouse:down', function(obj) {
				var pointer = canvas.getPointer(obj.e);
				var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];

				isDown = true;
				line = new fabric.Line(points, {
					strokeWidth: self.lineWidth,
					fill: self.color,
					stroke: self.color,
					originX: 'center',
					originY: 'center',
					perPixelTargetFind: true,
					selectable: false
				});

				canvas.add(line);
			});

			canvas.on('mouse:move', function(obj) {
				if (!isDown) return;
				var pointer = canvas.getPointer(obj.e);
				line.set({
					x2: pointer.x,
					y2: pointer.y
				});

				canvas.renderAll();
			});

			canvas.on('mouse:up', function() {
				line.setCoords();
				isDown = false;
			});
		};

		this.endLine = function() {
			activatAllObjects();
			canvas.off('mouse:down');
			canvas.off('mouse:move');
			canvas.off('mouse:up');
		};

		this.startArrow = function() {
			var line;
			var isDown = false;

			newAction('arrow');
			deactivateAllObjects();
			canvas.defaultCursor = 'crosshair';
			canvas.hoverCursor = 'crosshair';

			canvas.on('mouse:down', function(obj) {
				var pointer = canvas.getPointer(obj.e);
				var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
				var triangle;

				isDown = true;
				line = new fabric.Line(points, {
					strokeWidth: self.lineWidth,
					fill: self.color,
					stroke: self.color,
					originX: 'center',
					originY: 'center',
					hasBorders: false,
					hasControls: false,
					perPixelTargetFind: true
				});

				triangle = new fabric.Triangle({
					left: pointer.x,
					top: pointer.y,
					width: self.lineWidth + self.arrowAddWidth,
					height: self.lineWidth + self.arrowAddWidth,
					angle: -45,
					fill: self.color,
					originX: 'center',
					originY: 'center',
					hasBorders: false,
					hasControls: false,
					lockScalingX: true,
					lockScalingY: true,
					lockRotation: true
				});

				line.triangle = triangle;
				triangle.line = line;

				canvas.add(line);
				canvas.add(triangle);
			});

			canvas.on('mouse:move', function(obj) {
				if (!isDown) return;
				var pointer = canvas.getPointer(obj.e);
				line.set({
					x2: pointer.x,
					y2: pointer.y
				});

				line.triangle.set({
					left: pointer.x,
					top: pointer.y,
					angle: calcArrowAngle(line.x1, line.y1, pointer.x, pointer.y),
				});

				canvas.renderAll();
			});

			canvas.on('mouse:up', function() {
				var group = new fabric.Group();
				line.setCoords();
				line.triangle.setCoords();

				group.set({
					left: line.left,
					top: line.top,
					originX: 'center',
					originY: 'center',
					selectable: false,
					perPixelTargetFind: true
				});
				group.addWithUpdate(line);
				group.addWithUpdate(line.triangle);
				canvas.add(group);
				canvas.renderAll();
				isDown = false;
			});
		};

		this.endArrow = function() {
			activatAllObjects();
			canvas.off('mouse:down');
			canvas.off('mouse:move');
			canvas.off('mouse:up');
		};

		this.startRect = function() {
			var rect;
			var isDown;
			var startX, startY;

			newAction('rect');
			deactivateAllObjects();
			canvas.defaultCursor = 'crosshair';
			canvas.hoverCursor = 'crosshair';

			canvas.on('mouse:down', function(obj) {
				var pointer = canvas.getPointer(obj.e);

				startX = pointer.x;
				startY = pointer.y;
				isDown = true;

				rect = new fabric.Rect({
					strokeWidth: self.lineWidth,
					stroke: self.color,
					fill: 'transparent',
					left: pointer.x,
					top: pointer.y,
					hasBorders: true,
					hasControls: true,
					perPixelTargetFind: true,
					selectable: false
				});

				canvas.add(rect);
			});

			canvas.on('mouse:move', function(obj) {
				if (!isDown) return;
				var pointer = canvas.getPointer(obj.e);
				var w = pointer.x - startX;
				var h = pointer.y - startY;

				rect.set({
					left: Math.min(startX + w, startX),
					top: Math.min(startY + h, startY),
					width: Math.abs(w),
					height: Math.abs(h)
				});

				canvas.renderAll();
			});

			canvas.on('mouse:up', function() {
				rect.setCoords();
				isDown = false;
			});
		};

		this.endRect = function() {
			activatAllObjects();
			canvas.off('mouse:down');
			canvas.off('mouse:move');
			canvas.off('mouse:up');
		};

		this.startText = function() {
			newAction('text');
			deactivateAllObjects();
			canvas.defaultCursor = 'crosshair';
			canvas.hoverCursor = 'crosshair';

			canvas.on('mouse:up', function(obj) {
				if (obj.target && obj.target.type === 'i-text') {
					if (!obj.target.isEditing) {
						obj.target.selectable = true;
						canvas.setActiveObject(obj.target);
						obj.target.enterEditing();
					}
				} else {
					var pointer = canvas.getPointer(obj.e);
					var offsetTop = (self.fontSize * 1.1) / 2;
					var text = new fabric.IText('', {
						padding: 5,
						fontFamily: 'Verdana',
						fontSize: self.fontSize,
						lineHeight: 1.1,
						fill: self.color,
						left: pointer.x,
						top: pointer.y - offsetTop
					});

					canvas.add(text);
					canvas.renderAll();
					text.setCoords();
					canvas.setActiveObject(text);
					text.enterEditing();
				}
			});
		};

		this.endText = function() {
			var activeObject = canvas.getActiveObject();

			if (activeObject) {
				canvas.discardActiveObject();
				canvas.renderAll();
			}

			activatAllObjects();
			canvas.off('mouse:up');
		};

		this.startEllipse = function() {
			var ellipse;
			var isDown;
			var startX, startY;

			newAction('ellipse');
			deactivateAllObjects();
			canvas.defaultCursor = 'crosshair';
			canvas.hoverCursor = 'crosshair';

			canvas.on('mouse:down', function(obj) {
				var pointer = canvas.getPointer(obj.e);

				startX = pointer.x;
				startY = pointer.y;
				isDown = true;

				ellipse = new fabric.Ellipse({
					strokeWidth: self.lineWidth,
					stroke: self.color,
					fill: 'transparent',
					left: pointer.x,
					top: pointer.y,
					hasBorders: true,
					hasControls: true,
					perPixelTargetFind: true,
					selectable: false
				});

				canvas.add(ellipse);
			});

			canvas.on('mouse:move', function(obj) {
				if (!isDown) return;
				var pointer = canvas.getPointer(obj.e);
				var w = pointer.x - startX;
				var h = pointer.y - startY;

				ellipse.set({
					left: Math.min(startX + w, startX),
					top: Math.min(startY + h, startY),
					rx: Math.abs(w) / 2,
					ry: Math.abs(h) / 2
				});

				canvas.renderAll();
			});

			canvas.on('mouse:up', function() {
				ellipse.setCoords();
				isDown = false;
			});
		};

		this.endEllipse = function() {
			activatAllObjects();
			canvas.off('mouse:down');
			canvas.off('mouse:move');
			canvas.off('mouse:up');
		};

		this.startMove = function() {
			newAction('move');

			canvas.defaultCursor = 'default';
			canvas.hoverCursor = 'move';
		};

		this.endMove = function() {
			canvas.discardActiveObject();
			canvas.renderAll();
		};

		this.startDrawing = function() {
			newAction('drawing');
			canvas.isDrawingMode = true;
			canvas.freeDrawingBrush.color = this.color;
			canvas.freeDrawingBrush.width = this.lineWidth;
		};

		this.endDrawing = function() {
			canvas.isDrawingMode = false;
			canvas.getObjects().forEach(function(obj) {
				if (obj.type === 'path') {
					obj.perPixelTargetFind = true;
				}
			});
		};

		this.setColor = function(color) {
			var activeObject = canvas.getActiveObject();

			document.querySelector('.js-editor-color-selected').classList.remove(self.color);
			document.querySelector('.js-editor-color-selected').classList.add(color);
			self.color = color;
			canvas.freeDrawingBrush.color = color;
			document.querySelector('.js-editor-color.active').classList.remove('active');
			document.querySelector('.js-editor-color[data-value=' + color + ']').classList.add('active');

			if (activeObject) {
				if (activeObject.type === 'i-text') {
					activeObject.set({
						fill: color
					});
				} else if (activeObject.type === 'group') {
					activeObject.item(0).set({
						stroke: color
					});
					activeObject.item(1).set({
						fill: color
					});
				} else {
					activeObject.set({
						stroke: color
					});
				}
			}

			if (activeObject) {
				canvas.renderAll();
			}
		};

		this.setLineWidth = function(lineWidth) {
			var activeObject = canvas.getActiveObject();

			document.querySelector('.js-editor-line-width-selected').classList.remove('w' + self.lineWidth);
			document.querySelector('.js-editor-line-width-selected').classList.add('w' + lineWidth);
			canvas.freeDrawingBrush.width = lineWidth;
			self.lineWidth = lineWidth;
			document.querySelector('.js-editor-line-width.active').classList.remove('active');
			document.querySelector('.js-editor-line-width[data-value="' + lineWidth + '"]').classList.add('active');

			if (activeObject) {
				if (activeObject.type !== 'i-text') {
					if (activeObject.type === 'group') {
						activeObject.item(0).set({
							strokeWidth: lineWidth
						});
						activeObject.item(1).set({
							width: lineWidth + self.arrowAddWidth,
							height: lineWidth + self.arrowAddWidth
						});
					} else {
						activeObject.set({
							strokeWidth: lineWidth
						});
					}
				}
			}

			if (activeObject) {
				canvas.renderAll();
			}
		};

		function actionHandler(event) {
			self['start' + capitalizeFirstLetter(event.currentTarget.dataset.action)]();
			event.preventDefault();
		}

		function newAction(newAction) {
			activateActionBtn(newAction);
			if (self.action) {
				self['end' + capitalizeFirstLetter(self.action)]();
			}
			self.action = newAction;
		}

		function activateActionBtn(action) {
			document.querySelectorAll('.js-editor-action').forEach(function(actionBtn) {
				actionBtn.classList.remove('active');
			});
			document.querySelector('.js-editor-action.' + action).classList.add('active');
		}

		function deactivateAllObjects() {
			canvas.selection = false;
			canvas.forEachObject(function(obj) {
				obj.selectable = false;
			});
		}

		function activatAllObjects() {
			canvas.selection = true;
			canvas.forEachObject(function(o) {
				o.selectable = true;
			});
		}

		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		function calcArrowAngle(x1, y1, x2, y2) {
			var angle = 0;
			var x, y;

			x = (x2 - x1);
			y = (y2 - y1);

			if (x === 0) {
				angle = (y === 0) ? 0 : (y > 0) ? Math.PI / 2 : Math.PI * 3 / 2;
			} else if (y === 0) {
				angle = (x > 0) ? 0 : Math.PI;
			} else {
				angle = (x < 0) ? Math.atan(y / x) + Math.PI : (y < 0) ? Math.atan(y / x) + (2 * Math.PI) : Math.atan(y / x);
			}

			return (angle * 180 / Math.PI) + 90;
		}
	}

	function initRelations() {
		var scope = document.querySelector('input[name="Scope"]');
		var parentDropdown = document.querySelector('.js-parent-dropdown');

		scope.addEventListener('change', function(event) {
			var activeScopes = getParentsScopes(fieldsData.scopes, event.target.dataset.value);
			var prevLevel = -1;


			generateDropdown(parentDropdown, fieldsData.parents, 0, function(name, obj, level) {
				if (activeScopes.indexOf(obj.scopeId) !== -1 && prevLevel + 1 >= level || name === '>>> Miscellaneous <<<') {
					prevLevel = level;
					return generateOption(obj.id, level, name);
				} else {
					return '';
				}
			});

			parentDropdown.querySelector('.custom-select-dropdown-item').dispatchEvent(new Event('mousedown', {bubbles: true}));
		});
	}

	function initSelectors() {
		document.querySelectorAll('.js-custom-select').forEach(function(select) {
			var input = select.querySelector('input');
			var dropdown = select.querySelector('.js-custom-select-dropdown');

			input.addEventListener('click', function() {
				dropdown.classList.add('show');
			});

			input.addEventListener('focus', function() {
				dropdown.classList.add('show');
			});

			input.addEventListener('blur', function() {
				setTimeout(function() {
					dropdown.classList.remove('show');
				}, 50);
			});

			dropdown.addEventListener('mousedown', function(event) {
				var item = event.target;
				var active = dropdown.querySelector('.active');

				if (item.classList.contains('custom-select-dropdown-item')) {
					input.dataset.value = item.dataset.value;
					input.value = item.innerText;

					if (active) {
						active.classList.remove('active');
					}

					item.classList.add('active');

					input.dispatchEvent(new Event('change'));
				}
			});
		});

		document.documentElement.addEventListener('click', function(event) {
			var dropdown;

			if (event.target && !event.target.classList.contains('custom-select-input')) {
				dropdown = document.querySelector('.js-custom-select-dropdown.show');

				if (dropdown) {
					dropdown.classList.remove('show');
				}
			}
		});
	}

	function initForm() {
		fetch('https://www8.v1host.com/DealerSocket/rest-1.v1/Data/Scope?sel=Name,Parent&where=AssetState="64"&Accept=application/json', {
			method: 'GET',
			headers: {
				'Authorization': ''
			}
		}).then(function(response) {
			return response.json();
		}).then(function(response) {
			fieldsData.scopes = getTree(response, null, function(asset) {
				return {
					id: asset.id
				}
			});

			if (fieldsData.scopes && fieldsData.parents) {
				generateForm();
			}
		});

		fetch('https://www8.v1host.com/DealerSocket/rest-1.v1/Data/Theme?sel=Name,Scope,Parent&where=AssetState="64"&Accept=application/json', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer 1.0yzDvxnaLXDakgISQ46GqST0pj4='
			}
		}).then(function(response) {
			return response.json();
		}).then(function(response) {
			fieldsData.parents = getTree(response, null, function(asset) {
				return {
					id: asset.id,
					scopeId: asset.Attributes.Scope.value ? asset.Attributes.Scope.value.idref : null,
					scopeName: asset.Attributes['Scope.Name'].value
				}
			});

			if (fieldsData.scopes && fieldsData.parents) {
				generateForm();
			}
		});

		document.querySelector('form').addEventListener('submit', function(event) {
			var form = event.currentTarget;
			var name = form.Name.value;
			var scope = form.Scope.dataset.value.split(':');
			var parent = form.Parent.dataset.value.split(':');
			var description = form.Description.value;
			var image = '<img src="' + canvas.toDataURL() + '" alt="screenshot" width="' + canvas.getWidth() + '" style="max-width: 100%">';

			var params = '' +
				'<Asset href="/DealerSocket/rest-1.v1/New/Defect">' +
					'<Attribute name="Description" act="set"><![CDATA[' +
						'<p>' + description + '</p>' + image +
					']]></Attribute>' +
					'<Attribute name="Name" act="set">' +
						name +
					'</Attribute>' +
					'<Relation name="Scope" act="set">' +
						'<Asset href="/DealerSocket/rest-1.v1/Data/' + scope[0] + '/' + scope[1] + '" idref="' + scope[0] + ':' + scope[1] + '"/>' +
					'</Relation>' +
					'<Relation name="Parent" act="set">' +
						'<Asset href="/DealerSocket/rest-1.v1/Data/' + parent[0] + '/' + parent[1] + '" idref="' + parent[0] + ':' + parent[1] + '"/>' +
					'</Relation>' +
				'</Asset>';

			var options = {
				method: 'POST',
				url: 'https://www8.v1host.com/DealerSocket/rest-1.v1/Data/Defect',
				params: params,
				contentType: 'xml',
				headers: {
					'Authorization': 'Bearer 1.0yzDvxnaLXDakgISQ46GqST0pj4='
				}
			};

			fetch('https://www8.v1host.com/DealerSocket/rest-1.v1/Data/Defect?Accept=application/json', {
				method: 'POST',
				body: params,
				headers: {
					'Authorization': 'Bearer 1.0yzDvxnaLXDakgISQ46GqST0pj4='
				}
			}).then(function(response) {
				return response.json();
			}).then(function(response) {
				var defect = response.id.split(':');
				var url = 'https://www8.v1host.com/DealerSocket/Default.aspx?Page=Widgets/Details/QuickEditDefect&AssetContext=' + defect[0] + ':' + defect[1] + '&Bubble=' + defect[0] + ':' + defect[1];

				chrome.runtime.sendMessage({action: 'openDefectEditing', data: url});
			});

			event.preventDefault();
			return false;
		});
	}

	function generateForm() {
		var activeScope;

		generateDropdown(document.querySelector('.js-scope-dropdown'), fieldsData.scopes, 0, function(name, obj, level) {
			return generateOption(obj.id, level, name);
		});
		document.querySelector('.js-scope-dropdown .custom-select-dropdown-item').dispatchEvent(new Event('mousedown', {bubbles: true}));

		activeScope = document.querySelector('input[name="Scope"]').dataset.value;
		generateDropdown(document.querySelector('.js-parent-dropdown'), fieldsData.parents, 0, function(name, obj, level) {
			if (obj.scopeId === activeScope || name === '>>> Miscellaneous <<<') {
				return generateOption(obj.id, level, name);
			} else {
				return '';
			}
		});
	}

	function getTree(data, parent, setOptions) {
		var treeData = {};

		data.Assets.forEach(function(asset) {
			var parentName = asset.Attributes['Parent.Name'].value;
			var name = asset.Attributes.Name.value;

			if (parent == parentName) {
				treeData[name] = setOptions(asset);
				treeData[name].childrens = getTree(data, name, setOptions);
			}
		});

		return treeData;
	}

	function generateDropdown(dropdown, tree, n, generateOption) {
		var option;

		for (var key in tree) {
			option = generateOption(key, tree[key], n);

			if (option) {
				dropdown.appendChild(option);
			}

			if (tree[key].childrens) {
				generateDropdown(dropdown, tree[key].childrens, n + 1, generateOption);
			}
		}
	}

	function generateOption(value, level, text) {
		var option = document.createElement('div');

		option.dataset.value = value;
		option.classList.add('custom-select-dropdown-item', 'level' + level);
		option.textContent = text;

		return option;
	}

	function getParentsScopes(scopes, scopeId, res) {
		var isFinded;
		var temp;
		res = res || [];

		for (var key in scopes) {
			if (scopes[key].id === scopeId) {
				res.push(scopes[key].id);
				return res;
			}

			if (scopes[key].childrens); {
				temp = res.slice(0);
				temp.push(scopes[key].id);
				isFinded = getParentsScopes(scopes[key].childrens, scopeId, temp);
				if (isFinded) {
					return isFinded;
				}
			}
		}

		return false;
	}
}());

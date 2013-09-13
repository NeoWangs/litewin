// +----------------------------------------------------------------------+
// | litewin.js   简易弹窗
// +----------------------------------------------------------------------+
// | Author: ONEBOYS
// +----------------------------------------------------------------------+
// | Site: www.cssass.com
// +----------------------------------------------------------------------+
(function() {
  var dialogNum = 0, //记录弹出层数量
	maskerNum = 0, //记录有几个弹出层使用了遮罩层
	lockedNum = 0, //记录有几个弹出层使用了locked
	domIdx = 1001, //设置弹出层z-index值
	tipArr = [0];
	//用于tip方法记录位置
	function showDialog(cfg) {
		var config = {//默认值设置。
			title : "提示消息",
			iframe : true,
			btns : '',
			mask : false,
			drag : true,
			locked : false
		}
		extendCopy(cfg || {}, config);
		//对象拷贝继承
		/*
		 * 创建DOM结构
		 */
		var root = document.body;
		var dom = document.createElement("DIV");
		dom.id = config.id || 'dialog' + (Math.random() * 1986 >> 0);
		addClass(dom, "myDialog");
		var domHTML = '<div class="dialog_Wrap">';
		domHTML += '<h3 class="dialog_Head"><b>' + config.title + '</b><span class="dialog_Opts"><a href="javascript:;" class="dialog_close">&#10005;</a></span></h3>';
		domHTML += (config.html == undefined) ? '<div class="dialog_Body"><iframe class="dialog_iframe" src="' + config.url + '" allowTransparency=true frameborder=no border=0  width=100% height=100% ></iframe></div>' : '<div class="dialog_Body"><div class="dialog_Cont">' + config.html + config.btns + '</div></div>';
		domHTML += '</div>';
		if(config.iframe) {
			var iframeStr = '<iframe frameborder="no" class="converIframe" src="about:blank"></iframe>'
			domHTML += iframeStr;
		}
		if(config.mask) {
			maskerNum++;
			var maskDom = null;
			if(!$id("masker")) {
				maskDom = document.createElement("DIV");
				maskDom.id = "masker";
				maskDom.style.cssText = "position:absolute;width:100%;top:0;left:0;z-index:1000;";
				maskDom.style.height = Math.max(document.documentElement.clientHeight, root.offsetHeight) + 'px';
				root.appendChild(maskDom);
				events.addEvent(window, "resize", _resize);
			} else {
				maskDom = $id("masker");
			}
		}
		//firefox8之前不支持insertAdjacentHTML
		(dom.insertAdjacentHTML) ? dom.insertAdjacentHTML('beforeEnd', domHTML) : dom.innerHTML = domHTML;
		root.appendChild(dom);
		dialogNum++; 
		(function setting() {
			/*
			 *绑定一些方法,设置一些样式
			 */
			var closeBtn = $class("dialog_close",dom)[0], dialogHead = $class("dialog_Head",dom)[0];
			if(config.height) {
				// 有高度设置
				var dialogBody = $class("dialog_Body",dom)[0], dialogIframe = $class("dialog_iframe", dom);
				var bodyHeight = config.height - dialogHead.offsetHeight;
				dialogBody.style.height = bodyHeight + "px";
			}
			if(config.locked) {
				lockedNum++;
				addClass(document.documentElement, 'locked');
			}
			_pos();
			domIdx++;
			events.addEvent(closeBtn, 'click', _close);
			events.addEvent(dialogHead, 'mousedown', _drag);
		})();

		function _resize() {
			/* 针对masker层 */
			maskDom.style.height = Math.max(document.documentElement.clientHeight, root.offsetHeight) + 'px';
		}

		function _drag() {
			if(dialogNum != 1)
				dom.style.zIndex = domIdx++;
			//如果只有一个弹出层，点击不改变zIndex值
			if(!config.drag)
				return false;
			var e = arguments[0] || window.event;
			var tX = dom.offsetLeft, tY = dom.offsetTop, dx = e.clientX, dy = e.clientY;
			addClass(root, "draging");
			events.addEvent(document, 'mousemove', dragHandle);
			events.addEvent(document, 'mouseup', function() {
				events.removeEvent(document, 'mousemove', dragHandle);
				removeClass(root, "draging");
			});
			function dragHandle() {
				var e = arguments[0] || window.event;
				dom.style.left = tX + (e.clientX - dx) + "px";
				dom.style.top = tY + (e.clientY - dy) + "px";
			};
		}

		function _close() {
			if(config.beforeClose){
				var _continue = config.beforeClose();
				if(_continue == false) return;
 			}
			if(dom) {
				root.removeChild(dom);
				//删除Win中记录的dialog对象
				delete Win.wins[dom.id]; 
				dom = null;
				domIdx--;
				if(true) {
					if(--dialogNum === 0) {
						//重置z-index基数
						domIdx = 1001;
					}
				}
				if(config.mask) {
					if(--maskerNum === 0) {
						//删除遮罩层
						root.removeChild(maskDom);
						events.removeEvent(window, "resize", _resize);
					}
				}
				if(config.locked) {
					if(--lockedNum === 0) {//去除locked
						removeClass(document.documentElement, 'locked');
					}
				}
			};
			return false;
		};

		function _css(css) {
			dom.style.cssText += ";" + css;
			return this;
		};

		function _pos(align) {
			var windowSize = [document.documentElement.offsetWidth, document.documentElement.clientHeight], boxSize = [(config.width || 200), config.height || dom.offsetHeight], scrollTop = root.scrollTop || document.documentElement.scrollTop, posLeft = null, posTop = null;
			switch(align) {
				case 'leftTop':
					posLeft = 0;
					posTop = 0;
					break;
				case 'rightTop':
					posLeft = windowSize[0] - boxSize[0] - 10;
					posTop = 0;
					break;
				case 'leftBottom':
					posLeft = 0;
					posTop = windowSize[1] - boxSize[1] + scrollTop - 10;
					break;
				case 'rightBottom':
					posLeft = windowSize[0] - boxSize[0] - 10;
					posTop = windowSize[1] - boxSize[1] + scrollTop - 10;
					break;
				case 'center' :
				default :
					posLeft = (windowSize[0] - boxSize[0]) / 2;
					posTop = Math.max(((windowSize[1] - boxSize[1]) / 2 + scrollTop), 0);
			}
			dom.style.cssText += "position:absolute;z-index:" + domIdx + ";left:" + posLeft + "px; top:" + posTop + "px; width:" + boxSize[0] + "px; height:" + boxSize[1] + "px;";
			return this;
		}

		return {
			/*
			 *返回给外面的dialog对象属性方法
			 */
			'id' : dom.id,
			'dom' : dom,
			'position' : _pos,
			'css' : _css,
			'close' : _close
		}
	};

	var Win = {
		wins : {
			//记录当前所有dialog对象。
		}, 
		open : function(config) {
			//其他弹窗都基于 Win.open
			if( typeof (config) == "string") {
				var html = config;
				config = {
					html : html
				};
			};
			/* 如有同名id的dialog，先将其移除 */
			if(this.wins[config.id]) {
				this.wins[config.id].close();
			};
			var _myDialog = showDialog(config);
			this.wins[_myDialog.id] = _myDialog;
			return _myDialog;
		},
		alert : function(config, time) {
			/* 带自动关闭功能 */
			if( typeof (config) == "string") {
				var html = config;
				config = {
					id : "dialogAlert",
					html : html
				};
			};
			var myAlert = Win.open(config);
			if(time !== 0) {
				var t = time || 3000;
				setTimeout(function() {
					myAlert.close();
				}, t);
			}
			return myAlert;
		},
		notice : function(config, time) {
			/*
			 *	带自动排列功能
			 */
			if( typeof (config) != "object") {
				var html = config;
				config = {
					html : html
				};
			};

			/* webkit直接用Notifications API.  */
			if(window.webkitNotifications && config.html) {
				var icon = "";
				//可带图片，暂不提供
				if(window.webkitNotifications.checkPermission() == 0) {
					var popup = window.webkitNotifications.createNotification(icon, config.title, config.html);
					popup.ondisplay = function(event) {
						if(time == 0)
							return false;
						var t = time || 3000;
						setTimeout(function() {
							event.currentTarget.cancel();
						}, t);
					}
					popup.beforeClose = function(event) {
						config.beforeClose();
					}
					popup.show();
				} else {
					window.webkitNotifications.requestPermission();
				}
				return;
			}
			/*
			 * 计算位置。tipArr保存的是每一个tip窗口，距离页面上方应该有的top值。
			 */
			var l = tipArr.length, idx = 0, toalHeight = 0; (function() {
				for(var i = 0; i < l; i++) {
					if(tipArr[i] === 0) {
						idx = i;
						return;
					}
					toalHeight += tipArr[i];
				}
				idx = tipArr.length;
			})();

			var moreConfig = {
				beforeClose : config.beforeClose || null
			};
			config.beforeClose = function() {
				tipArr[idx] = 0;
				if(tipArr[tipArr.length - 1] == 0)
					tipArr.pop();
				//发现tipArr最后一项为0，则Pop
				if(moreConfig.beforeClose)
					moreConfig.beforeClose();
			};
			config.drag = false;
			var myTip = Win.alert(config, time).position("rightBottom");
			var tipHeight = myTip.dom.offsetHeight + 10;
			tipArr[idx] = tipHeight;
			myTip.css("top:" + (document.documentElement.clientHeight - toalHeight - tipHeight) + "px;");
			return myTip;
		},
		confirm : function(config, ok, cancel) {
			/* 带确定取消功能 */
			if( typeof (config) == "string") {
				var html = config;
				config = {
					title : "确认消息",
					html : html
				};
			}
			config.btns = '<div class="dialog_Btns"><b class="Btn BtnY"><a class="okBtn" href="javascript:;">确定</a></b> <b class="Btn BtnN"><a class="cancelBtn" href="javascript:;">取消</a></span></div>'
			var myConfirm = Win.open(config);
			var okBtn = $class('okBtn', myConfirm.dom), cancelBtn = $class('cancelBtn', myConfirm.dom);
			events.addEvent(okBtn, 'click', ok);
			if(typeof(cancel) == 'function'){
				events.addEvent(cancelBtn, 'click', cancel);
			}
			events.addEvent(okBtn, 'click', myConfirm.close);
			events.addEvent(cancelBtn, 'click', myConfirm.close);
			return myConfirm;
		}
	}
	window.Win = Win;
})()

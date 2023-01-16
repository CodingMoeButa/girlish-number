(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.WindowCtrl = factory();
	}
})(this, function() {
	'use strict';
	//
	var div = document.createElement('div');
	var prefix = ['webkit', 'moz', 'o', 'ms'];
	var saveProp = {};
	var support = {};
	support.transform3d = hasProp(['perspectiveProperty','WebkitPerspective','MozPerspective','OPerspective','msPerspective']);
	support.transform = hasProp(['transformProperty','WebkitTransform','MozTransform','OTransform','msTransform']);
	support.transition = hasProp(['transitionProperty','WebkitTransitionProperty','MozTransitionProperty','OTransitionProperty','msTransitionProperty']);
	support.cssAnimation = (support.transform3d || support.transform) && support.transition;
	//
	var menu = document.createElement('div');
	menu.className = 'gh-sidemenu';
	menu.innerHTML = '<nav><p class="sm-title">番組ジャンル</p><ul><li><a href="/drama/">ドラマ・映画</a></li><li><a href="/variety/">バラエティ・音楽</a></li><li><a href="/news-info/">報道・情報・ドキュメンタリー</a></li><li><a href="/anime/">アニメ</a></li><li><a href="/sports/">スポーツ</a></li><li><a href="/mini_bangumi/">ミニ番組</a></li><li><a href="/shopping/">ショッピング</a></li></ul><ul><li><a href="/anatsu/">アナウンサー</a></li><li><a href="https://shopping.tbs.co.jp/tbs/" target="_blank">番組グッズ</a></li><li><a href="/contact/">ご意見・お問い合わせ</a></li><li><a href="/sitemap/">サイトマップ</a></li></ul>';
	if (_ua.mobile || _ua.tablet)  menu.innerHTML += '<ul><li><a href="https://spstore.tbs.co.jp/">TBS 会員向けポータルサイト</a></li></ul>';
	menu.innerHTML += '</nav><div class="sm-search"><form action="/search/index.html"><input type="text" placeholder="サイト内検索" name="q" value=""><input type="hidden" name="c" value="tbs"><input type="hidden" name="p" value="1"><button type="submit">検索</button></form></div>';
	//
	var data = {cliW:null, cliH:null, inrW:null, inrH:null, scrlT:null};
	var WindowCtrl = function WindowCtrl(){
		return (this instanceof WindowCtrl) ? this.init() : new WindowCtrl();
	};
	//
	WindowCtrl.prototype.init = function() {
		//
		document.body.insertBefore(menu, document.body.firstChild);
		this.wrap = document.getElementById('con-wrap');
		this.body = document.getElementById('con-body');
		//
		// ↓ 2019.02.27
		this.fixbg = document.querySelector('.tbs-fix-bg') || null;
		// ↑ 2019.02.27
		//
		this.cover = document.createElement('div');
		this.cover.style.cssText = 'z-index:900;position:absolute;background-color:#000;width:100%;height:100%;left:0;top:0;right:0;bottom:0;';
		//
		if (support.cssAnimation) {
			saveStyle({
				transitionProperty: 'opacity',
				transitionTimingFunction: 'cubic-bezier(0,0,0.25,1)',
				transitionDuration: '500ms',
				opacity: 0
			}, this.cover);
		} else {
			saveStyle({
				opacity: 0
			}, this.cover);
		}
		this.opMax = 80;
		//
		this.flsLR = '';
		//
		this.sideMenu = false;
		this.overlay = false;
		this.flgScrlT = false;
		this.scrlT = null;
		this.scrlTPlus = null;
		//
		this.timerEv = null;
		//
		this.a = document.getElementById('sideMenuCtrl');
		this.a.addEventListener('click',this,false);
		//
		//
		// ↓ 2019.03.08
		this.ar = document.querySelector('.rightSideMenu-btn a') || null;
		this.menuR = document.querySelector('.rightSideMenu-contents') || null;
		if (this.ar && this.menuR) {
			this.ar.addEventListener('click',this,false);
			this.menuR.style.display = 'none';
		}
		// ↑ 2019.03.08
		//
		//
		this.mw = 250;
		this.max = 480;
		this.timer = null;
		this.now = 0;
		this.goal = null;
		this.dist = null;
		this.running = false;
		//
		//
		chkWin();
		return this;
	};

	WindowCtrl.prototype.handleEvent = function(event){
		switch (event.type) {
			case 'click':
				var ev = event || window.event;
				try {
					ev.preventDefault();
					ev.stopPropagation();
				} catch(e) {
					ev.returnValue = false;
					ev.cancelBubble = true;
				}
				//
				//
				try { if (agreeFlg) return; } catch(e) {};
				if (!this.overlay) {
					if (ev.target.parentNode.className=='rightSideMenu-btn' && !this.sideMenu) {
						this.openSideMenu('right');
						return;
					}
					if (ev.target.id == 'sideMenuCtrl' && !this.sideMenu) this.openSideMenu('left');
				} else {
					this.hideOverlay();
					if (this.sideMenu) this.closeSideMenu();
				}
				break;
			case 'resize':
			case 'scroll':
				clearTimeout(this.timerEv);
				this.timerEv = setTimeout((function(i){return function(){i.resize()};})(this),100);
				break;
			default:
				break;
		}
	};

	WindowCtrl.prototype.setListener = function(){
		window.addEventListener('scroll',this,false);
		window.addEventListener('resize',this,false);
	};
	WindowCtrl.prototype.cancelListener = function(){
		window.removeEventListener('scroll',this,false);
		window.removeEventListener('resize',this,false);
	};

	WindowCtrl.prototype.openSideMenu = function(flg){
		if (this.running) return;
		clearTimeout(this.timer);
		//
		this.flsLR = flg;
		//
		chkWin();
		//
		if (typeof this.startSlideOpen == 'function') this.startSlideOpen();
		this.sideMenu = true;
		this.showOverlay('#000');
		//
		window.scrollTo(0,0);
		//
		if (this.flsLR == 'left') {
			this.a.style.backgroundPosition = '-170px -150px';
			this.a.style.zIndex = '901';
			//
			menu.style.display = 'block';
			menu.style.position = 'absolute';
			menu.style.top = '0';
			menu.style.left = '0';
			if (menu.offsetHeight<data.cliH) menu.style.bottom = '0';
			else this.wrap.style.height = menu.offsetHeight + 'px';
			menu.style.width = this.mw + 'px';
		} else if (this.flsLR == 'right') {
			if (hasClass(this.ar,'rightSideMenu-btn-close')) {
				removeClass(this.ar,'rightSideMenu-btn-close');
				addClass(this.ar,'rightSideMenu-btn-open');
			}
			this.ar.style.zIndex = '901';
			this.body.style.zIndex = '2';
			//
			this.menuR.style.display = 'block';
			this.menuR.style.position = 'absolute';
			this.menuR.style.top = '0';
			this.menuR.style.right = '0';
			this.menuR.style.width = '100%';
			if (this.menuR.offsetHeight<data.cliH) this.menuR.style.bottom = '0';
			else this.wrap.style.height = this.menuR.offsetHeight + 'px';
			//
			var pr = data.cliW - this.mw;
			this.menuR.style.paddingLeft = pr + 'px';
		}
		//
		this.goal = ((data.cliW-70) > this.max) ? this.max : data.cliW-70;
		//
		if (this.flsLR == 'right') this.goal *= -1;
		//
		this.move();
		this.running = true;
	};
	WindowCtrl.prototype.closeSideMenu = function(){
		if (this.running) return;
		clearTimeout(this.timer);
		if (typeof this.startSlideClose == 'function') this.startSlideClose();
		//
		if (this.flsLR == 'left') {
			this.a.style.backgroundPosition = '-170px -50px';
			this.a.style.zIndex = 'auto';
		} else if (this.flsLR == 'right') {
			if (hasClass(this.ar,'rightSideMenu-btn-open')) {
				removeClass(this.ar,'rightSideMenu-btn-open');
				addClass(this.ar,'rightSideMenu-btn-close');
			}
			this.ar.style.zIndex = 'auto';
		}
		//
		// ↓ 2019.02.27
		if (this.fixbg) {
			menu.style.display = 'none';
			if (this.menuR) this.menuR.style.display = 'none';
		}
		// ↑ 2019.02.27
		//
		this.goal = 0;
		this.move();
		this.running = true;
		//
		if (this.flsLR == 'left') menu.style.zIndex = 'auto';
		else if (this.flsLR == 'right') this.menuR.style.zIndex = 'auto';
		this.body.style.zIndex = '1';
	};

	WindowCtrl.prototype.set = function(x) {
		this.body.style.left = this.now + 'px';
		this.mw = this.now;
		if (this.flsLR == 'left') {
			if (this.mw<250) this.mw = 250;
			menu.style.width = this.mw + 'px';
		} else if (this.flsLR == 'right') {
			var mw = this.mw*-1;
			if (mw<250) mw = 250;
			var pr = data.cliW - mw;
			this.menuR.style.paddingLeft = pr + 'px';
		}
	};
	WindowCtrl.prototype.move = function(x) {
		this.dist = Math.round((this.now-this.goal)/4);
		if (this.dist==0) {
			if (Math.abs(this.now-this.goal)>1) {
				((this.now-this.goal)>0) ? this.now -= 1 : this.now += 1;
				this.set(this.now);
				this.timer = setTimeout((function(i){return function(){i.move();};})(this),50);
			} else {
				this.now = this.goal;
				this.set(this.now);
				//
				this.endMove();
				return;
			}
		} else {
			this.now -= this.dist;
			this.set(this.now);
			this.timer = setTimeout((function(i){return function(){i.move();};})(this),50);
		}
	};
	WindowCtrl.prototype.endMove = function(flg) {
		this.running = false;
		this.flg = flg;
		if (this.goal==0 || this.flg=='smp') {
			this.sideMenu = false;
			if (this.flsLR == 'left') {
				menu.style.bottom = 'auto';
				menu.style.display = 'none';
			} else {
				this.menuR.style.bottom = 'auto';
				this.menuR.style.display = 'none';
			}
			this.shutDown();
			//
			if (typeof this.endSlideClose == 'function') this.endSlideClose();
		} else {
			if (this.flsLR == 'left') {
				this.resize();
				menu.style.zIndex = '1';
			} else if (this.flsLR == 'right') {
				this.resize();
				this.menuR.style.zIndex = '1';
			}
			if (typeof this.endSlideOpen == 'function') this.endSlideOpen();
		}
	};

	WindowCtrl.prototype.showOverlay = function(bgcolor,scrlT,opmax){
		if (this.overlay) return;
		this.overlay = true;
		//
		if (bgcolor) this.cover.style.backgroundColor = bgcolor;
		if (opmax) this.opMax = opmax;
		this.flgScrlT = scrlT ? true : false;
		if (this.cover.parentNode!=this.body) this.body.appendChild(this.cover);
		this.cover.addEventListener('click', this, false);
		//
		document.documentElement.style.overflowX = 'hidden';
		//
		this.body.style.position = 'relative';
		if (this.flgScrlT) {
			this.scrlT = document.documentElement.scrollTop || document.body.scrollTop;
			this.body.style.top = this.scrlT*-1 + 'px';
		} else {
			this.body.style.top = '0';
		}
		//
		this.wrap.style.right = '0';
		this.wrap.style.bottom = '0';
		// this.wrap.style.height = data.cliH + 'px';
		this.wrap.style.overflow = 'hidden';
		//
		this.body.style.width = '100%';
		// this.body.style.height = '100%';
		this.body.style.bottom = '0';
		//
		this.cover.style.opacity = this.opMax/100;
		//
		this.setListener();
	};
	WindowCtrl.prototype.hideOverlay = function(){
		if (!this.overlay) return;
		if (this.running) return;
		this.overlay = false;
		this.cover.removeEventListener('click', this, false);
		this.cover.style.opacity = 0;
		//
		if (!this.sideMenu) this.shutDown();
		//
		if (this.cover.parentNode==this.body) setTimeout((function(i){return function(){i.body.removeChild(i.cover);};})(this),700);
		//
		try { if (agreeFlg) agreeFlg = false; } catch(e) {};
	};
	WindowCtrl.prototype.shutDown = function(){
		//
		document.documentElement.style.overflowX = 'visible';
		this.body.style.width = 'auto';
		// this.body.style.height = 'auto';
		this.body.style.position = 'static';
		this.body.style.top = 'auto';
		this.body.style.bottom = 'auto';
		this.body.style.zIndex = 'auto';
		//
		this.wrap.style.height = 'auto';
		this.wrap.style.right = 'auto';
		this.wrap.style.bottom = 'auto';
		this.wrap.style.overflow = 'visible';
		//
		//
		if (this.flgScrlT) {
			var t = this.scrlT + this.scrlTPlus;
			document.body.scrollTop = t;
			if (!document.body.scrollTop && t) {
				document.documentElement.scrollTop = t;
			}
		}
		this.cancelListener();
	};
	WindowCtrl.prototype.getWin = function(){
		chkWin();
		var w = [data.cliW, data.cliH, data.inrW, data.inrH];
		return w;
	};
	WindowCtrl.prototype.resize = function(flg){
		if (!this.overlay) return;
		if (this.running) return;
		//
		chkWin();
		if (this.flgScrlT) this.scrlTPlus = document.documentElement.scrollTop || document.body.scrollTop;
		if (this.sideMenu) {
			this.wrap.style.height = 'auto';
			
			if (this.flsLR == 'left') {
				menu.style.bottom = 'auto';
				//
				if (menu.offsetHeight<data.cliH) menu.style.bottom = '0';
				else this.wrap.style.height = menu.offsetHeight + 'px';
				this.mw = ((data.cliW-70) > this.max) ? this.max : data.cliW-70;
				if (this.mw<250) this.mw = 250;
				this.now = this.mw;
				menu.style.width = this.mw + 'px';
				this.body.style.left = this.mw + 'px';
			} else if (this.flsLR == 'right') {
				this.menuR.style.bottom = 'auto';
				//
				if (this.menuR.offsetHeight<data.cliH) this.menuR.style.bottom = '0';
				else this.wrap.style.height = this.menuR.offsetHeight + 'px';
				//
				this.mw = ((data.cliW-70) > this.max) ? this.max : data.cliW-70;
				if (this.mw<250) this.mw = 250;
				var pr = data.cliW - this.mw;
				if (pr<70) pr = 70;
				this.menuR.style.paddingLeft = pr + 'px';
				this.body.style.left = -1*this.mw + 'px';
			}
			//
		}
		// this.wrap.style.height = data.cliH + 'px';
		// if (!flg) setTimeout((function(i){return function(){i.resize(true);};})(this),700);
	};
	WindowCtrl.prototype.complete = function() {
		if (this.sideMenu) {
			this.running = false;
			this.hideOverlay();
			this.closeSideMenu();
		}
	};
	//
	function chkWin(){
		data.cliW = document.documentElement.clientWidth;
		data.cliH = document.documentElement.clientHeight;
		data.inrW = window.innerWidth;
		data.inrH = window.innerHeight;
		data.scrlT = document.documentElement.scrollTop || document.body.scrollTop;
	}
	//
	function hasProp(props) {
		return some(props, function(prop) {
			return div.style[ prop ] !== undefined;
		});
	}
	function saveStyle(styles, elem) {
		var style = elem.style;
		for (var prop in styles) {
			setStyle(style, prop, styles[prop]);
		}
	}
	function setStyle(style,prop,val) {
		var _saveProp = saveProp[prop];
		if (_saveProp) {
			style[_saveProp] = val;
		} else if (style[prop] !== undefined) {
			saveProp[prop] = prop;
			style[prop] = val;
		} else {
			some(prefix, function(_prefix){
				var _prop = ucFirst(_prefix) + ucFirst(prop);
				if (style[_prop] !== undefined) {
					saveProp[prop] = _prop;
					style[_prop] = val;
					return true;
				}
			});
		}
	}
	function getCSSVal(prop) {
		if (div.style[ prop ] !== undefined) {
			return prop;
		} else {
			var ret;
			some(prefix, function(_prefix) {
				var _prop = ucFirst(_prefix) + ucFirst(prop);
				if (div.style[ _prop ] !== undefined) {
					ret = '-' + _prefix + '-' + prop;
					return true;
				}
			});
			return ret;
		}
	}
	function ucFirst(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	}
	function some(ary, callback) {
		for (var i = 0, len = ary.length; i < len; i++) {
			if (callback(ary[i], i)) {
				return true;
			}
		}
		return false;
	}
	//
	function addClass(element,classNameValue){
		if (!element || typeof element.className === 'undefined' || typeof classNameValue !== 'string') return;
		if (element.classList) {
			element.classList.add(classNameValue);
		} else {
			var classNames = element.className.replace(/^\s+|\s+$/g, '').split(' ');
			if (classNames.toString() === '') {
				classNames = [];
			}
			if (classNames.indexOf(classNameValue) > -1) return;
			classNames.push(classNameValue);
			element.className = classNames.join(' ');
		}
		return element;
	}
	function removeClass(elem,classNameValue){
		var elem = elem;
		var cname = classNameValue;
		var already = elem.getAttribute('className') || elem.getAttribute('class');
		if (!elem || !already || typeof cname !== 'string') return;
		if (elem.classList) {
			elem.classList.remove(cname);
		} else {
			var arrClsName = already.replace(/^\s+|\s+$/g, '').split(' '), hasClsName = false;
			if (arrClsName.indexOf(cname) === -1) return;
			if (arrClsName.toString() === '') {
				arrClsName = [];
			}
			for (var i=0,len=arrClsName.length; i<len; i++) {
				if (arrClsName[i] !== cname) continue;
				arrClsName.splice(i, 1);
				hasClsName = true;
				break;
			}
			if (hasClsName) elem.className = arrClsName.join(' ');
		}
		return elem;
	}
	function hasClass (elem, selector, orflg) {
		var i, len, hitCount = 0;
		if (!elem || typeof elem.className !== 'string') return;
		var strTrim = function(str) {
			return (str) ? str.replace(/^\s+|\s+$/g, '') : str;
		};
		var inArray = function(searchValue, arrayData) {
			var key, result = -1;
			if (!searchValue || !arrayData) return result;
			if (typeof searchValue !== 'string' || typeof arrayData !== 'object') return result;
			for (key in arrayData) {
				if (arrayData[key] === searchValue) {
					result = key;
					break;
				}
			}
			return result;
		};
		if (typeof selector === 'string') {
			selector = (selector.match(/^\./)) ? selector.replace(/^\./, '').split('.') : strTrim(selector).split(' ');
		}
		for (i = 0, len = selector.length; i < len; i++) {
			if (inArray(selector[i], elem.className.split(' ')) !== -1) {
				hitCount++;
			}
		}
		if (orflg) {
			if (hitCount > 0) return true;
		} else {
			if (hitCount === len) return true;
		}
		return false;
	}
	//
	return WindowCtrl;
});
var _sideMenu;
try{
	document.addEventListener('DOMContentLoaded', function(){_sideMenu=WindowCtrl();}, false);
}catch(e){}

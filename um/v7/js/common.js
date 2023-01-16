//===========================================
//	TBS common js
//===========================================
//
/*	Information (c) TBS
------------------------------------------------------------------------------------------
2016.02.22
1. check UA
2. noContextMenu
3. TBS search Box (PC size)
----------------------------------------------------------------------------------------*/
//
// ============================
//	check UA
// ============================
//
var _ua = ({
	ltIE6: false,
	ltIE7: false,
	ltIE8: false,
	mobile: false,
	tablet: false,
	mouse: false,
	touch: false,
	pointer: false,
	msPointer: false,
	browser: 'unknown',	// browser
	device: 'pc',			// pc or ipad or iphone or android
	webstorage: true,
	retina: false,
	pixelRatio: 1,
	init: function(){
		// UA
		var ua = window.navigator.userAgent.toLowerCase();
		if (ua.indexOf('msie') != -1) {
			if (ua.indexOf('msie 6.') != -1) this.browser = 'ie6';
			else if (ua.indexOf('msie 7.') != -1) this.browser = 'ie7';
			else if (ua.indexOf('msie 8.') != -1) this.browser = 'ie8';
			else if (ua.indexOf('msie 9.') != -1) this.browser = 'ie9';
			else if (ua.indexOf('msie 10.') != -1) this.browser = 'ie10';
		} else if (ua.indexOf('trident/7') != -1) {
			this.browser = 'ie11';
		} else if (ua.indexOf('edge') != -1) {
			this.browser = 'edge';
		} else if (ua.indexOf('ipad') != -1) {
			this.device = 'ipad';
			this.tablet = true;
		} else if (ua.indexOf('iphone') != -1 || ua.indexOf('ipod') != -1) {
			this.device = 'iphone';
			this.mobile = true;
		} else if (ua.indexOf('android') != -1) {
			this.device = 'android';
			if (ua.indexOf('mobile') != -1) {
				this.mobile = true;
			} else {
				this.tablet = true;
			}
			if (ua.indexOf('chrome') != -1) this.browser = 'chrome';
		} else if (ua.indexOf('opera') != -1 || ua.indexOf('opr') != -1) {
			this.browser = 'opera';
		} else if (ua.indexOf('chrome') != -1) {
			this.browser = 'chrome';
		} else if (ua.indexOf('safari') != -1) {
			this.browser = 'safari';
		}
		if ('MozAppearance' in document.documentElement.style) this.browser = 'firefox';
		this.ltIE6 = (typeof window.addEventListener == 'undefined' && typeof document.documentElement.style.maxHeight == 'undefined') ? true : false;
		this.ltIE7 = (typeof window.addEventListener == 'undefined' && typeof document.querySelectorAll == 'undefined') ? true : false;
		var msie = (ua.indexOf('msie')>-1) ? parseInt(ua.replace(/.*msie[ ]/,'').match(/^[0-9]+/), 10) : 0;
		this.ltIE8 = ((msie>8)||(msie==0)) ? false : true;
		// UA for SMP or Tablet
		if (ua.indexOf('windows') != -1 && ua.indexOf('touch') != -1) {
			this.tablet = true;
		} else if (ua.indexOf('firefox') != -1 && ua.indexOf('tablet') != -1) {
			this.tablet = true;
		} else if (ua.indexOf('kindle') != -1) {
			this.tablet = true;
		} else if (ua.indexOf('silk') != -1) {
			this.tablet = true;
		} else if (ua.indexOf('playbook') != -1) {
			this.tablet = true;
		}
		if (ua.indexOf('windows') != -1 && ua.indexOf('phone') != -1) {
			this.mobile = true;
		} else if (ua.indexOf('firefox') != -1 && ua.indexOf('mobile') != -1) {
			this.mobile = true;
		} else if (ua.indexOf('blackberry') != -1) {
			this.mobile = true;
		}
		// Mouse Touch Pointer
		this.touch = (typeof document.ontouchstart != 'undefined');
		this.pointer = window.navigator.pointerEnabled;
		this.msPointer = window.navigator.msPointerEnabled;
		// Web Storage
		this.webstorage = (function(){
			if (('localStorage' in window) && window['localStorage']!==null) {
				try {
					localStorage.removeItem('test');
					localStorage.setItem('test', 'test');
					var c = localStorage.getItem('test');
					localStorage.removeItem('test');
					return (c === 'test');
				} catch(e) {
					return false;
				}
			} else {
				return false;
			}
		})();
		if ('deviceXDPI' in screen) {
			this.pixelRatio = screen.deviceXDPI / screen.logicalXDPI;
		} else if (window.hasOwnProperty('devicePixelRatio')) {
			this.pixelRatio = window.devicePixelRatio;
		}
		if (this.pixelRatio>1) this.retina = true;
		//
		return this;
	}
}).init();
//
// ============================
//	for bind not supported
// ============================
//
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function(thisArg) {
		var fn = this, slice = Array.prototype.slice, args = slice.call(arguments, 1);
		return function(){
			return fn.apply(thisArg, args.concat(slice.call(arguments)));
		}
	}
}
//
// ============================
//	no context menu
// ============================
//
var _nocontxt = {
	load: function(){
		var all = document.body.getElementsByTagName('*');
		for (var i=0,item; item=all[i++];) {
			if (/(?:^|\s)nocontxt(?:$|\s)/.test(item.className)) {
				item.oncontextmenu = function(event){
					var ev = event || window.event;
					try {
						ev.preventDefault();
					} catch(e) {
						ev.returnValue = false;
					}
				};
				item.onmousedown = function(event){
					var ev = event || window.event;
					try {
						ev.preventDefault();
					} catch(e) {
						ev.returnValue = false;
					}
				};
				item.onselectstart = function(event){
					var ev = event || window.event;
					try {
						ev.preventDefault();
					} catch(e) {
						ev.returnValue = false;
					}
				};
			}
			if (/(?:^|\s)hide-pc(?:$|\s)/.test(item.className)) {
				if (!_ua.mobile && !_ua.tablet) item.style.display = 'none';
			}
			if (/(?:^|\s)hide-smp(?:$|\s)/.test(item.className)) {
				if (_ua.mobile || _ua.tablet) item.style.display = 'none';
			}
			if (/(?:^|\s)fp-causion(?:$|\s)/.test(item.className)) {
				if (_ua.device=='android') item.style.display = 'block';
			}
		}
	}
};
//
// ============================
//	TBS search Box (show/hide)
// ============================
//
var _searchManager = {
	aOpen: '',
	aClose: '',
	box: '',
	init: function(){
		try{
			this.aOpen = document.getElementById('js-search-open');
			this.box = document.getElementById('js-search-box');
			this.aClose = document.getElementById('js-search-close');
			this.aOpen.addEventListener('click',this,false);
			this.aClose.addEventListener('click',this,false);
		} catch(e) {
		}
	},
	handleEvent: function(event){
		switch (event.type) {
			case 'click':
				event.preventDefault();
				if (!this.display) {
					this.display = true;
					this.show();
				} else {
					this.display = false;
					this.hide();
				}
				break;
			case 'orientationchange':
				break;
			default:
				break;
		}
	},
	display: false,
	running: false,
	timer: null,
	alp: 0.5,
	show: function(){
		if (this.running) return;
		this.running = true;
		this.box.style.opacity = this.alp;
		this.box.style.display = 'block';
		this.chgAlp(0.05);
	},
	hide: function(){
		if (this.running) return;
		this.running = true;
		this.chgAlp(-0.05);
	},
	chgAlp: function(x){
		this.alp += x;
		if (this.alp > 1 || this.alp < 0.5) {
			if (this.alp>1) this.alp = 1;
			if (this.alp<0.5) {
				this.alp = 0.5;
				this.box.style.display = 'none';
			}
			this.box.style.opacity = this.alp;
			this.running = false;
			return;
		} else {
			this.box.style.opacity = this.alp;
			this.timer = setTimeout((function(i){return function(){i.chgAlp(x);};})(this),50);
		}
	},
	cancel: function(){
		this.display = false;
		this.running = false;
		if (this.timer) clearTimeout(this.timer);
		this.timer = null;
		this.alp = 0.5;
		this.box.style.opacity = this.alp;
		this.box.style.display = 'none';
	}
};
try {
	document.addEventListener('DOMContentLoaded', function(){_nocontxt.load();_searchManager.init();}, false);
} catch(e) {
}
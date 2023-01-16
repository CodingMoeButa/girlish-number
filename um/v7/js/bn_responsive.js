//===========================================
//	TBS Responsive Banner Super/Recta
//===========================================
//
/*	Information (c) TBS
------------------------------------------------------------------------------------------
2016.02.22
1. check MediaQuery
2. banner
----------------------------------------------------------------------------------------*/
//
// ============================
//	check MediaQuery
// ============================
//
var _chkMedia = ({
	checker: '',
	init: function(){
		this.checker = document.createElement('div');
		this.checker.id = 'checker';
		document.body.insertBefore(this.checker, document.body.firstChild);
		this.w = this.chkWidth();
		/* ↓ 2019.03.08 IE11 対策 */
		if (this.w===0) {
			if (window.matchMedia('(max-width: 0px)').matches) {
				this.w = 0;
			} else if (window.matchMedia('(min-width: 1px) and (max-width: 319px)').matches) {
				this.w = 1;
			} else if (window.matchMedia('(min-width: 320px) and (max-width: 767px)').matches) {
				this.w = 2;
			} else if (window.matchMedia('(min-width: 768px) and (max-width: 979px)').matches) {
				this.w = 3;
			} else {
				this.w = 4;
			}
		}
		/* ↑ 2019.03.08 IE11 対策 */
		window.addEventListener('resize',this,false);
		// window.addEventListener('orientationchange',this,false);
		return this;
	},
	handleEvent: function(event){
		switch (event.type) {
			case 'resize':
				this.resize();
				break;
			case 'orientationchange':
				break;
			default:
				break;
		}
	},
	w: null,
	o: null,
	resize: function(){
		var now = this.chkWidth();
		if (this.w !== now) {
			if ((this.w>=3)&&(now<=2)) {
				this.w = now;
				// PC => SMP
				if (_banner.div) _banner.intoSMP();
				if (_searchManager) _searchManager.cancel();
				if (this.plugin) this.plugin.intoSMP();
				this.triggerEvent('intoSMP', true, false);
			}
			if ((this.w<=2)&&(now>=3)) {
				this.w = now;
				// SMP => PC
				if (_banner.div) _banner.intoPC();
				try {if (_sideMenu) _sideMenu.complete('smp');} catch(e) {}
				if (this.plugin) this.plugin.intoPC();
				this.triggerEvent('intoPC', true, false);
			}
		}
		this.w = now;
	},
	chkWidth: function(){
		var style = this.checker.currentStyle || document.defaultView.getComputedStyle(this.checker, null);
		return parseInt(style.width,10);
	},
	triggerEvent: function(type, bubbles, cancelable, data){
		var ev = document.createEvent('Event');
		ev.initEvent(type, bubbles, cancelable);
		if (data) {
			for (var d in data) {
				if (data.hasOwnProperty(d)) {
					ev[d] = data[d];
				}
			}
		}
		return this.checker.dispatchEvent(ev);
	},
	chkOrientation: function(){
		var style = this.checker.currentStyle || document.defaultView.getComputedStyle(this.checker, null);
		return parseInt(style.height,10);
	}
}).init();
//
// ============================
//	banner
// ============================
//
var _banner = {
	div: '',
	smp: false,
	w: null,
	load: function(filepc,filesmp,type){
		// バナー設置時に html から呼び出される (自動では呼ばれない)
		if (type=='super') this.div = document.getElementById('bnSuper');	// 注：ない場合がある
		//
		/* ↓ 旧 Safari 対策 */
		this.w = _chkMedia.w = _chkMedia.chkWidth();
		/* ↑ 旧 Safari 対策 */
		//
		if (this.w<=2) this.smp = true;
		//
		/* ↓ IE9 〜 IE11 対策 */
		if (this.w==0) {
			var w = window.innerWidth;
			if (w>=768) this.smp = false;
		}
		/* ↑ IE9 〜 IE11 対策 */
		//
		if (!this.smp) this.xmlHttp(filepc);
		else this.xmlHttp(filesmp);
	},
	xmlHttp: function(filepath){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', filepath, false);
		xhr.send(null);
		if (xhr.status == 0) {
			// document.write('通信失敗');
		} else if ((200<=xhr.status && xhr.status<300) || (xhr.status==304)) {
			document.write(xhr.responseText);
		} else {
			document.write('url:' + filepath + ', status:' + xhr.status);
		}
	},
	intoSMP: function(){
		if (!this.smp) this.div.style.display = 'none';
	},
	intoPC: function(){
		if (!this.smp) this.div.style.display = 'block';
		else this.div.style.width = '320px';
	}
};
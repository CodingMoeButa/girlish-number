//===========================================
//	TBS Modal Window
//===========================================
//
/*	Information (c) TBS
------------------------------------------------------------------------------------------
2016.04.19
2017.02.14 edit
----------------------------------------------------------------------------------------*/
//
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.Modal = factory();
	}
})(this, function() {
	'use strict';
	//
	var flgPC = true;
	if (_ua.mobile || _ua.tablet) flgPC = false;
	//
	var data = {cliW:null, cliH:null, inrW:null, inrH:null, scrlT:null};
	var narrow = false;
	//
	var div = document.createElement('div');
	div.className = 'aaa bbb md-box';
	var pClose = document.createElement('p');
	pClose.className = 'md-close';
	var aClose = document.createElement('a');
	aClose.href = 'javascript:void(0)';
	var spanClose = document.createElement('span');
	spanClose.appendChild(document.createTextNode('close'));
	aClose.appendChild(spanClose);
	pClose.appendChild(aClose);
	div.appendChild(pClose);
	var divInner = document.createElement('div');
	divInner.className = 'md-inner';
	div.appendChild(divInner);
	var pCaption = document.createElement('p');
	pCaption.className = 'md-caption';
	var spanCaption = document.createElement('span');
	spanCaption.appendChild(document.createTextNode('caption'));
	pCaption.appendChild(spanCaption);
	div.appendChild(pCaption);
	//
	div.style.display = 'none';
	var display = false;
	//
	var loading = false;
	var nowloading = false;
	var bgx = 0;
	var tidNowLoading = null;
	//
	var flvp_swf, query;
	//
	var pLoading = document.createElement('p');
	pLoading.style.cssText ='font-size:2px;line-height:1;text-indent:-9999px;background-repeat:no-repeat;background-position:left top;position:absolute;left:50%;top:50%;width:50px;height:50px;padding:0;margin:0;margin-left:-25px;margin-top:-25px;z-index:5210;';
	pLoading.appendChild(document.createTextNode('now loading...'));
	//
	var Modal = function Modal(){
		return (this instanceof Modal) ? this.init() : new Modal();
	};
	Modal.prototype.init = function() {
		//
		var a = document.getElementsByTagName('a');
		var flgSS = false;
		var flgYT = false;
		//
		var autoplay = false;
		var autoTarget;
		//
		this.xmlpath = '';
		Array.prototype.slice.call(a).forEach((function(node){
			if (/(?:^|\s)md-sasayaki(?:$|\s)/.test(node.className)) {
				if (!this.xmlpath) {
					this.xmlpath = (node.getAttribute('data-xml')) ? node.getAttribute('data-xml') : '';
				}
				if (!flgSS) {
					flgSS = true;
					if (flgPC) {
						this.sasayakiSetup();
					} else {
						this.createXMLHttp(this.xmlpath + 'playlist.xml', (function(i){return function(data){i.xmlLoaded(data);};})(this));
					}
				}
				node.addEventListener('click',this,false);
				if (node.getAttribute('data-autoplay')=='on') {
					autoplay = true;
					autoTarget = node;
				}
			}
			if (/(?:^|\s)md-youtube(?:$|\s)/.test(node.className)) {
				if (!flgYT) {
					flgYT = true;
					var tag = document.createElement('script');
					tag.src = 'https://www.youtube.com/player_api';
					var firstScriptTag = document.getElementsByTagName('script').item(0);
					firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				}
				node.addEventListener('click',this,false);
				if (node.getAttribute('data-autoplay')=='on') {
					autoplay = true;
					autoTarget = node;
				}
			}
			if (/(?:^|\s)md-vimeo(?:$|\s)/.test(node.className)) {
				node.addEventListener('click',this,false);
			}
			if (/(?:^|\s)md-gmaps(?:$|\s)/.test(node.className)) {
				node.addEventListener('click',this,false);
			}
			if (/(?:^|\s)md-flowplayer(?:$|\s)/.test(node.className)) {
				node.addEventListener('click',this,false);
			}
			if (/(?:^|\s)md-video(?:$|\s)/.test(node.className)) {
				node.addEventListener('click',this,false);
			}
			if (/(?:^|\s)md-image(?:$|\s)/.test(node.className)) {
				node.addEventListener('click',this,false);
			}
		}).bind(this));
		//
		this.timer = null;
		//
		this.bgcolor = '';
		this.media = '';
		this.caption = '';
		this.url = '';
		this.poster = '';
		this.movie = '';
		this.imgpath = '';
		this.ssid = '';
		this.ssList;
		this.preloadimg = '';
		this.imgWidth = null;
		this.imgHeight = null;
		this.inner = '';
		//
		if (autoplay) {
			if (!_ua.mobile && !_ua.tablet) {
				var event = document.createEvent('MouseEvents');
				event.initEvent('click', false, true);
				autoTarget.dispatchEvent(event);
			}
		}
		//
		return this;
	};
	Modal.prototype.handleEvent = function(event){
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
				var elem = ev.currentTarget;
				if (!display) {
					this.bgcolor = (elem.getAttribute('data-bg')) ? elem.getAttribute('data-bg') : '#000';
					this.media = elem.className;
					this.caption = (elem.getAttribute('data-caption')) ? elem.getAttribute('data-caption') : '';
					this.poster = (elem.getAttribute('data-poster')) ? elem.getAttribute('data-poster') : '';
					this.ssid = (elem.getAttribute('data-ssid')) ? elem.getAttribute('data-ssid') : '';
					this.movie = (elem.getAttribute('data-movie')) ? elem.getAttribute('data-movie') : '';
					this.imgpath = (elem.getAttribute('data-image')) ? elem.getAttribute('data-image') : '';
					pLoading.style.backgroundImage = 'url(' + ((elem.getAttribute('data-loading')=='black') ? '/um/img/lazyloading_blk.png' : '/um/img/lazyloading_wht.png') +')';
					this.url = elem.href;
					display = true;
					this.run();
				} else {
					this.close();
				}
				break;
			case 'scroll':
			case 'resize':
				clearTimeout(this.timer);
				this.timer = setTimeout((function(i){return function(){i.resize()};})(this),200);
				break;
			case 'ended':
				this.close();
				break;
			case 'loadstart':
			case 'load':
				// console.log(event.type + 'しました');
				if (loading) endLoading();
				if (event.type=='loadstart') this.inner.removeEventListener('loadstart', this, false);
				if (event.type=='load' && this.media!='md-image') this.inner.removeEventListener('load', this, false);
				if (this.media=='md-image') {
					this.preloadimg.removeEventListener('load', this, false);
					this.showPics();
				}
				if (this.media=='md-youtube') onYouTubeIframeAPIReady();
				break;
			default:
				break;
		}
	};
	Modal.prototype.setListener = function(){
		aClose.addEventListener('click', this, false);
		window.addEventListener('scroll',this,false);
		window.addEventListener('resize',this,false);
		this.resize();
	};
	Modal.prototype.cancelListener = function(){
		_sideMenu.cover.removeEventListener('click', this, false);
		aClose.removeEventListener('click', this, false);
		window.removeEventListener('scroll',this,false);
		window.removeEventListener('resize',this,false);
		if (this.media=='md-video') this.inner.removeEventListener('ended', this, false);
	};
	Modal.prototype.run = function(){
		_sideMenu.showOverlay(this.bgcolor, true);
		_sideMenu.cover.addEventListener('click', this, false);
		//
		if (div.parentNode!=document.body) document.body.appendChild(div);
		//
		if (this.caption) {
			spanCaption.removeChild(spanCaption.firstChild);
			spanCaption.innerHTML = this.caption;
			if (pCaption.parentNode!=div) div.appendChild(pCaption);
		} else {
			if (pCaption.parentNode==div) div.removeChild(pCaption);
		}
		//
		if (!loading) {
			loading = true;
			if (pLoading.parentNode != divInner) divInner.appendChild(pLoading);
			if (!nowloading) loadingAnimation();
		}
		//
		var url = this.url;
		switch (this.media) {
			case 'md-sasayaki':
				if (flgPC) {
					this.inner = document.createElement('object');
					this.inner.data = flvp_swf;
					this.inner.type = 'application/x-shockwave-flash';
					this.inner.id = 'flvpswf';
					var prm = [
						{name: 'menu', value: 'false'},
						{name: 'allowScriptAccess', value: 'always'},
						{name: 'movie', value: flvp_swf},
						{name: 'quality', value: 'high'},
						{name: 'FlashVars', value: query},
						{name: 'wmode', value: 'transparent'},
						{name: 'allowFullScreen', value: 'true'}
					];
					for (var i=0,len=prm.length; i<len; i++) {
						prm[i].elem = document.createElement('param');
						prm[i].elem.setAttribute('name', prm[i].name);
						prm[i].elem.setAttribute('value', prm[i].value);
						this.inner.appendChild(prm[i].elem);
					}
					//
					divInner.appendChild(this.inner);
					div.style.display = 'block';
					this.setListener();
					this.ssTimer = null;
					this.chkSSReady();
/*
					this.inner.innerHTML = '<param name="menu" value="false" /><param name="allowScriptAccess" value="always" /><param name="movie" value="' + flvp_swf + '" /><param name="quality" value="high" /><param name="FlashVars" value="' + query + '" /><param name="wmode" value="transparent" /><param name="allowFullScreen" value="true" />';
*/
				} else {
					for (var i=0,len=this.ssList.length; i<len; i++) {
						if (this.ssList[i].id === this.ssid) {
							this.movie = this.ssList[i].file;
							this.media = 'md-video';
							this.run();
						}
					}
				}
				break;
			case 'md-youtube':
				this.inner = document.createElement('iframe');
				this.inner.id = 'player';
				this.inner.src = 'https://www.youtube.com/embed/'+chkYTid(this.url)+'?enablejsapi=1&wmode=transparent&rel=0&autoplay=1&showinfo=0&fs=0';
				this.inner.addEventListener('load', this, false);
				break;
			case 'md-vimeo':
				this.inner = document.createElement('iframe');
				this.inner.src = 'https://player.vimeo.com/video/'+chkVMid(this.url)+'?autoplay=1';
				this.inner.addEventListener('load', this, false);
				break;
			case 'md-gmaps':
				this.inner = document.createElement('iframe');
				this.inner.src = this.url + '&z=17&iwloc=B&hl=ja&output=embed&t=m';
				this.inner.addEventListener('load', this, false);
				break;
			case 'md-flowplayer':
				this.inner = document.createElement('div');
				this.inner.innerHTML = '<span style="color:#fff;line-height:1.5;padding:1em;">再生させたいところだけど、まだ未対応！</span>';
				break;
			case 'md-video':
				this.inner = document.createElement('video');
				this.inner.autoplay = true;
				this.inner.controls = true;
				this.inner.src = 'http://flvstream.tbs.co.jp/flvfiles/_definst_/' + this.movie + '/playlist.m3u8';
				if (this.poster) this.inner.poster = this.poster;
				this.inner.play();
				this.inner.addEventListener('loadstart', this, false);
				this.inner.addEventListener('ended', this, false);
				break;
			case 'md-image':
				this.inner = document.createElement('div');
				this.inner.className = 'md-pics';

				this.inner.oncontextmenu = function(){
					return false;
				};

				var img = document.createElement('img');
				img.src = '/um/img/cover.png';
				img.alt = '';
				this.inner.appendChild(img);
				this.imgLoad(this.imgpath);
				break;
			default:
				break;
		}
		//
		if (this.media !== 'md-image' && this.media !== 'md-sasayaki') {
			this.inner.style.width = '100%';
			this.inner.style.height = '100%';
			divInner.appendChild(this.inner);
			div.style.display = 'block';
			this.setListener();
		}
	};



	Modal.prototype.close = function(){
		display = false;
		div.style.display = 'none';
		while (divInner.firstChild.firstChild) {
			divInner.firstChild.removeChild(divInner.firstChild.firstChild);
		}
		while (divInner.firstChild) {
			divInner.removeChild(divInner.firstChild);
		}
		if (div.parentNode==document.body) document.body.removeChild(div);
		if (loading) endLoading();
		if (this.media=='md-sasayaki') controlFlvp('close');
		_sideMenu.hideOverlay();
		this.cancelListener();
	};
	Modal.prototype.resize = function(){
		chkWin();
		var w, h;
		// chkNarrow();
		if (data.cliW<320) {
			w = 300;
			h = (this.media!=='md-gmaps') ? Math.ceil(w/16*9) : Math.ceil(w/4*3);
			if (this.media=='md-image') h = Math.ceil(w/this.imgWidth*this.imgHeight);
			// document.documentElement.style.overflowX = 'visible';
		} else {
			var extraH = div.offsetHeight - divInner.offsetHeight;
			var mgn = 20;
			w = (data.cliW >= 920) ? 920 - mgn : data.cliW - mgn;
			h = (this.media!=='md-gmaps') ? Math.ceil(w/16*9) : Math.ceil(w/4*3);
			if (this.media=='md-image') {
				if (w > this.imgWidth) w = this.imgWidth;
				h = Math.ceil(w/this.imgWidth*this.imgHeight);
				if (h > this.imgHeight) h = this.imgHeight;
			}
			var hh = extraH + h;
			if (data.cliH <= hh) {
				h = (data.cliH < 200) ? 200 - extraH - 10 : data.cliH - extraH - 10;
			}
			w = (this.media!=='md-gmaps') ? Math.ceil(h/9*16) : Math.ceil(h/3*4);
			if (this.media=='md-image') w = Math.ceil(h/this.imgHeight*this.imgWidth);
		}
		//
		div.style.width = divInner.style.width = this.inner.style.width = w + 'px';
		if (this.media=='md-image') this.inner.style.backgroundSize = w + 'px ' + h + 'px';
		divInner.style.height = this.inner.style.height = h + 'px';
		if (!narrow) {
			div.style.marginLeft = -1*div.offsetWidth/2 +'px';
			div.style.marginTop = -1*div.offsetHeight/2 +'px';
		} else {
			// div.style.marginLeft = 'auto';
			// div.style.marginTop = 'auto';
			div.style.marginLeft = -1*div.offsetWidth/2 +'px';
			div.style.marginTop = -1*div.offsetHeight/2 +'px';
		}
	};
	Modal.prototype.imgLoad = function(path){
		this.preloadimg = new Image();
		this.preloadimg.src = path;
		this.preloadimg.addEventListener('load',this,false);
	};
	Modal.prototype.showPics = function(){
		this.imgWidth = this.preloadimg.width;
		this.imgHeight = this.preloadimg.height;
		this.inner.style.backgroundImage = 'url(' + this.imgpath + ')';
		divInner.appendChild(this.inner);
		div.style.display = 'block';
		this.setListener();
	};

	// Sasayaki
	Modal.prototype.sasayakiSetup = function() {
		//
		var urlBase = '/mi/syplayer/';
		flvp_swf = urlBase + 'app/flvp.swf';
		var playlists = [];
		playlists.push(urlBase + 'commonfile/common.txt');
		playlists.push('/um/library/js/setting.xml');
		playlists.push(this.xmlpath + 'playlist.xml');
		var flvp_data = playlists.join(',');
		query = 'data=' + flvp_data;
		var options = [];
		options.push('part=');
		options.push('imgpath=' + 'img/');
		var flvp_option = options.join('&');
		if (typeof flvp_option != 'undefined' && flvp_option != '') query += '&' + flvp_option;
	};
	Modal.prototype.chkSSReady = function(){
		if (ssReady) {
			// console.log(ssReady);
			ssReady = false;
			clearTimeout(this.ssTimer);
			if (loading) endLoading();
			this.ssTimer = setTimeout((function(i){return function(){controlFlvp('play', i.ssid);};})(this),500);
			return;
		} else {
			// console.log(ssReady);
			this.ssTimer = setTimeout((function(i){return function(){i.chkSSReady();};})(this),50);
		}
	};
	Modal.prototype.createXMLHttp = function(xml,func) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = (function(i){return function(){
			switch (xhr.readyState) {
				case 4:
					if ((200<=xhr.status && xhr.status<300)||(xhr.status==304)) {
						var data = xhr.responseXML;
						func(data);
					} else {
						i.errorMsg('データを取得できませんでした');
					}
					break;
				default:
					break;
			}
		};})(this);
		xhr.open('GET', xml, true);
		xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
		if (xhr.overrideMimeType) xhr.overrideMimeType("application/xml");
		xhr.send(null);
	};
	Modal.prototype.errorMsg = function(msg){
		var p = document.createElement('p');
		var span = document.createElement('span');
		p.style.cssText = 'font-size:16px;line-height:1.6;background-color:#000;color:#fff;padding:0;margin:0;';
		span.style.cssText = 'display:block;padding:15px';
		span.appendChild(document.createTextNode(msg));
		p.appendChild(span);
		divInner.appendChild(p);
	};
	Modal.prototype.xmlLoaded = function(doc){
		var data = doc.documentElement;
		this.ssList = [];
		var len = data.getElementsByTagName('part').length;
		for (var i=0; i<len; i++) {
			this.ssList[i] = new Object();
			this.ssList[i].id = (data.getElementsByTagName('id').item(i).firstChild) ? data.getElementsByTagName('id').item(i).firstChild.nodeValue : '';
			this.ssList[i].file = (data.getElementsByTagName('file').item(i).firstChild) ? data.getElementsByTagName('file').item(i).firstChild.nodeValue : '';
		}
	};

	//
	var flgNrw = false;
	function chkNarrow(){
		if (flgNrw != narrow) {
			if (narrow) chgClass(div, 'md-box', 'md-nrw');
			else chgClass(div, 'md-nrw', 'md-box');
		}
		flgNrw = narrow;
	}
	function chkWin(){
		var w = _sideMenu.getWin();
		data.cliW = w[0];
		data.cliH = w[1];
		data.inrW = w[2];
		data.inrH = w[3];
		narrow = (/*data.cliW<480 || */data.cliH < 320) ? true : false;
	}
	function chkYTid(url){
		// http://www.youtube.com/watch?v=AaBbCcDdEeF
		// または
		// http://youtu.be/AaBbCcDdEeF
		// http: でも https: でもよい
		//
		var url = url, ytid, result;
		if (url.indexOf('watch?v=') != -1) {
			result = url.split('watch?v=');
		} else if (url.indexOf('youtu.be') != -1) {
			result = url.split('youtu.be/');
		} else if (url.indexOf('/embed/') != -1) {
			result = url.split('/embed/');
		} else if (url.indexOf('/v/') != -1) {
			result = url.split('/v/');
		} else if (url.indexOf('?video_id=') != -1) {
			result = url.split('?video_id=');
		}
		ytid = result[result.length-1].substr(0,11);
		return ytid;
	}
	function chkVMid(url){
		// https://vimeo.com/45830194
		//
		var result = url.split('vimeo.com/');
		var mid = result[result.length-1].substr(0,8);
		return mid;
	}
	//
	function loadingAnimation(){
		nowloading = true;
		bgx -= 50;
		if (bgx <= -600) bgx = 0;
		pLoading.style.backgroundPosition = bgx + 'px 0px';
		tidNowLoading = setTimeout(function(){loadingAnimation();},100);
	}
	function endLoading(){
		loading = false;
		if (nowloading) nowloading = false;
		clearTimeout(tidNowLoading);
		if (pLoading.parentNode == divInner) divInner.removeChild(pLoading);
	}
	//
	function chgClass(trgt,x,y){
		var trgt = trgt;
		var bfr = x;
		var aft = y;
		var already = trgt.getAttribute('className') || trgt.getAttribute('class');
		if (!already) {
			trgt.className = aft;
		} else {
			var arrName = already.split(' ');
			for (var i=0,len=arrName.length; i<len; i++) {
				if (arrName[i]===bfr) delete arrName[i];
				else if (arrName[i]===aft) delete arrName[i];
			}
			if (!arrName[0]) arrName[0] = aft;
			else arrName.push(aft);
			var str = arrName.join(' ');
			str = str.replace(/\s+/g, ' ');
			trgt.className = str;
		}
	}
	//
	//
	var player;
	function onYouTubeIframeAPIReady() {
		player = new YT.Player('player', {events: {'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange}});
	}
	function onPlayerStateChange(event) {
		if (event.data == YT.PlayerState.ENDED) _modal.close();
	}
	function onPlayerReady(event) {
		// player.playVideo();
	}
	//
	function chkFlashPlugin(){
		var flashCanPlay = false;
		var pluginVersion = 0;
		if (navigator.plugins && navigator.mimeTypes['application/x-shockwave-flash']) {
			var plugin = navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin;
			if (plugin) {
				pluginVersion = parseInt(plugin.description.match(/\d+\.\d+/));
			}
		} else {
			var flashOCX;
			try {
				flashOCX = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7').GetVariable('$version').match(/([0-9]+)/);
			} catch(e) {
				try {
					flashOCX = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').match(/([0-9]+)/);
				} catch(e) {
				}
			}
			if (flashOCX) {
				pluginVersion = parseInt(flashOCX[0],10);
			}
		}
		if (pluginVersion <= 6) pluginVersion = 0;
		if (pluginVersion>=9) flashCanPlay = true;
		return flashCanPlay;
	}
	//
	return Modal;
});
var _modal;
try{
	document.addEventListener('DOMContentLoaded', function(){_modal = Modal();}, false);
}catch(e){}
//
function controlFlvp(pStr, pChap){
	if (!pChap) pChap = 1;
	var swf = (document.all ? window['flvpswf'] : document['flvpswf']) || null;
	if (swf && swf.controlFlvp) {
		swf.controlFlvp(pStr, pChap);
	}
}
var ssReady = false;
function flvpLog(obj) {
	if (obj['type'] == 'init' && obj['status'] == 'complete') {
		ssReady = true;
	}
	if (obj['type'] == 'videoConnect') {
		//console.log('videoConnect：再生の準備ができた');
	}
	if (obj['type'] == 'videoChange') {
		//console.log('videoChange：新しい動画コンテンツが動画プレーヤにロードされた');
	}
	if (obj['type'] == 'streamStart') {
		//console.log('streamStart：動画の再生が始まった');
	}
	if (obj['type'] == 'videoStop') {
		//console.log('videoStop：再生を停止');
	}
	if (obj['type'] == 'videoComplete') {
		//console.log('videoComplete：再生が完了');
		 _modal.close();
	}
}
function ANT_ClickBeacon(pStr) {
	var vdiv = document.getElementById("mes");
	vdiv.innerHTML = pStr;
}
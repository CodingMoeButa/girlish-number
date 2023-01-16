//===========================================
//	TBS Responsive Global Header
//===========================================
//
/*	Information (c) TBS
------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------*/
//
var _responsive = ({
	init: function(){
		if (_ua.tablet) {
			var arr = document.getElementsByTagName('meta');
			for (var i=0,item; item=arr[i++];) {
				if (/(?:^|\s)viewport(?:$|\s)/.test(item.name)) {
					item.content = 'width=1024,target-densitydpi=device-dpi';
				}
			}
		}
	}
}).init();
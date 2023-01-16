(function(u){
var msie = (u.indexOf('msie')>-1) ? parseInt(u.replace(/.*msie[ ]/,'').match(/^[0-9]+/),10) : 0;
var ltIE8 = ((msie>8)||(msie==0)) ? false : true;
if (ltIE8) document.write('<p>ご利用のブラウザでの閲覧はサポートされておりません。<br>詳しい推奨環境は <a href="/sitepolicy/">サイトポリシー</a> をご覧ください。</p>');
})(window.navigator.userAgent.toLowerCase());
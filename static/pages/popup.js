/**
 * Hi-QRCode: popup.js
 * @authors Jack.Chan (fulicat@qq.com)
 * @date      2015-07-20 17:22:19
 * @update    2016-03-27 by Jack.Chan
 * @version 2.0.1
 */

var isRetina = (function(){
	var root = (typeof exports === 'undefined' ? window : exports);
	var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
	if(root.devicePixelRatio > 1){
		return true;
	};
	if(root.matchMedia && root.matchMedia(mediaQuery).matches){
		return true;
	};
	return false;
})();

var qrcode = {
	width: 240,
	text: '',
	isZoomed: 0,
	create: function(text, width){
		var that = this;
		this.text = text || this.text;
		width = width || this.width;
		width = this.isZoomed ? parseInt(width * 2) : width;
		var QRdiv = document.createElement('div');
		$(QRdiv).qrcode({
			width: width,
			height: width,
			text: that.text,
			complete: function(){
				$('#qrcode').html('<img id="QRimg" '+ (isRetina ? 'style="width:'+ (width) +'px;height:'+ (width) +'px;"' : '') +' src="'+ this.toDataURL('image/png') +'">');
			}
		});
	},
	zoom: function(fn){
		fn = fn || function(){};
		this.isZoomed = !this.isZoomed ? 1 : 0;
		this.create();
		fn.apply(this, [this.isZoomed]);
	}
};

document.addEventListener('contextmenu', function(e){
	e.preventDefault();
}, false);

chrome.windows.getCurrent(function(a){
	chrome.tabs.getSelected(a.id, function(a){

		qrcode.create(a.url);

		$('#link2x').on('click', function(e){
			var that = this;
			qrcode.zoom(function(isZoomed){
				if(isZoomed){
					$(that).addClass('active').html('1倍');
				}else{
					$(that).removeClass('active').html('2倍');
				};
			});
			return false;
		});
		$('#link2short').on('click', function(e){
			var that = this;
			if(a.url.substr(0, 7) == 'http://' || a.url.substr(0, 8) == 'https://'){
				if($(this).data('url')){
					qrcode.create(a.url);
					$(this).data('url', '').removeClass('active').html('变短');
					$('#msg').html('');
					return false;
				}else{
					var api = 'http://api.weibo.com/2/short_url/shorten.json?source=1681459862&url_long=';
					var url = encodeURIComponent(a.url);
					api = api + url;
					$.ajax({
						type: 'POST',
						url: api,
						data: {
							'source': 1681459862,
							'url_long': url
						},
						beforeSend: function(xhr){
							$('#msg').html('<span class="loading">正在变短...</span>');
						},
						success: function(res){
							console.log(res);
							var surl = res.urls[0].url_short;
							console.log(surl);
							$('#msg').html('<span class="success">'+ surl +'</span>');
							qrcode.create(surl);
							$(that).data('url', a.url).addClass('active').html('还原');
						},
						error: function(err){
							console.log(err);
							$('#msg').html('<span class="error">变短失败了</span>');
						}
					});
				};
			}else{
				console.error('url protocol not supported.');
				$('#msg').html('<span class="error">协议不支持变短</span>');
			};
			return false;
		});
		$('#link2download').on('click', function(e){
			var img = document.getElementById('QRimg');
			if(img){
				var link = document.createElement('A');
				link.href = img.src;
				link.download = 'QRCode.png';
				link.click();
				link = null;
				console.log(link);
			}else{
				console.error('QRimg not found.');
			};
			return false;
		})
	});
});

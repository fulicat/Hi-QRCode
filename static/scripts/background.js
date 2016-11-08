/**
 * Hi-QRCode: background.js
 * @authors Jack.Chan (fulicat@qq.com)
 * @date    2015-07-20 17:22:19
 * @version 2.0.0
 */

function setPageActionIcon(tab){
	if(tab){
		if(tab.url.substr(0, 6)=='chrome' || tab.url.substr(0, 5)=='about'){
			chrome.pageAction.hide(tab.id);
		}else{
			chrome.pageAction.setIcon({
				tabId: tab.id, 
				path:{
					'19': 'static/icons/ico_19.png',
					'38': 'static/icons/ico_38.png'
				}
			});
			chrome.pageAction.show(tab.id);
		};
	};
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	setPageActionIcon(tab);
}), chrome.tabs.onActivated.addListener(function(otab){
	chrome.tabs.getSelected(null, function(tab){
		setPageActionIcon(tab);
	});
});

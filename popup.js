var ext = {     
    init:"init",
    initVidState:"initVidState",
    clearall: "clearall",
    capture:"capture",
    loadCapture:"loadCapture",
    toggleState:"toggleState",
    toggleVidState:"toggleVidState",
    updateState:"updateState"
};

// ========================== 

function communicate(method, data, callback) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {method : method, data:data}, callback);
    });
}

function reload() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.reload(tab.id);
    });
}

function setIcon(state) {
    var ico = {path : state?"icon_active.png":"icon.png"};
    chrome.browserAction.setIcon(ico,function() {});
}

document.addEventListener('DOMContentLoaded', function () {    
	var stateBtn = $("#editorBtnState"), 
        videoStateBtn = $("#vidDownloderBtnState"),
        clearBtn = $("#clearBtn");     

    function updateState(state) {
        stateBtn.prop("checked", state);
        //setIcon(state);
        //$(".notransition").removeClass("notransition");
    }
    function updateVideoState(state) {
        videoStateBtn.prop("checked", state);
    }
    
    communicate(ext.init, null, updateState);
    communicate(ext.initVidState, null, updateVideoState);
            
    stateBtn.click(function() {		
        communicate(ext.toggleState, null, updateState);        
	});     
    videoStateBtn.click(function() {		
        communicate(ext.toggleVidState, null, updateVideoState);        
	});
    clearBtn.click(function() {
        communicate(ext.clearall, null, reload);        
    });
});

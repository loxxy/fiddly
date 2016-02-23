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

function getCroppedImage(img, x,y,w,h) {    
    var c = $("<canvas>").attr({width:w, height:h});
    c[0].getContext("2d").drawImage(img[0], -x, -y);
    return c[0].toDataURL("image/png");
}

function capture(d, cb) {
    chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, function (image) {        
        image = getCroppedImage($("<img>").attr("src",image), d.x, d.y, d.w, d.h);
        //$("#main").html($("<img>").attr("src",image));        
        //cb($("<img>").attr("src",image));
        //cb({sdsd:"sdfdsfdsf"});        
        //console.log("Capture Done");
        communicate(ext.loadCapture, {image: image}, function() {
        });
       //chrome.tabs.create({url:"temp.html"});
       // console.log("ddd", cb);
    });    
    
    cb("Capture Started");
}

function setIcon(state) {
    var ico = {path : state?"icon_active.png":"icon.png"};
    chrome.browserAction.setIcon(ico,function() {});
}

function msgHandler(msg, sender, callback) {    
    var res = null;    
    switch(msg.method) {
        case ext.capture: res = capture(msg.data, callback); break;
        case ext.updateState: res = setIcon(msg.data);break;
    }        
    if(callback) callback(msg);
}

chrome.runtime.onMessage.addListener(msgHandler);
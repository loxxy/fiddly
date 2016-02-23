var ext = {
    init: "init",
    initVidState: "initVidState",
    clearall: "clearall",
    capture: "capture",
    loadCapture: "loadCapture",
    toggleState: "toggleState",
    toggleVidState: "toggleVidState",
    updateState: "updateState"
};


// ========================== 

var _data, _marker,
    _isRunning = false,
    _isVidRunning = false,
    _isInitialized = false,
    _target = null;

var STORE = "fiddly:data";

function ctrlBtnOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function removeBtnClick(e) {
    if (_target) {
        addData("rm", etox(_target));
        $(_target).remove();
    }
    _marker.hide();
    _target = null;
}

function moveBtnClick(e) {
    if (_target) $(_target).draggable();
}

function editBtnClick(e) {
    if (_target) $(_target).attr("contenteditable", "true");
}

function snapBtnClick(e) {
    var sender = $(_marker),
        d = {
            w: sender.width(),
            h: sender.height(),
            y: sender.offset().top - $(window).scrollTop(),
            x: sender.offset().left
        };
    // console.log(sender.offset().top, $(window).scrollTop());
    // communicate(ext.capture, d, function(res) { console.log(res); });
}

function onTargetOver(e) {
    var sender = $(e.target);
    if (_target != e.target) {
        _target = e.target;
        _marker.css({
            width: sender.width() + 4,
            height: sender.height(),
            top: sender.offset().top,
            left: sender.offset().left - 4
        }).show();
    }
}

function etox(element) {
    var xpath = '',
        id;
    while (element && element.nodeType == 1) {
        id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
        element = element.parentNode;
    }
    return xpath;
}

function xtoe(xpath) {
    return document.evaluate(
        xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function init() {
    if (!_isInitialized) {
        loadData();
        restore();
        saveData();
        _isInitialized = true;
    }
    //else toggleState();

    return _isRunning;
}

function initVidState() {
    return _isVidRunning;
}

function toggleState() {
    if (!_isRunning) {
        $('*').on('mouseenter.pf', onTargetOver);
        _marker = $('<div class="fiddlyMarker"><div class="btnCon">' +
            '<img class="editBtn cBtn" />' +
            '<img class="moveBtn cBtn" />' +
            '<img class="snapBtn cBtn" />' +
            '<img class="removeBtn cBtn" />' +
            '</div></div>');
        _marker.find(".cBtn").on("mouseover", ctrlBtnOver)
            .filter(".removeBtn").click(removeBtnClick)
            .css("background-image", 'url(\'' + chrome.extension.getURL("close.png") + '\')')
            .end().filter(".moveBtn").click(moveBtnClick)
            .css("background-image", 'url(\'' + chrome.extension.getURL("move.png") + '\')')
            .end().filter(".editBtn").click(editBtnClick)
            .css("background-image", 'url(\'' + chrome.extension.getURL("edit.png") + '\')')
            .end().filter(".snapBtn").click(snapBtnClick)
            .css("background-image", 'url(\'' + chrome.extension.getURL("snap.png") + '\')');

        _marker.appendTo("body");
    } else {
        $('*').off('mouseenter.pf')
            .filter(".ui-draggable").removeClass("ui-draggable").end()
            .filter('*[contenteditable]').removeAttr("contenteditable");
        !!_marker && _marker.remove();
    }

    _isRunning = !_isRunning;
    saveData();
    return _isRunning;
}


function toggleVidState() {
    if (!_isVidRunning) {
        var v = $("video");
        var src = v.attr("src");
        var pos = v.position();
        var btn = $("<a download target='_blank'>Download</a>")
            .attr("href", src)
            .addClass("fiddlyDownloader");
        btn.css({
            "position": "absolute",
            "display": "block",
            "z-index": "9999999",
            "background": "white",
            "top": pos.top || 0,
            "left": pos.left || 0,
            "padding": "10px",
            "color": "#3b5998",
            "cursor": "pointer",
            "text-decoration": "none"
        });
        btn.insertBefore(v)
    } else {
        $(".fiddlyDownloader").remove();
    }
    _isVidRunning = !_isVidRunning;
    return _isVidRunning;
}

function loadCapture(data) {
    var img = $("<img>").attr("src", data.image).css({
        width: "100%",
        height: "auto"
    });
    var html = $("<div>Welcome</div>").append(img).html();
    $.colorbox({
        html: html,
        width: "400px",
        height: "400px"
    });
}

function clearAll() {
    delete localStorage[STORE];
    return true;
}

//==========================//
//====== Data  Storage =====//
//==========================//

function saveData(d) {
    localStorage[STORE] = JSON.stringify(d || _data);
}

function addData(action, item) {
    if (_data[action]) _data[action].push(item);
    saveData();
}

function loadData() {
    _data = JSON.parse(localStorage[STORE] || "{}");
    _data.mv = _data.mv || [];
    _data.rm = _data.rm || [];
    _data.ed = _data.ed || [];
}

function restore() {
    _data.rm.forEach(function (i) {
        (i = xtoe(i)).parentElement.removeChild(i);
    });
}

//=========================================//
//====== External Communication  ==========//
//=========================================//

function msgHandler(msg, sender, callback) {
    var res = null;
    switch (msg.method) {
    case ext.init:
        res = init();
        break;
    case ext.initVidState:
        res = initVidState();
        break;
    case ext.toggleState:
        res = toggleState();
        break;
    case ext.toggleVidState:
        res = toggleVidState();
        break;
    case ext.loadCapture:
        res = loadCapture(msg.data);
        break;
    case ext.clearall:
        res = clearAll();
        break;
    }
    callback(res);
}

function communicate(method, data, callback) {
    chrome.runtime.sendMessage({
        data: data,
        method: method
    }, callback);
}

chrome.runtime.onMessage.addListener(msgHandler);


//============================//
//====== Auto Init  ==========//
//============================//

$(function () {
    init();
    communicate(ext.updateState, _isRunning, function (d) {

    });
});

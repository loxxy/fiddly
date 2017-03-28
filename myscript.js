/*jslint browser: true*/
/*global $, jQuery, console, XPathResult, chrome */

(function () {

  'use strict';

  var ext, data, marker,
    isRunning = false,
    isVidRunning = false,
    isInitialized = false,
    target = null,
    STORE = "fiddly:data";

  ext = {
    init: "init",
    initVidState: "initVidState",
    clearall: "clearall",
    capture: "capture",
    loadCapture: "loadCapture",
    toggleState: "toggleState",
    toggleVidState: "toggleVidState",
    updateState: "updateState"
  };


  function xtoe(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRSTORDEREDNODETYPE, null).singleNodeValue;
  }

  function etox(element) {
    var xpath = '',
      id;
    while (element && +element.nodeType === 1) {
      id = $(element.parentNode).children(element.tagName).index(element) + 1;
      if (id > 1) {
        id = '[' + id + ']';
      } else {
        id = '';
      }
      xpath = '/' + element.tagName.toLowerCase() + id + xpath;
      element = element.parentNode;
    }
    return xpath;
  }

  function saveData(d) {
    localStorage[STORE] = JSON.stringify(d || data);
  }

  function addData(action, item) {
    if (data[action]) {
      data[action].push(item);
    }
    saveData();
  }

  function loadData() {
    data = JSON.parse(localStorage[STORE] || "{}");
    data.mv = data.mv || [];
    data.rm = data.rm || [];
    data.ed = data.ed || [];
  }

  function restore() {
    data.rm.forEach(function (i) {
      (i = xtoe(i)).parentElement.removeChild(i);
    });
  }

  function ctrlBtnOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function removeBtnClick(e) {
    if (target) {
      addData("rm", etox(target));
      $(target).remove();
    }
    marker.hide();
    target = null;
  }

  function moveBtnClick(e) {
    if (target) {
      $(target).draggable();
    }
  }

  function editBtnClick(e) {
    if (target) {
      $(target).attr("contenteditable", "true");
    }
  }

  function snapBtnClick(e) {
    var sender = $(marker),
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
    if (target !== e.target) {
      target = e.target;
      marker.css({
        width: sender.width() + 4,
        height: sender.height(),
        top: sender.offset().top,
        left: sender.offset().left - 4
      }).show();
    }
  }

  function init() {
    if (!isInitialized) {
      loadData();
      restore();
      saveData();
      isInitialized = true;
    }
    //else toggleState();

    return isRunning;
  }

  function initVidState() {
    return isVidRunning;
  }

  function toggleState() {
    if (!isRunning) {
      $('*').on('mouseenter.pf', onTargetOver);
      marker = $('<div class="fiddlyMarker"><div class="btnCon">' +
        '<img class="editBtn cBtn" />' +
        '<img class="moveBtn cBtn" />' +
        '<img class="snapBtn cBtn" />' +
        '<img class="removeBtn cBtn" />' +
        '</div></div>');
      marker.find(".cBtn").on("mouseover", ctrlBtnOver)
        .filter(".removeBtn").click(removeBtnClick)
        .css("background-image", 'url(\'' + chrome.extension.getURL("close.png") + '\')')
        .end().filter(".moveBtn").click(moveBtnClick)
        .css("background-image", 'url(\'' + chrome.extension.getURL("move.png") + '\')')
        .end().filter(".editBtn").click(editBtnClick)
        .css("background-image", 'url(\'' + chrome.extension.getURL("edit.png") + '\')')
        .end().filter(".snapBtn").click(snapBtnClick)
        .css("background-image", 'url(\'' + chrome.extension.getURL("snap.png") + '\')');

      marker.appendTo("body");
    } else {
      $('*').off('mouseenter.pf')
        .filter(".ui-draggable").removeClass("ui-draggable").end()
        .filter('*[contenteditable]').removeAttr("contenteditable");
      if (marker) {
        marker.remove();
      }
    }

    isRunning = !isRunning;
    saveData();
    return isRunning;
  }


  function toggleVidState() {
    if (!isVidRunning) {
      var v = $("video"),
        src = v.attr("src"),
        pos = v.position() || {},
        btn = $("<a download target='blank'>Download</a>").attr("href", src).addClass("fiddlyDownloader");
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
      btn.insertBefore(v);
    } else {
      $(".fiddlyDownloader").remove();
    }
    isVidRunning = !isVidRunning;
    return isVidRunning;
  }

  function loadCapture(data) {
    var img = $("<img>").attr("src", data.image).css({
        width: "100%",
        height: "auto"
      }),
      html = $("<div>Welcome</div>").append(img).html();
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

  $(function () {
    init();
    communicate(ext.updateState, isRunning, function (d) {
    });
  });

}());

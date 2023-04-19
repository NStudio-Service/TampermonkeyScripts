// ==UserScript==
// @name    校园网助手
// @namespace    Campus.Network.Helper
// @version    0.5
// @description    校园网自动登录、解除30秒切换限制、主页功能球Bug修复
// @author    NXY666
// @match    http://10.100.1.5/*
// @match    http://10.100.1.7/*
// @match    http://a.xujc.com/*
// @icon    http://a.xujc.com/eportal/interface/index_files/pc/logosuccess.png
// @grant    unsafeWindow
// @require    https://cdn.staticfile.org/jquery/1.12.4/jquery.min.js
// @updateURL    https://raw.gitmirror.com/NStudio-Service/TampermonkeyScripts/main/CampusNetworkHelper/main.js
// @downloadURL    https://raw.gitmirror.com/NStudio-Service/TampermonkeyScripts/main/CampusNetworkHelper/main.js
// ==/UserScript==
function save(obj) {
    localStorage.CN_LoginScript = JSON.stringify(obj);
}

function getSpareMsgId() {
    let randomNumber = Math.random().toString().slice(2);
    if (document.querySelector("#msg" + randomNumber)) {
        return getSpareMsgId();
    }
    return "msg" + randomNumber;
}
function showMsg(txt) {
    if (!document.querySelector('#msgBox')) {
        $("body").append("<div id='msgBox' style='left: 10px; top: 10px; position: fixed'/>");
    }
    let id = getSpareMsgId(), fullId = "#" + id;
    $("#msgBox").append(`<div id='${id}' style='font-size:18px;display:none;background: #43cf78;color:#ffffff;overflow: hidden;padding:10px;margin:10px;text-align:center;border-radius: 3px;box-shadow:2px 2px 3px #aaaaaa;'>${txt}</div>`);
    $(fullId).fadeIn();
    setTimeout(() => {
        $(fullId).fadeOut();
        setTimeout(() => {
            $(fullId).remove();
        }, 1000);
    }, 3000);
}

let scriptConfig = JSON.parse(localStorage.CN_LoginScript || JSON.stringify({skipCount: 0, closeWindow: false}));
selectService = function (serviceName) {
    let userIndex = getQueryStringByName("userIndex");
    AuthInterFace.switchService(userIndex, encodeURIComponent(serviceName), function (switchServiceResult) {
        userIndex = switchServiceResult.userIndex;
        const keepaliveInterval = switchServiceResult.keepaliveInterval;
        if (switchServiceResult.result === "success") {
            showMessage("切换成功！");
            isshowClose = "false";
            freshSuccessPage(userIndex, keepaliveInterval);
        } else {
            AuthInterFace.logout(userIndex, function () {
                showMessage("切换失败，" + switchServiceResult.message + " 3s后将跳转到登录页面！");
                scriptConfig.skipCount = 2;
                save(scriptConfig);
                setTimeout(function () {
                    gologinPage();
                }, 3000);
            });
        }
    });
};

(function () {
    try {
        if (scriptConfig.skipCount === 0) {
            if (document.querySelector('#serviceSwitch')) {
                showMsg("连接成功");
                if (scriptConfig.closeWindow) {
                    scriptConfig.closeWindow = false;
                    save(scriptConfig);
                    window.opener = null;
                    window.close();
                }
                let setBallWindow = setInterval(() => {
                    if (
                        document.getElementById("ball1").getAttribute("url") &&
                        document.getElementById("ball2").getAttribute("url") &&
                        document.getElementById("ball3").getAttribute("url")
                    ) {
                        let ball1Url = document.getElementById("ball1").getAttribute("url");
                        let ball2Url = document.getElementById("ball2").getAttribute("url");
                        let ball3Url = document.getElementById("ball3").getAttribute("url");

                        document.getElementById("ball1").setAttribute("onclick", "window.open('" + ball1Url + "','_blank','width=1000,height=700,toolbar=no,location=no,menubar=no,titlebar=no,status=no')");
                        document.getElementById("ball2").setAttribute("onclick", "window.open('" + ball2Url + "','_blank','width=1000,height=700,toolbar=no,location=no,menubar=no,titlebar=no,status=no')");
                        document.getElementById("ball3").setAttribute("onclick", "window.open('" + ball3Url + "','_blank','width=1000,height=700,toolbar=no,location=no,menubar=no,titlebar=no,status=no')");

                        clearInterval(setBallWindow);
                    }
                }, 0);
            } else if (document.querySelector('#loginLink')) {
                showMsg("帐号登录");

                let autoLogin = setInterval(() => {
                    let authJs = doauthen.toString()
                    .replace(
                        'window.location="success.jsp?userIndex="+authResult.userIndex+"&keepaliveInterval="+authResult.keepaliveInterval;',
                        'window.open("success.jsp?userIndex=" + authResult.userIndex + "&keepaliveInterval=" + authResult.keepaliveInterval);close();'
                    )
                    .replace("function doauthen", "doauthen = function");
                    if (document.querySelector('#username').value && document.querySelector('#pwd').value) {
                        eval(authJs);
                        scriptConfig.closeWindow = true;
                        save(scriptConfig);
                        document.querySelector('#loginLink').click();
                        clearInterval(autoLogin);
                    }
                }, 0);
            } else if (document.querySelector('#offlineDiv')) {
                showMsg("下线过渡");
                scriptConfig.skipCount = 1;
                save(scriptConfig);
                document.querySelector('#offlineDiv').click();
            }
            showMsg("脚本状态：启用");
        } else {
            scriptConfig.skipCount--;
            save(scriptConfig);
            showMsg("脚本状态：暂停");
        }
    } catch (e) {
        alert(e);
        localStorage.removeItem("CN_LoginScript");
    }
})();

// ==UserScript==
// @name         校园网自动登录+解除限制
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       NXY666
// @match        http://10.100.1.5/*
// @icon         http://10.100.1.5/eportal/interface/index_files/pc/logosuccess.png
// @grant        unsafeWindow
// @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js
// ==/UserScript==
function save(obj) {
    localStorage.CN_LoginScript = JSON.stringify(obj);
}

(function () {
    try {
        let scriptConfig = localStorage.CN_LoginScript || JSON.stringify({skipCount: 0, closeWindow: false});
        scriptConfig = JSON.parse(scriptConfig);
        let floatyStr = "";
        if (scriptConfig.skipCount === 0) {
            if (document.querySelector('#serviceSwitch')) {
                floatyStr += (" · 成功");
                if (scriptConfig.closeWindow) {
                    scriptConfig.closeWindow = false;
                    save(scriptConfig);
                    window.opener = null;
                    window.close();
                    open(location, '_self').close();
                }
                let resetTime = new Date().getTime();
                let resetSwitchDelayTime = setInterval(() => {
                    if (switchDelayTime != null && switchDelayTime > 0) {
                        // noinspection JSUndeclaredVariable
                        switchDelayTime = 0;
                    } else if (new Date().getTime() - resetTime > 30000) {
                        clearInterval(resetSwitchDelayTime);
                    }
                }, 0);
            } else if (document.querySelector('#loginLink')) {
                floatyStr += (" · 登录");
                let autoLogin = setInterval(() => {
                    if (document.querySelector('#username').value && document.querySelector('#pwd').value) {
                        scriptConfig.closeWindow = true;
                        save(scriptConfig);
                        document.querySelector('#loginLink').click();
                        clearInterval(autoLogin);
                    }
                }, 0);
            } else if (document.querySelector('#offlineDiv')) {
                floatyStr += (" · 下线");
                scriptConfig.skipCount = 1;
                save(scriptConfig);
                document.querySelector('#offlineDiv').click();
            }
            floatyStr += " · 启用";
        } else {
            floatyStr += " · 跳过";
            scriptConfig.skipCount--;
            save(scriptConfig);
        }
        $("body").append("<div style='left: 10px;bottom: 10px;background: #43cf78;color:#ffffff;overflow: hidden;z-index: 9999;position: fixed;padding:10px;text-align:center;border-radius: 4px;'><a onclick='localStorage.removeItem(\"CN_LoginScript\");\n" + "\t\talert(\"清除完成！\");'>校园网络" + floatyStr + "</a></div>");
    } catch (e) {
        alert(e);
        localStorage.removeItem("CN_LoginScript");
    }
})();

// ==UserScript==
// @name    校园网助手
// @namespace    Campus.Network.Helper
// @version    0.7
// @description    -| 登录页自动登录 | 解除切换运营商时间限制 | 主页功能球优化 |-
// @author    NXY666
// @match    http://10.100.1.5/*
// @match    http://10.100.1.7/*
// @match    http://a.xujc.com/*
// @icon    http://a.xujc.com/eportal/interface/index_files/pc/logosuccess.png
// @grant    unsafeWindow
// @require    https://code.jquery.com/jquery-3.7.1.min.js
// @updateURL    https://raw.gitmirror.com/NStudio-Service/TampermonkeyScripts/main/CampusNetworkHelper/main.js
// @downloadURL    https://raw.gitmirror.com/NStudio-Service/TampermonkeyScripts/main/CampusNetworkHelper/main.js
// ==/UserScript==

function save(obj) {
	localStorage.CN_LoginScript = JSON.stringify(obj);
}

function checkWindowCloseable() {
	return window.opener != null || window.history.length === 1;
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
		$("body").append("<div id='msgBox' style='left: 10px; top: 10px; position: fixed;'/>");
	}
	let id = getSpareMsgId(), fullId = "#" + id;
	$("#msgBox").append(`<div id='${id}' style='font-size: 18px; display: none; background: #43cf78; color: white; overflow: hidden; padding: 10px 15px; margin: 10px; text-align: center; border-radius: 10px; box-shadow: 0 3px 6px rgba(140, 149, 159, 0.15);'>${txt}</div>`);
	$(fullId).fadeIn();
	setTimeout(() => {
		$(fullId).fadeOut();
		setTimeout(() => {
			$(fullId).remove();
		}, 1000);
	}, 3000);
}

let scriptConfig = JSON.parse(localStorage.CN_LoginScript || JSON.stringify({skipCount: 0, closeWindow: false}));

(function () {
	try {
		if (scriptConfig.skipCount === 0) {
			if (document.querySelector('#serviceSwitch')) {
				showMsg("连接成功");

				if (scriptConfig.closeWindow) {
					scriptConfig.closeWindow = false;
					save(scriptConfig);
					if (checkWindowCloseable()) {
						window.close();
					}
				}

				selectService = function (serviceName) {
					let userIndex = getQueryStringByName("userIndex");
					AuthInterFace.switchService(userIndex, encodeURIComponent(serviceName), function (switchServiceResult) {
						userIndex = switchServiceResult.userIndex;
						const keepaliveInterval = switchServiceResult.keepaliveInterval;
						if (switchServiceResult.result === "success") {
							isshowClose = "false";
							freshSuccessPage(userIndex, keepaliveInterval);
						} else {
							AuthInterFace.logout(userIndex, function () {
								showMessage(`切换失败，${switchServiceResult.message} 3s后将跳转到登录页面！`);
								scriptConfig.skipCount = 2;
								save(scriptConfig);
								setTimeout(function () {
									gologinPage();
								}, 3000);
							});
						}
					});
				};

				let setBallWindow = setInterval(() => {
					if (
						document.getElementById("ball1").getAttribute("url") &&
						document.getElementById("ball2").getAttribute("url") &&
						document.getElementById("ball3").getAttribute("url")
					) {
						let ball1Url = document.getElementById("ball1").getAttribute("url");
						let ball2Url = document.getElementById("ball2").getAttribute("url");
						let ball3Url = document.getElementById("ball3").getAttribute("url");

						document.getElementById("ball1").setAttribute("onclick", `window.open('${ball1Url}','_blank','width=1000,height=700,toolbar=no,location=no,menubar=no,titlebar=no,status=no')`);
						document.getElementById("ball2").setAttribute("onclick", `window.open('${ball2Url}','_blank','width=1000,height=700,toolbar=no,location=no,menubar=no,titlebar=no,status=no')`);
						document.getElementById("ball3").setAttribute("onclick", `window.open('${ball3Url}','_blank','width=1000,height=700,toolbar=no,location=no,menubar=no,titlebar=no,status=no')`);

						clearInterval(setBallWindow);
					}
				}, 0);
			} else if (document.querySelector('#loginLink')) {
				showMsg("帐号登录");

				let autoLogin = setInterval(() => {
					if (document.querySelector('#username').value && document.querySelector('#pwd').value) {
						clearInterval(autoLogin);

						const displayIsCheckNoEl = document.getElementById("disPlayIs_check_no");
						if (displayIsCheckNoEl.style.display === "block" || displayIsCheckNoEl.style.display === "") {
							checkIsSaveInfo();
							showMsg("记住密码选项已自动勾选");
							return;
						}

						if (checkWindowCloseable()) {
							let authJs = doauthen.toString()
							.replace("function doauthen", "doauthen = function")
							.replace('window.location="success.jsp?userIndex="+authResult.userIndex+"&keepaliveInterval="+authResult.keepaliveInterval;', 'window.open("success.jsp?userIndex="+authResult.userIndex+"&keepaliveInterval="+authResult.keepaliveInterval);close();');
							eval(authJs);

							scriptConfig.closeWindow = true;
							save(scriptConfig);
						}

						document.querySelector('#loginLink').click();
					}
				}, 0);
			} else if (document.querySelector('#offlineDiv')) {
				showMsg("下线过渡");

				scriptConfig.skipCount = 1;
				save(scriptConfig);
				document.querySelector('#offlineDiv').click();
			}

			showMsg("状态：启用");
		} else {
			scriptConfig.skipCount--;
			save(scriptConfig);

			showMsg(`状态：暂停 ${scriptConfig.skipCount + 1} 次`);
		}

		// 在页面左下角显示一行
		let tipNode = document.createElement("span");

		tipNode.innerText = "校园网助手正在代理本页面";

		tipNode.style.position = "fixed";
		tipNode.style.left = "5px";
		tipNode.style.bottom = "5px";
		tipNode.style.fontSize = "12px";
		tipNode.style.color = "gray";
		tipNode.style.pointerEvents = "none";

		document.body.appendChild(tipNode);
	} catch (e) {
		alert(e);
		localStorage.removeItem("CN_LoginScript");
	}
})();

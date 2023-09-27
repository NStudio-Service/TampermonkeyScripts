// ==UserScript==
// @name    校园网助手
// @namespace    Campus.Network.Helper
// @version    0.8
// @description    -| 登录页自动登录 | 解除切换运营商时间限制 | 主页功能球优化 |-
// @author    NXY666
// @match    http://10.100.1.5/*
// @match    http://10.100.1.7/*
// @match    http://a.xujc.com/*
// @icon    http://a.xujc.com/eportal/interface/index_files/pc/logosuccess.png
// @grant    unsafeWindow
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

function injectStyle(...css) {
	const styleElement = document.createElement('style');
	document.head.appendChild(styleElement);

	const styleSheet = styleElement.sheet;

	for (let cssItem of css) {
		styleSheet.insertRule(cssItem, styleSheet.cssRules.length);
	}
}
function fadeInElement(selector) {
	const element = document.querySelector(selector);
	if (element) {
		element.style.display = 'block';
		element.classList.add('fade-in');
	}
}
function fadeOutElement(selector) {
	const element = document.querySelector(selector);
	if (element) {
		element.classList.remove('fade-in');
		element.classList.add('fade-out');
		setTimeout(function () {
			element.style.display = 'none';
		}, 500); // 渐变结束后隐藏元素
	}
}
function removeElement(selector) {
	const element = document.querySelector(selector);
	if (element && element.parentNode) {
		element.parentNode.removeChild(element);
	}
}

function showMsg(txt) {
	if (!document.querySelector('#msg-box')) {
		const msgBox = document.createElement('div');
		msgBox.id = 'msg-box';
		msgBox.classList.add('msg-box');
		document.body.appendChild(msgBox);
	}
	const id = getSpareMsgId(),
		fullId = "#" + id;

	const messageDiv = document.createElement('div');
	messageDiv.id = id;
	messageDiv.classList.add('msg-item');
	messageDiv.innerHTML = txt;
	document.querySelector('#msg-box').appendChild(messageDiv);

	fadeInElement(fullId);
	setTimeout(function () {
		fadeOutElement(fullId);
		setTimeout(function () {
			removeElement(fullId);
		}, 1000);
	}, 3000);
}

let scriptConfig = JSON.parse(localStorage.CN_LoginScript || JSON.stringify({skipCount: 0, closeWindow: false}));

(function () {
	try {
		injectStyle(
			`@keyframes fade-in { from { opacity: 0; transform: translateX(-30%); } to { opacity: 1; transform: translateX(0); } }`,
			`@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }`,
			`.fade-in { animation: fade-in 0.5s forwards; }`,
			`.fade-out { animation: fade-out 0.5s forwards; }`,
			`.msg-box {
				position: fixed;
				left: 10px;
				top: 10px;
			}`,
			`.msg-item {
				font-size: 16px;
				display: none;
				background: linear-gradient(45deg, #43CF78, #4AE484);
				border: 1px solid #43CF78;
				color: white;
				overflow: hidden;
				padding: 10px 15px;
				margin: 10px;
				text-align: center;
				border-radius: 10px;
				box-shadow: 0 3px 6px rgba(140, 149, 159, 0.15);
			}`,
		);

		let pageType, helperState;

		if (scriptConfig.skipCount === 0) {
			if (document.querySelector('#serviceSwitch')) {
				pageType = "连接成功";

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
				pageType = "账号登录";

				let autoLogin = setInterval(() => {
					if (document.querySelector('#username').value && document.querySelector('#pwd').value) {
						clearInterval(autoLogin);

						const displayIsCheckNoEl = document.getElementById("disPlayIs_check_no");
						if (displayIsCheckNoEl.style.display === "block" || displayIsCheckNoEl.style.display === "") {
							checkIsSaveInfo();
							showMsg("已自动勾选记住密码选项");
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
				pageType = "下线过渡";

				scriptConfig.skipCount = 1;
				save(scriptConfig);
				document.querySelector('#offlineDiv').click();
			}

			helperState = "启用";
		} else {
			scriptConfig.skipCount--;
			save(scriptConfig);

			helperState = "暂停";
		}

		// 在页面左下角显示一行
		let tipSpan = document.createElement("span");

		let tipText = "校园网助手";
		if (pageType) {
			tipText += ` - ${pageType}`;
		}
		tipText += ` - ${helperState}`;
		tipSpan.innerText = tipText;

		tipSpan.style.position = "fixed";
		tipSpan.style.left = "5px";
		tipSpan.style.bottom = "5px";
		tipSpan.style.fontSize = "12px";
		tipSpan.style.color = "gray";
		tipSpan.style.pointerEvents = "none";

		document.body.appendChild(tipSpan);
	} catch (e) {
		console.warn(e);
		localStorage.removeItem("CN_LoginScript");
	}
})();

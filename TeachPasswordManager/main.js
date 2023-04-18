// ==UserScript==
// @name         教学文件系统密码管理器
// @namespace    Teach.Password.Manager
// @version      0.1
// @description  -| 密码自动补全 | 主动密码猜测 |-
// @author       NXY666
// @match        http://teach.xujc.com/student/index.php
// @icon         http://teach.xujc.com/favicon.ico
// @updateURL    https://raw.githubusercontents.com/NStudio-Service/TampermonkeyScripts/main/TeachPasswordManager/main.js
// @downloadURL  https://raw.githubusercontents.com/NStudio-Service/TampermonkeyScripts/main/TeachPasswordManager/main.js
// @grant        unsafeWindow
// ==/UserScript==

// 教师常用密码
let teacherPass = {};

let filePass = {};

function storeData() {
	localStorage.setItem("teacherPass", JSON.stringify(teacherPass));
	localStorage.setItem("filePass", JSON.stringify(filePass));
}

function readData() {
	teacherPass = JSON.parse(localStorage.getItem("teacherPass")) || {};
	filePass = JSON.parse(localStorage.getItem("filePass")) || {};
}

async function checkPass(dirId, type, dirPwd) {
	const url = "/student/index.php?c=File&a=pwd";
	const formData = new FormData();
	formData.append("dir_id", dirId);
	formData.append("type", type);
	formData.append("dir_pwd", dirPwd);
	formData.append("submit", "true");

	const response = await fetch(url, {
		method: "POST",
		body: formData
	});

	const text = await response.text();
	const parser = new DOMParser();
	const htmlDoc = parser.parseFromString(text, "text/html");
	const tipsInfo = htmlDoc.getElementsByClassName("tips_info");

	return tipsInfo.length === 0;
}

function getTeacherName() {
	const h2Element = Array.from(document.querySelectorAll('h2')).find(element => {
		return /^目录访问—.*$/.test(element.textContent);
	});
	return h2Element?.textContent.replace("目录访问—", "");
}

async function autoFillPass() {
	// 获取教师姓名
	const teacherName = getTeacherName();

	let url = new URL(location.href);

	let dirId = url.searchParams.get("dir_id");
	let type = url.searchParams.get("type");

	if (dirId in filePass) {
		let checkRes = await checkPass(dirId, type, filePass[dirId]);
		await handlePass(filePass[dirId], checkRes);
		checkRes && enterFile();
	} else {
		// 无保存的密码则尝试填写教师常用密码
		if (teacherName in teacherPass) {
			for (const pass of teacherPass[teacherName]) {
				if (await checkPass(dirId, type, pass)) {
					await handlePass(pass, true);
					enterFile();
				}
			}
		}
	}
}

function enterFile() {
	const url = new URL(location.href);

	// 把query中type的值给参数a，然后移除type
	url.searchParams.set("a", url.searchParams.get("type"));
	url.searchParams.delete("type");

	location.href = url.href;
}

async function handlePass(pass, checked = null) {
	let url = new URL(location.href);

	let dirId = url.searchParams.get("dir_id");
	let type = url.searchParams.get("type");

	// 获取教师姓名
	const teacherName = getTeacherName();

	if (checked === null ? await checkPass(dirId, type, pass) : checked) {
		// 删除teacherPass中相同的密码
		teacherPass[teacherName] = !teacherPass[teacherName] ? [] : teacherPass[teacherName].filter(oldPass => oldPass !== pass);
		// 添加密码
		teacherPass[teacherName].push(pass);
		// 如果密码超过10个，删除最早的密码
		if (teacherPass[teacherName].length > 10) {
			teacherPass[teacherName].shift();
		}

		// 记录正确的密码
		if (filePass[dirId] !== pass) {
			filePass[dirId] = pass;
		}

		// 保存数据
		storeData();

		enterFile();
	} else {
		// 删除错误的密码
		if (filePass[dirId] === pass) {
			delete filePass[dirId];
		}

		// 保存数据
		storeData();
	}
}

(async function () {
	const dirPwdInputEl = document.getElementById("dir_pwd");
	if (dirPwdInputEl) {
		// 读取数据
		readData();

		// 监听密码输入
		dirPwdInputEl.addEventListener("input", async function () {
			await handlePass(dirPwdInputEl.value);
		});

		await autoFillPass();
	}
})();

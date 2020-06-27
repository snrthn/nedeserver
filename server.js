const http = require('http');
const fs = require('fs');
const config = require('./conf/config.js');


// 创建服务
const server = http.createServer(function (req, res) {
        console.log(req.url);
	config.default_file.count = 0;
	var url = req.url.split('?')[0];
	var ext = getExt(url);
	writeFileHead(res, ext, 200, '*');
	if (isHtml(url)) {
		findFiles(res, url);
	} else {
		fs.readFile('./www/' + url, function (err, data) {
			if (!err) {
				res.write(data);
			} else {
				writeFileHead(res, 'html', 404);
				res.write(config.err_msg);
			}
			res.end();
		})
	}
});


// 读取后缀名
function getExt (url) {
	if (url === '/') return 'html';
	if (url.length > 1 && url.lastIndexOf('.') === -1) return 'html';
	if (url.length > 1 && url.lastIndexOf('.') === -1 && url.substr(-1) === '/') return 'html';
	if (url.lastIndexOf('.') !== -1) return url.substr(url.lastIndexOf('.') + 1, url.length - 1);
}


// 自动查找
function isHtml (url) {
	if (url === '/') return 'html';
	if (url.length > 1 && url.lastIndexOf('.') === -1) return 'html';
	if (url.length > 1 && url.lastIndexOf('.') === -1 && url.substr(-1) === '/') return 'html';
	return false;
}


// 遍历默认文档
function findFiles (res, url) {
	if (url.length > 1 && url.substr(-1) !== '/') url = url + '/';
	fs.readFile('./www' + url + config.default_file[config.default_file.count], function (err, data) {
		if (!err) {
			res.write(data);
			res.end();
			config.default_file.count = 0;
		} else {
			if (config.default_file.count < config.default_file.length) {
				config.default_file.count++;
				findFiles(res, url);
				return;
			}
			writeFileHead(res, 'html', 404);
			res.write(config.err_msg);
			res.end();
		}
	});
};


// 定义错误头
function  writeFileHead (res, ext, status, domain) {
	let obj = {};
	let mime = require('./conf/mime.json');
	obj['Content-Type'] = mime[ext] + ';charset=utf-8';
	if (domain) obj['Access-Control-Allow-Origin'] = domain;
	res.writeHead(status, obj);
}

// 监听端口
server.listen(config.port, function () {
	console.log('服务器运行中...');
});
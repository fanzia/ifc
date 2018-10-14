var path = require("path");
var rimraf = require("rimraf");
// var mkdirp = require('mkdirp');
var fsExtra = require("fs-extra");

clear();
function clear () {
	var dataPath = 	path.join(process.cwd(),"public/data");

	var uploadPath = path.join(dataPath, "upload");

	console.log('开始整理文件夹');
	rimraf(uploadPath,function (err) {
		if(err){
			console.log("删除上传文件夹失败:" + err);
		}else{
			console.log("删除上传文件夹成功");
			fsExtra.ensureDir(uploadPath,function (err) {
				if(err){
					console.log('新建上传文件夹失败:' + err)
				}else{
					console.log("新建上传文件夹成功");
				}	
			})
		}
	})


	var outputPath = path.join(dataPath, "output");

	rimraf(outputPath,function (err) {
		if(err){
			console.log("删除输出文件夹失败:" + err);
		}else{
			console.log("删除输出文件夹成功");
			fsExtra.ensureDir(outputPath,function (err) {
				if(err){
					console.log('新建输出文件夹失败:' + err)
				}else{
					console.log("新建输出文件夹成功");
				}	
			})
		}
	})

}
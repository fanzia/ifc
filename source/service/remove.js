var fsExtra = require("fs-extra");
var rimraf = require("rimraf");
var path = require("path");


module.exports = remove;


function remove (uuid) {
	var uploadFolder = path.join(process.cwd(),"public/data/upload",uuid);
	var outputFolder = path.join(process.cwd(),"public/data/output",uuid);

	var tasks = [];
	var task1 = rimraf(outputFolder,function (err) {
		if(err){
			console.log("删除上传文件夹失败:" + err);
		}else{
			console.log('删除上传文件夹'+uuid);
			
		}
	});



	var task2 = rimraf(uploadFolder,function (err) {
		if(err){
			console.log("删除上传文件夹失败:" + err);
		}else{
			console.log('删除输出文件夹'+uuid);

		}
	})

	tasks.push(task1);
	tasks.push(task2);

	return Promise.all(tasks)
		.then(function () {
			return new Promise(function(resolve){
				return resolve({
					info : "success"
				});
			});
		})


}
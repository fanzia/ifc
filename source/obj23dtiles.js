
var fs = require("fs");
var fsPromises = fs.promises;
var path = require("path");
var fsExtra = require('fs-extra');
var obj2Tileset = require('./obj23dtiles/lib/obj2Tileset');

module.exports = obj23dtiles;
function obj23dtiles (model) {

	// 拆分出来的转换函数
	function obj2tileset_o (objPath, outputPath, options) {
		if(typeof options.tilesetOptions === 'string') {
		    options.tilesetOptions = fsExtra.readJsonSync(options.tilesetOptions);
		}

		options.binary = true;
	    options.batchId = true;
	    options.b3dm = true;
		return obj2Tileset(objPath, outputPath, options)
		    .then(function(result) {
		        var b3dm = result.b3dm;
		        var batchTableJson = result.batchTableJson;
		        var tileset = result.tilesetJson;
		        var tilePath = result.tilePath;
		        var tilesetPath = result.tilesetPath;

		        if(options.outputBatchTable) {
		            var batchTableJsonPath = tilePath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
		            fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
		            fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
		        }

		        var tasks = [];
		        fsExtra.ensureDirSync(path.dirname(tilePath));
		        tasks.push(fsExtra.outputFile(tilePath, b3dm));
		        tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
		        return Promise.all(tasks);
		    })
		    .then(function() {
		    	return new Promise(function(resolve){
		    		return resolve({
		    			info : "success"
		    		});
		    	});
		    })
		    .catch(function(error) {
		    	var info = "转换3dtiles 失败:" + error.message || error;
		    	model.sendMessage("error",info);
		    });
	}



	// 读取列表
	try {
		var outputFolderPath = model.getOutputFolderPath();
		var objListPath = path.join(outputFolderPath,"objs");

		var files = fs.readdirSync(objListPath);
		var options = {
			tilesetOptions : path.join(outputFolderPath,"option.json"),
			tileset : true,
			b3dm : true
		};

		var tasks = [];
		
		files.forEach( function(file) {
			var filePath = path.join(objListPath,file);
			var stats = fs.statSync(filePath);
			if(stats.isDirectory()){
				return;
			}

			if(file.lastIndexOf(".obj") != -1){
				var fileName = file.substring(0, file.indexOf('.'));
				var outputPath = path.join(outputFolderPath,"objs",fileName+".b3dm");
				model.sendMessage("info",`开始转换${fileName}`);
				var task = obj2tileset_o(filePath,outputPath,options)
					.then(function (result) {
						model.sendMessage("info",`转换完成${fileName}`);
					})
				tasks.push(task);
			}
		});
		return Promise.all(tasks)
			.then(function (result) {
				return new Promise(function(resolve){
					return resolve({
						info : "转换全部完成"
					});
				});
			} )
	} catch(err) {
		model.sendMessage("err",`转换失败:${err}`);
	}


	

}
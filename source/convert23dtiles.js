var fs = require("fs");
var fsPromises = fs.promises;
var path = require("path");
var fsExtra = require('fs-extra');
var obj23dtiles = require('./obj23dtiles/lib/obj23dtiles');
var makeCompositeTile = require("./3dtiles/makeCompositeTile");

module.exports = convert23dtiles;
function convert23dtiles (model) {

	var allTasks = [];

	function readFolderList () {
		var outputFolderPath = model.getOutputFolderPath();
		var objListPath = path.join(outputFolderPath,"objs");

		var files = fs.readdirSync(objListPath);
		for(var i = 0; i < files.length;++i){
			var file = files[i];
			var filePath = path.join(objListPath,file);
			var stats = fs.statSync(filePath);
			if(!stats.isDirectory()){
				continue;;
			}

			convertFolder(filePath);
		}
	}


	function convertFolder (folderPath) {
		var files = fs.readdirSync(folderPath);
		model.sendMessage("info",`开始转换${path.basename(folderPath)}`);
		var tasks = [];
		for(var i = 0; i < files.length;++i){
			var file = files[i];
			var filePath = path.join(folderPath,file);
			var stats = fs.statSync(filePath);
			if(stats.isDirectory()){
				continue;
			}

			if(file.lastIndexOf(".obj") != -1){
				var fileName = file.substring(0, file.indexOf('.'));
				if(fileName.indexOf("b3dm")== 0){
					tasks.push(convert2B3dm(filePath));
				}else{
					tasks.push(convert2I3dm(filePath));
				}
			}
		}

		// 转换完成后生成cmpt
		folderTask = Promise.all(tasks)
			.then(function () {
				try {
					var pathList = getTileFileList(folderPath);
					var list = [];
					for(var i = 0; i < pathList.length;++i){
						list.push(fsExtra.readFileSync(pathList[i]));

					}

					var cmpt = makeCompositeTile(list);
					var basename = path.basename(folderPath);
					var cmptPath = path.join(folderPath,basename + ".cmpt");
					return fsExtra.outputFile(cmptPath, cmpt);
				} catch(e) {
					console.log(`合并${basename}cmpt出错${e}`);
				}


			})
		allTasks.push(folderTask);
	}

	function convert2B3dm (objPath) {
		var outputFolderPath = model.getOutputFolderPath();
		
		var basename = path.basename(objPath);
		var fileName = basename.substring(0, basename.indexOf('.'));

		var options = {
			tilesetOptions : path.join(outputFolderPath,"option.json"),
			tileset : true,
			b3dm : true
		};
		var outputPath = path.join(path.dirname(objPath),fileName +".b3dm");
		model.sendMessage("info",`开始转换${fileName}`);
		var task = obj23dtiles(objPath,outputPath,options);
		return task;
	}

	function convert2I3dm (objPath) {
		var outputFolderPath = model.getOutputFolderPath();
		
		var basename = path.basename(objPath);
		var fileName = basename.substring(0, basename.indexOf('.'));

		var options = {
			tilesetOptions : path.join(outputFolderPath,"option.json"),
			tileset : true,
			i3dm : true,
			customFeatureTable : path.join(path.dirname(objPath),fileName + "_featureTable.json"),
			customBatchTable : path.join(path.dirname(objPath),fileName +"_batchTable.json")
		};


		var outputPath = path.join(path.dirname(objPath),fileName +".i3dm");
		var task = obj23dtiles(objPath,outputPath,options);
		return task;
	}

	// 获取该文件夹下的文件列表
	function getTileFileList (folderPath) {
		var files = fs.readdirSync(folderPath);

		var list = [];
		for(var i = 0; i < files.length;++i){
			var file = files[i];
			var filePath = path.join(folderPath,file);
			var stats = fs.statSync(filePath);
			if(!stats.isDirectory()){
				continue;
			}

			var filesList = fs.readdirSync(filePath);
			for(var j = 0; j < filesList.length;++j){
				var fileName = filesList[j];
				var fileType = fileName.slice(fileName.lastIndexOf(".")+1);
				if(fileType == "b3dm" || fileType == "i3dm"){
					var tilePath = path.join(filePath,fileName);
					list.push(tilePath);
				}
			}
		}

		return list;
	}

	// function obj2tileset_o (objPath, outputPath, options) {
	// 	console.time('Total');
	// 	if(typeof options.tilesetOptions === 'string') {
	// 	    options.tilesetOptions = fsExtra.readJsonSync(options.tilesetOptions);
	// 	}
	// 	if (typeof options.customFeatureTable === 'string') {
	// 	    options.customFeatureTable = fsExtra.readJsonSync(options.customFeatureTable);
	// 	}

	// 	if(typeof options.customBatchTable === 'string') {
	// 	    options.customBatchTable = fsExtra.readJsonSync(options.customBatchTable);
	// 	}


	// 	options.binary = true;
	//     options.batchId = true;
	// 	obj2Tileset(objPath, outputPath, options)
	// 	    .then(function(result) {
	// 	        var i3dm = result.i3dm;
	// 	        var batchTableJson = result.batchTableJson;
	// 	        var tileset = result.tilesetJson;
	// 	        var tilePath = result.tilePath;
	// 	        var tilesetPath = result.tilesetPath;

	// 	        if(options.outputBatchTable) {
	// 	            var batchTableJsonPath = tilePath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
	// 	            fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
	// 	            fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
	// 	        }

	// 	        var tasks = [];
	// 	        fsExtra.ensureDirSync(path.dirname(tilePath));
	// 	        tasks.push(fsExtra.outputFile(tilePath, i3dm));
	// 	        tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
	// 	        return Promise.all(tasks);
	// 	    })
	// 	    .then(function() {
	// 	        console.timeEnd('Total');
	// 	    })
	// 	    .catch(function(error) {
	// 	        console.log(error.message || error);
	// 	        process.exit(1);
	// 	    });
	// }



	// var tasks = [];

	readFolderList();
	return Promise.all(allTasks)
		.then(function (result) {
			return new Promise(function(resolve){
				return resolve({
					info : "转换全部完成"
				});
			});
		} )
}
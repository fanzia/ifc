var Promise = require('bluebird');
var fs = require("fs");
var path = require('path');
var fsExtra = require('fs-extra');

module.exports = createTiles;
function createTiles (model) {


	// 创建tiles文件夹
	function createTilesFolder (outputFolderPath) {
		try {
			var tilesFolderPath = path.join(outputFolderPath,"tiles");
			fsExtra.emptyDirSync(tilesFolderPath);
			model.sendMessage("info","创建3tiles文件夹");
		} catch(err) {
			model.sendMessage("error",`创建3tiles文件夹失败:${err}`);
		}

	}

	// 移动tileset.json文件
	function moveTilesetJson (outputFolderPath) {
		try {
			var tilesetPath = path.join(outputFolderPath,"tileset.json");
			var newPath = path.join(outputFolderPath,"tiles","tileset.json");
			fsExtra.copySync(tilesetPath,newPath);
			model.sendMessage("info","移动tileset.json文件");
		} catch(err) {
			model.sendMessage("error",`移动tileset.json文件失败${err}`);
		}
	}

	// 移动positions.json
	function movePostionsJson (outputFolderPath) {
		try {
			var positionsJson = path.join(outputFolderPath,"positions.json");
			var newPath = path.join(outputFolderPath,"tiles","positions.json");
			fsExtra.copySync(positionsJson,newPath);
			model.sendMessage("info","移动positions.json文件");
		} catch(err) {
			model.sendMessage("error",`移动positions.json文件失败${err}`);
		}
	}

	// 文件夹下列表读取
	function moveTiles (outputFolderPath) {
		try {
			var objListPath = path.join(outputFolderPath,"objs");
			var files = fs.readdirSync(objListPath);
			files.forEach( function(file, index) {
				var filePath = path.join(objListPath,file);
				var stats = fs.statSync(filePath);
				if(stats.isFile()){
					return;
				}
				var tilesList = fs.readdirSync(filePath);
				tilesList.forEach( function(f, index) {
					var tileFile = path.join(filePath,f);
					var name = tileFile.substring(tileFile.lastIndexOf("."));
					if(name == ".cmpt"){
						moveFile(outputFolderPath,tileFile);
					}
				});
			});
		} catch(err) {
			model.sendMessage("error",`移动3dtiles文件失败${err}`);
		}

	}

	// 移动b3dm文件
	function moveFile (outputFolderPath,tileFile) {
		try {
			var basename = path.basename(tileFile);
			var tileName = basename.substring(0,basename.indexOf("."));
			var list = tileName.split("_");
			var folderPath = path.join(outputFolderPath,"tiles");
			for(var i = 0; i < list.length-1;++i){
				folderPath = path.join(folderPath,list[i]);
			}

			fsExtra.ensureDirSync(folderPath);

			var fileName = list[list.length -1] + tileFile.substring(tileFile.lastIndexOf("."));
			var newFile = path.join(folderPath,fileName);
			fsExtra.copySync(tileFile,newFile);
			model.sendMessage("info",`移动3dtiles文件${basename}`);
		} catch(err) {
			model.sendMessage("error",`移动3dtiles文件${tileFile}失败:${err}`);
		}
	}


	var outputFolderPath = model.getOutputFolderPath();
	createTilesFolder(outputFolderPath);
	moveTilesetJson(outputFolderPath);
	movePostionsJson(outputFolderPath);
	moveTiles(outputFolderPath);
}
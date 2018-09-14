var readLines = require('./readLines');
var Promise = require('bluebird');
var fs = require("fs");
var path = require('path');
var fsExtra = require('fs-extra');

module.exports = writeObj;

// writeObj(null);
function writeObj (model) {

	var mapFolder = null;
	var currentName = null;
	var currentList = null;

	var currentPositionIndex = 0;
	var currentUvIndex = 0;
	var currentNormalIndex = 0;



	// 创建objs文件夹
	function createObjsFolder () {
		try {
			var outputFolderPath = model.getOutputFolderPath();
			var objListPath = path.join(outputFolderPath,"objs");
			fsExtra.emptyDirSync(objListPath);
			model.sendMessage("info","创建obj输出文件夹成功");
		} catch(err) {
			model.sendMessage("error","创建obj输出文件夹失败:"+err);
		}
	}

	// 移动纹理文件
	function moveMtlPath () {
		try {
			var outputFolderPath = model.getOutputFolderPath();
			var outputMtlPath = path.join(outputFolderPath,"objs",model.getMtlName());
			fsExtra.copySync(model.getMtlPath(),outputMtlPath);
			model.sendMessage("info","移动MTL纹理文件成功");
		} catch(err) {
			model.sendMessage("error","移动MTL纹理文件失败:"+err);
		}
	}

	// 移动纹理贴图文件夹
	function moveMapFolder () {
		var mtlPath = model.getMtlPath();
		readLines(mtlPath, parseLine_mtlPath)
			.then(function () {
				if(mapFolder){
					try {
						var dir = path.dirname(model.getPath());
						var mapFolderPath = path.join(dir,mapFolder);
						var outputMapFolderPath = path.join(model.getOutputFolderPath(),"objs",mapFolder);
						fsExtra.copySync(mapFolderPath,outputMapFolderPath);
						model.sendMessage("info","移动纹理贴图文件成功");
					} catch(err) {
						model.sendMessage("err","移动纹理贴图文件失败:"+err);
					}
				}
			})
	}

	function parseLine_mtlPath (line) {
		line = line.trim();
		if(mapFolder == null){
			if(line.indexOf("map_Ka") != -1 || line.indexOf("map_Kd") != -1){
				var array = line.split(' ');
				var path = array[array.length -1];
				if(path){
					mapFolder = path.substring(0,path.indexOf("\\")); 
				}
			}
		}
	}


	function write () {
		var lodList = model.getLodList();
		writeItem(lodList);
	}

	function writeItem(lodList) {
		lodList.forEach( function(value, key) {
			currentName = key;
			currentList = value;
			var output = '';
			currentPositionIndex = 0;
			currentUvIndex = 0;
			currentNormalIndex = 0;

			output += `mtllib ${model.getMtlName()}\n`;
			for(var i = 0; i < currentList.length;++i){
				var id = currentList[i];
				var objectModel = model.getModel(id);
				if(objectModel == null){
					continue;
				}
				output += writeObjectModel(objectModel);
			}


			var outputFolderPath = model.getOutputFolderPath();
			var objName = path.join(outputFolderPath,"objs",currentName+".obj");
			try {
				fs.writeFileSync(objName,output,"utf8");
				model.sendMessage("info",`写入${currentName}成功`);
			} catch(err) {
				model.sendMessage("info",`写入${currentName}失败:${err}`);
			}
		});


	}

	function writeObjectModel (objectModel) {
		if(!objectModel){
			return "";
		}
		var output = '';
		
		output += `# object ${objectModel.getName()} \n\n`;

		output += writePositions(objectModel.getPositions());

		output += writeUvs(objectModel.getUvs());

		output += writeNormals(objectModel.getNormals());

		output += writeSmoothGroups(objectModel);

		output += `\n`;

		return output;
	}
	
	// v 
	function writePositions (positions) {
		var output = '';
		for(var i = 0; i < positions.length;++i){
			var point = positions[i];
			output += `v ${point.getX()} ${point.getZ()}  ${-point.getY()}\n`;
		}

		return output;
	}

	// vt
	function writeUvs (uvs) {
		var output = '';
		for(var i = 0; i < uvs.length;++i){
			var point = uvs[i];
			output += `vt ${point.getX()} ${point.getY()} ${point.getZ()} \n`;
		}
		return output;
	}
	
	// vn 
	function writeNormals (normals) {
		var output = '';
		for(var i = 0; i < normals.length;++i){
			var point = normals[i];
			output += `vn ${point.getX()} ${point.getY()} ${point.getZ()} \n`;
		}
		return output;
	}


	function writeSmoothGroups (objectModel) {
		var positionIndex = objectModel.getPositionIndex();
		var uvIndex = objectModel.getUvIndex();
		var normalIndex = objectModel.getNormalIndex();
		var smoothGroups = objectModel.getSmoothGroups();
		var output = '';
		output += `g ${objectModel.getName()}\n`;
		for(var i = 0; i < smoothGroups.length;++i){
			var smoothGroup = smoothGroups[i];
			output += writeSmoothGroup(smoothGroup,positionIndex,uvIndex,normalIndex,objectModel.getPositionCount());
		}
		currentPositionIndex += objectModel.getPositionCount();
		currentNormalIndex +=objectModel.getNormalCount();
		currentUvIndex += objectModel.getUvCount();

		return output;
	}


	 // "f v", "f v/v", "f v//v", "f v/v/v"
	function writeSmoothGroup (smoothGroup,positionIndex,uvIndex,normalIndex,positionCount) {
		// var faces = smoothGroup.getFaces();
		var materialFace = smoothGroup.getMaterialFace();
		var output = '';
		var number = smoothGroup.getNumber();
		output += `s ${number}\n`;

		materialFace.forEach( function(value, key) {
			var material = key;
			var faces = value;
			output += `usemtl ${material}\n`;	
			for(var i = 0; i < faces.length;++i){
				var face = faces[i];
				var positions = face.getPositions();
				var uvs = face.getUvs();
				var normals = face.getNormals();

				if(positionIndex == -1){
					console.log('no position');
					continue;
				}

				var pIndex = positionIndex - currentPositionIndex ;
				var uIndex = uvIndex - currentUvIndex;
				var nIndex = normalIndex - currentNormalIndex;
				output += `f `;
				if(uvIndex != -1 && normalIndex != -1){
					// "f v/v/v"
					for(var j = 0; j < 3;++j){
						output += `${parseInt(positions[j]) - pIndex}/${parseInt(uvs[j]) - uIndex}/${parseInt(normals[j]) - nIndex} `;
					}

					output += `\n`;

				}else if(uvIndex == -1 && normalIndex != -1){
					// "f v//v"
					for(var j = 0; j < 3;++j){
						output += `${parseInt(positions[j]) - pIndex}//${parseInt(normals[j]) - nIndex} `;
					}

					output += `\n`;
				}else if(uvIndex != -1 && normalIndex == -1){
					// "f v/v"
					for(var j = 0; j < 3;++j){
						output += `${parseInt(positions[j]) - pIndex}/${parseInt(uvs[j]) - uIndex} `;
					}

					output += `\n`;
				}else if(uvIndex == -1 && normalIndex == -1){
					// "f v"
					for(var j = 0; j < 3;++j){
						output += `${parseInt(positions[j]) - pIndex} `;
					}
					output += `\n`;
				}
			}
		});


		return output;
	}


	createObjsFolder();
	moveMtlPath();
	moveMapFolder();
	// 开始切分文件了
	write();
	return new Promise(function(resolve){
		return resolve({
			model : model
		});
	});
}
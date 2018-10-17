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

	function createObjKeyFolder (key) {
		try {
			var outputFolderPath = model.getOutputFolderPath();
			var objKeyPath = path.join(outputFolderPath,"objs",key);
			fsExtra.emptyDirSync(objKeyPath);
			model.sendMessage("info",`创建${key}文件夹成功`);
		} catch(err) {
			model.sendMessage("error",`创建${key}文件夹失败:${err}`);
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
		// var lodList = model.getLodList();
		var lodList = model.getLodList_2();
		// writeItem(lodList);
		// lodList.forEach( function(value, key) {
		// 	writeItem(value,key);
		// });
		var keys = lodList.keys();
		for(var i = 0; i <keys.length;++i){
			var key = keys[i];
			var value = lodList.get(key);
			writeItem(value,key);
		}
	}


	// function writeItem(lodList) {
	// 	lodList.forEach( function(value, key) {
	// 		currentName = key;
	// 		currentList = value;
	// 		var output = '';
	// 		currentPositionIndex = 0;
	// 		currentUvIndex = 0;
	// 		currentNormalIndex = 0;

	// 		output += `mtllib ${model.getMtlName()}\n`;
	// 		for(var i = 0; i < currentList.length;++i){
	// 			var id = currentList[i];
	// 			var objectModel = model.getModel(id);
	// 			if(objectModel == null){
	// 				continue;
	// 			}
	// 			output += writeObjectModel(objectModel);
	// 		}


	// 		var outputFolderPath = model.getOutputFolderPath();
	// 		var objName = path.join(outputFolderPath,"objs",currentName+".obj");
	// 		try {
	// 			fs.writeFileSync(objName,output,"utf8");
	// 			model.sendMessage("info",`写入${currentName}成功`);
	// 		} catch(err) {
	// 			model.sendMessage("info",`写入${currentName}失败:${err}`);
	// 		}
	// 	});
	// }


	function writeItem (typeHashMap,key) {
		// 创建key文件夹
		if(key == null){
			console.log(key);
			return;
		}
		console.log(key);
		createObjKeyFolder(key);
		var instanced = model.getInstanced();
		typeHashMap.forEach( function(list, refineType) {
			if(refineType == "b3dm"){
				// currentName = key;
				// currentList = list;
				if(list.length == 0){
					return;
				}
				var output = '';
				currentPositionIndex = 0;
				currentUvIndex = 0;
				currentNormalIndex = 0;

				output += `mtllib ../${model.getMtlName()}\n`;
				for(var i = 0; i < list.length;++i){
					var id = list[i];
					var objectModel = model.getModel(id);
					if(objectModel == null){
						continue;
					}
					output += writeObjectModel(objectModel,false);
				}


				var outputFolderPath = model.getOutputFolderPath();
				var objName = path.join(outputFolderPath,"objs",key, "b3dm.obj");
				try{
					fs.writeFileSync(objName,output,"utf8");
					model.sendMessage("info",`写入${key}成功`);
				} catch(err) {
					model.sendMessage("info",`写入${key}失败:${err}`);
				}
			}else{

				if(instanced){
					//  实例化
					currentPositionIndex = 0;
					currentUvIndex = 0;
					currentNormalIndex = 0;
					refineType = refineType.slice(1);
					writeInstanceModel(key,refineType,list);
				}else{
					var output = '';
					currentPositionIndex = 0;
					currentUvIndex = 0;
					currentNormalIndex = 0;

					output += `mtllib ../${model.getMtlName()}\n`;
					for(var i = 0; i < list.length;++i){
						var id = list[i];
						var objectModel = model.getModel(id);
						if(objectModel == null){
							continue;
						}
						output += writeObjectModel(objectModel,false);
					}

					refineType = refineType.slice(1);
					var outputFolderPath = model.getOutputFolderPath();
					var objName = path.join(outputFolderPath,"objs",key, "b3dm_" + refineType +".obj");
					try{
						fs.writeFileSync(objName,output,"utf8");
						model.sendMessage("info",`写入${currentName}成功`);
					} catch(err) {
						model.sendMessage("info",`写入${currentName}失败:${err}`);
					}
				}
			}
		});
	}

	// 创建实例化模型
	function writeInstanceModel(key,refineType,list) {
		writeInstanceObj(key,refineType,list);
		writeInstanceFeatureTable(key,refineType,list);
		writeInstanceBatchTable(key,refineType,list);
	}

	// 创建实例化模型的obj
	function writeInstanceObj (key,refineType,list) {
		var first = list[0];
		var objectModel = model.getModel(first);
		// var refineType = objectModel.getRefineType();

		// 输出obj
		var output = `mtllib ../${model.getMtlName()}\n`;
		output += writeObjectModel(objectModel,true);
		var outputFolderPath = model.getOutputFolderPath();
		var objName = path.join(outputFolderPath,"objs",key,refineType+".obj");
		try{
			fs.writeFileSync(objName,output,"utf8");
			model.sendMessage("info",`写入${currentName}成功`);
		} catch(err) {
			model.sendMessage("info",`写入${currentName}失败:${err}`);
		}
	}


	// 创建实例化模型的featureTable
	function writeInstanceFeatureTable (key,refineType,list) {
		
		var first = list[0];
		var firstObjectModel = model.getModel(first);
		var firstRefineInfo = firstObjectModel.getRefineInfo();
		var position = [];
		var orientation = [];
		var scale = [];

		for(var i = 0; i < list.length;++i){
			var objectModel = model.getModel(list[i]);
			if(!objectModel){
				continue;
			}

			// 调试用
			if(list[i] == "0mPrWLfiP6teKEF41l_UTI"){
				console.log('调试');
			}


			var geomType = objectModel.getGeomType();
			var refineInfo = objectModel.getRefineInfo();
			var center = objectModel.getCenter();
			if(geomType == "SweptSolid"){
				position.push([
					center.getX(),center.getY(),center.getZ()
					]);
				var o_and_s = getOrientationScale(firstRefineInfo,refineInfo);

				orientation.push(o_and_s.orientation);
				scale.push(o_and_s.scale);
			}else if(geomType == "MappedRepresentation"){
				position.push([
					center.getX(),center.getY(),center.getZ()
					]);
				var o = getOrientation(firstRefineInfo,refineInfo);
				orientation.push(o);
				scale.push([1,1,1]);
			}
		}


		var featureTableJson = {
			"position" : position,
			"orientation" : orientation,
			"scale" : scale
		};


		var outputFolderPath = model.getOutputFolderPath();
		var jsonPath = path.join(outputFolderPath,"objs",key,refineType + "_featureTable.json");
		try {
		    fsExtra.writeJsonSync(jsonPath,featureTableJson);
		    model.sendMessage("info","创建featureTable.json成功");
		} catch(err) {
		    model.sendMessage("error","创建featureTable.json失败:"+err);
		}
	}

	// 根据参照计算旋转和缩放
	function getOrientationScale (firstRefineInfo,refineInfo) {


		var angle_x = refineInfo.angle.x - firstRefineInfo.angle.x;
		var angle_y = refineInfo.angle.y - firstRefineInfo.angle.y;
		var angle_z = refineInfo.angle.z - firstRefineInfo.angle.z;

		var size = refineInfo.size;
		var firstSize = firstRefineInfo.size;


		var scale_x = (firstSize.x == 0) ? 1 :size.x/firstSize.x;
		var scale_y = (firstSize.y == 0) ? 1 :size.y/firstSize.y;
		var scale_z = (firstSize.z == 0) ? 1 :size.z/firstSize.z;

		var scale = [scale_x,scale_y,scale_z];
		var firstAngleZ = firstRefineInfo.angle.z;
		if(firstAngleZ == -90 || firstAngleZ == 90 ){
			scale = [scale_y,scale_x,scale_z];
		}

		if(angle_z<0){
			// angle_z = 360 + angle_z;
			angle_z = -angle_z;
		}
		var orientation = [
			angle_x,
			angle_y,
			angle_z
		];
		return {
			orientation : orientation,
			scale : scale
		}
	}

	// 计算旋转角度
	function getOrientation (firstRefineInfo,refineInfo) {
		var angle_x = refineInfo.angle.x - firstRefineInfo.angle.x;
		var angle_y = refineInfo.angle.y - firstRefineInfo.angle.y;
		var angle_z = refineInfo.angle.z - firstRefineInfo.angle.z;

		if(angle_z<0){
			// angle_z = 360 + angle_z;
			angle_z = -angle_z;
		}
		var orientation = [
			angle_x,
			angle_y,
			angle_z
		]; 
		return orientation;
	}

	function writeInstanceBatchTable (key,refineType,list) {
		var batchID = [];
		var name = [];
		for(var i = 0; i < list.length;++i){
			var objectModel = model.getModel(list[i]);
			if(!objectModel){
				continue;
			}
			batchID.push(i);
			name.push(objectModel.getName() + "_1");

		}

		var batchTableJson = {
			"batchID" : batchID,
			"name" : name
		};

		var outputFolderPath = model.getOutputFolderPath();
		var jsonPath = path.join(outputFolderPath,"objs",key,refineType + "_batchTable.json");
		try {
		    fsExtra.writeJsonSync(jsonPath,batchTableJson);
		    model.sendMessage("info","创建batchTable.json成功");
		} catch(err) {
		    model.sendMessage("error","创建batchTable.json失败:"+err);
		}
	}

	function writeObjectModel (objectModel,centerFlag) {
		if(!objectModel){
			return "";
		}
		var output = '';
		
		output += `# object ${objectModel.getName()} \n\n`;

		if(centerFlag){
			output += writePositions_center(objectModel);
		}else{
			output += writePositions(objectModel.getPositions());
		}
		
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

	// v  移动到中心点
	function writePositions_center (objectModel) {
		var output = '';
		var positions = objectModel.getPositions();
		var center = objectModel.getCenter();
		for(var i = 0; i < positions.length;++i){
			var point = positions[i];
			output += `v ${point.getX()-center.getX()} ${point.getZ()-center.getZ()}  ${-point.getY()+ center.getY()}\n`;
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
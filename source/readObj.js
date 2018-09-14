var readLines = require('./readLines');
var common = require("./Common");
var ObjectModel = require("./Model/ObjectModel");
var Point = require("./Model/Point");
var SmoothGroup = require("./Model/SmoothGroup");
var Face = require("./Model/Face");
var Promise = require('bluebird');

module.exports = readObj;
function readObj (model) {
	var currentPositions = [];
	var currentNormals = [];
	var currentUvs = [];
	var currentObjectModel = null;
	var currentFaceCount = 0;
	var poisitionCount = 0;
	var normalCount = 0;
	var uvCount = 0;
	var currentMaterial = null;
	var smoothGroup = null;

	var facePositions = [];
	var faceUvs = [];
	var faceNormals = [];

	var lineBuffer = '';


	function parseLine (line) {
		line = line.trim();
		var result;

		if ((line.length === 0) || (line.charAt(0) === '#')) {
		    // Don't process empty lines or comments
		} else if (/^o\s/i.test(line)) {
		    // var objectName = line.substring(2).trim();
		}else if(line.indexOf("g ") != -1){
			var list = line.split(" ");
			var name = list[1].trim();
			if(currentObjectModel){
				// 已经有赋值的
				if(currentPositions.length != 0 && currentObjectModel.getPositions().length == 0){
					currentObjectModel.setPositions(currentPositions,poisitionCount - currentPositions.length);
					currentPositions = [];
				}
				if(currentFaceCount !=0 && currentObjectModel.faceCount == 0){
					currentObjectModel.setFaceCount(currentFaceCount);
					currentFaceCount = 0;
				}

				if(currentNormals.length != 0 && currentObjectModel.getNormals().length == 0){
					currentObjectModel.setNormals(currentNormals,normalCount - currentNormals.length);
					currentNormals = [];
				}

				if(currentUvs.length != 0 && currentObjectModel.getUvs().length == 0){
					currentObjectModel.setUvs(currentUvs,uvCount - currentUvs.length);
					currentUvs = [];
				}
				if(smoothGroup){
					// if(smoothGroup.getMaterial() == null && currentMaterial){
					// 	smoothGroup.setMaterial(currentMaterial);
					// }
					// smoothGroup.addMaterial(currentMaterial);
					currentObjectModel.addSmoothGroup(smoothGroup);
					smoothGroup = null;
				}
			}
			currentObjectModel = new ObjectModel(name,model.center);
			if(currentPositions.length != 0 ){
				currentObjectModel.setPositions(currentPositions,poisitionCount - currentPositions.length);
				currentPositions = [];
			}
			if(currentFaceCount !=0){
				currentObjectModel.setFaceCount(currentFaceCount);
				currentFaceCount = 0;
			}

			if(currentNormals.length != 0){
				currentObjectModel.setNormals(currentNormals,normalCount - currentNormals.length);
				currentNormals = [];
			}

			if(currentUvs.length != 0){
				currentObjectModel.setUvs(currentUvs,uvCount - currentUvs.length);
				currentUvs = [];
			}

			model.addObjectModel(currentObjectModel);

			
		}else if ((result = global.vertexPattern.exec(line)) !== null) {
			var flap = model.getFlap();
			var point;
			if(flap){
				point = new Point(parseFloat(result[1]),parseFloat(result[3]),-parseFloat(result[2]));
			}else{
				point = new Point(parseFloat(result[1]),parseFloat(result[2]),parseFloat(result[3]));
			}

			currentPositions.push(point);
			poisitionCount++;
		}else if ((result = global.normalPattern.exec(line) ) !== null) {
           	var point = new Point(parseFloat(result[1]),parseFloat(result[2]),parseFloat(result[3]));
           	currentNormals.push(point);
           	normalCount++;
	    } else if ((result = global.uvPattern.exec(line)) !== null) {
	    	var z = 0.0;
	    	if(result.length >2){
	    		z = parseFloat(result[3]);
	    	}
	        var point = new Point(parseFloat(result[1]),parseFloat(result[2]),z);
	        currentUvs.push(point);
	        uvCount++;
		// }else if(line.substring(0, 2) === "f "){
		// 	currentFaceCount ++;
		// 	return;
		}else if(/^mtllib/i.test(line)){
			var array = line.split(" ");
	    	var mtlName = array[array.length-1];
	    	model.setMtlName(mtlName);
		}else if(/^usemtl\s/i.test(line)){
			var materialName = line.substring(7).trim();
			// 设置当前的纹理
			currentMaterial = materialName;
			if(smoothGroup){
				smoothGroup.addMaterial(currentMaterial);
			}
		}else if(/^s /i.test(line)){
			// 没有考虑 s off关闭平滑组的情况
			if(smoothGroup){
				currentObjectModel.addSmoothGroup(smoothGroup);
			}
			smoothGroup = new SmoothGroup();
			var number = line.substring(2);
			smoothGroup.setNumber(number);
			// smoothGroup.setMaterial(currentMaterial);
			// smoothGroup.addMaterial(currentMaterial);
		}else{
			if (line.slice(-1) === '\\') {
			    lineBuffer += line.substring(0, line.length-1);
			    return;
			}

			lineBuffer += line;
			if (lineBuffer.substring(0, 2) === 'f ') {
				currentFaceCount++;
			    while ((result = facePattern.exec(lineBuffer)) !== null) {
			        facePositions.push(result[1]);
			        faceUvs.push(result[2]);
			        faceNormals.push(result[3]);
			    }

			    var face = new Face(facePositions,faceUvs,faceNormals);
			    if(smoothGroup){
			    	smoothGroup.addFace(currentMaterial,face);
			    }

			    facePositions.length = 0;
			    faceNormals.length = 0;
			    faceUvs.length = 0;
			}
			 lineBuffer = '';
		}

	}

	// 后处理
	function afterRead () {
		if(currentPositions.length != 0 && currentObjectModel.getPositions().length == 0){
			currentObjectModel.setPositions(currentPositions,poisitionCount - currentPositions.length);
			currentPositions = [];
		}

		if(currentFaceCount != 0 && currentObjectModel.faceCount == 0){
			currentObjectModel.setFaceCount(currentFaceCount);
		}

		if(currentNormals.length != 0 && currentObjectModel.getNormals().length == 0){
			currentObjectModel.setNormals(currentNormals,normalCount - currentNormals.length);
			currentNormals = [];
		}

		if(currentUvs.length != 0 && currentObjectModel.getUvs().length == 0){
			currentObjectModel.setUvs(currentUvs,uvCount - currentUvs.length);
			currentUvs = [];
		}

		if(smoothGroup){
			// if(smoothGroup.getMaterial() == null && currentMaterial){
			// 	smoothGroup.setMaterial(currentMaterial);
			// }
			// smoothGroup.addMaterial(currentMaterial);
			currentObjectModel.addSmoothGroup(smoothGroup);
			smoothGroup = null;
		}
	}


	// 解析类型
	function parseLine_ifcType (line) {
		// console.log(line);
		var list = line.split("\t");
		if(list.length != 2){
			return;
		}

		var name = list[0];
		var type = list[1];
		var objectModel = model.getModel(name);
		if(objectModel){
			objectModel.setIFCType(type);
		}else{
			console.log(name);
		}

	}

	return readLines(model.getPath(), parseLine)
		.then(function(){

			afterRead();

			model.sendMessage("info","读取结束");

			var box = model.getBox();
			console.log(box);

			var lon = box.max_lon - box.min_lon;
			var lat = box.max_lat - box.min_lat;
			var height = box.max_height - box.min_height;
			model.sendMessage("info","长:" + lon);
			model.sendMessage("info","宽:" + lat);
			model.sendMessage("info","高:" + height);
			var box_world = model.getBoundingVolume();
			console.log(box_world);


			return readLines(model.getIFCTypePath(),parseLine_ifcType)
				.then(function(){
					return new Promise(function(resolve){
						return resolve({
							model : model
						});
					});
				});
		});
}


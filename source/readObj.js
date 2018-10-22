var readLines = require('./readLines');
var common = require("./Common");
var ObjectModel = require("./Model/ObjectModel");
var Point = require("./Model/Point");
var SmoothGroup = require("./Model/SmoothGroup");
var Face = require("./Model/Face");
var Promise = require('bluebird');
var HashMap = require('hashmap');

module.exports = readObj;
function readObj (model) {
	// var currentPositions = [];
	// var currentNormals = [];
	// var currentUvs = [];
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

	var positions = [];
	var normals = [];
	var uvs = [];




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
				// if(currentPositions.length != 0 && currentObjectModel.getPositions().length == 0){
				// 	currentObjectModel.setPositions(currentPositions,poisitionCount - currentPositions.length);
				// 	currentPositions = [];
				// }
				// if(currentFaceCount !=0 && currentObjectModel.faceCount == 0){
				// 	currentObjectModel.setFaceCount(currentFaceCount);
				// 	currentFaceCount = 0;
				// }

				// if(currentNormals.length != 0 && currentObjectModel.getNormals().length == 0){
				// 	currentObjectModel.setNormals(currentNormals,normalCount - currentNormals.length);
				// 	currentNormals = [];
				// }

				// if(currentUvs.length != 0 && currentObjectModel.getUvs().length == 0){
				// 	currentObjectModel.setUvs(currentUvs,uvCount - currentUvs.length);
				// 	currentUvs = [];
				// }
				if(smoothGroup){
					// if(smoothGroup.getMaterial() == null && currentMaterial){
					// 	smoothGroup.setMaterial(currentMaterial);
					// }
					// smoothGroup.addMaterial(currentMaterial);
					currentObjectModel.addSmoothGroup(smoothGroup);
					smoothGroup = null;
				}


				// 根据面赋值坐标
				var positionsIndexes = currentObjectModel.getPositionsIndexes();
				var objectModelPositions = getPositionsByIndexes(positionsIndexes);

				currentObjectModel.setPositions(objectModelPositions,positionsIndexes);
				// console.log(objectModelPositions);

				// 根据面赋值向量
				var normalsIndexes = currentObjectModel.getNormalsIndexes();
				var objectModelNormals = getNormalsByIndexes(normalsIndexes);
				currentObjectModel.setNormals(objectModelNormals,normalsIndexes);


				var uvsIndexes = currentObjectModel.getUvsIndexes();
				var objectModelUvs = getUvsByIndexes(uvsIndexes);
				currentObjectModel.setUvs(objectModelUvs,uvsIndexes);

			}
			currentObjectModel = new ObjectModel(name,model.center);
			// if(currentPositions.length != 0 ){
			// 	currentObjectModel.setPositions(currentPositions,poisitionCount - currentPositions.length);
			// 	currentPositions = [];
			// }

			// if(currentFaceCount !=0){
			// 	currentObjectModel.setFaceCount(currentFaceCount);
			// 	currentFaceCount = 0;
			// }

			// if(currentNormals.length != 0){
			// 	currentObjectModel.setNormals(currentNormals,normalCount - currentNormals.length);
			// 	currentNormals = [];
			// }

			// if(currentUvs.length != 0){
			// 	currentObjectModel.setUvs(currentUvs,uvCount - currentUvs.length);
			// 	currentUvs = [];
			// }
			// 根据面赋值坐标
			var positionsIndexes = currentObjectModel.getPositionsIndexes();
			var objectModelPositions = getPositionsByIndexes(positionsIndexes);
			currentObjectModel.setPositions(objectModelPositions,positionsIndexes);
			// console.log(objectModelPositions);

			// 根据面赋值向量
			var normalsIndexes = currentObjectModel.getNormalsIndexes();
			var objectModelNormals = getNormalsByIndexes(normalsIndexes);
			currentObjectModel.setNormals(objectModelNormals,normalsIndexes);


			var uvsIndexes = currentObjectModel.getUvsIndexes();
			var objectModelUvs = getUvsByIndexes(uvsIndexes);
			currentObjectModel.setUvs(objectModelUvs,uvsIndexes);

			model.addObjectModel(currentObjectModel);

			
		}else if ((result = global.vertexPattern.exec(line)) !== null) {
			var flap = model.getFlap();
			var point;
			if(flap){
				point = new Point(parseFloat(result[1]),parseFloat(result[3]),-parseFloat(result[2]));
			}else{
				point = new Point(parseFloat(result[1]),parseFloat(result[2]),parseFloat(result[3]));
			}

			// currentPositions.push(point);
			positions.push(point);
			poisitionCount++;
		}else if ((result = global.normalPattern.exec(line) ) !== null) {
           	var point = new Point(parseFloat(result[1]),parseFloat(result[2]),parseFloat(result[3]));
           	// currentNormals.push(point);
           	normals.push(point);
           	normalCount++;
	    } else if ((result = global.uvPattern.exec(line)) !== null) {
	    	var z = 0.0;
	    	if(result.length >2){
	    		z = parseFloat(result[3]);
	    	}
	        var point = new Point(parseFloat(result[1]),parseFloat(result[2]),z);
	        // currentUvs.push(point);
	        uvs.push(point);
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
			smoothGroup.addMaterial(currentMaterial);
		}else{
			if (line.slice(-1) === '\\') {
			    lineBuffer += line.substring(0, line.length-1);
			    return;
			}

			lineBuffer += line;
			if (lineBuffer.substring(0, 2) === 'f ') {
				currentFaceCount++;
			    while ((result = facePattern.exec(lineBuffer)) !== null) {
			        facePositions.push(parseInt(result[1]));
			        faceUvs.push(parseInt(result[2]));
			        faceNormals.push(parseInt(result[3]));
			    }

			    var face = new Face(facePositions,faceUvs,faceNormals);
			    var points = getPositonsByFace();

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

	// 根据面来获取用到了哪些点
	function getPositonsByFace () {
		
	}


	function getPositionsByIndexes (indexes) {
		var list = [];
		for(var i = 0; i< indexes.length;++i){
			list.push(positions[indexes[i]-1]);
		}
		return list;
	}


	function getNormalsByIndexes (indexes) {
		var list = [];
		for(var i = 0; i< indexes.length;++i){
			list.push(normals[indexes[i]-1]);
		}
		return list;
	}

	function getUvsByIndexes (indexes) {
		var list = [];
		for(var i = 0; i< indexes.length;++i){
			list.push(uvs[indexes[i]-1]);
		}
		return list;
	}


	// 后处理
	function afterRead () {
		// if(currentPositions.length != 0 && currentObjectModel.getPositions().length == 0){
		// 	currentObjectModel.setPositions(currentPositions,poisitionCount - currentPositions.length);
		// 	currentPositions = [];
		// }

		// if(currentFaceCount != 0 && currentObjectModel.faceCount == 0){
		// 	currentObjectModel.setFaceCount(currentFaceCount);
		// }

		// if(currentNormals.length != 0 && currentObjectModel.getNormals().length == 0){
		// 	currentObjectModel.setNormals(currentNormals,normalCount - currentNormals.length);
		// 	currentNormals = [];
		// }

		// if(currentUvs.length != 0 && currentObjectModel.getUvs().length == 0){
		// 	currentObjectModel.setUvs(currentUvs,uvCount - currentUvs.length);
		// 	currentUvs = [];
		// }

		if(smoothGroup){
			// if(smoothGroup.getMaterial() == null && currentMaterial){
			// 	smoothGroup.setMaterial(currentMaterial);
			// }
			// smoothGroup.addMaterial(currentMaterial);
			currentObjectModel.addSmoothGroup(smoothGroup);
			smoothGroup = null;
		}

		// 根据面赋值坐标
		var positionsIndexes = currentObjectModel.getPositionsIndexes();
		var objectModelPositions = getPositionsByIndexes(positionsIndexes);
		currentObjectModel.setPositions(objectModelPositions,positionsIndexes);
		// console.log(objectModelPositions);

		// 根据面赋值向量
		var normalsIndexes = currentObjectModel.getNormalsIndexes();
		var objectModelNormals = getNormalsByIndexes(normalsIndexes);
		currentObjectModel.setNormals(objectModelNormals,normalsIndexes);


		var uvsIndexes = currentObjectModel.getUvsIndexes();
		var objectModelUvs = getUvsByIndexes(uvsIndexes);
		currentObjectModel.setUvs(objectModelUvs,uvsIndexes);
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

	// 测试-计算范围轮廓
	function getBorderGrid () {
		var modelBox = model.getBox();
		var width = modelBox.max_lon-modelBox.min_lon;
		var height = modelBox.max_lat-modelBox.min_lat;
		var count = 20;
		var size = null;
		if(width> height){
			size = height/count;
		}else{
			size = width/count;
		}
		var widthCount = Math.ceil(width/size);
		var heightCount = Math.ceil(height/size);
		var models = model.getModels();
		var hashMap = new HashMap();

		for(var i = 0; i < widthCount;++i){
			for(var j = 0; j < heightCount;++j){
				var box = {
					min_lon : modelBox.min_lon + i*size,
					max_lon : modelBox.min_lon + (i+1)*size,
					min_lat : modelBox.min_lat + j*size,
					max_lat : modelBox.min_lat + (j+1)*size,
				};
				var center = {
					x : modelBox.min_lon + i*size + size/2,
					y : modelBox.min_lat + j*size + size/2
				}
				for(var k = 0; k<models.length;++k){
					var objectModel = models[k];
					var objectModelBox = objectModel.getBox();
					// if(center.x < objectModelBox.max_lon && center.y > objectModelBox.min_lon &&
					// 	center.y < objectModelBox.max_lat &&center.y > objectModelBox.min_lat){
					// 	hashMap.set(i+"_"+j,true);
					// 	break;
					// }
					// var min_x = Math.max(box.min_lon,objectModelBox.min_lon);
					// var min_y = Math.max(box.min_lat,objectModelBox.min_lat);
					// var max_x = Math.min(box.max_lon,objectModelBox.max_lon);
					// var max_y = Math.min(box.max_lat,objectModelBox.max_lat);
					// if(min_x > max_x || min_y > max_y){
					// 	// 不想交
					// }else{
					// 	hashMap.set(i+"_"+j,true);
					// 	break;
					// }
					var result = isIntersect(objectModelBox,box);
					if(result){
						hashMap.set(i+"_"+j,true);
						break;
					}
				}
				if(!(hashMap.get(i+"_"+j))){
					hashMap.set(i+"_"+j,false);
				}
				
			}
		}
		console.log(hashMap);

		for(var i = heightCount-1;i>=0;i--){
			var str = '';
			for(var j = 0; j < widthCount;++j){
				var key = j + "_" + i; 
				var value = hashMap.get(key);
				if(value== true){
					str += "y" + ",";
				}else if(value == false){
					str += "n" + ",";
				}else{
					str += "b" + ",";
				}
			}
			console.log(str);
		}

	}

	function isIntersect (box1,box2) {
		var x01 = box1.min_lon,x02 = box1.max_lon,y01 = box1.min_lat,y02=box1.max_lat;
		var x11 = box2.min_lon,x12 = box2.max_lon,y11 = box2.min_lat,y12=box2.max_lat;
		var zx = Math.abs(x01+x02 - x11- x12);
		var x = Math.abs(x01 -x02) + Math.abs(x11-x12);
		var zy = Math.abs(y01+y02 - y11-y12);
		var y = Math.abs(y01 - y02) + Math.abs(y11-y12);
		if(zx <= x && zy <= y){
			return true
		}else{
			return false;
		}
	}

	return readLines(model.getPath(), parseLine)
		.then(function(){

			afterRead();

			model.setPositions(positions);
			model.setUvs(uvs);
			model.setNormals(normals);
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

			// 计算范围轮廓,暂时不计算了
			// getBorderGrid();
			// model.getGrid();


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


var Cesium = require('cesium');
var defaultValue = Cesium.defaultValue;
var ObjectModel = require("./ObjectModel");
var IFC = require("../IFC/IFC");
var Common = require("../Common");
var Box = require("./Box");
var path = require('path');
var HashMap = require('hashmap');

class Model{
	constructor(objPath,center,uuid,options,ifcName){
		this.objPath = objPath;
		this.center = center;
		this.uuid = uuid;
		this.flap = defaultValue(options.flap,true);
		this.type = defaultValue(options.type,"common");
		this.count0  = defaultValue(options.count_0,10);
		this.countX = defaultValue(options.count_x,1);
		this.countY = defaultValue(options.count_y,1);
		this.countZ = defaultValue(options.count_z,1);
		this.instanced = defaultValue(options.instanced,true);
		this.modelName = defaultValue(options.modelName,ifcName);
		this.wallDelta = defaultValue(parseInt(options.wallDelta),7);
		this.containSlab = defaultValue(options.containSlab=="yes"?true:false,false);
		this.draco = defaultValue(options.draco,true);
		this.models = [];
		this.box = null;
		this.ws = defaultValue(options.ws,null);
		// this.outputFolderPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\output";
		this.outputFolderPath = path.join(process.cwd(),"public/data/output",uuid);
		this.mtlName = null;

		var ifcPath = path.join(process.cwd(),"public/data/upload",uuid ,ifcName);
		this.ifc = new IFC(ifcPath,uuid);


		this.positions = [];
		this.normals = [];
		this.uvs = [];
	}

	getUuid(){
		return this.uuid;
	}

	getPath(){
		return this.objPath;
	}

	getOutputFolderPath(){
		return this.outputFolderPath;
	}

	getCenter(){
		return this.center;
	}

	getFlap(){
		return this.flap;
	}

	getModelName(){
		return this.modelName;
	}

	getInstanced(){
		return this.instanced;
	}

	getWallDelta(){
		return this.wallDelta;
	}

	isContainSlab(){
		return this.containSlab;
	}

	// 加载一个模型
	addObjectModel(objectModel){
		if(objectModel instanceof ObjectModel){
			this.models.push(objectModel);
			this.box = null;
		}
	}

	// 所有的坐标点
	setPositions(positions){
		this.positions = positions;
	}

	getPositionByIndex(index){
		return this.positions[index-1];
	}

	setNormals(normals){
		this.normals = normals;
	}

	getNormalByIndex(index){
		return this.normals[index-1];
	}

	setUvs(uvs){
		this.uvs = uvs;
	}

	getUvByIndex(index){
		return this.uvs[index-1];
	}

	// 计算范围
	getBox(){
		if(this.box){
			return this.box;
		}
		if(this.models.length == 0){
			return null;
		}
		var box = this.models[0].getBox();
		for(var i = 1; i < this.models.length;++i){
			var objectModel = this.models[i];
			box = box.merge(objectModel.getBox());
		}
		this.box = box;
		return box;
	}

	getBoundingVolume(){
		if(!this.box){
			this.getBox();
		}

		if(!this.box){
			return null;
		}

		var tileWidth = this.box.max_lon - this.box.min_lon;
		var tileHeight = this.box.max_lat - this.box.min_lat;
		tileWidth = Math.ceil(tileWidth);
		tileHeight = Math.ceil(tileHeight);
		var offsetX = 0;
		var offsetY = 0;
		var offsetX = tileWidth / 2 + this.box.min_lon;
		var offsetY = tileHeight / 2 + this.box.min_lat;
		offsetY = -offsetY;

		var longitudeExtent = Common.metersToLongitude(tileWidth, this.center.lat);
		var latitudeExtent = Common.metersToLatitude(tileHeight);

		var west = this.center.lon - longitudeExtent / 2 + offsetX / tileWidth * longitudeExtent;
		var south = this.center.lat - latitudeExtent / 2 - offsetY / tileHeight * latitudeExtent;
		var east = this.center.lon + longitudeExtent / 2 + offsetX / tileWidth * longitudeExtent;
		var north = this.center.lat + latitudeExtent / 2 - offsetY / tileHeight * latitudeExtent;
		return new Box({
			min_lon : west,
			min_lat : south,
			max_lon : east,
			max_lat : north,
			min_height : this.box.min_height,
			max_height : this.box.max_height
		});
	}


	setMtlName(mtlName){
		this.mtlName = mtlName;
	}

	getMtlName(){
		return this.mtlName;
	}

	getMtlPath(){
		var dir = path.dirname(this.objPath);
		return path.join(dir,this.mtlName);
	}

	// 获取如何切分的列表
	// getLodList(){
	// 	// 测试专用
	// 	var lodList = [];
	// 	lodList.push({
	// 		"name" : "0_0_0_0",
	// 		"list" : ["2WjQNV5Yv9VBczJ4BBNlzt","2WjQNV5Yv9VBczJ4BBNk4m"]
	// 	});

	// 	lodList.push({
	// 		"name" : "0_0_1_0",
	// 		"list" : ["2WjQNV5Yv9VBczJ4BBNlu6","3ykhvsD7DAVf769GG15l_T"]
	// 	})
	// 	return lodList;
	// }


	getLodList(){
		var hashmap = new HashMap();
		this.models.forEach( function(model, index) {
			var key = model.getKey();
			var name = model.getName();
			if(hashmap.get(key)){
				var list = hashmap.get(key);
				list.push(name);
			}else{
				var list = [name];
				hashmap.set(key,list);
			}

		});
		return hashmap;
	}

	// 加上实例化
	// hashmap<key,hashmap<type,list>>
	// getLodList_2(hashmap){
	// 	var hashmap = new HashMap();
	// 	this.models.forEach( function(model, index) {
	// 		var key = model.getKey();
	// 		if(key == null){
	// 			return;
	// 		}
	// 		var name = model.getName();
	// 		var refineType = model.getRefineType();
	// 		// if(refineType)
	// 		if(hashmap.get(key)){
	// 			var typeHashMap = hashmap.get(key);
	// 			if(refineType){
	// 				var list = typeHashMap.get(refineType);
	// 				if(list){
	// 					list.push(name);
	// 				}else{
	// 					typeHashMap.set(refineType,[name]);
	// 				}
	// 			}else{
	// 				var list = typeHashMap.get("b3dm");
	// 				if(list){
	// 					list.push(name);
	// 				}else{
	// 					typeHashMap.set("b3dm",[name]);
	// 				}
	// 			}
	// 		}else{
	// 			var typeHashMap = new HashMap();
	// 			if(refineType){
	// 				var list = typeHashMap.get(refineType);
	// 				if(list){
	// 					list.push(name);
	// 				}else{
	// 					typeHashMap.set(refineType,[name]);
	// 				}
	// 			}else{
	// 				var list = typeHashMap.get("b3dm");
	// 				if(list){
	// 					list.push(name);
	// 				}else{
	// 					typeHashMap.set("b3dm",[name]);
	// 				}
	// 			}
	// 			hashmap.set(key,typeHashMap);
	// 		}

	// 	})


	// 	hashmap.forEach( function(typeHashMap, key) {
	// 		var b3dmList = typeHashMap.get("b3dm");
	// 		if(!b3dmList){
	// 			typeHashMap.set("b3dm",[]);
	// 		}
	// 		b3dmList = typeHashMap.get("b3dm");
	// 		typeHashMap.forEach( function(list, refineType) {

	// 			if(refineType != "b3dm"&& list.length == 1){
	// 				b3dmList.push(list[0]);
	// 				typeHashMap.delete(refineType);
	// 			}
	// 		});
	// 	});
	// 	return hashmap;
	// }


	getLodList_2(hashmap){
		var hashmap = new HashMap();
		this.models.forEach( function(model, index) {
			var keys = model.getKeys();
			if(keys == null){
				return;
			}
			for(var i = 0; i < keys.length;++i){
				var key = keys[i];
				var name = model.getName();
				var refineType = model.getRefineType();
				// if(refineType)
				if(hashmap.get(key)){
					var typeHashMap = hashmap.get(key);
					if(refineType){
						var list = typeHashMap.get(refineType);
						if(list){
							list.push(name);
						}else{
							typeHashMap.set(refineType,[name]);
						}
					}else{
						var list = typeHashMap.get("b3dm");
						if(list){
							list.push(name);
						}else{
							typeHashMap.set("b3dm",[name]);
						}
					}
				}else{
					var typeHashMap = new HashMap();
					if(refineType){
						var list = typeHashMap.get(refineType);
						if(list){
							list.push(name);
						}else{
							typeHashMap.set(refineType,[name]);
						}
					}else{
						var list = typeHashMap.get("b3dm");
						if(list){
							list.push(name);
						}else{
							typeHashMap.set("b3dm",[name]);
						}
					}
					hashmap.set(key,typeHashMap);
				}
			}

		})


		hashmap.forEach( function(typeHashMap, key) {
			var b3dmList = typeHashMap.get("b3dm");
			if(!b3dmList){
				typeHashMap.set("b3dm",[]);
			}
			b3dmList = typeHashMap.get("b3dm");
			typeHashMap.forEach( function(list, refineType) {

				if(refineType != "b3dm"&& list.length == 1){
					b3dmList.push(list[0]);
					typeHashMap.delete(refineType);
				}
			});
		});
		return hashmap;
	}


	getModel(name){
		for(var i = 0; i < this.models.length;++i){
			var model = this.models[i];
			var modelName = model.getName();
			if(modelName === name){
				return model;
			}
		}
		return null;
	}

	getModels(){
		return this.models;
	}

	getIFCTypePath(){
		var dir = path.dirname(this.objPath);
		return path.join(dir,"ifcType.txt");
	}

	getType(){
		return this.type;
	}


	sortByArea(){
		function sort_function (a,b) {
			if(a == null || b == null){
				return false;
			}
			return b.getArea() - a.getArea();
		}
		this.models.sort(sort_function);
	}

	sortByHeight(){
		function sort_function (a,b) {
			return b.getHeight() - a.getHeight();
		}

		this.models.sort(sort_function);
	}

	getCount0(){
		return this.count0;
	}

	getCountX(){
		return this.countX;
	}

	getCountY(){
		return this.countY;
	}

	getCountZ(){
		return this.countZ;
	}

	getTransform(){
		var position = Cesium.Cartesian3.fromRadians (this.center.getX(), this.center.getY(), this.center.getZ());
		var heading = Cesium.Math.toRadians (0);
		var hpr = new Cesium.HeadingPitchRoll (heading, 0, 0);
		var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame (position, hpr);

		var array = [];
		for(var i = 0; i < 16;++i){
			array.push(modelMatrix[i]);
		}
		return array;
	}


	sendMessage(type,message){
		if(!this.ws){
			return;
		}

		if(type == "info"){
			console.log(message);
		}else if (type == "error") {
			console.error(message);
		}else if(type == "success"){
			console.log(message);
		}

		var result = {
			status : type,
			message : message
		};

		this.ws.send(JSON.stringify(result));
	}


	getIFC(){
		return this.ifc;
	}

	// 获取坐标格网
	getGrid(){
		var modelBox = this.getBox();
		this.gridSize = 1;

		var width = modelBox.max_lon-modelBox.min_lon;
		var height = modelBox.max_lat-modelBox.min_lat;

		// var count = 5;
		// var size = null;
		// if(width> height){
		// 	size = height/count;
		// }else{
		// 	size = width/count;
		// }
		// this.gridSize = size;
		// var widthCount = Math.ceil(width/size);
		// var heightCount = Math.ceil(height/size);
		var widthCount = Math.ceil(width/this.gridSize);
		var heightCount = Math.ceil(height/this.gridSize);

		var models = this.getModels();
		this.gridHashMap = new HashMap();

		for(var i = 0; i < widthCount;++i){
			for(var j = 0; j < heightCount;++j){
				var box = {
					min_lon : modelBox.min_lon + i*this.gridSize,
					max_lon : modelBox.min_lon + (i+1)*this.gridSize,
					min_lat : modelBox.min_lat + j*this.gridSize,
					max_lat : modelBox.min_lat + (j+1)*this.gridSize,
				};
				var center = {
					x : modelBox.min_lon + i*this.gridSize + this.gridSize/2,
					y : modelBox.min_lat + j*this.gridSize + this.gridSize/2
				}
				for(var k = 0; k<models.length;++k){
					var objectModel = models[k];
					var objectModelBox = objectModel.getBox();
					var result = Common.isIntersect(objectModelBox,box);
					if(result){
						this.gridHashMap.set(i+"_"+j,true);
						break;
					}
				}
				if(!(this.gridHashMap.get(i+"_"+j))){
					this.gridHashMap.set(i+"_"+j,false);
				}
				
			}
		}
		console.log(this.gridHashMap);

		for(var i = heightCount-1;i>=0;i--){
			var str = '';
			for(var j = 0; j < widthCount;++j){
				var key = j + "_" + i; 
				var value = this.gridHashMap.get(key);
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

	// 根据模型获取格网序列号
	getModelGridKey(modelName){
		var objectModel = this.getModel(modelName);
		if(!objectModel){
			return null;
		}

		var center = objectModel.getCenter();
		var modelBox = objectModel.getBox();

		var box = this.getBox();

		var min_x = Math.floor((modelBox.min_lon - box.min_lon)/this.gridSize);
		var min_y = Math.floor((modelBox.min_lat - box.min_lat)/this.gridSize);
		var max_x = Math.floor((modelBox.min_lon - box.min_lon)/this.gridSize);
		var max_y = Math.floor((modelBox.min_lat - box.min_lat)/this.gridSize);
		return {
			min_x : min_x,
			min_y : min_y,
			max_x : max_x,
			max_y : max_y
		};

		// var grid_x = Math.floor((center.getX() - box.min_lon)/this.gridSize);
		// var grid_y = Math.floor((center.getY() - box.min_lat)/this.gridSize);
		// return{
		// 	x : grid_x,
		// 	y : grid_y
		// };
	}

	// 根据grid获取值
	getGridValue(x,y){
		var key = x+ "_"+y;
		return this.gridHashMap.get(key);
	}

	// 是否压缩
	getDraco(){
		return this.draco;
	}

}

module.exports = Model;
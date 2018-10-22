var Box = require("../Model/Box");

module.exports = subdivideMuqiang;

function subdivideMuqiang (model) {
	
	// 显示筛选出来的数据
	function subdivide_0(box){
		var count = 0;
		// var count0 = model.getCount0();
		var models = model.getModels();
		for(var i = 0; i < models.length ;++i){
			var objectModel = models[i];
			if(objectModel.getIFCType() == "IfcSlab" || objectModel.getIFCType() == "IfcPlate"){
				objectModel.setParam(0,0,0,0);
				count++;
			}
			
		}
		// 防止个数不满足第一级的要求
		// if(count < count0){
		// 	for(var i = 0; i < models.length && count < count0;++i){
		// 		var objectModel = models[i];
		// 		objectModel.setParam(0,0,0,0);
		// 		count++;
		// 	}
		// }

		var countX = model.getCountX();
		var countY = model.getCountY();
		var countZ = model.getCountZ();

		var lonDelta = (box.max_lon - box.min_lon)/countX;
		var latDelta = (box.max_lat - box.min_lat)/countY;
		var heightDelta=(box.max_height -box.min_height)/countZ;
		var json = {
			"boundingVolume":{
				"region":box.toArray(),
			},
			"geometricError": 1,
			"content":{
				"uri" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".cmpt"
			},
			"children":[]
		}
		// if(count0 == 0){
		// 	json = {
		// 		"boundingVolume":{
		// 			"region":box.toArray(),
		// 		},
		// 		"geometricError": 1,
		// 		"children":[]
		// 	}
		// }

		for(var i = 0; i < countX;++i){
			for(var j = 0; j < countY;++j){
				for(var k = 0; k < countZ;++k){
					var lon = box.min_lon + lonDelta*i;
					var lat = box.min_lat + latDelta*j;
					var height = box.min_height + heightDelta*k;
					var gridBox = new Box({
						min_lon : lon,
						max_lon : lon+lonDelta,
						min_lat : lat,
						max_lat : lat + latDelta,
						min_height : height,
						max_height : height + heightDelta
					});

					var childJson = subdivide_1(gridBox,1,i,j,k);
					if(childJson){
						json["children"].push(childJson);
					}
				}
			}
		}
		return json;
	}


	function subdivide_1 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) 
				// replace机制
				// || objectModel.getKey() != null
				// || (ifcType != "IfcSlab" && ifcType != "IfcWall"
				// && ifcType != "IfcWallStandardCase" && ifcType != "IfcPlate")){
				// 只显示楼板和幕墙玻璃
				|| (ifcType != "IfcSlab" && ifcType != "IfcPlate")){
				// || (ifcType != "IfcPlate")){
				continue;
			}
			count++;
			objectModel.setParam(level,x,y,h);

		}


		var childJson = subdivide_2(box,2,x,y,h);
		// var childJson = null;
		var json = null;
		if(count == 0){
			if(childJson){
				json = childJson;
			}
		}else{
			json = {
			 	"boundingVolume":{
			 		"region":box.toArray()
			 	},
			 	// "viewerRequestVolume":{
			 	// 	"region":viewerBox.toArray()
			 	// },
			 	"geometricError": 0.1,
			 	"content":{
			 		"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 		}
			 	},
			 	"children":[]
			};
			if(childJson){
				json["children"].push(childJson);
			}
		}
		return json;
	}

// 
	function subdivide_2 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) 
				// || objectModel.getKey() != null
				|| (ifcType != "IfcWall" && ifcType != "IfcBeam"
				&& ifcType != "IfcWallStandardCase" && ifcType != "IfcColumn" && ifcType != "IfcCovering"
				&& ifcType != "IfcSlab")){
				continue;
			}
			count++;
			objectModel.setParam(level,x,y,h);

		}

		var childJson = subdivide_3(box,3,x,y,h);
		var json = null;
		if(count == 0){
			if(childJson){
				json = childJson;
			}
		}else{
			json = {
			 	"boundingVolume":{
			 		"region":box.toArray()
			 	},
			 	"geometricError": 0.025,
			 	"content":{
			 		"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 		}
			 	},
			 	"children":[]
			};
			if(childJson){
				json["children"].push(childJson);
			}
		}
		return json;
	}
	// 第二级
	function subdivide_3 (box,level,x,y,h) {
		var count = 0;
		var models = model.getModels();
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) 
				// || objectModel.getKey()!= null )
				)
				continue;
			count++;
			objectModel.setParam(level,x,y,h);
		}

		if(count == 0){
			return null;
		}

		var json = {
			"boundingVolume":{
				"region":box.toArray()
			},
			"geometricError": 0,
			"content":{
				"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			}
		}
		return json;
	}

	// 测试用例
	function subdivide_test (box) {
		var list = [];
		var models = model.getModels();
		for(var i = 0; i < models.length ;++i){
			var objectModel = models[i];
			var name = objectModel.getName();
			if(list.indexOf(name) != -1){
				objectModel.setParam(0,0,0,0);
			}
		}

		var json = {
			"boundingVolume":{
				"region":box.toArray(),
			},
			"geometricError": 0,
			"content":{
				"uri" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".cmpt"
			},
		}
		return json;
	}


	function subdivide () {
		model.sortByArea();
		var box = model.getBoundingVolume();
		var json = subdivide_0(box);
		// var json = subdivide_test(box);
		var transform = model.getTransform();
		var box = model.getBoundingVolume();
		var boundingVolume = {
			"region" : box.toArray()
		};
		var tilesetJson = {
			"asset" : {
			    "version": "0.0",
			    "tilesetVersion": "1.0.0-obj23dtiles",
			    "gltfUpAxis": "Y"
			},
			"geometricError": 4,
			"root":{
				"transform": transform,
				"boundingVolume": boundingVolume,
				"geometricError" : 2,
				"refine": "replace",
				"content": json["content"],
				"children": json["children"]
			}
		}
		return tilesetJson;
	}
	return subdivide()
}
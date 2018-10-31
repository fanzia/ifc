var Box = require("../Model/Box");

module.exports = subdivideMuqiang;

function subdivideMuqiang (model) {
	
	// 显示slab+plate会合并在一起
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
				// 只显示楼板和幕墙玻璃
				|| (ifcType != "IfcSlab" && ifcType != "IfcPlate")){
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

//  显示楼板，墙体
	function subdivide_2 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) 
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
				json["children"] = childJson;
			}
		}
		return json;
	}

	// 划分一个2×2的分割
	function subdivide_3 (box,level,x,y,h) {
		var json = [];
		var lonDelta = (box.max_lon - box.min_lon)/2;
		var latDelta = (box.max_lat - box.min_lat)/2;
		var heightDelta=(box.max_height -box.min_height)/1;
		var gridX = x*2,gridY = y*2,gridH= h*2;
		for(var i = 0; i < 2;++i){
			for(var j = 0; j < 2;++j){
				for(var k = 0; k <2;++k){
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
					var childX = gridX+i,childY = gridY+j,childH =gridH+k;
					var childJson = subdivide_otree_3(gridBox,level,childX,childY,childH);
					if(childJson){
						json.push(childJson);
					}
				}
			}
		}
		return json;
	}

	function subdivide_otree_3 (box,level,x,y,h) {
		 var count = 0;
		 var models = model.getModels();
		 for(var i = 0; i < models.length;++i){
		 	var objectModel = models[i];
		 	var centerWorld = objectModel.getCenterWorld();
		 	if(!box.isPointIn(centerWorld) )
		 		continue;
		 	count++;
		 	objectModel.setParam(level,x,y,h);
		 }

		 if(count == 0){
		 	return null;
		 }
		 var viewerBox = box.scaledXYZ(1.8,1.8,1.4);
		 var json = {
		 	"boundingVolume":{
		 		"region":box.toArray()
		 	},
		 	"viewerRequestVolume":{
		 		"region":viewerBox.toArray()
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
			"geometricError": 40,
			"root":{
				"transform": transform,
				"boundingVolume": boundingVolume,
				"geometricError" : 20,
				"refine": "replace",
				"content": json["content"],
				"children": json["children"]
			}
		}
		return tilesetJson;
	}
	return subdivide()
}
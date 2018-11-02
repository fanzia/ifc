var Box = require("../Model/Box");
module.exports = subdivideShuinuan;
function subdivideShuinuan (model) {
	
	// // 第0级
	function subdivide_0(box){
		var count = 0;
		// var count0 = model.getCount0();
		var models = model.getModels();
		// for(var i = 0; i < models.length;++i){
		// 	var objectModel = models[i];
		// 	if(objectModel.getIFCType() == "IfcFlowSegment"){
		// 		objectModel.setParam(0,0,0,0);
		// 		count++;
		// 	}
		// }
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
		var viewerBox = box.scaled(2);
		var json = {
			"boundingVolume":{
				"region":box.toArray(),
			},
			"viewerRequestVolume":{
				"region":box.toArray()
			},
			"geometricError": 0.01,
			// "content":{
			// 	"uri" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".cmpt"
			// },
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


	// 第一级
	function subdivide_1 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) || objectModel.getKeys().length != 0
				|| (ifcType != "IfcFlowSegment" && ifcType != "IfcFlowFitting"
				&& ifcType != "IfcFlowController")){
				continue;
			}
			count++;
			objectModel.setParam(level,x,y,h);
		}

		var viewerBox = box.scaledXYZ(1.8,1.8,1.4);
		var childJson = subdivide_2(box,2,x,y,h);
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
			 	"viewerRequestVolume":{
			 		"region":viewerBox.toArray()
			 	},
			 	"geometricError": 0.001,
			 	"content":{
			 		"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 		}
			 	},
			 	"refine": "REPLACE",
			 	"children":[]
			};
			if(childJson){
				json["children"] = childJson;
			}
		}
		return json;
	}

	function subdivide_2 (box,level,x,y,h) {
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
					var childJson = subdivide_otree_2(gridBox,level,childX,childY,childH);
					if(childJson){
						json.push(childJson);
					}
				}
			}
		}
		return json;
	}

	// 四叉树
	function subdivide_otree_2 (box,level,x,y,h) {
		var count = 0;
		var models = model.getModels();
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld))
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

	

	function subdivide () {
		// model.sortByArea();
		var box = model.getBoundingVolume();
		var json = subdivide_0(box);
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
			"geometricError": 2,
			"root":{
				"transform": transform,
				"boundingVolume": boundingVolume,
				"geometricError" : 1,
				"refine": "ADD",
				"content": json["content"],
				"children": json["children"]
			}
		}
		return tilesetJson;
	}

	return subdivide();

}
var Box = require("../Model/Box");
module.exports = subdivideTujian;
function subdivideTujian (model) {
	
	// // 第0级
	function subdivide_0(box){
		var count = 0;
		var count0 = model.getCount0();
		var models = model.getModels();
		for(var i = 0; i < models.length && count < count0;++i){
			var objectModel = models[i];
			if(objectModel.getIFCType() == "IfcSlab"){
				objectModel.setParam(0,0,0,0);
				count++;
			}
			
		}
		// 防止个数不满足第一级的要求
		if(count < count0){
			for(var i = 0; i < models.length && count < count0;++i){
				var objectModel = models[i];
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
				"url" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".b3dm"
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


	// 第一级
	function subdivide_1 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) || objectModel.getKey() != null
				|| (ifcType != "IfcSlab" && ifcType != "IfcWall"
				&& ifcType != "IfcWallStandardCase")){
				continue;
			}
			count++;
			objectModel.setParam(level,x,y,h);

		}

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
			 	"geometricError": 0.25,
			 	"content":{
			 		"url" : level + "/" + h +  "/" + x + "/" + y  + ".b3dm",
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
	function subdivide_2 (box,level,x,y,h) {
		var count = 0;
		var models = model.getModels();
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) || objectModel.getKey()!= null )
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
				"url" : level + "/" + h +  "/" + x + "/" + y  + ".b3dm",
			}
		}
		return json;
	}

	


	function subdivide (model) {
		model.sortByArea();
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
			"geometricError": 4,
			"root":{
				"transform": transform,
				"boundingVolume": boundingVolume,
				"geometricError" : 2,
				"refine": "ADD",
				"content": json["content"],
				"children": json["children"]
			}
		}
		return tilesetJson;
	}

	return subdivide();

}
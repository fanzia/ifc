var Box = require("../Model/Box");
var Point = require("../Model/Point");
var Common = require("../Common");
var lineIntersect = require("line-intersect");



module.exports = subdivideTujian;
function subdivideTujian (model) {
	var ifc = model.getIFC();
	var models = model.getModels();
	var containSlab = model.isContainSlab();
	
	// // 第0级
	function subdivide_0(box){
		var count = 0;
		// var count0 = model.getCount0();
		var models = model.getModels();
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			// if(objectModel.getIFCType() == "IfcWall" || objectModel.getIFCType() == "IfcWallStandardCase" ){
			// 	// || objectModel.getIFCType() == "IfcSlab"){
			// 	if(!objectModel.getWallInternal()){
			// 		objectModel.setParam(0,0,0,0);
			// 	}
			// 	// objectModel.setParam(0,0,0,0);
			// 	// count++;
			// }

			// 是否包含楼板
			if(containSlab){
				if(objectModel.getIFCType() == "IfcWall" || objectModel.getIFCType() == "IfcWallStandardCase"
					|| objectModel.getIFCType() == "IfcSlab"){
					if(!objectModel.getWallInternal()){
						objectModel.setParam(0,0,0,0);
					}
				}
			}else{
				if(objectModel.getIFCType() == "IfcWall" || objectModel.getIFCType() == "IfcWallStandardCase" ){
					if(!objectModel.getWallInternal()){
						objectModel.setParam(0,0,0,0);
					}
				}
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
			"geometricError": 0.15,
			"content":{
				"uri" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".cmpt"
			},
			"refine":"REPLACE",
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
		var modelBox = null;

		var modelCenter = model.getBox().getCenter();
		var delta = model.getBox().getRadius()/3;

		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var objectModelBox = objectModel.getBox();



			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld)){
				continue;
			}

			if(objectModel.getName().indexOf("1HxobCbUrDPwiQsJXE4lGq") !=-1){
				console.log(objectModel);
			}

			if(!modelBox){
				modelBox = objectModelBox;
			}else{
				modelBox = modelBox.merge(objectModelBox);
			}
			var ifcType = objectModel.getIFCType();
			

			if(containSlab){
				if(!box.isPointIn(centerWorld)  
					|| (ifcType != "IfcSlab" && ifcType != "IfcWall"
					&& ifcType != "IfcWallStandardCase")){
					continue;
				}
			}else{
				if(!box.isPointIn(centerWorld)  
					|| (ifcType != "IfcWall"
					&& ifcType != "IfcWallStandardCase")){
					continue;
				}
			}


			// count++;
			// objectModel.setParam(level,x,y,h);
			if(!objectModel.getWallInternal()){
				count++;
				objectModel.setParam(level,x,y,h);
			}



			// var spaceIDs = objectModel.getSpaceIDs();
			// var spaceIDsLength = spaceIDs.length;
			// if(spaceIDsLength == 1){
			// 	// 只属于一个空间，那么是外墙面
			// 	// console.log(`${objectModel.getName()},${spaceIDs}`);
			// 	count++;
			// 	objectModel.setParam(level,x,y,h);
			// }else if(spaceIDsLength >1){
			// 	// count++;
			// 	// objectModel.setParam(level,x,y,h);
		

		}

		var modelBoxWorld = Common.getBoundingVolume(modelBox,model.getCenter());

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
			 		// "region":modelBoxWorld.toArray()
			 	},
			 	"geometricError": 0.10,
			 	"content":{
			 		"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 			// "region":modelBoxWorld.toArray()
			 		}
			 	},
			 	// "refine":"ADD",
			 	"children":[]
			};
			if(childJson){
				json["children"].push(childJson);
			}
		}
		return json;
	}

	function subdivide_2 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		var modelBox = null;

		var modelCenter = model.getBox().getCenter();

		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var objectModelBox = objectModel.getBox();



			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld)){
				continue;
			}


			if(!modelBox){
				modelBox = objectModelBox;
			}else{
				modelBox = modelBox.merge(objectModelBox);
			}
			var ifcType = objectModel.getIFCType();
			
			if(!box.isPointIn(centerWorld)  
				// || objectModel.getKeys().length != 0
				|| (ifcType != "IfcSlab" && ifcType != "IfcWall"
				&& ifcType != "IfcWallStandardCase")){
				continue;
			}


			count++;
			objectModel.setParam(level,x,y,h);


		}

		var modelBoxWorld = Common.getBoundingVolume(modelBox,model.getCenter());

		var childJson = subdivide_3(box,3,x,y,h);
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
			 		// "region":modelBoxWorld.toArray()
			 	},
			 	"geometricError": 0.06,
			 	"content":{
			 		"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 			// "region":modelBoxWorld.toArray()
			 		}
			 	},
			 	// "refine":"ADD",
			 	"children":[]
			};
			if(childJson){
				json["children"] = childJson;
			}
		}
		return json;
	}

	// 第二级
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



	// 区分内外墙
	function checkWalls () {
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			if(objectModel.getIFCType() == "IfcWall" || objectModel.getIFCType() == "IfcWallStandardCase"){
				checkWall(objectModel);
			}
		}
	}

	function checkWall (objectModel) {
		if(!objectModel){
			return;
		}

		var key = model.getModelGridKey(objectModel.getName());
		if(!key){
			return;
		}

		var min_x = key.min_x;
		var min_y = key.min_y;
		var max_x = key.max_x;
		var max_y = key.max_y;

		// for(var i = min_x -3; i < min_x + 4;++i){
		// 	for(var j = min_y -3;j < min_y +4 ;++j){
		// 		var value = model.getGridValue(i,j);
		// 		if(!value){
		// 			return;
		// 		}
		// 	}
		// }

		// for(var i = max_x -3; i < max_x + 4;++i){
		// 	for(var j = max_y -3;j < max_y +4 ;++j){
		// 		var value = model.getGridValue(i,j);
		// 		if(!value){
		// 			return;
		// 		}
		// 	}
		// }

		// var delta = 9;
		var delta = model.getWallDelta();
		for(var i = min_x -delta; i <= max_x + delta;++i){
			for(var j = min_y -delta;j <= max_y +delta ;++j){
				var value = model.getGridValue(i,j);
				if(!value){
					return;
				}
			}
		}


		objectModel.setWallInternal(true);
	}
	


	function subdivide () {
		model.sortByArea();
		//区分内外墙
		checkWalls();
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
			"geometricError": 8,
			"root":{
				"transform": transform,
				"boundingVolume": boundingVolume,
				"geometricError" : 2,
				"refine": "REPLACE",
				"content": json["content"],
				"children": json["children"]
			}
		}
		return tilesetJson;
	}




	return subdivide();

}
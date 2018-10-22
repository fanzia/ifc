var Box = require("../Model/Box");
var Point = require("../Model/Point");
var Common = require("../Common");
var lineIntersect = require("line-intersect");



module.exports = subdivideTujian;
function subdivideTujian (model) {
	var ifc = model.getIFC();
	
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
				"url" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".cmpt"
			},
			"children":[]
		}
		if(count0 == 0){
			json = {
				"boundingVolume":{
					"region":box.toArray(),
				},
				"geometricError": 1,
				"children":[]
			}
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

			if(objectModel.getName().indexOf("19KcUM3mrDf8FcGPGgWy0k") !=-1){
				console.log(objectModel);
			}

			if(!modelBox){
				modelBox = objectModelBox;
			}else{
				modelBox = modelBox.merge(objectModelBox);
			}
			var ifcType = objectModel.getIFCType();
			
			if(!box.isPointIn(centerWorld) || objectModel.getKeys().length != 0
				|| (ifcType != "IfcSlab" && ifcType != "IfcWall"
				&& ifcType != "IfcWallStandardCase")){
				continue;
			}
			var spaceIDs = objectModel.getSpaceIDs();
			var spaceIDsLength = spaceIDs.length;
			if(spaceIDsLength == 1){
				// 只属于一个空间，那么是外墙面
				// console.log(`${objectModel.getName()},${spaceIDs}`);
				count++;
				objectModel.setParam(level,x,y,h);
			}else if(spaceIDsLength >1){
				// count++;
				// objectModel.setParam(level,x,y,h);

				var flag = false;
				// 同时属于多个空间，则判断交点
				console.log(`${objectModel.getName()},${spaceIDs}`);
				var point_min = new Point(objectModelBox.min_lon,objectModelBox.min_lat);
				var point_max = new Point(objectModelBox.max_lon,objectModelBox.max_lat);
				for(var k = 0; k < spaceIDsLength;++k){
					var space_1 = ifc.getIFCSpace(spaceIDs[k]);
					if(!space_1){
						continue;
					}
					var space_1_center = space_1.getCenter();
					for(var j = k+1; j < spaceIDsLength;++j){
						var space_2 = ifc.getIFCSpace(spaceIDs[j]);
						if(!space_2){
							continue;
						}
						var space_2_center = space_2.getCenter();

						var intersectResult = lineIntersect.checkIntersection(point_min.getX(),point_min.getY(),point_max.getX(),point_max.getY(),space_1_center.getX(),space_1_center.getY(),
							space_2_center.getX(),space_2_center.getY());
						if(intersectResult.type != "none"){
							flag = true;
							console.log(intersectResult);
							continue;
						}
					}
				}
				// 相交过
				if(!flag){
					count++;
					objectModel.setParam(level,x,y,h);
				}
			}else{
				
				count++;
				objectModel.setParam(level,x,y,h);
				// 暂时屏蔽
				// 强制计算中心点
				// var center = objectModel.getCenter();
				// var distance = Math.sqrt(Math.pow(center.getX()-modelCenter.getX(),2)+Math.pow(center.getY()-modelCenter.getY(),2));
				// if(distance>delta){
				// 	count++;
				// 	objectModel.setParam(level,x,y,h);
				// }
				// var key = model.getModelGridKey(objectModel.getName());
				// if(key){
				// 	var min_x = key.min_x;
				// 	var min_y = key.min_y;

				// 	var flag = true;

				// 	// 先判断最小的区域
				// 	for(var m = min_x-1;m < min_x+4;++m){
				// 		for(var n = min_y-1;n < min_y+4;++n){
				// 			var value = model.getGridValue(m,n);
				// 			if(!value){
				// 				flag = false;
				// 				break;
				// 			}
				// 		}
				// 	}
				// 	if(!flag){
				// 		count++;
				// 		objectModel.setParam(level,x,y,h);
				// 	}else{
				// 		var max_x = key.max_x;
				// 		var max_y = key.max_y;


				// 		// 最大点的区域
				// 		for(var m = max_x-1;m < max_x+4;++m){
				// 			for(var n = max_y-1;n < max_y+4;++n){
				// 				var value = model.getGridValue(m,n);
				// 				if(!value){
				// 					flag = false;
				// 					break;
				// 				}
				// 			}
				// 		}

				// 		if(!flag){
				// 			count++;
				// 			objectModel.setParam(level,x,y,h);
				// 		}
				// 	}

				// }else{
				// 	count++;
				// 	objectModel.setParam(level,x,y,h);
				// }

			}
			// count++;
			// objectModel.setParam(level,x,y,h);

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
			 	"geometricError": 0.15,
			 	"content":{
			 		"url" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 			// "region":modelBoxWorld.toArray()
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
			if(!box.isPointIn(centerWorld) || objectModel.getKeys().length!= 0 )
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
				"url" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			}
		}
		return json;
	}

	


	function subdivide () {
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
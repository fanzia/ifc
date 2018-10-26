var Box = require("../Model/Box");
module.exports = subdivideCommon;
function subdivideCommon (model) {
	function subdivide_0(box){
		var count = 0;
		var models = model.getModels();

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
		var list = [
			"0vctpRLVD2ngqADF_wL3VJ",
			"0vctpRLVD2ngqADF_wL3VH",
			"0vctpRLVD2ngqADF_wL3VN",
			"0vctpRLVD2ngqADF_wL3VQ"
		];
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) || objectModel.getKeys().length != 0
				// || (ifcType != "IfcBuildingElementProxy" 
					// && ifcType != "IfcFlowFitting"&& ifcType != "IfcFlowController"
					){
				continue;
			}

			// if(list.indexOf(objectModel.getName()) != -1){
			// 	continue;
			// }
			count++;
			objectModel.setParam(level,x,y,h);
		}

		var json = null;
		if(count != 0){
			json = {
			 	"boundingVolume":{
			 		"region":box.toArray()
			 	},
			 	"geometricError": 0,
			 	"content":{
			 		"uri" : level + "/" + h +  "/" + x + "/" + y  + ".cmpt",
			 		"boundingVolume":{
			 			"region":box.toArray()
			 		}
			 	},
			};
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
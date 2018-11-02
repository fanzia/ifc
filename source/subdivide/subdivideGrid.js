var Box = require("../Model/Box");

module.exports = subdivideGrid;


function subdivideGrid (model) {

	function subdivide_0 (box) {
		var countX = model.getCountX();
		var countY = model.getCountY();
		var countZ = model.getCountZ();

		var lonDelta = (box.max_lon - box.min_lon)/countX;
		var latDelta = (box.max_lat - box.min_lat)/countY;
		var heightDelta=(box.max_height -box.min_height)/countZ;
		var viewerBox = box.scaled(3);
		var json = {
			"boundingVolume":{
				"region":box.toArray(),
			},
			"viewerRequestVolume":{
				"region":box.toArray()
			},
			"geometricError": 0.01,
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
		var viewerBox = box.scaledXYZ(1.8,1.8,1.5);
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
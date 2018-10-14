var Box = require("../Model/Box");
var Common = require("../Common");
module.exports = subdivideNeizhuangshi;
function subdivideNeizhuangshi (model) {
	
	// // 第0级
	function subdivide_0(box){

		var countX = model.getCountX();
		var countY = model.getCountY();
		var countZ = model.getCountZ();

		var lonDelta = (box.max_lon - box.min_lon)/countX;
		var latDelta = (box.max_lat - box.min_lat)/countY;
		var heightDelta=(box.max_height -box.min_height)/countZ;

		var jsonChildren = [];
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

					var childJson = subdivide_grid(gridBox,0,i,j,k);
					if(childJson){
						jsonChildren.push(childJson);
					}
				}
			}
		}
		return jsonChildren;
	}


	function subdivide_grid (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		var model_box = null;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) || objectModel.getKey() != null){
				continue;
			}
			count++;
			objectModel.setParam(level,x,y,h);
			if(!model_box){
				model_box = objectModel.getBox();
			}else{
				model_box = model_box.merge(objectModel.getBox());
			}
		}

		if(count == 0){
			return null;
		}

		var boundingVolume = Common.getBoundingVolume(model_box,model.getCenter());

		var scaleBox = boundingVolume.scaled(4);
		var json = {
			"boundingVolume":{
				"region":box.toArray()
			},
			"viewerRequestVolume":{
				"region":scaleBox.toArray()
			},
			"geometricError": 0,
			"content":{
				"url" :level + "/" +  h +  "/" + x + "/" + y  + ".cmpt"
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
			"geometricError": 200,
			"root":{
				"transform": transform,
				"boundingVolume": boundingVolume,
				"geometricError" : 200,
				"refine": "ADD",
				"children": json
			}
		}
		return tilesetJson;
	}

	return subdivide();

}
var Box = require("../Model/Box");

module.exports = subdivideMuqiang;

function subdivideMuqiang (model) {
	
	// 只显示一个方盒子，目前只随便前面的要素
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


	function subdivide_1 (box,level,x,y,h) {
		var models = model.getModels();
		var count = 0;
		for(var i = 0; i < models.length;++i){
			var objectModel = models[i];
			var ifcType = objectModel.getIFCType();
			var centerWorld = objectModel.getCenterWorld();
			if(!box.isPointIn(centerWorld) || objectModel.getKey() != null
				|| (ifcType != "IfcSlab" && ifcType != "IfcWall"
				&& ifcType != "IfcWallStandardCase" && ifcType != "IfcPlate")){
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

	function subdivide_test (box) {
		// 管道通风
		// var list = ['0nkrcUA719GuSoF3vmShdi',
		// 	'2z_27ANGD32gxXP6ZOL$H_',
		// 	'0nkrcUA719GuSoF3vmShdM',
		// 	'0nkrcUA719GuSoF3vmShbK',
		// 	'0nkrcUA719GuSoF3vmShyc',
		// 	'0nkrcUA719GuSoF3vmShyi',
		// 	'0nkrcUA719GuSoF3vmShcT',
		// 	'0nkrcUA719GuSoF3vmShwS',
		// 	'0nkrcUA719GuSoF3vmShyr',
		// 	'2z_27ANGD32gxXP6ZOL$kV',
		// 	'0nkrcUA719GuSoF3vmShy6'];
		var list = ['0jyAB6_NX8TAfMCpfCO4ot',
			'0jyAB6_NX8TAfMCpfCO4or',
			'0jyAB6_NX8TAfMCpfCO4oe',
			'0jyAB6_NX8TAfMCpfCO4os',
			'0jyAB6_NX8TAfMCpfCO4oc',
			'0jyAB6_NX8TAfMCpfCO4oq',
			'0jyAB6_NX8TAfMCpfCO4od',
			'0jyAB6_NX8TAfMCpfCO4of',
			'0jyAB6_NX8TAfMCpfCO4op',
			'0jyAB6_NX8TAfMCpfCO4oP'];
		var list = ['0jyAB6_NX8TAfMCpfCO4fM',
			'0jyAB6_NX8TAfMCpfCO4f8',
			'0jyAB6_NX8TAfMCpfCO4gP',
			'0jyAB6_NX8TAfMCpfCO4gR',
			'0jyAB6_NX8TAfMCpfCO4gT',
			'0jyAB6_NX8TAfMCpfCO4gN',
			'0jyAB6_NX8TAfMCpfCO4g9',
			'0jyAB6_NX8TAfMCpfCO4gB',
			'0jyAB6_NX8TAfMCpfCO4gD',
			'0jyAB6_NX8TAfMCpfCO4gF',
			'0jyAB6_NX8TAfMCpfCO4g1',
			'0jyAB6_NX8TAfMCpfCO4g3',
			'0jyAB6_NX8TAfMCpfCO4g5',
			'0jyAB6_NX8TAfMCpfCO4hH'];
		var list = ['39WCYrVm57Kx$tzsSyo_wj',
'39WCYrVm57Kx$tzsSyo_xr',
'39WCYrVm57Kx$tzsSyo_YN',
'3nVd_QAJX0MfQFHa0PLkJL',
'3nVd_QAJX0MfQFHa0PLkJx',
'36g7iOEAT0BA92NX08Zdut'];
		// var list = ['2BIZhdvlX6UO_$0XOmb8Cu',
		// 	'2ooRya9v98lPGXZoNy8tdT',
		// 	'2ooRya9v98lPGXZoNy8tXN',
		// 	'2ooRya9v98lPGXZoNy8tX7',
		// 	'2ooRya9v98lPGXZoNy8tWr',
		// 	'2ooRya9v98lPGXZoNy8tWZ',
		// 	'2ooRya9v98lPGXZoNy8tWH',
		// 	'2ooRya9v98lPGXZoNy8tWV',
		// 	'2ooRya9v98lPGXZoNy8tWD',
		// 	'2ooRya9v98lPGXZoNy8tZz',
		// 	'2ooRya9v98lPGXZoNy8tZj',
		// 	'2ooRya9v98lPGXZoNy8tZR',
		// 	'2ooRya9v98lPGXZoNy8tZ9',
		// 	'2ooRya9v98lPGXZoNy8tYt',
		// 	'2ooRya9v98lPGXZoNy8tYd',
		// 	'2ooRya9v98lPGXZoNy8tYL',
		// 	'2ooRya9v98lPGXZoNy8tY3',
		// 	'2ooRya9v98lPGXZoNy8tOA',
		// 	'2ooRya9v98lPGXZoNy8tHf',
		// 	'2ooRya9v98lPGXZoNy8tHP',
		// 	'2ooRya9v98lPGXZoNy8tH9',
		// 	'2ooRya9v98lPGXZoNy8tIO',
		// 	'2ooRya9v98lPGXZoNy8tEq',
		// 	'2ooRya9v98lPGXZoNy8tEd',
		// 	'2ooRya9v98lPGXZoNy8t8H',
		// 	'2ooRya9v98lPGXZoNy8t1n',
		// 	'2ooRya9v98lPGXZoNy8t1X',
		// 	'2ooRya9v98lPGXZoNy8t3S',
		// 	'2ooRya9v98lPGXZoNy8syM',
		// 	'2ooRya9v98lPGXZoNy8svS',
		// 	'2ooRya9v98lPGXZoNy8spb',
		// 	'2ooRya9v98lPGXZoNy8sj7',
		// 	'2ooRya9v98lPGXZoNy8sNl',
		// 	'0uIUai9vn0b8tu8J14OHfS',
		// 	'0uIUai9vn0b8tu8J14OHh$'];
		var list = ['2BIZhdvlX6UO_$0XOmb8Cu'];
		var list = ['0z8gvz_eT5Xe$VpKo_xGo7',
			'0z8gvz_eT5Xe$VpKo_xGph',
			'0z8gvz_eT5Xe$VpKo_xGpW',
			'0z8gvz_eT5Xe$VpKo_xGqA',
			'0z8gvz_eT5Xe$VpKo_xGrP',
			'0z8gvz_eT5Xe$VpKo_xGrE',
			'0z8gvz_eT5Xe$VpKo_xG8u',
			'0z8gvz_eT5Xe$VpKo_xG8k',
			'0z8gvz_eT5Xe$VpKo_xG8b',
			'0z8gvz_eT5Xe$VpKo_xG9T',
			'0z8gvz_eT5Xe$VpKo_xGAF',
			'0z8gvz_eT5Xe$VpKo_xGBN'];
		var list = ['2BIZhdvlX6UO_$0XOmb8Fp',
			'2ooRya9v98lPGXZoNy8tdS',
			'2ooRya9v98lPGXZoNy8tXM',
			'2ooRya9v98lPGXZoNy8tX6',
			'2ooRya9v98lPGXZoNy8tWq',
			'2ooRya9v98lPGXZoNy8tWY',
			'2ooRya9v98lPGXZoNy8tWG',
			'2ooRya9v98lPGXZoNy8tWU',
			'2ooRya9v98lPGXZoNy8tWC',
			'2ooRya9v98lPGXZoNy8tZy',
			'2ooRya9v98lPGXZoNy8tZi',
			'2ooRya9v98lPGXZoNy8tZQ',
			'2ooRya9v98lPGXZoNy8tZ8',
			'2ooRya9v98lPGXZoNy8tYs',
			'2ooRya9v98lPGXZoNy8tYc',
			'2ooRya9v98lPGXZoNy8tYK',
			'2ooRya9v98lPGXZoNy8tY2',
			'2ooRya9v98lPGXZoNy8tOD',
			'2ooRya9v98lPGXZoNy8tHe',
			'2ooRya9v98lPGXZoNy8tHO',
			'2ooRya9v98lPGXZoNy8tH8',
			'2ooRya9v98lPGXZoNy8tIR',
			'2ooRya9v98lPGXZoNy8tEt',
			'2ooRya9v98lPGXZoNy8tEc',
			'2ooRya9v98lPGXZoNy8t8G',
			'2ooRya9v98lPGXZoNy8t1m',
			'2ooRya9v98lPGXZoNy8t1W',
			'2ooRya9v98lPGXZoNy8t3V',
			'2ooRya9v98lPGXZoNy8syP',
			'2ooRya9v98lPGXZoNy8svV',
			'2ooRya9v98lPGXZoNy8spa',
			'2ooRya9v98lPGXZoNy8sj6',
			'2ooRya9v98lPGXZoNy8sNk'];
		// var list = ['2BIZhdvlX6UO_$0XOmb8Fp'];
		// 696
		var list = ['0nkrcUA719GuSoF3vmShtK',
					'0nkrcUA719GuSoF3vmShmU',
					'0nkrcUA719GuSoF3vmShmK',
					'0nkrcUA719GuSoF3vmShof',
					'0nkrcUA719GuSoF3vmShoR',
					'0nkrcUA719GuSoF3vmShpg',
					'0nkrcUA719GuSoF3vmSh$b',
					'0nkrcUA719GuSoF3vmSh$z',
					'0nkrcUA719GuSoF3vmSh$B',
					'0nkrcUA719GuSoF3vmShuh',
					'0nkrcUA719GuSoF3vmShu_',
					'0nkrcUA719GuSoF3vmShwW',
					'0nkrcUA719GuSoF3vmShwn',
					'0nkrcUA719GuSoF3vmShwK',
					'0nkrcUA719GuSoF3vmShxe',
					'0nkrcUA719GuSoF3vmShx2',
					'0nkrcUA719GuSoF3vmShaW',
					'0nkrcUA719GuSoF3vmShax',
					'0nkrcUA719GuSoF3vmShaF',
					'0nkrcUA719GuSoF3vmSha9',
					'0nkrcUA719GuSoF3vmShaV',
					'0nkrcUA719GuSoF3vmShaM',
					'0nkrcUA719GuSoF3vmShb7',
					'0nkrcUA719GuSoF3vmShWA',
					'0nkrcUA719GuSoF3vmShW2',
					'0nkrcUA719GuSoF3vmShWR',
					'0nkrcUA719GuSoF3vmShXg',
					'0nkrcUA719GuSoF3vmShXY',
					'0nkrcUA719GuSoF3vmShYe',
					'0nkrcUA719GuSoF3vmShYY',
					'0nkrcUA719GuSoF3vmShYx',
					'0nkrcUA719GuSoF3vmShiU',
					'0nkrcUA719GuSoF3vmShjt',
					'0nkrcUA719GuSoF3vmSgNr',
					'0nkrcUA719GuSoF3vmSgNo',
					'2z_27ANGD32gxXP6ZOLmKg',
					'2z_27ANGD32gxXP6ZOLmKr',
					'2z_27ANGD32gxXP6ZOL$gE',
					'2z_27ANGD32gxXP6ZOL$h$',
					'2z_27ANGD32gxXP6ZOL$jP',
					'2z_27ANGD32gxXP6ZOL$JX',
					'2z_27ANGD32gxXP6ZOL$Ld',
					'2z_27ANGD32gxXP6ZOL$Nd',
					'2ooRya9v98lPGXZoNy8sgP',
					'2ooRya9v98lPGXZoNy8sgO',
					'2ooRya9v98lPGXZoNy8sTK',
					'2ooRya9v98lPGXZoNy8sTN',
					'2ooRya9v98lPGXZoNy8sT8',
					'2ooRya9v98lPGXZoNy8sTB',
					'2ooRya9v98lPGXZoNy8sOe',
					'2ooRya9v98lPGXZoNy8sOh',
					'2ooRya9v98lPGXZoNy8sQ8',
					'2ooRya9v98lPGXZoNy8sQB'];
		var list = ['0nkrcUA719GuSoF3vmShmU'];
		// 1802
		var list = ['0nkrcUA719GuSoF3vmShyi',
			'0nkrcUA719GuSoF3vmShyc',
			'0nkrcUA719GuSoF3vmShyr',
			'0nkrcUA719GuSoF3vmShy6',
			'0nkrcUA719GuSoF3vmShwS',
			'0nkrcUA719GuSoF3vmShbK',
			'0nkrcUA719GuSoF3vmShcT',
			'0nkrcUA719GuSoF3vmShdi',
			'0nkrcUA719GuSoF3vmShdM',
			'2z_27ANGD32gxXP6ZOL$kV',
			'2z_27ANGD32gxXP6ZOL$H_'];
		var list = ['0nkrcUA719GuSoF3vmShyi'];
		// #6258
		var list = ['0nkrcUA719GuSoF3vmSha0',
			'0nkrcUA719GuSoF3vmShaO',
			'0nkrcUA719GuSoF3vmShbl',
			'0nkrcUA719GuSoF3vmShcD',
			'0nkrcUA719GuSoF3vmShd8'];
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
				"url" : 0+ "/" +  0 +  "/" + 0 + "/" + 0  + ".b3dm"
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
				"refine": "ADD",
				"content": json["content"],
				"children": json["children"]
			}
		}
		return tilesetJson;
	}
	return subdivide()
}
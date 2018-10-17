var Box = require("./Model/Box");

class Common{


	constructor(){

	}


	static metersToLongitude(meters, latitude) {
	    return meters * 0.000000156785 / Math.cos(latitude);
	}

	static metersToLatitude(meters) {
	    return meters * 0.000000157891;
	}

	static transformPoint(point,center) {
		var tileWidth = point.lon;
		var tileHeight = point.lat;
		var longitudeExtent = Common.metersToLongitude(tileWidth, center.lat);
		var latitudeExtent = Common.metersToLatitude(tileHeight);
		var point_x = center.lon + longitudeExtent;
		var point_y = center.lat + latitudeExtent;
		return{
			lon : point_x,
			lat : point_y,
			height : point.height
		}
	}

	static getCenter(positions){

	}

	static getExtent(positions){
		var min_lon = null, max_lon = null, min_lat = null, max_lat = null, min_height = null,max_height = null;
		for(var i = 0; i < positions.length;++i){
			var point = positions[i];
			var lon = point.lon;
			var lat = point.lat;
			var height = point.height;

			if(min_lon == null) min_lon = lon;
			if(max_lon == null) max_lon = lon;
			if(min_lat == null) min_lat = lat;
			if(max_lat == null) max_lat = lat;
			if(min_height == null) min_height = height;
			if(max_height == null) max_height = height;
			min_lon = min_lon > lon ? lon : min_lon;
			max_lon = max_lon < lon ? lon : max_lon;
			min_lat = min_lat > lat ? lat : min_lat;
			max_lat = max_lat < lat ? lat : max_lat;
			min_height = min_height > height ? height : min_height;
			max_height = max_height < height ? height : max_height;
		}
		return new Box({
			min_lon : min_lon,
			max_lon : max_lon,
			min_lat : min_lat,
			max_lat : max_lat,
			min_height : min_height,
			max_height : max_height
		});
	}

	static getBoundingVolume(box,center){
		if(!box){
			return null;
		}


		var tileWidth = box.max_lon - box.min_lon;
		var tileHeight = box.max_lat - box.min_lat;
		tileWidth = Math.ceil(tileWidth);
		tileHeight = Math.ceil(tileHeight);
		var offsetX = 0;
		var offsetY = 0;
		var offsetX = tileWidth / 2 + box.min_lon;
		var offsetY = tileHeight / 2 + box.min_lat;
		offsetY = -offsetY;

		var longitudeExtent = Common.metersToLongitude(tileWidth, center.lat);
		var latitudeExtent = Common.metersToLatitude(tileHeight);

		var west = center.lon - longitudeExtent / 2 + offsetX / tileWidth * longitudeExtent;
		var south = center.lat - latitudeExtent / 2 - offsetY / tileHeight * latitudeExtent;
		var east = center.lon + longitudeExtent / 2 + offsetX / tileWidth * longitudeExtent;
		var north = center.lat + latitudeExtent / 2 - offsetY / tileHeight * latitudeExtent;
		return new Box({
			min_lon : west,
			min_lat : south,
			max_lon : east,
			max_lat : north,
			min_height : box.min_height,
			max_height : box.max_height
		});
	}

	// 判断是否相交
	static  isIntersect (box1,box2) {
		if(box1)
		var x01 = box1.min_lon,x02 = box1.max_lon,y01 = box1.min_lat,y02=box1.max_lat;
		var x11 = box2.min_lon,x12 = box2.max_lon,y11 = box2.min_lat,y12=box2.max_lat;
		var zx = Math.abs(x01+x02 - x11- x12);
		var x = Math.abs(x01 -x02) + Math.abs(x11-x12);
		var zy = Math.abs(y01+y02 - y11-y12);
		var y = Math.abs(y01 - y02) + Math.abs(y11-y12);
		if(zx <= x && zy <= y){
			return true
		}else{
			return false;
		}
	}
}

// 顶点 v float float float
global.vertexPattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/; 

// 法线 vn float float float  
global.normalPattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;   

// 贴图坐标  vt float float
global.uvPattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
// 三角面
// for any face format "f v", "f v/v", "f v//v", "f v/v/v"
global.facePattern = /(-?\d+)\/?(-?\d*)\/?(-?\d*)/g;

module.exports = Common;

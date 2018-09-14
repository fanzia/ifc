class Point{
	constructor(lon,lat,height){
		this.lon = lon;
		this.lat = lat;
		this.height = height;
	}

	getX(){
		return this.lon;
	}

	getY(){
		return this.lat;
	}

	getZ(){
		return this.height;
	}

}

module.exports = Point;
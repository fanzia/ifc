
var Common = require("../Common");
// var Common = require("./Common");

class ObjectModel{
	// lon 为模型中心点的弧度值
	// constructor(name,positions,faces,box,lon,lat){
	// 	this.name = name;
	// 	this.positions = positions;
	// 	this.faces = faces;
	// 	this.box = box;

	// 	this.lon = lon;
	// 	this.lat = lat;

	// 	this.center = this.box.getCenter();
	// 	this.center_world = Common.transformPoint(this.center,this.lon,this.lat);
	// }

	constructor(name,modelCenter){
		this.name = name;
		// 整个模型的中心点，地理坐标
		this.modelCenter = modelCenter;
		this.positions = [];
		this.faceCount = 0;
		this.positionIndex = -1;

		this.normals = [];
		this.normalIndex = -1;

		this.uvs = [];
		this.uvIndex = -1;

		this.smoothGroups = [];
		this.ifcType = "none";

		this.x = null;
		this.y = null;
		this.h = null;
		this.level = null;
		this.key = null;

		this.refineType = null;
		this.geomType = null;
		this.refineInfo = null;
	}

	getName(){
		return this.name;
	}

	setPositions(positions,index){
		this.positions = positions;
		this.positionIndex = index;
		this.calculate();
	}

	getPositions(){
		return this.positions;
	}

	getPositionIndex(){
		return this.positionIndex;
	}

	getPositionCount(){
		return this.positions.length;
	}

	setNormals(normals,index){
		this.normals = normals;
		this.normalIndex = index;
	}

	getNormals(){
		return this.normals;
	}

	getNormalIndex(){
		return this.normalIndex;
	}


	getNormalCount(){
		return this.normals.length;
	}

	setUvs(uvs,index){
		this.uvs = uvs;
		this.uvIndex = index;
	}

	getUvs(){
		return this.uvs;
	}

	getUvIndex(){
		return this.uvIndex;
	}

	getUvCount(){
		return this.uvs.length;
	}

	addSmoothGroup(smoothGroup){
		this.smoothGroups.push(smoothGroup);
	}

	getSmoothGroups(){
		return this.smoothGroups;
	}

	setFaceCount(count){
		this.faceCount = count;
	}

	getCenter(){
		return this.center;
	}

	getCenterWorld(){
		return this.center_world;
	}

	setIFCType(type){
		this.ifcType = type;
	}

	getIFCType(){
		return this.ifcType;
	}


	getArea(){
		return this.box.getArea();
	}

	getHeight(){
		return this.box.getHeight();
	}
	
	// 长宽高中最高的
	getLength(){
		return this.box.getLength();
	}


	calculate(){
		this.box = Common.getExtent(this.positions);
		this.center = this.box.getCenter();
		// 地球上的坐标
		this.center_world = Common.transformPoint(this.center,this.modelCenter);
	}

	getBox(){
		return this.box;
	}

	setParam(level,x,y,h){
		this.level = level;
		this.x = x;
		this.y = y;
		this.h = h;

		// this.key = `${level}_${x}_${y}_${h}`;
		this.key = `${level}_${h}_${x}_${y}`;
	}

	getKey(){
		return this.key;
	}

	// 实例化类型
	setRefineType(refineType,geomType,info) {
		this.refineType = refineType;
		this.geomType = geomType;
		this.refineInfo = info;
	}
	

	getRefineType(){
		return this.refineType;
	}

	getGeomType(){
		return this.geomType;
	}

	getRefineInfo(){
		return this.refineInfo;
	}

}

module.exports = ObjectModel;
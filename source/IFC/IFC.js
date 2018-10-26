var HashMap = require('hashmap');

class IFC{
	constructor(ifcPath,uuid){
		this.ifcPath = ifcPath;
		this.uuid = uuid;
		this.hashmap = new HashMap();

		this.typeHashMap = new HashMap();

		this.spaceHashMap = new HashMap();

		this.spaceWallsHashMap = new HashMap();


		this.aggregatesHashMap = new HashMap();

		this.ifcSpacesHashMap = new HashMap(); 

		// 用于自行解析的mapped类型
		this.mappedHashMap = new HashMap();

		this.siteAngle = {
			x : 0,
			y : 0,
			z : 0
		};
	}


	getIFCPath(){
		return this.ifcPath;
	}


	getHashMap(){
		return this.hashmap;
	}

	getTypeHashMap(){
		return this.typeHashMap;
	}

	// #737215= IFCRELSPACEBOUNDARY('22f_W9ewb4g83ZXZQz0QyG',#41,'1stLevel',$,#343,#16851,#444,.PHYSICAL.,.INTERNAL.);
	// 记录 #343 [#16851,...]
	getSpaceHashMap(){
		return this.spaceHashMap;
	}
	// 记录 #343 [#uuid,#uuid]
	getSpaceWallsHashMap(){
		return this.spaceWallsHashMap;
	}


	getAggregatesHaspMap(){
		return this.aggregatesHashMap;
	}

	getHashMapStringValue(key){
		var value = this.hashmap.get(key);
		if(!value){
			return null;
		}

		return value.slice(value.indexOf("(")+1,value.lastIndexOf(")"));
	}


	addIFCSpace(spaceID,ifcSpace){
		if(!this.ifcSpacesHashMap.get(spaceID)){
			this.ifcSpacesHashMap.set(spaceID,ifcSpace);
		}
	}

	getIFCSpace(spaceID){
		return this.ifcSpacesHashMap.get(spaceID);
	}

	// 整个场地的旋转角度
	setSiteAngle(angle){
		this.siteAngle = angle;
	}

	getSiteAngle(angle){
		return this.siteAngle;
	}


	getMappedHashMap(){
		return this.mappedHashMap;
	}
}

module.exports = IFC;
var HashMap = require('hashmap');

class IFC{
	constructor(ifcPath,uuid){
		this.ifcPath = ifcPath;
		this.uuid = uuid;
		this.hashmap = new HashMap();

		this.typeHashMap = new HashMap();
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


	getHashMapStringValue(key){
		var value = this.hashmap.get(key);
		if(!value){
			return null;
		}

		return value.slice(value.indexOf("(")+1,value.lastIndexOf(")"));
	}
}

module.exports = IFC;
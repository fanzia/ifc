var HashMap = require('hashmap');

class SmoothGroup{

	constructor(){
		// this.materialName = null;
		// this.faces = [];
		this.number = null;
		this.materialFaces = new HashMap();
	}

	setNumber(number){
		this.number = number;
	}
	getNumber(){
		return this.number;
	}

	// setMaterial(name){
	// 	this.materialName = name;
	// }

	// addFace(face){
	// 	this.faces.push(face);
	// }

	// getMaterial(){
	// 	return this.materialName;
	// }

	// getFaces(){
	// 	return this.faces;
	// }


	addMaterial(material){
		if(!material){
			return;
		}
		var faces = this.materialFaces.get(material);
		if(faces){
			return;
		}

		var list = [];
		this.materialFaces.set(material,[]);
	}

	addFace(material,face){
		if(this.materialFaces.has(material)){
			var faces = this.materialFaces.get(material);
			faces.push(face);
		// }else{
		// 	this.addMaterial(material);
		// 	this.addFace(material,face);
		}
	}

	getMaterialFace(){
		return this.materialFaces;
	}
}

module.exports = SmoothGroup;
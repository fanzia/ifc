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

	// 获取坐标点的序列
	getPositionsIndexs(){
		var list = [];
		this.materialFaces.forEach( function(faces, key) {
			for(var i = 0; i < faces.length;++i){
				var positions = faces[i].getPositions();
				for(var j = 0; j <positions.length;++j){
					if(list.indexOf(positions[j])  == -1){
						list.push(positions[j]);
					}
				}
			}
		});
		return list;
	}


	getNormalsIndexes(){
		var list = [];
		this.materialFaces.forEach( function(faces, key) {
			for(var i = 0; i < faces.length;++i){
				var normals = faces[i].getNormals();
				for(var j = 0; j <normals.length;++j){
					if(list.indexOf(normals[j])  == -1){
						list.push(normals[j]);
					}
				}
			}
		});
		return list;
	}


	getUvsIndexes(){
		var list = [];
		this.materialFaces.forEach( function(faces, key) {
			for(var i = 0; i < faces.length;++i){
				var uvs = faces[i].getUvs();
				for(var j = 0; j <uvs.length;++j){
					if(list.indexOf(uvs[j])  == -1){
						list.push(uvs[j]);
					}
				}
			}
		});
		return list;
	}

}

module.exports = SmoothGroup;

class Face{
	constructor(positions,uvs,normals){
		this.positions = [];
		this.uvs = [];
		this.normals = [];
		for(var i = 0;i < positions.length;++i){
			if(positions[i]){
				this.positions.push(positions[i]);
			}
		}
		for(var i = 0;i < uvs.length;++i){
			if(uvs[i]){
				this.uvs.push(uvs[i]);
			}
		}

		for(var i = 0;i < normals.length;++i){
			if(normals[i]){
				this.normals.push(normals[i]);
			}
		}

	}

	getPositions(){
		return this.positions;
	}

	getUvs(){
		return this.uvs;
	}

	getNormals(){
		return this.normals;
	}
}

module.exports = Face;
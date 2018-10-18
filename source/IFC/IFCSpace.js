
class IFCSpace{
	constructor(spaceID,spaceCenter,wallList){
		this.spaceID = spaceID;
		this.spaceCenter = spaceCenter;
		this.wallList = wallList;
	}

	getCenter(){
		return this.spaceCenter;
	}
}

module.exports = IFCSpace;
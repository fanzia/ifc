var path = require("path");
var fsExtra = require("fs-extra");

module.exports = getInfo;
function getInfo (uuid) {
	
	var json = {};
	try {
		// var outputFolder = path.join(process.cwd(),"public/data/output");
		var modelJsonPath = path.join(process.cwd(),"public/data/output",uuid,"model.json");
		if(!fsExtra.pathExistsSync(modelJsonPath)){
			json = {
				"error" : "无法获取"
			};
		}

		json = fsExtra.readJsonSync(modelJsonPath);

	} catch(e) {
		json = {
			"error" : "无法获取"
		};
	}

	return json;
}
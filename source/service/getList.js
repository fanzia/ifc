var path = require("path");
var fs = require("fs");
var fsExtra = require("fs-extra");
module.exports = getList;

function getList () {

	var json = {
		list : []
	};

	var list = [];


	try {
		var uploadFolder = path.join(process.cwd(),"public/data/upload");
		var outputFolder = path.join(process.cwd(),"public/data/output");
		var files = fs.readdirSync(uploadFolder);
		files.forEach( function(file, index) {
			var filePath = path.join(uploadFolder,file);
			var stats = fs.statSync(filePath);
			if(stats.isFile()){
				return;
			}
			// var time = stats.birthtime;
			var childJson = {
				uuid : file,
				time : new Date(stats.birthtimeMs)
			};

			var files = fs.readdirSync(filePath);
			var ifcName = null;
			files.forEach( function(inputName, index) {
				var inputFile = path.join(filePath,inputName);
				if(inputName.substring(inputName.lastIndexOf(".")+1).toLowerCase() == "ifc"){
					ifcName = inputName;
				}
			});

			if(!ifcName){
				return;
			}
			childJson["ifc"] = ifcName;

			var outputPath = path.join(process.cwd(),"public/data/output",file,"tiles");
			if(fsExtra.pathExistsSync(outputPath)){
				childJson["output"] = true;
			}else{
				childJson["output"] = false;
			}
			list.push(childJson);
		});
	} catch(e) {
		
		return {
			"error" : e
		};
	}

	list.sort(sort_function);
	function sort_function (a,b) {
		return b.time - a.time;
	};

	return {
		list : list
	};
}
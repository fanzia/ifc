var fs = require("fs");
var readLines = require('./readLines');
var path = require('path');

modify();

// 按照ifcconvert转换后匹配过的obj来更正3dmax导出的数据
var output = "";
var objNameList = [];
var max_output = "";
function modify () {

	// 先将3dmax导出的数据进行utf-8编码的转换
	var objPath_max = "output/3dmax.obj" ;
	var objPath_max_utf8 = "output/3dmax-utf8.obj";
	
	var input = "ifc";
	var objPath = "model/" + input + ".obj";



	// readLines(objPath_max,parseLine_max)
	// 	.then(function () {
	// 		fs.writeFile(objPath_max_utf8,max_output,"utf-8",function (err) {
	// 			if(err){
	// 				console.log('转换3dmax文件失败');
	// 				return;
	// 			}

	// 			// readLines()
	// 			readLines(objPath, parseLine_getList)
	// 				.then(function () {
	// 					console.log(objNameList.length);
	// 						readLines(objPath_max_utf8,parseLine_modifyName)
	// 								.then(function(){
	// 										var fileName = "output/ifc.obj";
	// 										fs.writeFile(fileName,output,"utf-8",function (err) {
	// 											if(err){
	// 												console.log(err);
	// 												return;
	// 											}
	// 											fs.copyFileSync("output/3dmax.mtl","output/" + "ifc" +".mtl");
	// 											console.log('转换完成');
	// 										})
	// 								});
	// 				})
	// 		})
	// 	});

	var input = "ifc";
	var objPath = "model/" + input + ".obj";
	readLines(objPath, parseLine_getList)
		.then(function () {
			console.log(objNameList.length);
				var objPath_max = "output/3dmax.obj" ;
				readLines(objPath_max,parseLine_modifyName)
						.then(function(){
								var fileName = "output/ifc.obj";
								fs.writeFile(fileName,output,"utf-8",function (err) {
									if(err){
										console.log(err);
										return;
									}
									fs.copyFileSync("output/3dmax.mtl","output/" + "ifc" +".mtl");
									console.log('转换完成');
								})
						});
		})
}


function parseLine_getList (line) {
	if (/^g\s/i.test(line)){
		var name = line.slice(line.lastIndexOf(" ")+1,line.length);
		objNameList.push(name);
	}
}

var index = -1;
function parseLine_modifyName (line) {
		if(line.indexOf("# object") != -1){
				index++;
				output += "# object " + convertName(index) + "\n";
		}else if(/^g\s/i.test(line)){
				output += "g " + convertName(index) + "\n";

		}else if(/^o\s/i.test(line)){
				output += "o " + convertName(index) + "\n";
		}else if (/^mtllib/i.test(line)){
			output += "mtllib ifc.mtl"
		}else{
				output += line + '\n';
		}
}	

function convertName (index) {
	var name = objNameList[index];
	// var result = name.replace(/\$/g,'#');
	return name;
}


function parseLine_max(line){
	max_output += line +'\n';
}
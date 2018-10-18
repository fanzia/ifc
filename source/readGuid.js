var fs = require("fs");
var readLines = require('./readLines');
var path = require('path');

var output = "";
var global_index = 0;
convert();
function convert(){

	var input = 'ifc';
	var txt = "model/" + input + ".obj";
	
	readLines(txt, parseLine)
		.then(function () {
			var fileName = "output/" + input + "_id.obj";
			fs.writeFile(fileName,output,"utf-8",function (err) {
				if(err){
					console.log(err);
					return;
				}

				fs.copyFileSync("model/" + input + ".mtl","output/" + input +".mtl");
				console.log('转换完成');
			})
		});
}


function parseLine (line) {
	if (/^g\s/i.test(line)){
		output += "g " + global_index + "\n";
		global_index++;
	}else{
		output += line + "\n";
	}
}
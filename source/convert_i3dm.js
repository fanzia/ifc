
var fs = require("fs");
var fsPromises = fs.promises;
var path = require("path");
var fsExtra = require('fs-extra');
var obj2Tileset = require('./obj23dtiles/lib/obj2Tileset');
var makeCompositeTile = require("./3dtiles/makeCompositeTile");
// convert_i3dm();
makeCmpt();
function makeCmpt () {
	var b3dmPath = "E:\\Cesium\\ifc\\public\\data\\output\\a\\cmpt\\0.b3dm";
	var i3dmPath = "E:\\Cesium\\ifc\\public\\data\\output\\a\\cmpt\\0.i3dm";
	var b3dm = fsExtra.readFileSync(b3dmPath);
	var i3dm = fsExtra.readFileSync(i3dmPath);
	// var cmpt = makeCompositeTile([b3dm, i3dm]);
	var cmpt = makeCompositeTile([b3dm]);

	console.log(cmpt);
	var cmptPath =  "E:\\Cesium\\ifc\\public\\data\\output\\a\\cmpt\\0.cmpt";
	fsExtra.outputFile(cmptPath, cmpt);


}
function convert_i3dm () {

	var outputFolderPath = "E:\\Cesium\\ifc\\public\\data\\output\\a";
	var options = {
		tilesetOptions : path.join(outputFolderPath,"option.json"),
		tileset : true,
		i3dm : true,
		customFeatureTable : path.join(outputFolderPath,"featureTable.json"),
		customBatchTable : path.join(outputFolderPath,"0_0_0_0_batchTable.json")

	};
	var objPath = "E:\\Cesium\\ifc\\public\\data\\output\\a\\0_0_0_0.obj";
	var outputPath = path.join(outputFolderPath,"0.i3dm");

	obj2tileset_o(objPath,outputPath,options);
}

function obj2tileset_o (objPath, outputPath, options) {
	console.time('Total');
	if(typeof options.tilesetOptions === 'string') {
	    options.tilesetOptions = fsExtra.readJsonSync(options.tilesetOptions);
	}
	if (typeof options.customFeatureTable === 'string') {
	    options.customFeatureTable = fsExtra.readJsonSync(options.customFeatureTable);
	}

	if(typeof options.customBatchTable === 'string') {
	    options.customBatchTable = fsExtra.readJsonSync(options.customBatchTable);
	}


	options.binary = true;
    options.batchId = true;
	obj2Tileset(objPath, outputPath, options)
	    .then(function(result) {
	        var i3dm = result.i3dm;
	        var batchTableJson = result.batchTableJson;
	        var tileset = result.tilesetJson;
	        var tilePath = result.tilePath;
	        var tilesetPath = result.tilesetPath;

	        if(options.outputBatchTable) {
	            var batchTableJsonPath = tilePath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
	            fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
	            fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
	        }

	        var tasks = [];
	        fsExtra.ensureDirSync(path.dirname(tilePath));
	        tasks.push(fsExtra.outputFile(tilePath, i3dm));
	        tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
	        return Promise.all(tasks);
	    })
	    .then(function() {
	        console.timeEnd('Total');
	    })
	    .catch(function(error) {
	        console.log(error.message || error);
	        process.exit(1);
	    });
}

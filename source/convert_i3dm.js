
var fs = require("fs");
var fsPromises = fs.promises;
var path = require("path");
var fsExtra = require('fs-extra');
var obj2Tileset = require('./obj23dtiles/lib/obj2Tileset');
var makeCompositeTile = require("./3dtiles/makeCompositeTile");
var obj23dtiles = require('./obj23dtiles/lib/obj23dtiles');
// convert_i3dm();
// makeCmpt();
// convert_i3dm();
convert_b3dm();
// convert_gltf();
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

function convert_b3dm () {
	var outputFolderPath = "E:\\Cesium\\ifc\\public\\data\\output\\test";
	var options = {
		tilesetOptions : path.join(outputFolderPath,"option.json"),
		tileset : true,
		b3dm : true,
		draco : true
	};
	var objPath = "E:\\Cesium\\ifc\\public\\data\\output\\test\\b3dm.obj";
	var outputPath = path.join(outputFolderPath,"draco","0.b3dm");

	var task = obj23dtiles(objPath,outputPath,options);
}


function  convert_gltf(argument) {
	var outputFolderPath = "E:\\Cesium\\ifc\\public\\data\\output\\test";
	var options = {
		binary : true,
		// draco : true
	};
	var objPath = "E:\\Cesium\\ifc\\public\\data\\output\\test\\b3dm.obj";
	// var outputPath = path.join(outputFolderPath,"draco","0.b3dm");
	var outputPath = path.join(outputFolderPath,"t.gltf");

	obj23dtiles(objPath,outputPath,options)


}

function convert_i3dm () {

	var outputFolderPath = "E:\\Cesium\\ifc\\public\\data\\output\\test";
	var options = {
		// tilesetOptions : path.join(outputFolderPath,"option.json"),
		tileset : false,
		i3dm : true,
		customFeatureTable : path.join(outputFolderPath,"161201_featureTable.json"),
		customBatchTable : path.join(outputFolderPath,"161201_batchTable.json")

	};
	var objPath = "E:\\Cesium\\ifc\\public\\data\\output\\test\\161201.obj";
	var outputPath = path.join(outputFolderPath,"b","0.i3dm");

	obj2tileset_o(objPath,outputPath,options);
}



function convert_i3dm_t () {
	var outputFolderPath = "E:\\Cesium\\ifc\\public\\data\\output\\b3fa0e25-4756-4f3c-8de9-99ed1cb98216\\objs\\2_0_0_0";
	var options = {
		tilesetOptions : path.join(outputFolderPath,"option.json"),
		tileset : true,
		i3dm : true,
		customFeatureTable : path.join(outputFolderPath,"172085_featureTable_1.json"),
		customBatchTable : path.join(outputFolderPath,"172085_batchTable_1.json")

	};
	var objPath = "E:\\Cesium\\ifc\\public\\data\\output\\b3fa0e25-4756-4f3c-8de9-99ed1cb98216\\objs\\2_0_0_0\\172085.obj";
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

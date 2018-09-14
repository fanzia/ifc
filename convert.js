var fs = require("fs");
var fsPromises = fs.promises;
var path = require("path");
var fsExtra = require('fs-extra');
var obj2Tileset = require('./obj23dtiles/lib/obj2Tileset');
var obj2gltf = require('./obj23dtiles/lib/obj2gltf');


convert();
// convert_gltf();
function convert () {

	// var outputFolderPath = "E:\\Cesium\\Eclipse\\data\\convert\\obj23dtiles";
	var outputFolderPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\output";
	var options = {
		tilesetOptions : path.join(outputFolderPath,"option.json"),
		tileset : true,
		b3dm : true
	};
	// var objPath = "E:\\Cesium\\Eclipse\\data\\input\\convert\\3_7_2.obj";
	// var objPath = "E:\\Cesium\\Eclipse\\data\\input\\4332516_low\\4332516.obj";
	// var objPath = "E:\\Cesium\\Eclipse\\data\\input\\png_1\\png.obj";
	// var objPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\output.obj";
	// var objPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\ifc_4.obj";
	var objPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\ifc_4_weld.obj";
	var outputPath = path.join(outputFolderPath,"0.b3dm");

	obj2tileset_o(objPath,outputPath,options);
}

function convert_gltf (argument) {
	var outputFolderPath = "E:\\Cesium\\Eclipse\\data\\convert\\gltf\\1_1.gltf";
	var options = {
		binary : true
	};
	// var objPath = "E:\\Cesium\\Eclipse\\data\\input\\convert\\3_7_2.obj";
	var objPath = "E:\\Cesium\\Eclipse\\data\\input\\1\\4332516_t.obj";
	// var objPath = "E:\\Cesium\\Eclipse\\data\\input\\tri_1\\tri_1.obj";
	var objPath = "E:\\Cesium\\Eclipse\\data\\input\\4332516_low\\4332516.obj";

	obj23glft_o(objPath,outputFolderPath,options);
}



function obj2tileset_o (objPath, outputPath, options) {
	if(typeof options.tilesetOptions === 'string') {
	    options.tilesetOptions = fsExtra.readJsonSync(options.tilesetOptions);
	}

	options.binary = true;
    options.batchId = true;
    options.b3dm = true;
	obj2Tileset(objPath, outputPath, options)
	    .then(function(result) {
	        var b3dm = result.b3dm;
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
	        tasks.push(fsExtra.outputFile(tilePath, b3dm));
	        tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
	        return Promise.all(tasks);
	    })
	    .then(function() {
	    	console.log('完成');
	    	var info = '转换文件成功:' + objPath  ;
	    })
	    .catch(function(error) {
	    	var info = "转换3dtiles 失败:" + error.message || error;
	        console.log(ws,"error",info);
	        // process.exit(1);
	    });
}

function obj23glft_o(objPath, outputPath, options){
	obj2gltf(objPath, options)
	    .then(function(result){
	        var gltf = result.gltf;
	        if (options && options.binary) {
	            // gltf is a glb buffer
	            return fsExtra.outputFile(outputPath, gltf);
	        }
	        var jsonOptions = {
	            spaces : 2
	        };
	        return fsExtra.outputJson(outputPath, gltf, jsonOptions);
	    })
	    .then(function() {
	        // console.timeEnd('Total');
	      	console.log('完成');
	    })
	    .catch(function(error) {
	        console.log(error.message || error);
	        process.exit(1);
	    });
}
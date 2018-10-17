var ffi = require('ffi');
var fsExtra = require("fs-extra");
var path = require("path");
var Model = require("./Model/Model");
var Point = require("./Model/Point");
var readObj = require("./readObj");
var writeObj = require("./writeObj");
var convert23dtiles	= require("./convert23dtiles");
var createTiles	= require("./createTiles");
var subdivide = require("./subdivide");
var Cesium = require("cesium");
var fs = require('fs');
var readLines = require('./readLines');
var readIFC = require("./IFC/readIFC");


module.exports = convert;
function convert (uuid,options) {
	console.log(uuid);
	// console.log(options);

	function getIFCName (uuid) {
		var folderPath = path.join(process.cwd(),"public/data/upload",uuid);
		var files = fs.readdirSync(folderPath);
		for(var i = 0; i < files.length;++i){
			var file = files[i];
			var name = file.substring(file.lastIndexOf("."));
			if(name.toLowerCase() == ".ifc"){
				return file;
			}
		}
		return null;
	}

	function ifcToObj (uuid,options) {
		// 假设调用一个dll
		// 使用ffi调用dll文件，进行
		var addDll = ffi.Library('addDll.dll',{
			'add' : ['int',['int','int']]
		});

		var dd = addDll.add(3,5);
		console.log("模拟调用dll:"+ dd);


		// 实际上是生成obj文件
		// moveObj(uuid);
		// createModel(uuid,options);

		// 9.17手工处理ifc
		createIFCType();

	}


	function moveObj (uuid) {
		var objPath = "E:\\Cesium\\ifc\\public\\data\\test\\ifc.obj";
		var ifcTypePath = "E:\\Cesium\\ifc\\public\\data\\test\\ifcType.txt";
		var mtlPath = "E:\\Cesium\\ifc\\public\\data\\test\\ifc.mtl";

		var newObjPath = path.join(process.cwd(),"public/data/upload",uuid,"ifc.obj");
		var newIfcTypePath = path.join(process.cwd(),"public/data/upload",uuid,"ifcType.txt");
		var newMtlPath =  path.join(process.cwd(),"public/data/upload",uuid,"ifc.mtl");
		try {
			fsExtra.copySync(objPath,newObjPath);
			// fsExtra.copySync(ifcTypePath,newIfcTypePath);
			fsExtra.copySync(mtlPath,newMtlPath);
		} catch(e) {
			console.log(e);
		}

	}

	function createModel (uuid,options) {
		var modelPath = path.join(process.cwd(),"public/data/upload",uuid,"ifc.obj");
		var point = new Point(Cesium.Math.toRadians(options.lon),Cesium.Math.toRadians(options.lat),0);
		var options = {
			flap : false,
			type : options.type,
			count_0 : options.count_0,
			count_x : options.count_x,
			count_y : options.count_y,
			count_z : options.count_z,
			ws : options.ws,
			instanced : options.instanced,
			modelName : options.modelName
		};

		var ifcName = getIFCName(uuid);
		if(!ifcName){
			console.log('没有ifc文件');
			return;
		}
		var model = new Model(modelPath,point,uuid,options,ifcName);

		// 之前的版本，直接切分然后生成转换
		// readObj(model)
		// 	.then(function (result) {
		// 		subdivide(result.model)
		// 			.then(function (result) {
		// 				writeObj(result.model)
		// 					.then(function (result) {
		// 						obj23dtiles(result.model)
		// 							.then(function (result) {
		// 								model.sendMessage("info","转换3dtiles结束");
		// 								createTiles(model);
		// 								model.sendMessage("success",model.getUuid());
		// 							})
		// 					})
		// 			})
		// 	})

		// 9.29,尝试根据ifc实例化
		// readObj(model)
		// 	.then(function (result) {
		// 		readIFC(result.model);

		// 	})


		// 10.10版本
		readObj(model)
			.then(function (result) {
				readIFC(result.model)
					.then(function (result) {
						subdivide(result.model)
							.then(function (result) {
								writeObj(result.model)
									.then(function (result) {
										convert23dtiles(result.model)
											.then(function (result) {
												model.sendMessage("info","转换3dtiles结束");
												createTiles(model);
												model.sendMessage("success",model.getUuid());
											})
									})
							})
					})
			})
	}


	var currentFile = null;
	var output = "";
	var ifcFolder = "E:\\Cesium\\ifc\\public\\data\\test\\ifc";
	function parseLine_ifc (line) {
		var list = line.trim().split(",");
		output += `${list[0]}\t${currentType}\n`;
	}

	function getIFCType_file (files) {
		var file = files.shift();
		if(!file){
			return new Promise(function(resolve){
				return resolve({
					info : "success"
				});
			});
		}
		var filePath = path.join(ifcFolder,file);
		var fileName = path.basename(file);
		currentType = fileName.substring(0,fileName.lastIndexOf("."));

		if(currentType == "IfcBuilding" || currentType == "IfcBuildingStorey" || currentType == "IfcCurtainWall" || currentType == "IfcOpeningElement" || currentType == "IfcProject" || currentType == "IfcSite" || currentType == "IfcTypeObject" || currentType == "PropertySetDefinition"
			|| currentType == "IfcDistributionPort" || currentType == "IfcStair"){
			return getIFCType_file (files);
		}

		
		return readLines(filePath,parseLine_ifc)
			.then(function () {
				return getIFCType_file (files);
			})
	}

	
	// 辅助生成ifctype.txt
	function createIFCType () {
		try {
			var files = fs.readdirSync(ifcFolder);
			getIFCType_file(files)
				.then(function (result) {
					// console.log(output);
					var newIfcTypePath = path.join(process.cwd(),"public/data/upload",uuid,"ifcType.txt");
					fs.writeFileSync(newIfcTypePath,output,"utf8");
					moveObj(uuid);
					createModel(uuid,options);
				})
		} catch(e) {
			console.log(e);
		}


	}

	ifcToObj(uuid,options);
}
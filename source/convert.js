var ffi = require('ffi');
var fsExtra = require("fs-extra");
var path = require("path");
var Model = require("./Model/Model");
var Point = require("./Model/Point");
var readObj = require("./readObj");
var writeObj = require("./writeObj");
var obj23dtiles	= require("./obj23dtiles");
var createTiles	= require("./createTiles");
var subdivide = require("./subdivide");
var Cesium = require("cesium");


module.exports = convert;
function convert (uuid,options) {
	console.log(uuid);
	console.log(options);



	function ifcToObj (uuid,options) {
		// 假设调用一个dll
		// 使用ffi调用dll文件，进行
		var addDll = ffi.Library('addDll.dll',{
			'add' : ['int',['int','int']]
		});

		var dd = addDll.add(3,5);
		console.log("模拟调用dll:"+ dd);


		// 实际上是生成obj文件
		moveObj(uuid);
		createModel(uuid,options);
	}


	function moveObj (uuid) {
		var objPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\test\\ifc.obj";
		var ifcTypePath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\test\\ifcType.txt";
		var mtlPath = "E:\\Cesium\\IFCto3dtiles\\public\\data\\test\\ifc.mtl";

		var newObjPath = path.join(process.cwd(),"public/data/upload",uuid,"ifc.obj");
		var newIfcTypePath = path.join(process.cwd(),"public/data/upload",uuid,"ifcType.txt");
		var newMtlPath =  path.join(process.cwd(),"public/data/upload",uuid,"ifc.mtl");
		try {
			fsExtra.copySync(objPath,newObjPath);
			fsExtra.copySync(ifcTypePath,newIfcTypePath);
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
			ws : options.ws
		};
		var model = new Model(modelPath,point,uuid,options);
		readObj(model)
			.then(function (result) {
				subdivide(result.model)
					.then(function (result) {
						writeObj(result.model)
							.then(function (result) {
								obj23dtiles(result.model)
									.then(function (result) {
										model.sendMessage("info","转换3dtiles结束");
										createTiles(model);
										model.sendMessage("success",model.getUuid());
									})
							})
					})
			})
	}

	ifcToObj(uuid,options);
}
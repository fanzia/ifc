var Model = require("./Model/Model");
var Point = require("./Model/Point");
var readObj = require("./readObj");
var writeObj = require("./writeObj");
var obj23dtiles	= require("./obj23dtiles");
var createTiles	= require("./createTiles");
var subdivide = require("./subdivide");
var Cesium = require("cesium");

main();
function main () {
	var path = "E:\\Cesium\\IFCto3dtiles\\public\\data\\ifc_4.obj";
	// var path = "E:\\Cesium\\IFCto3dtiles\\public\\data\\output.obj";
	// var path = "E:\\Cesium\\IFCto3dtiles\\public\\data\\ifc_4_weld.obj";
	// var path = "E:\\Cesium\\IFCto3dtiles\\public\\data\\input\\4332516.obj";
	var lon = 117.19131460833329;
	var lat = 39.12627008333333;

	var point = new Point(Cesium.Math.toRadians(lon),Cesium.Math.toRadians(lat),0);
	var options = {
		flap : false,
		type : "wlm",
		count_0 : 10,
		count_x : 1,
		count_y : 1,
		count_z : 1
	};
	var model = new Model(path,point,options);
	readObj(model)
		.then(function (result) {
			subdivide(result.model)
				.then(function (result) {
					writeObj(result.model)
						.then(function (result) {
							// console.log(result.model);
							obj23dtiles(result.model)
								.then(function (result) {
									console.log(result);
									createTiles(model);
								})
						})
				})
		})
}

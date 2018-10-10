var readLines = require('../readLines');
var path = require("path");
var IFC = require("./IFC");
var fsExtra = require('fs-extra');
var Cesium = require('cesium');


module.exports =  readIFC;

function readIFC (model) {
	var ifc = model.getIFC();

	var hashmap = ifc.getHashMap();
	var typeHashMap = ifc.getTypeHashMap();


	function parseLine (line) {
		line = line.trim();
		if((line.charAt(0) != '#')){
			return;
		}
		var list = line.split("=");

		var key = list[0].trim();
		var value = list[1].trim();
		hashmap.set(key,value);

		var ifcKey = value.slice(0,value.indexOf("("));
		var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
		if(ifcKey == "IFCRELDEFINESBYTYPE"){
			var valueList = ifcInfo.split(",");
			var typeListStr = ifcInfo.slice(ifcInfo.lastIndexOf("(")+1,ifcInfo.lastIndexOf(")"))
			var typeID = valueList[valueList.length -1];
			var typeList = typeListStr.split(",");
			typeHashMap.set(typeID,typeList);
			// 查找每一个id model.getObjecetModel(),赋予defineType
			checkTypeList(typeID,typeList);
		}
	}

	// 处理类型列表
	function checkTypeList(typeID,typeList) {
		if(typeList.length <= 1){
			return;
		}
		for(var i = 0; i < typeList.length;++i){
			var id = typeList[i];
			checkEntity(typeID,id);
		}
	}

	function checkEntity (typeID,id) {
		// var idStr = hashmap.get(id);
		// #319= IFCFLOWSEGMENT('2BIZhdvlX6UO_$0XOmb8Cu',#41,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1376331',$,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1209128',#300,#313,'1376331');
		var str_value_entity = ifc.getHashMapStringValue(id);
		if(!str_value_entity){
			console.log(`${id}不存在`);
			return;
		}

		var strList = str_value_entity.trim().split(",");
		// #313= IFCPRODUCTDEFINITIONSHAPE($,$,(#310));
		var id_IFCPRODUCTDEFINITIONSHAPE = strList[strList.length-2];
		var str_IFCPRODUCTDEFINITIONSHAPE = hashmap.get(id_IFCPRODUCTDEFINITIONSHAPE);
		if(!str_IFCPRODUCTDEFINITIONSHAPE){
			console.log(`无效id${id_IFCPRODUCTDEFINITIONSHAPE}`);
			return;
		}

		var id_objectModel = strList[0];
		id_objectModel = id_objectModel.replace(/'/g,'');

		var objectModel = model.getModel(id_objectModel);
		if(!objectModel){
			console.log(`${id_objectModel}不存在`);
			return;
		}


		var id_IFCSHAPEREPRESENTATION = str_IFCPRODUCTDEFINITIONSHAPE.slice(str_IFCPRODUCTDEFINITIONSHAPE.lastIndexOf("(")+1,str_IFCPRODUCTDEFINITIONSHAPE.lastIndexOf("))"));
		var str_IFCSHAPEREPRESENTATION = hashmap.get(id_IFCSHAPEREPRESENTATION);


		// #310= IFCSHAPEREPRESENTATION(#102,'Body','SweptSolid',(#309));
		var str_value_IFCSHAPEREPRESENTATION = ifc.getHashMapStringValue(id_IFCSHAPEREPRESENTATION);
		if(!str_value_IFCSHAPEREPRESENTATION){
			console.log(`无效id${id_IFCSHAPEREPRESENTATION}`);
			return;
		}

		var list = str_value_IFCSHAPEREPRESENTATION.split(",");
		var geometryType = list[list.length-2];
		geometryType = geometryType.replace(/'/g,'');
		console.log(geometryType);
		// if(geometryType != "SweptSolid"){
		// 	console.log(geometryType + "无法处理");
		// 	return;
		// }
		if(geometryType == "SweptSolid"){
			var info = getSweptSolidInfo(list);
			objectModel.setRefineType(typeID,geometryType,info);
		}


	}

	// 拉伸体信息
	function getSweptSolidInfo (list) {
		var id_IFCEXTRUDEDAREASOLID = list[list.length-1].slice(1,list[list.length-1].length-1);
		var str_value_IFCEXTRUDEDAREASOLID = ifc.getHashMapStringValue(id_IFCEXTRUDEDAREASOLID);
		if(!str_value_IFCEXTRUDEDAREASOLID){
			console.log(`无效id${id_IFCEXTRUDEDAREASOLID}`);
			return null;
		}

		// #309= IFCEXTRUDEDAREASOLID(#305,#308,#19,125.);	
		list = str_value_IFCEXTRUDEDAREASOLID.split(",");
		var id_IFCRECTANGLEPROFILEDEF = list[0];
		var id_IFCAXIS2PLACEMENT3D = list[1];
		var id_dirction_z = list[2];
		var z_length = parseFloat(list[3]);


		// #305= IFCRECTANGLEPROFILEDEF(.AREA.,'\X2\900198CE\X0\',#304,4695.20168082382,1390.);
		var str_value_IFCRECTANGLEPROFILEDEF = ifc.getHashMapStringValue(id_IFCRECTANGLEPROFILEDEF);
		if(!str_value_IFCRECTANGLEPROFILEDEF){
			console.log(`无效id${id_IFCRECTANGLEPROFILEDEF}`);
			return;
		}

		var list = str_value_IFCRECTANGLEPROFILEDEF.split(",");
		var x_length = parseFloat(list[list.length-2]);
		var y_length = parseFloat(list[list.length-1]);


		// #308= IFCAXIS2PLACEMENT3D(#306,#19,#17);
		var str_value_IFCAXIS2PLACEMENT3D = ifc.getHashMapStringValue(id_IFCAXIS2PLACEMENT3D);
		if(!str_value_IFCAXIS2PLACEMENT3D){
			console.log(`无效id${id_IFCAXIS2PLACEMENT3D}`);
			return;
		}


		var list = str_value_IFCAXIS2PLACEMENT3D.split(",");
		var id_IFCCARTESIANPOINT = list[0];
		var id_z_IFCDIRECTION = list[1];
		var id_x_IFCDIRECTION = list[2];


		var str_value_IFCCARTESIANPOINT = ifc.getHashMapStringValue(id_IFCCARTESIANPOINT);
		if(!str_value_IFCCARTESIANPOINT){
			console.log(`无效id${id_IFCCARTESIANPOINT}`);
			return;
		}

		var pointList = str_value_IFCCARTESIANPOINT.slice(1,str_value_IFCCARTESIANPOINT.length-1).split(",");
		var x = pointList[0];
		var y = pointList[1];
		var z = pointList[2];


		// 根据数值计算向量
		var x_cartesian = getCartesianByDirection(id_x_IFCDIRECTION,"x");
		var z_cartesian = getCartesianByDirection(id_z_IFCDIRECTION,"z");
		var y_cartesian = getCartesianY(x_cartesian,z_cartesian);

		var direction = {
			x : x_cartesian,
			y : y_cartesian,
			z : z_cartesian
		};

		var angle = getAngleByDirection(direction);

		var info = {
			direction : direction,
			angle : angle,
			size :{
				x : x_length,
				y : y_length,
				z : z_length
			}
		}

		return info;
	}


	// 根据方向获取向量
	function getCartesianByDirection (direction,axis) {
		var result = null;
		if(direction == "$"){
			if(axis == "x"){
				result = Cesium.Cartesian3.UNIT_X;
			}else if(axis == "z"){
				result = Cesium.Cartesian3.UNIT_Z;
			}
		}else{
			var value = ifc.getHashMapStringValue(direction);
			var str = value.slice(value.indexOf("(")+1,value.lastIndexOf(")"));
			var list = str.split(",");
			result = new Cesium.Cartesian3(parseFloat(list[0]),parseFloat(list[1]),parseFloat(list[2]));
		}
		return result;
	}

	// 叉积 求y轴向量
	function getCartesianY (x_cartesian,z_cartesian) {
		return Cesium.Cartesian3.cross(z_cartesian,x_cartesian,new Cesium. Cartesian3());
	}

	// 求解每个方向上的旋转角度
	function getAngleByDirection (direction) {
		var x = direction.x;
		var y = direction.y;
		var z = direction.z;
		var r11 = x.x,r21 = x.y,r31= x.z;
		var r12 = y.x,r22 = y.y,r32 = y.z;
		var r13 = z.x,r23 = z.y,r33 = z.z;

		var angle_x = Math.atan2(r32,r33);
		var angle_y = Math.atan2(-r31,Math.sqrt(r32*r32+r33*r33));
		var angle_z = Math.atan2(r21,r11);
		return {
			x : Cesium.Math.toDegrees(angle_x),
			y : Cesium.Math.toDegrees(angle_y),
			z : Cesium.Math.toDegrees(angle_z)
		};
	}


	return readLines(ifc.getIFCPath(),parseLine)
		.then(function(){

			// 
			return new Promise(function(resolve){
				return resolve({
					model : model
				});
			});
		});

}
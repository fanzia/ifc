var readLines = require('../readLines');
var path = require("path");
var IFC = require("./IFC");
var fsExtra = require('fs-extra');
var Cesium = require('cesium');
var IFCSpace = require("./IFCSpace");


module.exports =  readIFC;

function readIFC (model) {
	var ifc = model.getIFC();

	var hashmap = ifc.getHashMap();
	var typeHashMap = ifc.getTypeHashMap();
	var spaceHashMap = ifc.getSpaceHashMap();
	var spaceWallsHashMap = ifc.getSpaceWallsHashMap();
	var aggregatesHashMap = ifc.getAggregatesHaspMap();


	function parseLine (line) {
		line = line.trim();
		if((line.charAt(0) != '#')){
			return;
		}
		var list = line.split("=");

		var key = list[0].trim();
		var value = list[1].trim();
		hashmap.set(key,value);

		// var ifcKey = value.slice(0,value.indexOf("("));
		
		// if(ifcKey == "IFCRELDEFINESBYTYPE"){
		// 	var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
		// 	var valueList = ifcInfo.split(",");
		// 	var typeListStr = ifcInfo.slice(ifcInfo.lastIndexOf("(")+1,ifcInfo.lastIndexOf(")"))
		// 	var typeID = valueList[valueList.length -1];
		// 	var typeList = typeListStr.split(",");
		// 	typeHashMap.set(typeID,typeList);
		// 	// 查找每一个id model.getObjecetModel(),赋予defineType
		// 	checkTypeList(typeID,typeList);
		// }else if(ifcKey == "IFCRELSPACEBOUNDARY"){
		// 	var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
		// 	var valueList = ifcInfo.split(",");
		// 	var spaceID = valueList[4];
		// 	var wallID = valueList[5];
		// 	checkSpaceBoundary(spaceID,wallID);
		// }else if(ifcKey == "IFCRELAGGREGATES"){
		// 	var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
		// 	var valueList = ifcInfo.split(",");
		// 	var key = valueList[4];
		// 	// var list = valueList[5];
		// 	var list = ifcInfo.slice(ifcInfo.lastIndexOf("(")+1,ifcInfo.lastIndexOf(")")).split(",");
		// 	aggregatesHashMap.set(key,list);
		// }
	}

	// 第二遍读取
	function parseLine_2 (line) {
		line = line.trim();
		if((line.charAt(0) != '#')){
			return;
		}
		var list = line.split("=");

		var key = list[0].trim();
		var value = list[1].trim();
		var ifcKey = value.slice(0,value.indexOf("("));
		
		
		if(ifcKey == "IFCRELDEFINESBYTYPE"){
			var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
			var valueList = ifcInfo.split(",");
			var typeListStr = ifcInfo.slice(ifcInfo.lastIndexOf("(")+1,ifcInfo.lastIndexOf(")"))
			var typeID = valueList[valueList.length -1];
			var typeList = typeListStr.split(",");
			typeHashMap.set(typeID,typeList);
			// 查找每一个id model.getObjecetModel(),赋予defineType
			checkTypeList(typeID,typeList);
		}else if(ifcKey == "IFCRELSPACEBOUNDARY"){
			var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
			var valueList = ifcInfo.split(",");
			var spaceID = valueList[4];
			var wallID = valueList[5];
			checkSpaceBoundary(spaceID,wallID);
		}else if(ifcKey == "IFCRELAGGREGATES"){
			var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
			var valueList = ifcInfo.split(",");
			var key = valueList[4];
			// var list = valueList[5];
			var list = ifcInfo.slice(ifcInfo.lastIndexOf("(")+1,ifcInfo.lastIndexOf(")")).split(",");
			aggregatesHashMap.set(key,list);
		}else if(ifcKey == "IFCSITE"){
			var ifcInfo = value.slice(value.indexOf("(")+1,value.length-2);
			var valueList = ifcInfo.split(",");
			var key = valueList[5];
			var angle = getIFCSiteDirection(key);
			if(angle){
				ifc.setSiteAngle(angle);
			}

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
			// 太多了，暂时屏蔽
			// console.log(`无效id${id_IFCPRODUCTDEFINITIONSHAPE}`);
			return;
		}

		var id_objectModel = strList[0];
		id_objectModel = id_objectModel.replace(/'/g,'');

		if(id_objectModel == "0JRjfcPi1FvQdxHWaKBS29" || id_objectModel == "0TWCh4IHnFsvUblEPG6qPH"){
			console.log('调试');
		}

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
			// console.log(`无效id${id_IFCSHAPEREPRESENTATION}`);
			return;
		}

		var list = str_value_IFCSHAPEREPRESENTATION.split(",");
		var geometryType = list[list.length-2];
		geometryType = geometryType.replace(/'/g,'');
		// console.log(geometryType);
		// if(geometryType != "SweptSolid"){
		// 	console.log(geometryType + "无法处理");
		// 	return;
		// }
		if(geometryType == "SweptSolid"){
			var info = getSweptSolidInfo(list);
			if(info){
				objectModel.setRefineType(typeID,geometryType,info);
			}
		}else if(geometryType == "MappedRepresentation"){
			var info = getMappedInfo(id,list);
			if(info){
				objectModel.setRefineType(typeID,geometryType,info);
			}
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
		var id_IFC_PROFILEDEF = list[0];
		var id_IFCAXIS2PLACEMENT3D = list[1];
		var id_dirction_z = list[2];
		var z_length = parseFloat(list[3]);


		// 可能是长方体也可能是圆柱体
		// #305= IFCRECTANGLEPROFILEDEF(.AREA.,'\X2\900198CE\X0\',#304,4695.20168082382,1390.);
		// #18798= IFCCIRCLEPROFILEDEF(.AREA.,'\X2\7A7A8C0356DE6C34\X0\',#18797,21.);
		var str_value_IFC_PROFILEDEF = ifc.getHashMapStringValue(id_IFC_PROFILEDEF);
		if(!str_value_IFC_PROFILEDEF){
			console.log(`无效id${id_IFC_PROFILEDEF}`);
			return;
		}

		var str_IFC_PROFILEDEF= hashmap.get(id_IFC_PROFILEDEF);
		var ifc_PROFILEDEF_type = str_IFC_PROFILEDEF.slice(0,str_IFC_PROFILEDEF.indexOf("(")).trim();

		var x_length = 0,y_length = 0;
		if(ifc_PROFILEDEF_type == "IFCRECTANGLEPROFILEDEF"){
			var list = str_value_IFC_PROFILEDEF.split(",");
			x_length = parseFloat(list[list.length-2]);
			y_length = parseFloat(list[list.length-1]);
		}else if(ifc_PROFILEDEF_type == "IFCCIRCLEPROFILEDEF"){
			// 圆柱形暂时不处理
			return null;
			x_length = 0;
			y_length = 0;
		}else{
			return null;
		}


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
		angle = {
			x : angle.x,
			y : angle.y,
			z : angle.z
		};

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

		var angle_x,angle_y,angle_z;
		if(r11*r11 + r21*r21 == 0){
			// if(r12 > 0){
			// 	angle_y = Math.PI/2;
			// }else{
			// 	angle_y = -Math.PI/2;
			// }
			angle_y = -Math.PI/2;
			// angle_x = Math.atan2(r32,r33);
			// angle_z = Math.atan2(r21,r11);
			angle_x = Math.PI;
			angle_z = Math.atan2(r12,-r22);
		}else {
			angle_x = Math.atan2(r32,r33);
			angle_y = Math.atan2(-r31,Math.sqrt(r32*r32+r33*r33));
			angle_z = Math.atan2(r21,r11);
		}
		// angle_x = Math.atan2(r32,r33);
		// angle_y = Math.atan2(-r31,Math.sqrt(r32*r32+r33*r33));
		// angle_z = Math.atan2(r21,r11);

		return {
			x : Cesium.Math.toDegrees(angle_x),
			y : Cesium.Math.toDegrees(angle_y),
			z : Cesium.Math.toDegrees(angle_z)
		};
	}

	function getAngleByDirection_2 (direction) {
		var x = direction.x;
		var y = direction.y;
		var z = direction.z;
		var m00 = x.x,m10 = x.y,m20= x.z;
		var m01 = y.x,m11 = y.y,m21 = y.z;
		var m02 = z.x,m12 = z.y,m22 = z.z;

		var angle_x = Math.atan2(m12,m22);
		var c2 = Math.sqrt(m00*m00 + m01*m01);
		var angle_y = Math.atan2(-m02,c2);
		var s1 = Math.sin(angle_x),c1 = Math.cos(angle_x);
		var angle_z = Math.atan2(s1*m20-c1*m10,c1*m11-s1*m21);
		return {
			x : Cesium.Math.toDegrees(angle_x),
			y : Cesium.Math.toDegrees(angle_y),
			z : Cesium.Math.toDegrees(angle_z)
		};
	}

	function getAngleByDirection_3(direction) {
		var x = direction.x;
		var y = direction.y;
		var z = direction.z;
		var r11 = x.x,r21 = x.y,r31= x.z;
		var r12 = y.x,r22 = y.y,r32 = y.z;
		var r13 = z.x,r23 = z.y,r33 = z.z;

		var angle_x,angle_y,angle_z;
		if(Math.abs(r31) != 1){
			angle_y = -Math.asin(r31);
			angle_x = Math.atan2(r32/Math.cos(angle_y),r33/Math.cos(angle_y));
			angle_z = Math.atan2(r21/Math.cos(angle_y),r11/Math.cos(angle_y));
		}else{
			// angle_z = -Math.PI/2;
			// angle_z = 0;
			if(r31 == -1){
				// angle_z = 0;
				// angle_y = Math.PI/2;
				// angle_x = angle_z + Math.atan2(r12,r13);
				angle_y = Math.PI/2;
				angle_x = Math.PI;
				angle_z = angle_x -  Math.atan2(r12,r13);

			}else{
				// angle_z = Math.PI/2;
				// angle_y = -Math.PI/2;
				// angle_x = -angle_z + Math.atan2(-r12,-r13);
				angle_y = -Math.PI/2;
				angle_x = 0;
				angle_z = Math.atan2(-r12,-r13) - angle_x;
			}
		}

		return {
			x : Cesium.Math.toDegrees(angle_x),
			y : Cesium.Math.toDegrees(angle_y),
			z : Cesium.Math.toDegrees(angle_z)
		};

	}


	function getMappedInfo (id,list) {
		// #35507= IFCPLATE('0m5vqcy496oBmzeJ2bcHVb',#41,'\X2\7CFB7EDF5D4C677F\X0\:\X2\73BB7483\X0\:601237',$,'\X2\73BB7483\X0\',#35505,#35492,'601237');
		var str_value_entity = ifc.getHashMapStringValue(id);
		if(!str_value_entity){
			return;
		}
		var strList = str_value_entity.trim().split(",");
		// #35505
		var id_IFCLOCALPLACEMENT = strList[strList.length -3];
		if(!id_IFCLOCALPLACEMENT){
			return;
		}

		// #35505= IFCLOCALPLACEMENT(#35486,#35504);
		var str_value_IFCLOCALPLACEMENT = ifc.getHashMapStringValue(id_IFCLOCALPLACEMENT);
		if(!str_value_IFCLOCALPLACEMENT){
			return;
		}

		var list = str_value_IFCLOCALPLACEMENT.split(",");
		var id_IFCAXIS2PLACEMENT3D = list[list.length-1];

		// #35504= IFCAXIS2PLACEMENT3D(#35500,#19,#35502);
		var str_value_IFCAXIS2PLACEMENT3D = ifc.getHashMapStringValue(id_IFCAXIS2PLACEMENT3D);
		if(!str_value_IFCAXIS2PLACEMENT3D){
			return;
		}


		var list = str_value_IFCAXIS2PLACEMENT3D.split(",");
		var id_z_IFCDIRECTION = list[1];
		var id_x_IFCDIRECTION = list[2];

		var x_cartesian = getCartesianByDirection(id_x_IFCDIRECTION,"x");
		var z_cartesian = getCartesianByDirection(id_z_IFCDIRECTION,"z");
		var y_cartesian = getCartesianY(x_cartesian,z_cartesian);

		var direction = {
			x : x_cartesian,
			y : y_cartesian,
			z : z_cartesian
		};
		var angle = getAngleByDirection(direction);
		var angle_3 = getAngleByDirection_3(direction);
		console.log(`${angle.x},${angle.y},${angle.z};${angle_3.x},${angle_3.y},${angle_3.z}`);

		var info = {
			direction : direction,
			angle : angle_3
		};
		return info;
	}


	// #737215= IFCRELSPACEBOUNDARY('22f_W9ewb4g83ZXZQz0QyG',#41,'1stLevel',$,#343,#16851,#444,.PHYSICAL.,.INTERNAL.);
	// 检查空间边界
	function checkSpaceBoundary (spaceID,wallKey) {
		var wallList = spaceWallsHashMap.get(spaceID);
		var wallKeys = spaceHashMap.get(spaceID);
		if(wallKeys){
			if(wallKeys.indexOf(wallKey) == -1){
				wallKeys.push(wallKey);
				var list = changeWallKeyToIDs(wallKey);
				wallList = wallList.concat(list);
				spaceWallsHashMap.set(spaceID,wallList);

				// if(list){
				// 	wallList = wallList.concat(list);
				// }
			}	
		}else{
			// var list = [];
			// var list = changeWallKeyToIDs(wallKey);
			// if(list){
			// 	wallList = list
			// }

			spaceHashMap.set(spaceID,[wallKey]);
			var list = changeWallKeyToIDs(wallKey);
			spaceWallsHashMap.set(spaceID,list);
			
			// wallList = wallList.concat(list);
		}
	}

	// 根据实体分割来确定具体是哪些ID
	function changeWallKeyToIDs (wallKey) {
		var str_value_wall = ifc.getHashMapStringValue(wallKey);
		if(!str_value_wall){
			return null;
		}

		var list = str_value_wall.split(",");
		var id_wall = list[0];
		id_wall = id_wall.replace(/'/g,'');
		var objectModel = model.getModel(id_wall);
		if(objectModel){
			return [id_wall];
		}

		// 可能是幕墙
		var str_wall = hashmap.get(wallKey);

		var wall_type = str_wall.slice(0,str_wall.indexOf("(")).trim();
		// console.log(wall_type);
		if(wall_type == "IFCCURTAINWALL"){
			return [wallKey];
		}
	}

	// 替换幕墙
	function checkCurtainWall () {
		spaceWallsHashMap.forEach(function (list,key) {
			for(var i = 0; i < list.length;++i){
				var id = list[i];
				var modelIDs = [];
				if(id.length < 20){
					var ids = aggregatesHashMap.get(id);
					list.splice(i,1);
					if(!ids){
						return;
					}
					for(var j = 0; j < ids.length;++j){
						var str_value = ifc.getHashMapStringValue(ids[j]);	
						var str_value_list = str_value.split(",");
						var id_objectModel = str_value_list[0].replace(/'/g,'');
						var objectModel = model.getModel(id_objectModel);
						if(objectModel){
							modelIDs.push(id_objectModel);
						}
					}

					var newList = list.concat(modelIDs);
					spaceWallsHashMap.set(key,newList);
				}
			}
		})
	}	

	function getSpaceList () {
		spaceWallsHashMap.forEach(function (list,key) {
			var str = ``;
			for(var i = 0; i < list.length;++i){
				str += `${list[i]}|`
			}
			str = str.slice(0,str.length-1);
			// console.log(key);
			// console.log(str);
		})

		spaceWallsHashMap.forEach( function(list, key) {
			var spaceCenter = null;
			var spaceBox = null;
			for(var i = 0; i < list.length;++i){
				var id = list[i];
				var objectModel = model.getModel(id);
				if(!objectModel){
					continue;
				}
				// var ifcType = objectModel.getIFCType();
				// if(ifcType != "IfcWall" && ifcType != "IfcSlab" && ifcType != "IfcWallStandardCase"){
				// 	continue;
				// }

				objectModel.addSpaceID(key);
				// 计算中心点
				var center = objectModel.getCenter();
				if(!spaceCenter){
					spaceCenter = center;
				}else{
					spaceCenter.lon = (center.lon + spaceCenter.lon)/2;
					spaceCenter.lat = (center.lat + spaceCenter.lat)/2;
					spaceCenter.height = (center.height + spaceCenter.height)/2;
				}

				// 计算包围矩形
				var objectModelBox = objectModel.getBox();
				if(!spaceBox){
					spaceBox = objectModelBox;
				}else{
					spaceBox = spaceBox.merge(objectModelBox);
				}
			}
			console.log(`${key}: ${spaceCenter.getX()},${spaceCenter.getY()},${spaceCenter.getZ()}`);
			var boxCenter = spaceBox.getCenter();
			console.log(`${key}: ${boxCenter.getX()},${boxCenter.getY()},${boxCenter.getZ()}`);
			var ifcSpace = new IFCSpace(key,boxCenter,list);
			ifc.addIFCSpace(key,ifcSpace);
		});
	}

	// 获取整个地块的方向
	function getIFCSiteDirection (key) {
		// #541747= IFCLOCALPLACEMENT($,#541746);
		var str_value_IFCLOCALPLACEMENT = ifc.getHashMapStringValue(key);
		if(!str_value_IFCLOCALPLACEMENT){
			return null;
		}

		var list = str_value_IFCLOCALPLACEMENT.trim().split(",");
		var id_IFCAXIS2PLACEMENT3D = list[1];
		var str_value_IFCAXIS2PLACEMENT3D = ifc.getHashMapStringValue(id_IFCAXIS2PLACEMENT3D);
		if(!str_value_IFCAXIS2PLACEMENT3D){
			return null;
		}
		var list = str_value_IFCAXIS2PLACEMENT3D.trim().split(",");
		var id_z_IFCDIRECTION = list[1];
		var id_x_IFCDIRECTION = list[2];

		var x_cartesian = getCartesianByDirection(id_x_IFCDIRECTION,"x");
		var z_cartesian = getCartesianByDirection(id_z_IFCDIRECTION,"z");
		var y_cartesian = getCartesianY(x_cartesian,z_cartesian);
		var direction = {
			x : x_cartesian,
			y : y_cartesian,
			z : z_cartesian
		};

		var angle = getAngleByDirection(direction);
		return angle;
	}


	return readLines(ifc.getIFCPath(),parseLine)
		.then(function(){
			return readLines(ifc.getIFCPath(),parseLine_2)
				.then(function () {
					// 解析结束，开始替换curtainwall幕墙集合
					checkCurtainWall();

					getSpaceList();

					return new Promise(function(resolve){
						return resolve({
							model : model
						});
					});
				})
		});

}
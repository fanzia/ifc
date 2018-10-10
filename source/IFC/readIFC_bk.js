
var readLines = require('../readLines');
var path = require("path");
var IFC = require("./IFC");
var fsExtra = require('fs-extra');
var Cesium = require('cesium');

module.exports =  readIFC;


// var uuid = "55d6649b-499a-4cdd-9088-f7bbf516d3fa";
// var ifcPath = path.join(process.cwd(),"public/data/upload",uuid,"F2.ifc");
// var ifc = new IFC(ifcPath,uuid);
// readIFC(ifc)
// 	.then(function(){
// 		readTypeObject(ifc,"door");
// 	});

function readIFC (model) {
	var ifc = model.getIFC();

	var hashmap = ifc.getHashMap();
	var typeHashMap = ifc.getTypeHashMap();

	// 确保输出文件夹
	function createOutputFolder () {
	    try {
	        var outputFolderPath = model.getOutputFolderPath();
	        fsExtra.emptyDirSync(outputFolderPath);
	        model.sendMessage("info","创建输出文件夹成功");
	    } catch(err) {
	        model.sendMessage("error","创建输出文件夹失败:"+err);
	    }

	}


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
		}

	}


	function readTypeObject () {
		var ifc = model.getIFC();
		var typeHashMap = ifc.getTypeHashMap();
		var list = typeHashMap.get("#1802");
		if(list.length == 1){
			console.log('无需实例化');
			return;
		}
		var first = list[0];
		console.log(first);
		var jsons = [];


		for(var i = 0; i < list.length;++i){
			var json = readIFCEntity(list[i]);
			if(json){
				jsons.push(json);
			}
		}
		console.log(jsons);
		for(var i = 0; i <jsons.length;++i){
			var json = jsons[i];
			console.log(`${jsons[i].name},${jsons[i].direction.x},${jsons[i].direction.y},${jsons[i].direction.z},${json.box.max_lon-json.box.min_lon},${json.box.max_lat-json.box.min_lat},${json.box.max_height-json.box.min_height},${Cesium.Math.toDegrees(json.angle.x)},${Cesium.Math.toDegrees(json.angle.y)},${Cesium.Math.toDegrees(json.angle.z)}`);
		}

		writeFeatureTable(jsons);
		writeBatchTable(jsons);

	}
	// 读取一个实体
	function readIFCEntity (id) {
		
		// #319= IFCFLOWSEGMENT('2BIZhdvlX6UO_$0XOmb8Cu',#41,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1376331',$,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1209128',#300,#313,'1376331');
		var hashmap =  ifc.getHashMap(); 
		var idStr = hashmap.get(id);
		if(!idStr){
			console.log('无效id');
			return;
		}

		var str_value_IFCFLOWSEGMENT = ifc.getHashMapStringValue(id);
		var strList = str_value_IFCFLOWSEGMENT.trim().split(",");
		var id_IFCPRODUCTDEFINITIONSHAPE = strList[strList.length-2];
		// #313= IFCPRODUCTDEFINITIONSHAPE($,$,(#310));
		var str_IFCPRODUCTDEFINITIONSHAPE = hashmap.get(id_IFCPRODUCTDEFINITIONSHAPE);
		if(!str_IFCPRODUCTDEFINITIONSHAPE){
			console.log('无效id');
			return;
		}
		// object_id
		var id_objectModel = strList[0];
		id_objectModel = id_objectModel.replace(/'/g,'');
		if(id_objectModel == "0nkrcUA719GuSoF3vmShwK"){
			console.log(id_objectModel);
		}


		var id_IFCSHAPEREPRESENTATION = str_IFCPRODUCTDEFINITIONSHAPE.slice(str_IFCPRODUCTDEFINITIONSHAPE.lastIndexOf("(")+1,str_IFCPRODUCTDEFINITIONSHAPE.lastIndexOf("))"));
		var str_IFCSHAPEREPRESENTATION = hashmap.get(id_IFCSHAPEREPRESENTATION);


		// #310= IFCSHAPEREPRESENTATION(#102,'Body','SweptSolid',(#309));
		var str_value_IFCSHAPEREPRESENTATION = ifc.getHashMapStringValue(id_IFCSHAPEREPRESENTATION);
		if(!str_value_IFCSHAPEREPRESENTATION){
			console.log('无效id');
			return;
		}

		var list = str_value_IFCSHAPEREPRESENTATION.split(",");
		var geometryType = list[list.length-2];
		geometryType = geometryType.replace(/'/g,'');
		if(geometryType != "SweptSolid"){
			console.log(geometryType + "无法处理");
			return;
		}
		var id_IFCEXTRUDEDAREASOLID = list[list.length-1].slice(1,list[list.length-1].length-1);
		var str_value_IFCEXTRUDEDAREASOLID = ifc.getHashMapStringValue(id_IFCEXTRUDEDAREASOLID);
		if(!str_value_IFCEXTRUDEDAREASOLID){
			console.log('无效id');
			return;
		}

		// #309= IFCEXTRUDEDAREASOLID(#305,#308,#19,125.);
		var list = str_value_IFCEXTRUDEDAREASOLID.split(",");
		var id_IFCRECTANGLEPROFILEDEF = list[0];
		var id_IFCAXIS2PLACEMENT3D = list[1];
		var id_dirction_z = list[2];
		var z_length = parseFloat(list[3]);

		// #305= IFCRECTANGLEPROFILEDEF(.AREA.,'\X2\900198CE\X0\',#304,4695.20168082382,1390.);
		var str_value_IFCRECTANGLEPROFILEDEF = ifc.getHashMapStringValue(id_IFCRECTANGLEPROFILEDEF);
		if(!str_value_IFCRECTANGLEPROFILEDEF){
			console.log('无效id');
			return;
		}

		var list = str_value_IFCRECTANGLEPROFILEDEF.split(",");
		var x_length = parseFloat(list[list.length-2]);
		var y_length = parseFloat(list[list.length-1]);


		// #308= IFCAXIS2PLACEMENT3D(#306,#19,#17);
		var str_value_IFCAXIS2PLACEMENT3D = ifc.getHashMapStringValue(id_IFCAXIS2PLACEMENT3D);
		if(!str_value_IFCAXIS2PLACEMENT3D){
			console.log('无效id');
			return;
		}

		var list = str_value_IFCAXIS2PLACEMENT3D.split(",");
		var id_IFCCARTESIANPOINT = list[0];
		var id_z_IFCDIRECTION = list[1];
		var id_x_IFCDIRECTION = list[2];


		var str_value_IFCCARTESIANPOINT = ifc.getHashMapStringValue(id_IFCCARTESIANPOINT);
		if(!str_value_IFCCARTESIANPOINT){
			console.log('无效id');
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





		var objectModel = model.getModel(id_objectModel);
		if(!objectModel){
			return;
		}

		var direction = {
			x : x_cartesian,
			y : y_cartesian,
			z : z_cartesian
		};
		var angle = getAngleByDirection(direction);
		var json = {
			name : id_objectModel,
			center : objectModel.getCenter(),
			direction : direction,
			angle : angle,
			size : {
				x : x_length,
				y : y_length,
				z : z_length
			},
			box : objectModel.getBox()
		}

		return json;

	}


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

	// 输出featuerTable
	function writeFeatureTable (jsons) {
		var position = [];
		var orientation = [];
		var scale = [];

		var first = jsons[0];



		for(var i = 0; i < jsons.length;++i){
			var json = jsons[i];
			position.push([json.center.getX(),
				json.center.getY(),
				json.center.getZ()]);
			var o_and_s = getOrientationScale(first,json);
			orientation.push(o_and_s.orientation);
			scale.push(o_and_s.scale);
		}

		var featureTableJson = {
			"position" : position,
			"orientation" : orientation,
			"scale" : scale
		};

		var jsonPath = path.join(model.getOutputFolderPath(),"featureTable.json");
		try {
		    fsExtra.writeJsonSync(jsonPath,featureTableJson);
		    model.sendMessage("info","创建featureTable.json成功");
		} catch(err) {
		    model.sendMessage("error","创建featureTable.json失败:"+err);
		}
	}

	function writeBatchTable (jsons) {
		var batchID = [];
		var name = [];
		for(var i = 0; i < jsons.length;++i){
			var json = jsons[i];
			batchID.push(i);
			name.push(json.name + "_1");
		}

		var batchTableJson = {
			"batchID" : batchID,
			"name" : name
		};

		var jsonPath = path.join(model.getOutputFolderPath(),"batchTable.json");
		try {
		    fsExtra.writeJsonSync(jsonPath,batchTableJson);
		    model.sendMessage("info","创建batchTable.json成功");
		} catch(err) {
		    model.sendMessage("error","创建batchTable.json失败:"+err);
		}
	}

	// function getOrientationScale (referenece,item) {
	// 	var first_direction = referenece.direction;
	// 	var direction = item.direction; 
	// 	var first_size = referenece.size;
	// 	var size = item.size;

	// 	var orientation = [0,0,0];
	// 	var scale = [1,1,1];
	// 	if(first_direction.x == direction.x && first_direction.y == direction.y && first_direction.z == direction.z){
	// 		orientation =  [0,0,0];
	// 		scale = [size.x/first_size.x,size.y/first_size.y,size.z/first_size.z];
	// 	}else if(first_direction.x == "#19" && first_direction.y == "#11"  && first_direction.z == "#17"){
	// 		if(direction.x == "#19" && direction.y == "#17" && direction.z == "#13"){
	// 			orientation =  [0,0,90];
	// 			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
	// 		}else if(direction.x == "#11" && direction.y == "#15" && direction.z == "#19"){
	// 			orientation =  [0,0,270];
	// 			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
	// 			// scale = [1,1,1];
	// 		}else if(direction.x == "#19" && direction.y == "#13" && direction.z == "#15"){
	// 			orientation =  [0,0,180];
	// 			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
	// 		}
	// 	}else if(first_direction.x == "#19" && first_direction.y == "#13"  && first_direction.z == "#15"){
	// 		if(direction.x == "#19" && direction.y == "#11" && direction.z == "#17"){
	// 			orientation =  [0,0,180];
	// 			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
	// 		}else if(direction.x == "#11" && direction.y == "#15" && direction.z == "#19"){
	// 			orientation =  [0,0,270];
	// 			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
	// 		}else if(direction.x == "#19" && direction.y == "#17" && direction.z == "#13"){
	// 			orientation =  [0,0,90];
	// 			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
	// 		}
	// 	}else if(first_direction.x == "#11" && first_direction.y == "#15"  && first_direction.z == "#19"){
	// 		if(direction.x == "#19" && direction.y == "#11" && direction.z == "#17"){
	// 			orientation =  [0,0,90];
	// 			scale = [size.x/first_size.x,size.y/first_size.y,size.z/first_size.z];
	// 		}else if(direction.x == "#19" && direction.y == "#13" && direction.z == "#15"){
	// 			orientation =  [0,0,90];
	// 			scale = [size.x/first_size.x,size.y/first_size.y,size.z/first_size.z];
	// 		}else if(direction.x == "#19" && direction.y == "#17" && direction.z == "#13"){
	// 			orientation =  [0,0,180];
	// 			scale = [size.x/first_size.x,size.y/first_size.y,size.z/first_size.z];
	// 		}
	// 	}
	// 	return {
	// 		orientation : orientation,
	// 		scale : scale
	// 	};
	// }

	// 新版本，按照向量计算
	function getOrientationScale (referenece,item) {
		var first_direction = referenece.direction;
		var first_angle = getAngleByDirection(first_direction);




		var direction = item.direction; 
		var first_size = referenece.size;
		var size = item.size;

		// var x = direction.x;
		// var y = direction.y;
		// var z = direction.z;
		// var r11 = x.x,r21 = x.y,r31= x.z;
		// var r21 = y.x,r22 = y.y,r32 = y.z;
		// var r31 = z.x,r23 = z.y,r33 = z.z;

		// var angle_x = Math.atan2(r32,r33);
		// var angle_y = Math.atan2(-r31,Math.sqrt(r32*r32+r33*r33));
		// var angle_z = Math.atan2(r21,r11);
		var angle = getAngleByDirection(direction);


		angle_x = angle.x - first_angle.x;
		angle_y = angle.y - first_angle.y;
		angle_z = angle.z - first_angle.z;


		var scale = [size.x/first_size.x,size.y/first_size.y,size.z/first_size.z];
		if(first_angle.z == -90 || first_angle.z== 90 ){
			scale = [size.y/first_size.y,size.x/first_size.x,size.z/first_size.z];
		}
		
		if(angle_z<0){
			// angle_z = 360 + angle_z;
			angle_z = -angle_z;
		}
		var orientation = [
			angle_x,
			angle_y,
			angle_z
		];
		return {
			orientation : orientation,
			scale : scale
		}
	}


	createOutputFolder();
	return readLines(ifc.getIFCPath(),parseLine)
		.then(function () {
			// return new Promise(function(resolve){
			// 	return resolve({
			// 		info :"success"
			// 	});
			// });
			readTypeObject(model,"");

		})
}

// function readTypeObject (model,objectType) {
// 	// console.log(objectType);
// 	var ifc = model.getIFC();
// 	var typeHashMap = ifc.getTypeHashMap();
// 	var list = typeHashMap.get("#317");
// 	if(list.length == 1){
// 		console.log('无需实例化');
// 		return;
// 	}


// }


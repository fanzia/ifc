var subdivideWlm = require("./subdivide/subdivideWlm");
var subdivideTujian = require("./subdivide/subdivideTujian");
var subdivideShuinuan = require("./subdivide/subdivideShuinuan");
var subdivideNeizhuangshi = require("./subdivide/subdivideNeizhuangshi");
var subdivideCommon = require("./subdivide/subdivideCommon");
var fsExtra = require('fs-extra');
var path = require('path');

module.exports = subdivide;

function subdivide (model) {

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
	
	function createOptionJson () {
		var json = {
            "longitude" : model.getCenter().getX(),
            "latitude" : model.getCenter().getY(),
            "transHeight" : 0.0,
            "geometricError" : 200,
            "region":         true,
            "box":            false,
            "sphere":         false
        }
        var outputFolderPath = model.getOutputFolderPath();
        var jsonPath = path.join(outputFolderPath,"option.json");
        try {
            fsExtra.writeJsonSync(jsonPath,json);
            model.sendMessage("info","创建option.json成功");
        } catch(err) {
            model.sendMessage("error","创建option.json失败:" + err);
        }
	}

	function createPositionsJson () {
        var json = {
            list : []
        };

        var models = model.getModels();
        models.forEach( function(objectModel, index) {
            var centerWorld = objectModel.getCenterWorld();
            var box = objectModel.getBox();
            var radius = box.getRadius();
            json["list"].push({
                id : objectModel.getName(),
                center : centerWorld,
                radius : radius
            });
        }); 
        var outputFolderPath = model.getOutputFolderPath();
        var jsonPath = path.join(outputFolderPath,"positions.json");
        try {
            fsExtra.writeJsonSync(jsonPath,json);
            model.sendMessage("info","创建positions.json成功");
        } catch(err) {
            model.sendMessage("error","创建positions.json失败:"+err);
        }
    }

    function createModelInfo () {
        var json = {
            uuid : model.getUuid(),
            type : model.getType(),
            count0 : model.getCount0(),
            countX : model.getCountX(),
            countY : model.getCountY(),
            countZ : model.getCountZ(),
            box : model.getBox()
        };

        var outputFolderPath = model.getOutputFolderPath();
        var jsonPath = path.join(outputFolderPath,"model.json");
        try {
            fsExtra.writeJsonSync(jsonPath,json);
            model.sendMessage("info","创建model.json成功");
        } catch(err) {
            model.sendMessage("error","创建model.json失败:"+err);
        }
    }

    createOutputFolder();
    createOptionJson();
    createPositionsJson();
    createModelInfo();

	var outputFolderPath = model.getOutputFolderPath();
	var jsonPath = path.join(outputFolderPath,"tileset.json");

	var type = model.getType();
	var json = null;
	switch (type) {
		case "wlm":
			// statements_1
			json = subdivideWlm(model);
			break;
		case "tujian":
            json = subdivideTujian(model);
			break;
		case "shuinuan":
            json = subdivideShuinuan(model);
			break;
		case "neizhuangshi":
            json = subdivideNeizhuangshi(model);
			break;
		case "common":
            json = subdivideCommon(model);
			break;
		default:
			json = subdivideCommon(model);
			break;
	}



	try {
		fsExtra.writeJsonSync(jsonPath,json);
        model.sendMessage("info","创建tileset.json成功");
	} catch(err) {
        model.sendMessage("error","创建tileset.json失败:" + err);
	}
	

	return new Promise(function(resolve){
		return resolve({
			model : model
		});
	});
}
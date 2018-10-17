2ooRya9v98lPGXZoNy8tOA
| -1  0 0  2751.28413748807 |
|  0 -1 0 11694.99824262250 |
|  0  0 1  4037.50000000000 |
|  0  0 0     1.00000000000 |
#480716= IFCAXIS2PLACEMENT3D(#6,$,$);
#480717= IFCLOCALPLACEMENT(#188,#480716);
#480718= IFCCARTESIANPOINT((0.,0.));
#480720= IFCAXIS2PLACEMENT2D(#480718,#23);
#480721= IFCRECTANGLEPROFILEDEF(.AREA.,'\X2\900198CE\X0\',#480720,4095.20168084039,1390.);
#480722= IFCCARTESIANPOINT((2751.28413748807,11694.9982426225,4037.5));
#480724= IFCAXIS2PLACEMENT3D(#480722,#19,#13);
#480725= IFCEXTRUDEDAREASOLID(#480721,#480724,#19,125.);
#480726= IFCSHAPEREPRESENTATION(#102,'Body','SweptSolid',(#480725));
#480728= IFCPRODUCTDEFINITIONSHAPE($,$,(#480726));
#480730= IFCFLOWSEGMENT('2ooRya9v98lPGXZoNy8tOA',#41,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1444219',$,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1209128',#480717,#480728,'1444219');
{"id":"2ooRya9v98lPGXZoNy8tOA","center":{"lon":2.0453748507063496,"lat":0.6828840835136902,"height":9.1},"radius":4.326476835342808,"center_m":{"lon":2.7512841374880677,"lat":11.6949982426225,"height":9.1}}



#487448= IFCAXIS2PLACEMENT3D(#6,$,$);
#487449= IFCLOCALPLACEMENT(#188,#487448);
#487450= IFCCARTESIANPOINT((-8.64019966684282E-12,0.));
#487452= IFCAXIS2PLACEMENT2D(#487450,#23);
#487453= IFCRECTANGLEPROFILEDEF(.AREA.,'\X2\900198CE\X0\',#487452,3715.20168084047,1390.);
#487454= IFCCARTESIANPOINT((81125.5581803069,15996.5982409131,4537.4625));
#487456= IFCAXIS2PLACEMENT3D(#487454,$,$);
#487457= IFCEXTRUDEDAREASOLID(#487453,#487456,#19,125.);
#487458= IFCSHAPEREPRESENTATION(#102,'Body','SweptSolid',(#487457));
#487460= IFCPRODUCTDEFINITIONSHAPE($,$,(#487458));
#487462= IFCFLOWSEGMENT('2ooRya9v98lPGXZoNy8sj7',#41,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1446966',$,'\X2\77E95F6298CE7BA1\X0\:\X2\900198CE\X0\:1209128',#487449,#487460,'1446966');




5494.89632939129,3252.39915974469,4537.4625

2751.28413748807,11694.9982426225,4037.5


5494.89632939129-2751.28413748807

3252.39915974469-11694.9982426225


4537.4625-4037.5



// 生成i3dm
E:\Cesium\ifc\public\data\output\a>obj23dtiles -i 0_0_0_0.obj --tileset --i3dm -f featureTable.json -p option.json -c 0_0_0_0_batchTable.json


全部
tileset_all = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url : "public/data/output/" + "e8f9ea17-3ed1-4ef6-8c63-dd275acfd7cf" + "/tiles",
}));
tileset_all.style = new Cesium.Cesium3DTileStyle({
       "show": "true","color":"rgba(0,233,0,0.2)"
    });

#317
showCesium("55d6649b-499a-4cdd-9088-f7bbf516d3fa");
tileset2 = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url : "public/data/output/" + "a" + "/Instanced0_0_0_0",
}));
tileset2.style = new Cesium.Cesium3DTileStyle({
   "show": "true","color":"color('#ff0000')"
});



#520
showCesium("1dd580f9-9c25-4436-b625-85938f24b7ce");
tileset2 = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url : "public/data/output/" + "a" + "/Instanced0_0_0_0",
}));
tileset2.style = new Cesium.Cesium3DTileStyle({
   "show": "true","color":"color('#ff0000')"
});


#696
showCesium("f76e437b-dae4-48a3-8fff-08dcd6649164");
tileset2 = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url : "public/data/output/" + "a" + "/Instanced0_0_0_0",
}));
tileset2.style = new Cesium.Cesium3DTileStyle({
   "show": "true","color":"color('#ff0000')"
});


#1802
showCesium("7495fb55-3fc7-4ca3-b50b-bfba20e31c95");
tileset2 = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url : "public/data/output/" + "a" + "/Instanced0_0_0_0",
}));
tileset2.style = new Cesium.Cesium3DTileStyle({
   "show": "true","color":"color('#ff0000')"
});




var model = {"id":"2BIZhdvlX6UO_$0XOmb8Fp","center":{"lon":2.0453754102588544,"lat":0.6828832690173224,"height":9.5825},"radius":1.5959966503743546,"center_m":{"lon":5.51989632939129,"lat":6.536399159296931,"height":9.5825}}
zoomTo(model);
function zoomTo (model) {
    if(model == null){
        return;
    }
    var center = Cesium.Cartesian3.fromRadians(model.center.lon,model.center.lat,model.center.height);
    var sphere = new Cesium.BoundingSphere(center,model.radius);
    viewer.camera.flyToBoundingSphere(sphere, {
                duration: 0.5
            });
    var tileset = viewer.scene.primitives.get(0);
    if(tileset == null){
        console.log('tileset is null');
        return;
    }
    tileset.style = new Cesium.Cesium3DTileStyle({
                
     color: {
        conditions: [
            ["regExp('" + model.id +"').test(String(${name}))", "rgb(255, 0, 0)"],
            ["true", "rgba(47, 232, 215,0.2)"]
        ]
        }    
            });
}



function addTest (uuid,refineType) {
    tileset_i3dm = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url : "public/data/output/"+uuid+"/objs/2_0_0_0/Instanced" + refineType
    }));
    tileset_i3dm.style = new Cesium.Cesium3DTileStyle({
       "show": "true","color":"rgba(255,0,0,1)"
    });


    tileset_b3dm = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url : "public/data/output/"+uuid + "/objs/2_0_0_0/Batchedb3dm_" + refineType
    }));
    tileset_b3dm.style = new Cesium.Cesium3DTileStyle({
       "show": "true","color":"rgba(0,255,0,1)"
    });
}



E:\Cesium\hengda\ifc\2-21\tujian\B1>IfcConvert.exe B1.ifc --use-element-guids --model-offset -362841.6568;-2923742.3293;0  --precision 5 


IfcConvert.exe B1.ifc --use-element-guids --model-offset -363113.111;-2923740.310;0  --precision 5 



.,3240599759

IfcConvert.exe B1.ifc --use-element-guids --model-offset -781175.512;-3240599.759;0  --precision 5 




    
    var refineType = "66904";
    var uuid_b = "134657ac-8899-48be-be87-d28049a86977";
    var uuid_i = "0f874673-bf3d-47c5-9ceb-c925ced48611";
    tileset_i3dm = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url : "public/data/output/"+uuid_i+"/objs/2_0_0_0/Instanced" + refineType
    }));
    tileset_i3dm.style = new Cesium.Cesium3DTileStyle({
       "show": "true","color":"rgba(255,0,0,1)"
    });


    tileset_b3dm = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url : "public/data/output/"+uuid_b + "/objs/2_0_0_0/Batchedb3dm_" + refineType
    }));
    tileset_b3dm.style = new Cesium.Cesium3DTileStyle({
       "show": "true","color":"rgba(0,255,0,1)"
    });


    362841.6568,2923742.3293

2-1 
363113.103,   2923740.312
363113.4111， 2923739.6185   1175550.0 到正北的角度17°57' 43"
-0.3081 0.6935
271.4462 -2.0173

2-2
363059.098, 2923757.821
363059.4069,2923757.1281    1175550.0 到正北的角度17.96°
-0.3089 0.6929
217.4412 15.4917

2-21
363113.111, 2923740.310
363113.4193,2923739.6169    1175550.0 到正北的角度17.96°

-0.3083 0.6931
271.4542 -2.0193
|  0.95125729235096980  0.30839838480300397 0  363113111 |
| -0.30839838480300397  0.95125729235096980 0 2923740310 |
|  0.00000000000000000 -0.00000000000000000 1          0 |
|  0.00000000000000000  0.00000000000000000 0          1 |




2-21-shui
781175512.,3240599759.
|  0.96253700286315880  0.27115036072114596 0  781175512 |
| -0.27115036072114596  0.96253700286315880 0 3240599759 |
|  0.00000000000000000 -0.00000000000000000 1          0 |
|  0.00000000000000000  0.00000000000000000 0          1 |


revit 基点
参考模型土建 - 21地块
781175.5111,3240599.7583   -19790.6   15.73°




备注
grid设置水暖，重新计算范围，防止范围不完整


'3J$wvBuV13cQZrEpwzDMIk',
'0DqP81Qgf4LhzEqZmjSXWV',
'0DqP81Qgf4LhzEqZmjSXWR',
'0DqP81Qgf4LhzEqZmjSZ9J',
'3rFteWDT5FewGQ3DzJ10yt',
'3rFteWDT5FewGQ3DzJ10ys',
'1VBqVb0v5Cq9wnVgW5emH2',
'2H6hn2HCz6OAT7a2fHiyap',
'1VBqVb0v5Cq9wnVgW5emCm',
'3rFteWDT5FewGQ3DzJ10yo',
'1VBqVb0v5Cq9wnVgW5em0C',
'1VBqVb0v5Cq9wnVgW5etg0',
'1VBqVb0v5Cq9wnVgW5etgh',
'1VBqVb0v5Cq9wnVgW5em0C',
'1VBqVb0v5Cq9wnVgW5etg0',



var styleList="3J$wvBuV13cQZrEpwzDMIk_1|0DqP81Qgf4LhzEqZmjSXWV_1|3rFteWDT5FewGQ3DzJ10yo_1|31fi3hgPHDVvSq8n4IbsoI_1|25vlNKCYD49O8ayEIrmVHF_1|0DqP81Qgf4LhzEqZmjSZ9J_1|0DqP81Qgf4LhzEqZmjSXWR_1";



tileset.style = new Cesium.Cesium3DTileStyle({
   "show": "regExp('" + styleList+"').test(String(${name}))"
});




ifc
363113.111, 2923740.310
362841.6568 2923742.3293  
  
x-a
x-b

271.4542 -2.0193
15249.1129183872,-15819.3945348475,0.



15.249+271.4542  -15.819-2.0193
15520.5671183872 ,-15821.4138348475



房间1中心点
286.7032,-17.8383

房间2中心点
9281.04932027608,-24022.8287416756
271.4542+9.281  -24.022-2.0193
280.7352  -26.0413

#343: 278.0451346182823,-20.782745273590088,-3.6099064302444455
readIFC.js:441 #1128: 273.9355863648935,-33.61782719450117,-4.3318939511243375

{"id":"0DqP81Qgf4LhzEqZmjSZ9J","center":{"lon":2.0454309469249274,"lat":0.6828778568455462,"height":-2.7175000000000002},"radius":12.551731115666882,"center_m":{"lon":280.31,"lat":-27.741500000000002,"height":-2.7175000000000002},"box":{"x":8.860000000000014,"y":6.876999999999999,"z":5.635}}


{"id":"3rFteWDT5FewGQ3DzJ10yt","center":{"lon":2.0454309964408415,"lat":0.6828776788234437,"height":-2.6750000000000003},"radius":17.07358966357105,"center_m":{"lon":280.55499999999995,"lat":-28.869,"height":-2.6750000000000003},"box":{"x":9.310000000000002,"y":13.192000000000004,"z":5.55}}
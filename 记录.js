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
Total: 36.671ms
function init () {
	// 展示地图
	showMap();
	getList();
	addEvent();
}

function addEvent () {
	$(".clear-tiles").click(function () {
		viewer.scene.primitives.removeAll();	
	})
}


function showMap () {
	viewer = new Cesium.Viewer('right',{
		  // imageryProvider : new Cesium.WebMapTileServiceImageryProvider({
		  //                               url : '/QuadServer/services/maps/wmts100',
		  //                               layer : 'world_image',
		  //                               style : 'default',
		  //                               format : 'image/jpeg',
		  //                               tileMatrixSetID : 'PGIS_TILE_STORE',
		  //                               // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
		  //                               minimumLevel: 0,
		  //                               maximumLevel: 19,
		  //                               credit : new Cesium.Credit('world_country'),
		  //                               tilingScheme : new Cesium.GeographicTilingScheme({rectangle : extent})
		  //                     })
	});
	viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
}

function getList () {
	$.ajax({
		url: '/getList',
		type: 'get',
		dataType: 'text',
	})
	.done(function(result) {
		// console.log("success");
		var json = JSON.parse(result);
		console.log(json);
		showList(json);
    
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	
}

function showList (json) {
	var error = json["error"];
	if(error){
		console.log(error);
		alert("暂时无法获取列表");
		return;
	}

	var list = json["list"];
	if(!list){
		return;
	}
	var html = `<ul>`;
	list.forEach( function(item, index) {
		var uuid = item.uuid;
		var output = item.output;
		var ifc = item.ifc;
		var date = item.time;
		date = formatDate(new Date(date));
		if(output){
			html += `<li uuid='${uuid}'>
			<div class='ifc-name'>${ifc}</div>
			<div class='ifc-time'>${date}</div>
			<div class='ifc-tool'><button>显示</button></div>
			<div class='clear'></div>
			</li>`;
		}else{
			html += `<li uuid='${uuid}'>
				<div class='ifc-name'>${ifc}</div>
				<div class='ifc-tool'><button disabled>显示</button></div>
				<div class='clear'></div>
				</li>`;
		}
		
	});
	
	html += `</ul>`;

	$("#left #list").html(html);

	$("#list .ifc-tool button").click(function () {
		var uuid = $(this).parents("li").attr("uuid");
		show3dtiles(uuid);
	})


	
}


function show3dtiles (uuid) {
	viewer.scene.primitives.removeAll();
	tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url : "public/data/output/" + uuid + "/tiles",
	}));
	tileset.readyPromise.then(function(tileset) {
	    viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0));
	     viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	})

}

function formatDate (date) {
	if(!date){
		return;
	}
	var yyyy = date.getFullYear().toString();
	var MM = (date.getMonth() + 1).toString();;
	var dd = date.getDate().toString();
	var hh = date.getHours().toString();
	var mm = date.getMinutes().toString();
	var ss = date.getSeconds().toString();
	 var result =  yyyy + '-' + (MM[1]?MM:"0"+MM[0]) 
	 + '-' + (dd[1]?dd:"0"+dd[0]) + ' ' + (hh[1]?hh:"0"+hh[0]) 
	 + ':' + (mm[1]?mm:"0"+mm[0]) + ':' + (ss[1]?ss:"0"+ss[0]);
	 return result;
}
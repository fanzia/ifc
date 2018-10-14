var file_uuid = null;
var ws = null;
var return_uuid = null;
var viewer = null;
var tileset = null;
var date = null;
var tile = null;
function init () {

	// ws = new WebSocket("ws://localhost:8181");


	initUploader();


	javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats(); $("#right")[0].appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='../js/stats.min.js';document.head.appendChild(script);})()

	// 开始处理
	$("#btn_begin").click(function(){
		beginConvert();
	});

	// 显示
	$("#btn_show").click(function () {
		showCesium(return_uuid);
	});

	// 展示地图
	showMap();

}

// 初始化上传控件	
function initUploader () {
	var list = $("#list");
	var uploader = WebUploader.create({

	    // swf文件路径
	    swf:  '/js/Uploader.swf',

	    // 文件接收服务端。
	    server: '/file_upload',

	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
	    // pick: '#picker',
	    pick : {
	    	id : "#picker",
	    	multiple : false
	    },


	    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
	    resize: false,
	    // accept :{
	    //     title: 'IFC文件',
	    //     extensions: 'ifc',
	    //     mimeTypes: 'text/*'
	    // }
	});
	var uploadState  = "pending";
	var  uploadBtn =$("#btn_upload");
	uploadBtn.click(function(){
		if(uploadState === 'uploading' ) {
			// 暂停上传
	        uploader.stop();
	    }else{
	    	// 上传
	        uploader.upload();
	    }
	});	

	$("#picker").mousedown(function(evt){
		evt.preventDefault();
		reset();		
	});

	//  当有文件被添加进队列的时候
	uploader.on( 'fileQueued', function( file ) {
	    var html = '<div class="file-item" id="' + file.id+ '">'
	    +	'	<div class="file-name" title="' + file.name + '">'
	    +			file.name
	    +	'	</div>'
	    +	'	<div class="progress">'
	    +	'		<div class="progress-bar"></div>'
	    +	'	</div>'
	    + 	'	<div class="state">等待上传</div>'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">任务名称：</div>'
	    +	'<input type="text" value="'+ file.name +'" class="model-name">'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">是否实例化：</div>'
	    +	'<select class="instanced">'
	    +	'	<option value="yes">实例化</option>'
	    +	'	<option value="no">不实例化</option>'
	    +	'</select>'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">中心点经度：</div>'
	    +	'<input type="text" value="117.19131460833329" class="center-lon">'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">中心点纬度：</div>'
	    +	'<input type="text" value="39.12627008333333" class="center-lat">'
	    +	'</div>'

	    // +	'<div class="file-item" >'
	    // +	'<div class="label">面个数：</div>'
	    // +	'<input type="text" value="5000" class="face-limit">'
	    // +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">类型：</div>'
	    +	'<select class="ifc-type">'
	    +	'	<option value="muqiang">幕墙</option>'
	    +	'	<option value="tujian">土建</option>'
	    +	'	<option value="wlm">外立面</option>'
	    +	'	<option value="shuinuan">水暖</option>'
	    +	'	<option value="neizhuangshi">内装饰</option>'
	    +	'</select>'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">0级个数：</div>'
	    +	'<input type="text" value="20" class="count-0">'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">X向个数：</div>'
	    +	'<input type="text" value="4" class="count-x">'
	    +	'</div>'
	   	+	'<div class="file-item" >'
	    +	'<div class="label">Y向个数：</div>'
	    +	'<input type="text" value="4" class="count-y">'
	    +	'</div>'
	    +	'<div class="file-item" >'
	    +	'<div class="label">Z向个数：</div>'
	    +	'<input type="text" value="1" class="count-z">'
	    +	'</div>'
	    list.html(html);
	    file_uuid = null;
	});
	// 文件上传过程中创建进度条实时显示。
	uploader.on( 'uploadProgress', function( file, percentage ) {
	    var progressbar = $("#" + file.id + " .progress-bar");
	     progressbar.css( 'width', percentage * 100 + '%' );
	     $("#" + file.id + " .state").html("上传中");
	});


	uploader.on( 'uploadSuccess', function( file,parm ) {
	    $("#" + file.id + " .state").html("上传成功");
	    var rawStr = parm._raw;
	    var json = JSON.parse(rawStr);
	    file_uuid = json.path;
	    console.log(file_uuid);
	    $("#btn_begin").show();
	});

	uploader.on( 'uploadError', function( file ) {
	    // $( '#'+file.id ).find('p.state').text('上传出错');
	    $("#" + file.id + " .state").html("上传失败");
	});

	uploader.on( 'uploadComplete', function( file ) {
	    // $( '#'+file.id ).find('.progress').fadeOut();
	});


	// 整体上传事件
	uploader.on( 'all', function( type ) {
	    if ( type === 'startUpload' ) {
	        uploadState = 'uploading';
	    } else if ( type === 'stopUpload' ) {
	        uploadState = 'paused';
	    } else if ( type === 'uploadFinished' ) {
	        uploadState = 'done';
	    }

	    if ( uploadState === 'uploading' ) {
	        uploadBtn.text('暂停上传');
	    } else {
	        uploadBtn.text('开始上传');
	    }
	});
}

function execute (filename,lon,lat,type,count_0,count_x,count_y,count_z,instanced,modelName,callback) {
	$.ajax({
		type:"get",
		url : "/model/" + filename + "/" + lon + "/" + lat + "/" + type+ "/" + count_0 + "/" + count_x + "/" + count_y + "/" + count_z
			+ "/"+ instanced +"/" + modelName,
		dataType : "text",
		success:function(result){
			console.log(result);
			if(callback){
				callback(result);
			}
		},
		error:function(xhr){
			var json = {
				"status" : "error",
				"message" : "失败"
			};
	        if(callback){
	        	callback(JSON.stringify(json));
	        }
	    }			
	});
}


// 开始处理
function beginConvert () {
	var lon = $(".center-lon").val();
	var lat = $(".center-lat").val();
	if(lon == "" || lat == ""){
		alert("请输入有效的中心点经纬度");
		return;
	}
	// var faceLimit = parseInt($(".face-limit").val());
	// if(faceLimit == null){
	// 	alert("请输入有效的面限制个数");
	// 	return;
	// }

	var count_0 = $(".count-0").val();
	var count_x = $('.count-x').val();
	var count_y = $(".count-y").val();
	var count_z = $(".count-z").val(); 
	var type = $(".ifc-type").val();

	var instanced = $(".instanced").val();
	var modelName = $(".model-name").val();

	date = new Date();
	execute(file_uuid,lon,lat,type,count_0,count_x,count_y,count_z,instanced,modelName,
		function(result){
		showMessage(result);
		result = JSON.parse(result);
		if(result.status == "begin"){
			
			var loc = window.location, new_uri;
			if (loc.protocol === "https:") {
			    new_uri = "wss:";
			} else {
			    new_uri = "ws:";
			}
			new_uri += "//" + loc.hostname + ":" + "8181";
			ws = new WebSocket(new_uri);
			// ws = new WebSocket("ws://localhost:8181");
			ws.onopen = function (e) {
	            console.log('连接到服务端');
	        }
			ws.onmessage = function (e) {
		    	var data = e.data;
		    	var res = showMessage(data);
		    	if(res){
		    		var delta = new Date() - date;
		    		console.log('total time is ' + (delta/1000/60).toFixed(2) + "min");
		    		var html = '<div class="' + "success" + '">转换完成</div>';
		    		$(".info-div").html(html);
		    		return_uuid = res;
		    		$("#btn_show").show();
		    		
		    	}
		    }
		}
	});
}

// 显示实时信息
function showMessage (result) {
	result = JSON.parse(result);
	var className = "info";
	if(result.status == "error"){
		className = "error";
	}else if(result.status == "info"){
		className = "info";
	}else if(result.status == "success"){
		className = "success";
		return result.message;
	}
	var html = '<div class="' + className + '">' + result.message + '</div>';
	$(".info-div").html(html);
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
function showCesium (uuid) {
	viewer.scene.primitives.removeAll();
	tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url : "public/data/output/" + uuid + "/tiles/tileset.json",
	}));
	tileset.readyPromise.then(function(tileset) {
	    viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0));
	     viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	})


	// addMoveEvent();

	var event = function(t){
	    tile = t;       
	    tileset.tileVisible.removeEventListener(tileVisible_event);
	};
	this.tileVisible_event = event;
	tileset.tileVisible.addEventListener(event);
}


// 重置
function reset () {
	$("#list,.info-div").empty();
	$("#btn_begin,#btn_show").hide();
	viewer.scene.primitives.remove(tileset);
	tileset = null;
	return_uuid = null;
	file_uuid = null;

}




function addMoveEvent () {
    // HTML overlay for showing feature name on mouseover
    var nameOverlay = document.createElement('div');
    viewer.container.appendChild(nameOverlay);
    nameOverlay.className = 'backdrop';
    nameOverlay.style.display = 'none';
    nameOverlay.style.position = 'absolute';
    nameOverlay.style.bottom = '0';
    nameOverlay.style.left = '0';
    nameOverlay.style['pointer-events'] = 'none';
    nameOverlay.style.padding = '4px';
    nameOverlay.style.backgroundColor = 'black';
    nameOverlay.style.color = 'white';
    var selected = {
        feature: undefined,
        originalColor: new Cesium.Color()
    };

    // Information about the currently highlighted feature
    var highlighted = {
        feature: undefined,
        originalColor: new Cesium.Color()
    };

    // An entity object which will hold info about the currently selected feature for infobox display
    var selectedEntity = new Cesium.Entity();

    // Color a feature yellow on hover.
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
        // If a feature was previously highlighted, undo the highlight
        if (Cesium.defined(highlighted.feature)) {
            highlighted.feature.color = highlighted.originalColor;
            highlighted.feature = undefined;
        }

        // Pick a new feature
        var pickedFeature = viewer.scene.pick(movement.endPosition);
        if (!Cesium.defined(pickedFeature)) {
            nameOverlay.style.display = 'none';
            return;
        }

        // A feature was picked, so show it's overlay content
        nameOverlay.style.display = 'block';
        nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
        nameOverlay.style.left = movement.endPosition.x + 'px';
        if(!Cesium.defined(pickedFeature.getProperty)){
            return;
        }
        var name = pickedFeature.getProperty('name');
        if (!Cesium.defined(name)) {
            name = pickedFeature.getProperty('id');
            if (!Cesium.defined(name)) {
                name = pickedFeature.getProperty("batchIdnew");
            }
        }
        console.log(name);
        nameOverlay.textContent = name;

        // Highlight the feature if it's not already selected.
        if (pickedFeature !== selected.feature) {
            highlighted.feature = pickedFeature;
            Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
            pickedFeature.color = Cesium.Color.YELLOW;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
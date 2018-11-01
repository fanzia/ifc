var express = require('express');
var app = express();
var fs = require("fs");
var formidable = require("formidable");
var uuidv4 = require('uuid/v4');
var url = require('url');
var compression = require('compression');
_ = require("underscore");
wu = require("./webuploader");
var path = require("path");
var bodyParser = require('body-parser');
var convert = require("./convert");
var getList = require("./service/getList");
var getInfo = require("./service/getInfo");
var remove = require("./service/remove");



var ws = null;
var file_uuid = null;
var center_lon = null, center_lat = null,face_limit = null;
var g_params = null;


// 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());


// 首页
app.get('/index.htm', function (req, res) {
	res.sendFile( __dirname + "/public/" + "index.htm" );
})

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


// 访问tiles
app.get('/public/data/output/*', function(req, res,next) {
    var buffer = Buffer.alloc(3);
    var reqUrl = url.parse(req.url, true);
    var filePath = reqUrl.pathname.substring(1);
    res.sendFile(path.join(process.cwd(),filePath));
});
// 上传
app.post('/file_upload',function(req,res){
    var form = new formidable.IncomingForm({uploadDir:"tmp"});  //避免EXDEV问题
    form.parse(req, function(err, fields, files){
        var file_uuid = uuidv4();
        if(_.isUndefined(fields.status)){ //分片上传
            var upDir = "";
            var isChunks = !(_.isUndefined(fields.chunks) || parseInt(fields.chunks) <= 0);
            if(isChunks){
                upDir = path.join("public/data/upload",file_uuid, wu.createUniqueFileName(fields));
            }else{
                upDir = path.join("public/data/upload",file_uuid);
            }

            fs.mkdir(upDir, function(err){
                if(_.isNull(err) || err.code === "EEXIST"){

                    var newFileName = "";

                    if(isChunks){
                        //更新tmp文件的修改时间
                        fs.open(upDir+".tmp", "w", function(err, fd){
                            if(err){
                                //todo
                                console.error(err);

                            }else{
                                var time = new Date();
                                fs.futimes(fd, time, time, function(err){
                                    if(err){
                                        //todo
                                        console.error(err);
                                    }

                                    fs.close(fd);
                                });
                            }
                        });


                        newFileName = fields.chunk;
                    }else{
                        // newFileName = wu.randomFileName(path.extname(files.file.name));
                        newFileName = files.file.name;
                    }

                    
                    fs.rename(files.file.path, path.join(upDir, newFileName), function(err){
                        if(err){
                            //todo
                            console.error(err);
                            res.end('{"status":0}');
                            return ;
                        }

                        res.end('{"status":1, "path":"'+ file_uuid +'"}');
                    });

                }else{
                    //todo
                    console.error(err);
                    res.end('{"status":0}');
                }
            });


        }else if(fields.status == "md5Check"){  //秒传校验

            //todo 模拟去数据库中校验md5是否存在
            if(fields.md5 == "b0201e4d41b2eeefc7d3d355a44c6f5a"){
                res.end('{"ifExist":1, "path":"kazaff2.jpg"}');
            }else{
                res.end('{"ifExist":0}');
            }


        }else if(fields.status == "chunkCheck"){  //分片校验

            fs.stat(path.join(config.uploadDir, fields.name, fields.chunkIndex), function(err, stats){
                if(err || stats.size != fields.size){
                    res.end('{"ifExist":0}');
                }else{
                    res.end('{"ifExist":1}');
                }
            });
        }else if(fields.status == "chunksMerge"){   //分片合并

            //同步机制
            if(_.contains(lockMark, fields.name)){

                res.end('{"status":0}');
            }else{

                lockMark.push(fields.name);

                var newFileName = wu.randomFileName(fields.ext);
                var targetStream = fs.createWriteStream(path.join(config.uploadDir, newFileName));
                wu.chunksMerge(path.join(config.uploadDir, fields.name), targetStream, fields.chunks, function(err){

                    if(err){
                        //todo
                        console.error(err);
                        res.end('{"status":0}');
                        return ;
                    }

                    targetStream.end(function(){
                        //删除文件夹和tmp
                        fs.unlink(path.join(config.uploadDir, fields.name) + ".tmp", function(err){
                            if(err){
                                //todo
                                console.error(err);
                            }
                        });
                        fs.rmdir(path.join(config.uploadDir, fields.name), function(err){
                            if(err){
                                //todo
                                console.error(err);
                            }
                        });

                        lockMark = _.without(lockMark, fields.name);

                        res.end('{"status":1, "path":"' + newFileName + '"}');
                    });

                });
            }
        }
    });
});

// 执行转换操作
app.get('/model/:uuid/:lon/:lat/:type/:count_0/:count_x/:count_y/:count_z/:instanced/:modelName/:wall_delta/:contain_slab/:draco',function(req,res){
    var uuid = req.params.uuid;
    var lon = req.params.lon;
    var lat = req.params.lat;
    // var faceLimit = req.params.faceLimit;
    var type = req.params.type;
    var count_0 = req.params.count_0;
    var count_x = req.params.count_x;
    var count_y = req.params.count_y;
    var count_z = req.params.count_z;
    var instanced = req.params.instanced;
    if(instanced == "no"){
        instanced = false;
    }else{
        instanced = true;
    }
    var modelName = req.params.modelName;
    var wall_delta = req.params.wall_delta;
    var contain_slab = req.params.contain_slab;
    var draco = req.params.draco;
    if(draco == "no"){
        draco = false;
    }else{
        draco = true;
    }
    if(uuid == null || lon == null || lat == null || type == null
        || count_0 == null || count_x == null || count_y == null || count_z == null){
        response = {
           message:'无效信息', 
           status : "error",
        };
        res.send(JSON.stringify(response));
        return;
    }
    response = {
        message:'开始转换……', 
        status : "begin",
    };
    
    file_uuid = uuid;
    center_lon = lon;
    center_lat = lat;
    g_params = {
        type : type,
        count_0 : count_0,
        count_x : count_x,
        count_y : count_y,
        count_z : count_z,
        instanced : instanced,
        modelName : modelName,
        wall_delta : wall_delta,
        contain_slab : contain_slab,
        draco : draco
    };




    var WebSocketServer = require('ws').Server;
    // 避免重复添加
    if(ws == null){
        var wss = new WebSocketServer({ port: 8181 });
        wss.on('connection', function (ws_c) {
            ws = ws_c;
            console.log('连接到客户端');
            convert(file_uuid,{
                lon : center_lon,
                lat : center_lat,
                // faceLimit : face_limit,
                ws : ws,
                type : g_params.type,
                count_0 : g_params.count_0,
                count_x : g_params.count_x,
                count_y : g_params.count_y,
                count_z : g_params.count_z,
                instanced : g_params.instanced,
                modelName : g_params.modelName,
                wallDelta : g_params.wall_delta,
                containSlab : g_params.contain_slab,
                draco : g_params.draco
            });

            file_uuid = null, center_lon = null,center_lat = null,face_limit = null;
            g_params = null;
            ws.on('message', function (message) {
                console.log(message);
            });
        });
    }

    res.send(JSON.stringify(response));
});


app.get('/getList',function (req,res) {
    var json = getList();
    res.send(JSON.stringify(json));
})

app.get('/getInfo/:uuid',function (req,res) {
    var uuid = req.params.uuid;
    var json = getInfo(uuid);
    res.send(JSON.stringify(json));
})


app.get('/remove/:uuid',function (req,res) {
    var uuid = req.params.uuid;
    remove(uuid)
        .then(function (json) {
            res.send(JSON.stringify(json));
        });
    
})
var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
  console.log("访问地址为 http://%s:%s", host, port)
});



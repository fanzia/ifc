var Point = require("./point");

class Box {

    constructor(box) {
        this.min_lon = box.min_lon;
        this.max_lon = box.max_lon;
        this.min_lat = box.min_lat;
        this.max_lat = box.max_lat;
        this.min_height = box.min_height;
        this.max_height = box.max_height;
    }
    //类中函数
    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }

    getCenter(){
        return new Point((this.max_lon + this.min_lon)/2,
            (this.max_lat + this.min_lat)/2,
            (this.max_height + this.min_height)/2)
    }

    toObject(){
        return{
            min_lon :this.min_lon ,
            max_lon :this.max_lon ,
            min_lat :this.min_lat ,
            max_lat :this.max_lat ,
            min_height :this.min_height ,
            max_height :this.max_height 
        };
    }


    toArray(){
        return [this.min_lon,this.min_lat,this.max_lon,this.max_lat,
        this.min_height,this.max_height];
    }


    scaled(scale){
        var center = this.getCenter();
        var lonLength = this.max_lon - this.min_lon;
        var latLength = this.max_lat - this.min_lat;
        var heightLength =this.max_height - this.min_height;

        // var min_lon = center.lon - lonLength * scale /2;
        // var min_lat = center.lat - latLength * scale /2;
        // var min_height = center.height - heightLength * scale /2;

        return new Box({
            min_lon : center.lon - lonLength * scale /2,
            max_lon : center.lon + lonLength * scale /2,
            min_lat : center.lat - latLength * scale /2,
            max_lat : center.lat + latLength * scale /2,
            min_height : center.height - heightLength * scale /2,
            max_height : center.height + heightLength * scale /2
        });
    }

    getArea(){
        return (this.max_lon - this.min_lon)* (this.max_lat - this.min_lat)
        *(this.max_height - this.min_height);
    }

    getHeight(){
        return this.max_height - this.min_height;
    }

    getRadius(){
        return Math.sqrt(Math.pow(this.max_lat - this.min_lat,2) + Math.pow(this.max_lon - this.min_lon,2) + Math.pow(this.max_height - this.min_height,2))
    }

    // 合并
    merge(b){
        var min_lon = this.min_lon > b.min_lon ? b.min_lon : this.min_lon;
        var max_lon = this.max_lon < b.max_lon ? b.max_lon : this.max_lon;
        var min_lat = this.min_lat > b.min_lat ? b.min_lat : this.min_lat;
        var max_lat = this.max_lat < b.max_lat ? b.max_lat : this.max_lat;
        var min_height = this.min_height > b.min_height ? b.min_height : this.min_height;
        var max_height = this.max_height < b.max_height ? b.max_height : this.max_height;

        return new Box({
            min_lon : min_lon,
            max_lon : max_lon,
            min_lat : min_lat,
            max_lat : max_lat,
            min_height : min_height,
            max_height : max_height
        });
    }

    // 长宽高中最大的
    getLength(){
        return Math.max(this.max_lon-this.min_lon,this.max_lat-this.min_lat,this.max_height - this.min_height);
    }

    isPointIn(point){
        if(!point){
            return false;
        }
        if(point.lon <= this.max_lon && point.lon >= this.min_lon
            && point.lat <= this.max_lat && point.lat >= this.min_lat
            && point.height <= this.max_height && point.height >= this.min_height){
            return true;
        }
        return false;
    }
}

module.exports = Box;

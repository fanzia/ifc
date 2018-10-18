var lineIntersect = require("line-intersect");

main();
function main () {
	var point1 = {
		// x : 278.0451346182823,
		// y : -20.782745273590088
		x:278.0280859375,
		y:-22.4319375
		// #343: 277.005,-27.411,-2.9200000000000004
	}
	var point2 = {
		// x : 273.9355863648935,
		// y : -33.61782719450117
		x:276.8559225463867,
		y:-29.89355810546875
	}

	var box = {
		max_height:0.1,
		max_lat:-22.273,
		max_lon:285.21,
		min_height:-5.45,
		min_lat:-35.465,
		min_lon	:275.9
	};

	// var box = {
	// 	max_height:0.1,
	// 	max_lat:-24.303,
	// 	max_lon:284.74,
	// 	min_height:-5.535,
	// 	min_lat:-31.18,
	// 	min_lon	:275.88
	// }

	// 3rFteWDT5FewGQ3DzJ10yo
	// var box = {
	// 	max_height:0.1,
	// 	max_lat:-19.618,
	// 	max_lon:279.88,
	// 	min_height:-5.535,
	// 	min_lat:-26.206,
	// 	min_lon	:269.26
	// }
	var result = lineIntersect.checkIntersection(point1.x,point1.y,point2.x,point2.y
		,box.min_lon,box.min_lat,box.max_lon,box.max_lat);
	console.log(result);
}
var ffi = require('ffi');
// 使用ffi调用dll文件，进行
var addDll = ffi.Library('addDll.dll',{
	'add' : ['int',['int','int']]
});

var dd = addDll.add(3,5);
console.log(dd);
"use strict";

var aws = require('aws-sdk');

/*
http://stackoverflow.com/questions/5171213/load-vanilla-javascript-libraries-into-node-js

There is a much better method than using eval: the vm module.

For example, here is my execfile module, which evaluates the script at path in either context or the global context:
*/

var vm = require("vm");
var fs = require("fs");

module.exports = function(path, context) {
  context = context || {};
  var data = fs.readFileSync(path);
  vm.runInNewContext(data, context, path);
  return context;
}

/*
And it can be used like this:

> var execfile = require("execfile");
> // `someGlobal` will be a global variable while the script runs
> var context = execfile("example.js", { someGlobal: 42 });
> // And `getSomeGlobal` defined in the script is available on `context`:
> context.getSomeGlobal()
42
> context.someGlobal = 16
> context.getSomeGlobal()
16
Where example.js contains:

function getSomeGlobal() {
    return someGlobal;
}
The big advantage of this method is that you've got complete control over the global variables in the executed script: you can pass in custom globals (via context), and all the globals created by the script will be added to context. Debugging is also easier because syntax errors and the like will be reported with the correct file name.
*/
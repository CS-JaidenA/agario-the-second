/** @type {{random:function():string, options:string[]}} */
const colour = {};

colour.random   = () => colour.options[Math.floor(Math.random() * colour.options.length)];
colour.options  = ["red", "orange", "yellow", "green", "blue", "purple"];

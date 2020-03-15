const fs = require('fs');
const pegjs = require('./pegjs/packages/pegjs');

const grammar = fs.readFileSync("./ftlang.pegjs").toString();
const parser = pegjs.generate(grammar, {output: "source", format:"umd", cache:false});

fs.writeFileSync("./parser.js", parser);

console.log('done.');
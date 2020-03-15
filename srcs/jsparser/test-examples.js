const fs = require("fs");

const parser = require("./parser");
const checker = require("./checker");
const process = require("process");
const { Scopable } = require('./definitions.js');
const { scope2text } = require('./checker-utils.js')();

function getColoredType(type)
{
	switch(type)
	{
		case "error":
			return "\x1b[31merror\x1b[37m";
		case "warn":
			return "\x1b[33mwarn\x1b[37m";
		case "fatal":
			return "\x1b[41mfatal\x1b[40m";
		case "note":
			return "\x1b[90mnote";
		default:
			return type;
	}
}

function test_example(file) {
	const content = fs.readFileSync("./../../examples/" + file).toString();

	console.log('--- "' + file + '" ---');
	console.time('parsing');
	let ast;
	try {
		ast = parser.parse(content);
	}
	catch(e){
		console.log(e.message);
		return;
	}
	console.timeEnd('parsing');

	ast.file = file;

	console.time('checking');
	const report = checker.check(ast, {file});
	console.timeEnd('checking')

	if(report.logs.length > 0)
	{
		const splitted = content.split('\n');
		for (const log of report.logs) {
			const {type, message, module, scopestack, location, node} = log;
			const {line, column} = location.start;

			if(type)
			{
				const start_line = line-1-1;
				const end_line = location.end.line+1;
				console.log(`\x1b[100m\nscope: ${scope2text(scopestack)}, node: ${node.constructor.name}\x1b[40m\n`
				+splitted.slice(start_line, end_line)
				.map( (s,i) => s.replace(/(?![a-zA-Z]|\x1b\[)([0-9]+)/g, "\x1b[95m$1\x1b[37m"))
				.map((s, i) => "\x1b[90m"+(start_line+i+1)+"\x1b[37m\t"+s)
				.join('\n')
				.replace(/(else|if|ret|class|enum|const|let|unstable)(?![a-zA-Z0-9])/g, "\x1b[91m$1\x1b[37m"));
			}
			console.log(`"${module.file}"[${line}:${column}] ${getColoredType(type)}: ${message}`);
		}
	}

	if (report.done) {
		console.log('done compilated.');
	}

	return { ast };
}

const file = process.argv[2];
const mode = process.argv[3] || "";

if (mode === "mapid") {
	const { ast } = test_example(file);
	console.log('Mapping ids:');
	ast.symbols.forEach((d, i) => {
		console.log(i + ' = ' + d.constructor.name)
		if (d instanceof Scopable) {
			d.symbols.forEach((d, j) => console.log(i + "." + j + ' = ' + d.constructor.name));
		}
	});

}
else if (mode.slice(0,3) === "cst") {
	const { ast: cst } = test_example(file);
	const vm = require('vm');
	console.log(eval(mode.replace(/@([a-zA-Z0-9]+)/g, ".symbols.get('$1')")));
}
else if(mode.slice(0,3) === "ast")
{
	const content = fs.readFileSync("./../../examples/" + file).toString();
	console.log('--- "' + file + '" ---');
	console.time('parsing');
	const ast = parser.parse(content);
	console.timeEnd('parsing');
	const vm = require('vm');
	console.log(eval(mode));
}
else {
	test_example(file);
}
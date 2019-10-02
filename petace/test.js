
const { doc, func, reg, arg, label } = require('./petacelib');

const main_doc = doc("main")

const f = func("multiply", "int")

const a = arg("int"), b = arg("int");
const r0 = reg("int"), r1 = reg("int");
const start = label(), end = label();

r0.set(0)
r1.set(0)
start.target =
end.jle(r0, a)
r1.add(b)
r0.inc()
start.jmp()
end.target =
f.ret(r1)

const colorscli = require('colors-cli');

console.log(
	main_doc.generateMnemonicCode()
	)
/*const code = main_doc.generate();

const fs = require('fs');

fs.writeFileSync("./test.c", code);*/
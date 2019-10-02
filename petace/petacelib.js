let i = 0;

// petace instruction set
const
	RETC = i++, RETR = i++, RETA = i++,
	ADDR = i++, ADDC = i++, ADDA = i++, SUBR = i++, SUBC = i++, SUBA = i++, MULR = i++, MULC = i++, MULA = i++,
	DIVR = i++, DIVC = i++, DIVA = i++, MODR = i++, MODC = i++, MODA = i++, ANDR = i++, ANDC = i++, ANDA = i++,
	XORR = i++, XORC = i++, XORA = i++, ORR = i++, ORC = i++, ORA = i++, LANDR = i++, LANDC = i++, LANDA = i++,
	LORR = i++, LORC = i++, LORA = i++, SETR = i++, SETC = i++, SETA = i++, MOV = i++,
	INC = i++, DEC = i++, NEG = i++, INV = i++, JMP = i++, 
	JLER = i++, JLR = i++, JGER = i++, JGR = i++, JER = i++, JLEC = i++, JLC = i++, JGEC = i++, JGC = i++, JEC = i++, 
	JLEA = i++, JLA = i++, JGEA = i++, JGA = i++, JEA = i++;

const mnemonic = [
	"RETC", "RETR", "RETA",
	"ADDR", "ADDC", "ADDA", "SUBR", "SUBC", "SUBA", "MULR", "MULC", "MULA",
	"DIVR", "DIVC", "DIVA", "MODR", "MODC", "MODA", "ANDR", "ANDC", "ANDA",
	"XORR", "XORC", "XORA", "ORR", "ORC", "ORA", "LANDR", "LANDC", "LANDA",
	"LORR", "LORC", "LORA", "SETR", "SETC", "SETA", "MOV",
	"INC", "DEC", "NEG", "INV", "JMP", 
	"JLER", "JLR", "JGER", "JGR", "JER", "JLEC", "JLC", "JGEC", "JGC", "JEC",
	"JLEA", "JLA", "JGEA", "JGA", "JEA"
];

class PetaceDocument {
	constructor(name) {
		this.name = name;
		this.symbols = new Map();
	}

	addFunction(function_) {
		this.symbols.set(function_.name, function_);
	}

	generateMnemonicCode()
	{
		let code = "DOCUMENT("+this.name+") {\n";
		this.symbols.forEach( symbol => {
			if(symbol instanceof PetaceFunction)
				code += symbol.generateMnemonicCode();
		});
		return code.replace(/\n/g, '\n\t') + '\n}';
	}
}

class PetaceRegister {
	constructor(type) {
		this.type = type;
		this.function = null;
		this.use_as_address = false;
	}

	get unref() {
		this.use_as_address = true;
	}

	add(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [ADDA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [ADDR, this, operand]);
		}
		else
			this.function.nodes.push(node = [ADDC, this, operand]);
		return node;
	}
	sub(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [SUBA, this, operand]);
				operand.use_as_address = false; INC
			}
			else
				this.function.nodes.push(node = [SUBR, this, operand]);
		}
		else
			this.function.nodes.push(node = [SUBC, this, operand]);
		return node;
	}
	mul(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [MULA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [MULR, this, operand]);
		}
		else
			this.function.nodes.push(node = [MULC, this, operand]);
		return node;
	}
	div(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [DIVA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [DIVR, this, operand]);
		}
		else
			this.function.nodes.push(node = [DIVC, this, operand]);
		return node;
	}
	mod(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [MODA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [MODR, this, operand]);
		}
		else
			this.function.nodes.push(node = [MODC, this, operand]);
		return node;
	}
	and(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [ANDA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [ANDR, this, operand]);
		}
		else
			this.function.nodes.push(node = [ANDC, this, operand]);
		return node;
	}
	xor(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [XORA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [XORR, this, operand]);
		}
		else
			this.function.nodes.push(node = [XORC, this, operand]);
		return node;
	}
	or(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [ORA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [ORR, this, operand]);
		}
		else
			this.function.nodes.push(node = [ORC, this, operand]);
		return node;
	}
	land(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [LANDA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [LANDR, this, operand]);
		}
		else
			this.function.nodes.push(node = [LANDC, this, operand]);
		return node;
	}
	lor(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [LORA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [LORR, this, operand]);
		}
		else
			this.function.nodes.push(node = [LORC, this, operand]);
		return node;
	}
	set(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [SETA, this, operand]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [SETR, this, operand]);
		}
		else
			this.function.nodes.push(node = [SETC, this, operand]);
		return node;
	}
	inc() {
		let node;
		this.function.nodes.push(node = [INC, this]);
		return node;
	}
	dec() {
		let node;
		this.function.nodes.push(node = [DEC, this]);
		return node;
	}
	not() {
		let node;
		this.function.nodes.push(node = [NOT, this]);
		return node;
	}
	inv() {
		let node;
		this.function.nodes.push(node = [INV, this]);
		return node;
	}
	dec() {
		let node;
		this.function.nodes.push(node = [DEC, this]);
		return node;
	}
	mov(address) {
		let node;
		this.function.nodes.push(node = [MOV, this, address]);
		return node;
	}
}

class PetaceArgument extends PetaceRegister {
}

class PetaceFunction {
	constructor(name, type) {
		this.name = name;
		this.return_type = type;
		this.args = [];
		this.registers = [];
		this.nodes = [];
		this.labels = [];
	}

	addLabel(label) {
		this.labels.push(label);
		label.function = this;
	}

	removeLabel(label) {
		this.labels.splice(this.labels.indexOf(label), 1);
		label.function = null;
	}

	addArgument(arg) {
		this.args.push(arg);
		arg.function = this;
	}

	removeArgument(arg) {
		this.args.splice(this.args.indexOf(arg), 1);
		arg.function = null;
	}

	addRegister(register) {
		this.registers.push(register);
		register.function = this;
	}

	removeRegister(register) {
		this.registers.splice(this.registers.indexOf(register), 1);
		register.function = null;
	}

	addNode(node) {
		this.nodes.push(node);
	}

	removeNode(node) {
		this.nodes.splice(this.nodes.indexOf(node), 1);
	}

	ret(operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.nodes.push([node = RETA, operand]);
				operand.use_as_address = false;
			}
			else
				this.nodes.push(node = [RETR, operand]);
		}
		else
			this.nodes.push(node = [RETC, operand]);
		return node;
	}

	generateMnemonicCode() {
		const registers_labels = this.registers.map((_, i) => 'r' + i);
		const args_labels = this.args.map((_, i) => 'arg' + i);
		const operandText = operand => {
			if (operand instanceof PetaceArgument)
				return args_labels[this.args.indexOf(operand)];
			else if (operand instanceof PetaceRegister)
				return registers_labels[this.registers.indexOf(operand)];
			else if (typeof operand === "number")
				return operand.toString();
			else if (operand instanceof PetaceLabel)
				return '$' + this.computeNodeOffset(operand.target).toString(16);
			return "!!";
		}
		const instructions = this.nodes.map( node => {
			return "$" + this.computeNodeOffset(node).toString(16) + '\t'
			+ mnemonic[node[0]]
			+ '\t'
			+ node.slice(1).map(operand => operandText(operand)).join('\t')
		});
		const args = this.args.map((arg, i) => arg.type + ' arg' + i);
		const type = (this.return_type !== "void" ? ': ' + this.return_type : '');
		const registers = this.registers.map((reg, i) => reg.type + " r" + i+';');
		return this.name + '(' + args.join(', ') + ')' + type + '\n{\n\t' + registers.join(' ') + '\n\n\t' + instructions.join('\n\t') + '\n}';
	}

	computeLabelsOffset() {
		this.labels.sort((a,b) => this.nodes.indexOf(a.target) - this.nodes.indexOf(b.target));
		for(const label of this.labels)
		{
			label.offset = this.computeNodeOffset(label.target);
		}
	}

	computeNodeOffset(target) {
		let offset = 0;
		for (const node of this.nodes) {
			if (node === target)
				return offset;
			if (node[0] <= MOV)
				offset += 3;
			else if(node[0] <= JMP)
				offset += 2;
			else
				offset += 4;
		}
		return -1;
	}

}

class PetaceLabel {
	constructor() {
		this.function = null;
		this.target = null;
	}

	jmp() {
		this.function.nodes.push([JMP, this]);
	}

	jle(register, operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [JLEA, register, operand, this]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [JLER, register, operand, this]);
		}
		else
			this.function.nodes.push(node = [JLEC, register, operand, this]);
		return node;
	}
	jl(register, operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [JLA, register, operand, this]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [JLR, register, operand, this]);
		}
		else
			this.function.nodes.push(node = [JLC, register, operand, this]);
		return node;
	}
	jge(register, operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [JGEA, register, operand, this]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [JGER, register, operand, this]);
		}
		else
			this.function.nodes.push(node = [JGEC, register, operand, this]);
		return node;
	}
	jg(register, operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [JGA, register, operand, this]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [JGR, register, operand, this]);
		}
		else
			this.function.nodes.push(node = [JGC, register, operand, this]);
		return node;
	}
	je(register, operand) {
		let node;
		if (operand instanceof PetaceRegister) {
			if (operand.use_as_address) {
				this.function.nodes.push(node = [JEA, register, operand, this]);
				operand.use_as_address = false;
			}
			else
				this.function.nodes.push(node = [JER, register, operand, this]);
		}
		else
			this.function.nodes.push(node = [JEC, register, operand, this]);
		return node;
	}
}

let current_document = new PetaceDocument(), current_function = new PetaceFunction();

function doc(name) {
	if (!name) throw new Error("document name invalid");
	current_document = new PetaceDocument(name);
	return current_document;
}

function func(name, type = "void") {
	if (!name) throw new Error("function name invalid");
	else if (!type) throw new Error("function type invalid");
	current_function = new PetaceFunction(name, type);
	current_document.addFunction(current_function);
	return current_function;
}

function reg(type) {
	if (!type) throw new Error("register type invalid");
	const register = new PetaceRegister(type);
	current_function.addRegister(register);
	return register;
}

function arg(type) {
	if (!type) throw new Error("argument type invalid");
	const arg = new PetaceArgument(type);
	current_function.addArgument(arg);
	return arg;
}

function label() {
	const label = new PetaceLabel();
	current_function.addLabel(label);
	return label;
}

module.exports = { doc, func, reg, arg, label, current_document, current_function };
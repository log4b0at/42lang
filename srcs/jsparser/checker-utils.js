const parser = require('./parser');
const { IdentifierMember, FunctionDeclaration, ExpressionMember, UnaryOperation, Localizable, Module,
MacroDeclaration,ClassDeclaration,StructDeclaration,EnumDeclaration } = require('./definitions');

function type2text(type) {
	if (typeof type === "string")
		return type;
	else
		throw new Error("unrepresentable type: " + type);
}

function scope2text(scopestack) {
	let stack = "";
	for (const scopable of scopestack) {
		if (scopable instanceof Module) {
			stack += '"'+scopable.file+'"';
		} 
		else if(scopable instanceof FunctionDeclaration
			|| scopable instanceof MacroDeclaration
			|| scopable instanceof ClassDeclaration
			|| scopable instanceof EnumDeclaration
			|| scopable instanceof StructDeclaration){
			stack += "."+scopable.identifier;
		}
	}
	return stack;
}

module.exports = function (context) {

	/**
	 * @description set dest.type and dest.size from some src, src can be an expression or a literal.
	 * @usecase good when the src is not always an expression
	 */
	function setTypeInfosFrom(dest, src) {
		if (isLiteral(src)) {
			const { type, size } = getTypeInfosForLiteral(src);
			dest.type = type;
			dest.size = size;
		}
		else {
			dest.type = src.type;
			dest.size = src.size;
		}
	}

	function getTypeInfosForLiteral(literal) {
		let type, size;
		if (typeof literal === "number") {
			const abs = literal < 0 ? -literal - 1 : literal;
			if (literal < 2 && literal >= 0) { type = "bool"; size = 1; }
			else if (abs < 128) { type = "char"; size = 1 * 8; }
			else if (abs < 32768) { type = "word"; size = 2 * 8; }
			else if (abs < 2147483648) { type = "int"; size = 4 * 8; }
			else { type = "long"; size = 8 * 8; }
		} else {
			type = "ptr";
			size = 8 * 8;
		}
		return { type, size };
	}

	function getScopableBySymbol(symbol) {
		const { scopestack } = context;
		scopestack.reverse();
		for (const scopable of scopestack) {
			if (scopable.symbols.has(symbol)) {
				scopestack.reverse()
				return scopable;
			}
		}
		scopestack.reverse();
		return null;
	}

	function getScopableAtTop() {
		return context.scopestack[context.scopestack.length - 1];
	}

	function isLiteral(expression) {
		if (typeof expression === "string" || typeof expression === "number")
			return true;
		else
			return false;
	}

	function isAssignable(expr) {
		return (expr instanceof IdentifierMember || expr instanceof ExpressionMember
			|| (expr instanceof UnaryOperation && expr.operator === "*"));
	}

	function isTypesEquals(type_a, type_b) {
		if (typeof type_a === "string" && typeof type_b === "string") {
			return type_a === type_b;
		}
	}

	function isTypesCompatibles(type_a, type_b) {
		// if its primitive all types are compatible
		if (typeof type_a === "string" && typeof type_b === "string")
			return true;
		return false;
	}

	function error(message, localizable) {
		if (localizable instanceof Localizable === false) throw new Error("localizable is not valid");
		if (context.done)
			context.done = false;
		context.logs.push({
			type: 'error',
			message: message,
			location: parser.computeLocation(localizable.start, localizable.end),
			module: context.module,
			scopestack: Array.from(context.scopestack),
			node: localizable
		});
	}

	function warn(message, localizable) {
		if (localizable instanceof Localizable === false) throw new Error("localizable is not valid");
		context.logs.push({
			type: 'warn',
			message: message,
			location: parser.computeLocation(localizable.start, localizable.end),
			module: context.module,
			scopestack: Array.from(context.scopestack),
			node: localizable
		});
	}

	function note(message, localizable) {
		context.logs.push({
			type: 'note',
			message: message,
			location: parser.computeLocation(localizable.start, localizable.end),
			module: context.module,
			scopestack: Array.from(context.scopestack),
			node: localizable
		});
	}

	function fatal(message, localizable) {
		if (context.done)
			context.done = false;
		context.logs.push({
			type: 'fatal',
			message: message,
			location: parser.computeLocation(localizable.start, localizable.end),
			module: context.module,
			scopestack: Array.from(context.scopestack),
			node: localizable
		});
		throw "fatal";
	}

	return {
		scope2text,
		getScopableAtTop, isAssignable, isLiteral, isTypesCompatibles, isTypesEquals, getScopableBySymbol, type2text,
		getTypeInfosForLiteral,
		setTypeInfosFrom, error, warn, note, fatal
	};
};
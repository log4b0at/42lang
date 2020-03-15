const { Module, FunctionDeclaration, VariableDeclaration, Operation, AssignOperation, CastOperation,
	BranchExpression, IdentifierMember, ExpressionMember, Expression, Instruction, RetInstruction, Identifiable,
	UnaryOperation, RightUnaryOperation, ArgumentDeclaration, BranchInstruction, LoopInstruction } = require("./definitions.js");

const context = { module: null, scopestack: [], current_function: null, ret_target: null, logs: [], done: true };

// @ThreadSafe
const { getScopableAtTop, isAssignable, isLiteral, isTypesCompatibles, isTypesEquals, getScopableBySymbol, getTypeInfosForLiteral,
	error, fatal, warn, note, type2text, setTypeInfosFrom } = require('./checker-utils.js')(context);

function check(ast) {
	if (ast instanceof Module) {
		try {
			logs = [];
			referenceModuleSymbols(ast);
			const { scopestack } = context;
			context.module = ast;
			scopestack.push(context.module);
			for (const declaration of ast.declarations) {
				if (declaration instanceof FunctionDeclaration) {
					checkFunction(declaration);
				}
			}
			scopestack.pop();
		}
		catch (e) {
			if (e !== "fatal")
				throw e;
		}
	} else throw new Error("AST is not an instance of Module class");

	return context;
}

function checkFunction(function_) {
	const last_function = context.current_function;
	const last_ret_target = context.ret_target;
	context.current_function = function_;
	context.ret_target = function_;
	context.scopestack.push(function_);
	const { ret, args, block } = function_;
	ret.size = checkType(ret.type);

	checkArgumentsDeclarations(args);
	checkInstructionBlock(block);

	context.current_function = last_function;
	context.ret_target = last_ret_target;
	context.scopestack.pop();
}

function checkInstructionBlock(block) {
	if (block instanceof Array)
		for (const instruction of block) {
			if (instruction instanceof VariableDeclaration) {
				checkVariable(instruction);
			} else if (instruction instanceof Expression) {
				checkExpression(instruction);
			} else if (instruction instanceof Instruction) {
				checkInstruction(instruction);
			}
		}
	else if (block instanceof Instruction)
		checkInstruction(block);
}

function checkArgumentsDeclarations(args) {
	if (args instanceof Array) for (const arg of args)
		checkArgumentDeclaration(arg);
	else if (args instanceof ArgumentDeclaration)
		checkArgumentDeclaration(args);
}

function checkVariable(variable) {
	const { init } = variable;

	const symbols = getScopableAtTop().symbols;
	if (!symbols.has(variable.identifier))
		symbols.set(variable.identifier, variable);
	else
		error(`identifier "${variable.identifier}" already used in this scope.`, variable);

	if(init !== null)
		variable.initialized = true;
	else
		variable.initialized = false;


	/** @todo re-organize that */

	if (isLiteral(init)) {
		if (variable.type === null) { /* let keyword */
			const { type, size } = getTypeInfosForLiteral(init);
			variable.type = type;
			variable.size = size;
		}
	} else if (init instanceof Expression) {
		checkExpression(init);
		if (variable.type === null) { /* let keyword */ 
			variable.type = init.type;
			variable.size = init.size;
		} else {
			const size = checkType(variable.type);
			variable.size = size;
			checkImplicitCast(init, variable);
		}
	} else if (variable.type !== null) { /* let keyword */
		variable.size = checkType(variable.type);
	}
}

function checkArgumentDeclaration(arg) {
	const { symbols } = context.current_function;
	if (!symbols.has(arg.identifier))
		symbols.set(arg.identifier, arg);
	else
		error(`argument identifier "${arg.identifier}" already used in this function.`, arg);

	arg.size = checkType(arg.type);
}

/*checkExpression(left);
		checkExpression(right);
		const { type: left_type, size: left_size } = isLiteral(left) ? getTypeInfosForLiteral(left) : left;
		const { type: right_type, size: right_size } = isLiteral(right) ? getTypeInfosForLiteral(right) : right;
		if (expr instanceof AssignOperation) {
			if (!isLiteral(left) && !isLiteral(right))
			{
				if(left instanceof Identifiable && left.identified instanceof VariableDeclaration)
				{
					const {identified:variable} = left;
					if(variable.initialized === false)
					{
						if(variable.type === null) // "let" keyword
						{
							variable.type = right_type;
							variable.size = right_size;
						}
						variable.initialized = true;
					}
					else if(variable.stability === "const")
					{
						error(`re-assigning constant "${variable.identifier}"`, expr);
					}
				}
				if(!isLiteral(right) && right_type !== null)
				{
					checkImplicitCast(right, left);
				}
			}
			else fatal("left operand is not assignable");
		}
		else if(left instanceof Identifiable) checkIfInitialized(left);
		if(right instanceof Identifiable) checkIfInitialized(right);
		if (left_size <= right_size) {
			expr.size = right_size;
			expr.type = right_type;
		}
		else {
			expr.size = left_size;
			expr.type = left_type;
		} */

function checkAssignToIdentifiable(assign_expr) {
	const identifiable = assign_expr.left;
	const operand = assign_expr.right;
	if (identifiable.identified instanceof VariableDeclaration) {
		const { identified: variable } = identifiable;
		if (variable.initialized === false) {
			if (variable.type === null) // "let" keyword
			{
				if (isLiteral(operand)) {
					const { type, size } = getTypeInfosForLiteral(operand);
					variable.type = type;
					variable.size = size;
				} else {
					variable.type = operand.type;
					variable.size = operand.size;
				}
				identifiable.type = variable.type;
				identifiable.size = variable.size;
			}
			variable.initialized = true;
		}
		else if (variable.stability === "const") {
			error(`re-assigning constant "${variable.identifier}"`, assign_expr);
		}
	}
}

function checkReadIdentifiable(identifiable) {
	if (identifiable.identified instanceof VariableDeclaration) {
		const { identified: variable } = identifiable;
		if (variable.type === null) {
			fatal(`unable to determine type of variable "${variable.identifier}" before using it`, identifiable);
		} else if(variable.initialized === false) {
			warn(`use of uninitialized variable "${variable.identifier}"`, identifiable);
			variable.initialized = true;
		}
	}
}

function checkAssignOperation(assign_expr) {
	const { left, right, operator } = assign_expr;
	if (isAssignable(left)) {
		if (left instanceof Identifiable)
		{
			checkAssignToIdentifiable(assign_expr);
			console.log(left)
			if (operator !== '=')
				checkReadIdentifiable(left);
		}
		if (right instanceof Identifiable)
			checkReadIdentifiable(right);
		if (!isLiteral(right)) {
			checkImplicitCast(right, left);
		}
		assign_expr.type = left.type;
		assign_expr.size = left.size;
	} else {
		fatal("left operand is not assignable", assign_expr);
	}
}

function checkExpression(expr) {
	if (expr instanceof Operation) {
		const { left, right } = expr;
		checkExpression(left);
		checkExpression(right);
		if (expr instanceof AssignOperation) {
			checkAssignOperation(expr);
		} else {
			let lsize, ltype, rsize, rtype;

			if (isLiteral(left)) {
				const linfos = getTypeInfosForLiteral(left);
				lsize = linfos.size;
				ltype = linfos.type;
			} else {
				if (left instanceof Identifiable)
					checkReadIdentifiable(left);
				lsize = right.size;
				ltype = left.type;
			}

			if (isLiteral(right)) {
				const rinfos = getTypeInfosForLiteral(right);
				rsize = rinfos.size;
				rtype = rinfos.type;
			} else {
				if (right instanceof Identifiable)
					checkReadIdentifiable(right);
				rsize = right.size;
				rtype = right.type;
			}

			if (lsize >= rsize) {
				expr.type = ltype;
				expr.size = lsize;
			} else {
				expr.type = rtype;
				expr.size = rsize;
			}
		}
	}
	else if (expr instanceof IdentifierMember) {
		checkIdentifier(expr);
		const { size, type } = expr.identified;
		expr.size = size;
		expr.type = type;
	}
	else if (expr instanceof UnaryOperation) {
		const { right, operator } = expr;
		checkExpression(right);
		if (expr instanceof CastOperation) {
			expr.size = checkType(operator);
			expr.type = operator;
		}
		else if (isLiteral(right)) {
			const { type, size } = getTypeInfosForLiteral(right);
			expr.size = size;
			expr.type = type;
		}
		else {
			if (right instanceof Identifiable) checkReadIdentifiable(right);
			expr.size = right.size;
			expr.type = right.type;
		}
	}
	else if (expr instanceof RightUnaryOperation) {
		const { left } = expr;
		checkExpression(left);
		if (isLiteral(left)) {
			const { type, size } = getTypeInfosForLiteral(right);
			expr.size = type;
			expr.type = size;
		}
		else {
			if (right instanceof Identifiable) checkReadIdentifiable(right);
			expr.size = right.size;
			expr.type = right.type;
		}
	}
	else if (expr instanceof BranchExpression) {
		const { success, fail, condition } = expr;
		const last_target = context.ret_target;
		context.ret_target = expr;
		checkExpression(condition);
		if (success instanceof Expression) {
			checkExpression(success);
			setTypeInfosFrom(expr, success);
		}
		else if (success instanceof Array)
		{
			const type = checkInstructionBlock(success);
			if(type === null)
				fatal("branch doesn't return value", success);
		}

		if (fail instanceof Expression) {
			checkExpression(fail);
			if (!isLiteral(fail) && fail.size > expr.size) {
				if (isTypesCompatibles(expr.type, fail.type)) {
					expr.type = fail.type;
					expr.size = expr.size;
				} else fatal(`conflict between incompatibles types "${type2text(expr.type)}" and "${type2text(fail.type)}"`);
			}
		}
		else if (fail instanceof Array)
		{
			const type = checkInstructionBlock(fail);
			if(type === null)
				fatal("branch doesn't return value", fail);
		}

		if (!expr.type) {
			fatal(`unable to determine type from branch expression`);
		}

		context.ret_target = last_target;
	}
	else if (typeof expr === "number" || typeof expr === "string") { }
	else { throw new Error(`unhandled expression type "${expr.constructor.name}"`); }
}

function checkIdentifier(expr) {
	const { right, identifier } = expr;
	const scopable = getScopableBySymbol(identifier);
	if (scopable === null){
		fatal(`identifier "${identifier}" not found in the scope`);
	}
	else {
		const identified = scopable.symbols.get(identifier);
		if (right === null) {
			expr.identified = identified;
		}
		else {
			if (identified instanceof Scopable === false)
				fatal(`"${identifier}" is not subject to accessing members`);
			const last_identified = checkMember(right, identified);
			expr.identified = last_identified;
		}
	}
}

function checkMember(expr, scopable) {
	const { right, identifier } = expr;
	const { symbols } = scopable;
	if (expr instanceof IdentifierMember) {
		if (symbols.has(identifier)) {
			const identified = symbols.get(identifier);
			if (right !== null) {
				if (identified instanceof Scopable === false)
					fatal(`"${identifier}" is not subject to accessing members`);
				return checkMember(right, identified);
			}
			return identified;
		}
		else {
			fatal(`"${scopable.identifier}" has no member identified as "${identifier}"`);
		}
	}
}

function checkInstruction(instruction) {
	if (instruction instanceof RetInstruction) {
		const { ret_target } = context;
		const { expression } = instruction;
		checkExpression(expression);

		if (ret_target instanceof FunctionDeclaration) {
			if (!isLiteral(expression))
				checkImplicitCast(expression, ret_target.ret);
		}
		else if (ret_target instanceof BranchExpression) {
			if (!ret_target.type) {
				ret_target.type = expression.type;
				ret_target.size = expression.size;
			} else {
				if (!isLiteral(expression))
					checkImplicitCast(expression, ret_target);
			}
		}
	}
	else if (instruction instanceof BranchInstruction) {

	}
	else if (instruction instanceof LoopInstruction) {
		const { condition, success } = instruction;
		checkExpression(condition);
		if(success instanceof Array) 
			checkInstructionBlock(success);
		else if(success instanceof Instruction)
			checkInstruction(success);
		else if(success instanceof Expression)
			checkExpression(success);
	}
	else throw new Error(`unhandled instruction type ${instruction.constructor.name}`);
}

/**
 * @description check if an implicit cast is possible between two expression
 * @param expr_from expression not literal
 * @param expr_to expression not literal
 */
function checkImplicitCast(expr_from, expr_to) {
	if (!isTypesEquals(expr_to.type, expr_from.type) && !isTypesCompatibles(expr_to.type, expr_from.type))
		error(`incompatible implicit cast from ${type2text(expr_from.type)} to ${type2text(expr_to.type)}`, expr_from);
	else if (expr_to.size < expr_from.size)
	{
		warn("implicit loss of information", expr_from);
	}
}

function checkType(type) {
	if (typeof type === "string") {
		switch (type) {
			case "int":
			case "uint":
			case "float":
				return 4 * 8;
			case "bool":
				return 1;
			case "char":
			case "uchar":
				return 1 * 8;
			case "ptr":
			case "long":
			case "ulong":
			case "double":
			case "quad":
				return 8 * 8;
			case "word":
			case "uword":
				return 2 * 8;
			default:
				throw new Error(`unknow primitive "${type}"`);
		}
	}
	else {
		throw new Error(`unhandled 'type' type "${type}"`);
	}
}

function referenceModuleSymbols(module) {
	const { symbols, declarations } = module;
	for (const declaration of declarations) {
		if (declaration instanceof FunctionDeclaration) {
			symbols.set(declaration.identifier, declaration);
		}
		else if (declaration instanceof VariableDeclaration) {
			if (!symbols.has(declaration.identifier))
				symbols.set(declaration.identifier, declaration);
			else
				error(`identifier "${declaration.identifier}" already used in this scope.`, declaration);
		}
		else {
			throw new Error("module containing an undefined behavior declaration");
		}
	}
}

module.exports = { check };
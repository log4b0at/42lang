const parser = require('./parser');
class Localizable { start; end; constructor(){this.start=parser.loc_start(); this.end = parser.loc_end();} };
class Expression extends Localizable { type; size; };
class Identifiable extends Expression { identified; }
class Instruction extends Localizable {};
class Scopable { symbols = new Map(); }
class Operation extends Expression { left; operator; right; constructor(L, op, R) { super(); this.left = L; this.operator = op; this.right = R; } }
class AssignOperation extends Operation{}
class UnaryOperation extends Expression { operator; right; constructor(op, R) { super(); this.operator = op; this.right = R;}}
class CastOperation extends UnaryOperation{}
class RightUnaryOperation extends Expression { operator; left; constructor(op, L) { super(); this.operator = op; this.left = L;}}
class Module extends Scopable { file; declarations; constructor(d) { super(); this.declarations = d; } }
class IdentifierMember extends Identifiable { right = null; identifier; constructor(id) { super(); this.identifier = id; } }
class ExpressionMember extends Identifiable { right = null; expression; constructor(expression) { super(); this.expression = expression; } }
class CallExpression extends Identifiable { right = null; expression; constructor(expression) { super(); this.expression = expression; } }
class PrimitiveType { primitive; constructor(primitive) { this.primitive = primitive; } };
class ReferenceType { nullable; immutable; local; reference; constructor(n, i, l, r) { this.nullable = n; this.immutable = i; this.local = l; this.reference = r; } }
class ReferenceMember extends Identifiable { right = null; identifier; constructor(id) { super(); this.identifier = id; } }
class TemplatedReferenceMember extends ReferenceMember { constructor(id, t) { super(id); this.template = t; } }
class PointerType { nullable; immutable; local; type; constructor(n, i, l, t) { this.nullable = n; this.immutable = i; this.local = l; this.type = t; } }
class VariableDeclaration extends Instruction { initialized=false; type; identifier; global = false; fictive = false; stability = null; init; constructor(i, t, e, s) { super(); this.type = t; this.identifier = i; this.init = e; this.stability = s; } }
class ArgumentDeclaration extends Instruction { type; identifier; global = false; stability = null; constructor(t, i, g, s) { super(); this.type = t; this.identifier = i; this.global = g; this.stability = s; } }
class Model { declaration; constructor(d) { this.declaration = d; } }
class MacroDeclaration { identifier; args; ret; block; constructor(i, a, t, b) { this.identifier = i; this.args = a; this.ret = t; this.block = b; } }
class FunctionDeclaration extends Scopable { identifier; args; ret; block; constructor(i, a, t, b) { super(); this.identifier = i; this.args = a; this.ret = t; this.block = b; } }
class ClassDeclaration extends Scopable { identifier; block; constructor(i, b, e, impl, t) { super(); this.identifier = i; this.block = b; this.ext = e; this.impl = impl; this.templates = t; } }
class EnumDeclaration extends Scopable { identifier; block; constructor(i, b, p, t) { super(); this.identifier = i; this.block = b; this.primitive = p; this.templates = t; } }
class StructDeclaration extends Scopable { identifier; block; constructor(i, b, impl, t) { super(); this.identifier = i; this.block = b; this.impl = impl; this.templates = t; } }
class TemplateDeclaration { identifier; constructor(i) { this.identifier = i; } }
class Ret { type; identifier; constructor(t, i) { this.type = t; this.identifier = i; } }
class RetInstruction extends Instruction { expression; constructor(e) { super(); this.expression = e; } }
class BranchInstruction extends Instruction { condition; success; fail; constructor(c, s, f) { super(); this.condition = c; this.success = s; this.fail = f; } }
class BranchExpression extends Expression { condition; success; fail; constructor(c, s, f) { super(); this.condition = c; this.success = s; this.fail = f; } }
class LoopInstruction extends Instruction { condition; negate; success; constructor(c, n, s) { super(); this.condition = c; this.negate = n; this.success = s; } }
class BreakInstruction extends Instruction { };
class ContinueInstruction extends Instruction { };
class AddressExpression extends Expression { constructor(r, a) { super(); this.reference = r; this.args = a; } }
class NewExpression extends Expression { constructor(r, a) { super(); this.reference = r; this.args = a; } }
class DeleteInstruction extends Instruction { constructor(e) { super(); this.expression = e; } }
function op(L, R) {
	if (R)
	{
		const op = new Operation(L, R[0], R[1]);
		return op;
	}
	return L;
}

function uop(L, R) {
	if (L)
		return new UnaryOperation(L, R);
	return L;
}

function RTL(head, tail) {
	if (tail.length > 0) {
		tail.unshift(head);
		return tail.reduce((left, right) => { right.left = left; return right; });
	}
	return head;
}

function LTR(head, tail) {
	if (tail.length > 0) {
		tail.unshift(head);
		return tail.reduce((left, right) => { left.right = right; return left; });
	}
	return head;
}
function FLAT(head, tail) {
	if (tail.length > 0) { tail.unshift(head); return tail; } return head;
}

module.exports = {
	op,uop,RTL,LTR,FLAT,
	Identifiable,
	Localizable,
	Operation,
	Expression,
	Instruction,
	AssignOperation,
	CastOperation,
	UnaryOperation,
	RightUnaryOperation,
	Module,
	IdentifierMember,
	ExpressionMember,
	CallExpression,
	PrimitiveType,
	ReferenceType,
	ReferenceMember,
	TemplatedReferenceMember,
	PointerType,
	VariableDeclaration,
	ArgumentDeclaration,
	Model,
	MacroDeclaration,
	FunctionDeclaration,
	ClassDeclaration,
	EnumDeclaration,
	StructDeclaration,
	TemplateDeclaration,
	Ret,
	RetInstruction,
	BranchInstruction,
	BranchExpression,
	LoopInstruction,
	BreakInstruction,
	ContinueInstruction,
	AddressExpression,
	NewExpression,
	DeleteInstruction 
}
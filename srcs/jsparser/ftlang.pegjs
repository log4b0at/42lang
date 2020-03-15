{
	module.exports.loc_start = function(){return peg$savedPos;};
	module.exports.loc_end = function(){return peg$currPos;}
	module.exports.computeLocation = function(start, end){return peg$computeLocation(start, end);}
	const {
		FLAT,RTL,LTR,op,uop,
		Operation,
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
	} = require("./definitions.js");
	let count = 0;
}

Start = Module;
Module = _ D:Declarations { return new Module(D);};

ASM = "asm"; BREAK="break"; BOOL="bool"; CHAR = "char"; CONTINUE="continue"; CLASS = "class";
CONST = "const"; DELETE = "delete"; DOUBLE = "double"; ELSE ="else";
ENUM = "enum"; EXPORT = "export"; EXT = "ext"; FALSE="false"; FICTIVE = "fictive"; FLOAT = "float";
GLOBAL = "global"; GOTO = "goto"; IF = "if";
IMPL = "impl"; IMPORT = "import"; INT = "int";
IS = "is"; LET = "let"; LONG = "long";
MODEL = "model"; NEW = "new"; NULL="null"; PTR = "ptr";
QUAD = "quad"; RET = "ret"; THROW = "throw"; TRUE = "true";
TYPE = "type"; UCHAR = "uchar"; UINT = "uint";
ULONG = "ulong"; UNTIL = "until";
UNSTABLE = "unstable"; USE = "use"; UWORD = "uword";
WHILE = "while"; WORD = "word"; STRUCT = "struct";

Primitive = p:(PTR / CHAR / INT / BOOL / UCHAR / FLOAT / WORD / DOUBLE / UINT / UWORD / LONG / ULONG / QUAD) !IdentifierPart {return p;};

Literal = Number / Char / String / NamedLiteral;
Comma = L:Lambda R:(',' Comma)? { return op(L,R); }
Lambda = L:Assign R:('=>' Lambda)? { return op(L,R); }
Assign = L:SelectOR R:(('='/':='/'*='/'/='/'-='/'+='/'%='/'<<='/'>>='/'|='/'&='/'^=') Assign)? { return R ? new AssignOperation(L,R[0],R[1]) : L; };
SelectOR = L:LogicOR R:(':' SelectOR)? { return op(L,R); };
LogicOR = L:LogicAND R:('||' LogicOR)? { return op(L,R); };
LogicAND = L:BinaryOR R:('&&' LogicAND)? { return op(L,R); };
BinaryOR = L:BinaryXOR R:('|' BinaryOR)? { return op(L,R); };
BinaryXOR = L:BinaryAND R:('^' BinaryXOR)? { return op(L,R); };
BinaryAND = L:Compare R:('&' !'&' BinaryAND)? { return op(L,R); };
Compare = L:RelativeCompare R:(('=='/'!=') Compare)? { return op(L,R); };
RelativeCompare = L:Shift R:(('<='/'>='/'>'/'<') RelativeCompare)? { return op(L,R); };
Shift = L:Sum R:(('>>'/'<<') Shift)? { return op(L,R); };
Sum = L:Product R:(('+'/'-') Sum)? { return op(L,R); };
Product = L:Unary R:(('*'/'/'/'%') Product)? { return op(L,R); };
Unary = _ U:(L:('--'/'-'/'!'/'++'/'*'/'~'/'+') R:Unary { return new UnaryOperation(L,R); } / L:Cast R:Unary { return new CastOperation(L,R);} / RightUnary) { return U; };
RightUnary = L:Verbose R:(O:('--'/'++') _ {return 'r'+O;})? { return R ? new UnaryOperation(R,L) : L; };
Verbose = 'new' __ R:Reference _ A:('(' A:(Comma/_{return null}) ')' _ {return A})? {return new NewExpression(R,A);} / BranchExpression / Member;
Member = H:(I:Identifier {return new IdentifierMember(I);} / Primary) _ T:(R0:(
'.' _ I:Identifier {return new IdentifierMember(I);}
/ '[' E:Assign ']' {return new ExpressionMember(E);}
/ '(' A:(Comma/_{return null}) ')' {return new CallExpression(A);}
) _ { return R0; })* { return LTR(H,T); };
Primary = '(' E:Lambda ')' {return E;} / Literal / AddressExpression;
AddressExpression = '&' _ R:Reference _ A:('(' A:(Comma/_{return null}) ')' _ {return A})? {return new AddressExpression(R,A);};
Type "type" = p:Primitive _ { return p; }
/ (n:'?'? l:'&'? i:'!'? 
t:('*' s:('[' ConstantExpression ']')? t:Type {return new PointerType(!!n,!!i,!!l,t);}
/ r:Reference {return new ReferenceType(!!n,!!i,!!l,r);}){return t;});
Cast = '<' _ t:Type '>' {return t;} / Primitive;

References = H:Reference _ T:(',' _ T:Reference _ {return T;})* { return FLAT(H,T); }
Reference = i:Identifier ta:(TA:TemplateArguments _ {return TA;})? _ T:('.' _ I:Identifier _ TA:(TA:TemplateArguments _ {return TA;})? {return TA ? new TemplatedReferenceMember(I,TA) : new ReferenceMember(I)})*
{ return LTR(ta ? new TemplatedReferenceMember(i,ta) : new ReferenceMember(i), T); };
TemplateArguments = '<' _ H:TemplateArgument _ T:(',' _ T:TemplateArgument _ {return T;})* '>' { return FLAT(H, T); };
TemplateArgument = Type / Literal;
ConstantExpression "constant expression" = Assign;
Identifier "identifier" = $([$a-zA-Z_][$a-zA-Z0-9_]*);
IdentifierPart = [a-z0-9A-Z];

TypeParameter = TYPE __ P:Primitive _ {return P;};
ImplParameter = IMPL __ R:References _ {return R;};
ExtParameter = EXT __ R:References _ {return R;};
StabilityParameter = A:(CONST/UNSTABLE) __ {return A;};
GlobalParameter = GLOBAL __ {return true;};
FictiveParameter = FICTIVE __ {return true;};
Ret = ':' _ T:Type _ I:(I:Identifier _ {return I;})? {return new Ret(T, I);};
Declarations = (GlobalVariableDeclaration / Declaration / Model)*
Model = MODEL __ D:Declaration { return new Model(D); };
Declaration =  ClassDeclaration / EnumDeclaration / StructDeclaration / FunctionDeclaration;
EnumDeclaration = ENUM __ I:Identifier _ T:TemplatesDeclarations? P:TypeParameter? B:EnumBlock {return new EnumDeclaration(I,B,P,T);};
ClassDeclaration = CLASS __ I:Identifier _ T:TemplatesDeclarations? E:ExtParameter? M:ImplParameter? B:ClassBlock {return new ClassDeclaration(I,B,E,M,T);};
StructDeclaration = STRUCT __ I:Identifier _ T:TemplatesDeclarations? M:ImplParameter? B:StructBlock {return new StructDeclaration(I,B,M,T);};
FunctionDeclaration = I:Identifier _ F:
( A:ArgumentsDeclarations? R:Ret? B:InstructionBlock { return new FunctionDeclaration(I,A,R,B); }
/ A:TemplatesDeclarations R:Ret? B:InstructionBlock { return new MacroDeclaration(I,A,R,B); } ) { return F; };
ArgumentsDeclarations = '(' _ A:(H:ArgumentDeclaration _ T:(',' _ A:ArgumentDeclaration _ {return A;})* {return FLAT(H,T);}) ')' _ {return A;}
ArgumentDeclaration = G:GlobalParameter? S:StabilityParameter? T:Type I:Identifier {return new ArgumentDeclaration(T, I, G, S);};
TemplatesDeclarations = '<' _ H:Identifier _ T:(',' _ T:Identifier _ {return new TemplateDeclaration(T);})* '>' _ {return FLAT(new TemplateDeclaration(H),T);};

BasicVariableDeclaration = S:StabilityParameter? T:(LET __ {return null;}/Type) I:Identifier _ E:('=' _ E:Assign _ {return E;})? ';' _
{ return new VariableDeclaration(I,T,E,S);};
LocalVariableDeclaration = G:GlobalParameter? F:FictiveParameter? B:BasicVariableDeclaration { if(G) B.global = true; if(F) B.fictive = true; return B; };
GlobalVariableDeclaration = GLOBAL __ F:FictiveParameter? B:BasicVariableDeclaration { B.global = true; if(F) B.fictive = true; return B; };
InstructionBlock = '{' _ I:Instructions '}' _ {return I;} / ';' _ {return null;};
Instructions = Instruction*;
Instruction = I:(RetInstruction/BranchInstruction/LoopInstruction/BreakInstruction/ContinueInstruction/DeleteInstruction/LocalVariableDeclaration/Assign) _ (';' _)? {return I;};
RetInstruction = RET !IdentifierPart E:Lambda { return new RetInstruction(E); };
BranchInstruction = IF C:Lambda S:(InstructionBlock/Instruction) F:(ELSE _ I:(InstructionBlock/Instruction) _{return I;})? { return new BranchInstruction(C,S,F); };
BranchExpression =  IF C:Lambda S:(InstructionBlock/Instruction) ELSE _ F:(InstructionBlock/BranchExpression/Assign) _ { return new BranchExpression(C,S,F); };
LoopInstruction = N:(WHILE{return false}/UNTIL{return true}) E:Lambda I:(InstructionBlock/Instruction) { return new LoopInstruction(E, N, I); }
BreakInstruction = BREAK { return new BreakInstruction(); };
DeleteInstruction = DELETE !IdentifierPart _ E:Member { return new DeleteInstruction(E); };
ContinueInstruction = CONTINUE { return new ContinueInstruction(); };
EnumBlock = '{' _ '}' _ / ';' _ {return null;};
ClassBlock = '{' _ '}' _ / ';' _ {return null;};
StructBlock = '{' _ D:(Declaration/LocalVariableDeclaration)* '}' _ {return D;} / ';' _ {return null;};

Tags = ('@' I:Identifier _ V:('(' _ H:ConstantExpression _ T:(',' _ ConstantExpression)* ')' _) {return FLAT(H,T)})?
Number = '0' n:(
'b' b:$[0-1_]+ {return parseInt(b.replace(/_/g, ''), 2); }
/ 'x' h:$[0-9A-F_]+ {return parseInt(h.replace(/_/g, ''), 16); } 
/ 'o' o:$[0-7_]+ {return parseInt(o.replace(/_/g, ''), 8); }
) { return n; }
/ i:$[0-9_]+ f:('.' [0-9]+ {return true;})? { return f ? parseFloat(text()) : parseInt(i.replace(/_/g, '')); };
Char = '\'' c:('\\' s:$. {return unescapeSequence(s);} /.) '\'' { return c.charCodeAt(0); }
String = '"' s:(EscapeSequence/[^"])* '"' { return s.join(''); }
NamedLiteral = TRUE {return 1;} / FALSE {return 0;} / NULL {return 0;};

_ "whitespace" = [ \t\n\r\f\v]* (Comment [\t\n\r\f\v ]*)*
__ "whitespace"=  ([ \t\n\r\f\v] / Comment)+;

Comment = '/' ('*' (!'*/' .)* '*/' / '/' (!'\n' .)* '\n');

EscapeSequence
= '\\' s:SingleEscapeCharacter {return s;};

SingleEscapeCharacter
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b"; }
  / "f"  { return "\f"; }
  / "n"  { return "\n"; }
  / "r"  { return "\r"; }
  / "t"  { return "\t"; }
  / "v"  { return "\v"; }
  / !{ error("unknow espace sequence"); };
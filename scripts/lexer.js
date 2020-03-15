const { range, chains } = require("./state_machine.js");

const hex = hx => String.fromCharCode(parseInt(hx, 16));

const identifier = 
{
	...range('A', 'Z', "identifier"),
	...range('a', 'z', "identifier"),
	...range('0', '9', "identifier"),
	'$': "identifier", // $ symbol is supported as identifier part
	/* support utf-8 identifiers*/
	...range( hex('C2'), hex('DF') , "identifier_utf8_2B"), 
	...range( hex('E1'), hex('EF') , "identifier_utf8_3B"),
	...range( hex('F0'), hex('F4') , "identifier_utf8_4B"), 
	
	'_': "identifier",
	default: "TOKEN_IDENTIFIER"
};

const operator_list = [
	'-', '--', '+', '++', '(', ')','[',']','{','}','*','/',',','.',';',':','!','>','>=','>>','~','&','&&','|','||','^',
	'==', '!=', '<', '<=', '<<', '=>', '?', '=',
	'-=', '+=', '*=', '/=', '%=', '>>=', '<<=', '&=', '|=', '^=', '**='
];

const contraignant_operators = ['==', '!=', '-', '.', '+', '<', '<<' , '>', '>>', '*', '/', '%', '^', '!', '=', '&', '|'];


const nc_optokens = {};

/* And a non contraignant operator state, and get his table identifier */
const nc_optoken =  element => { 
	const table_id = "TOKEN_OPERATOR_"+element ;
	nc_optokens[table_id] = "token";
	return table_id;
};

const non_contraignant_operators_chain = 
{
	'(': nc_optoken('('),
	')': nc_optoken(')'),
	'[': nc_optoken('['),
	']': nc_optoken(']'),
	'{': nc_optoken('{'),
	'}': nc_optoken('}'),
	';': nc_optoken(';'),
	':': nc_optoken(':'),
	',': nc_optoken(','),
	'?': nc_optoken('?'),
	'~': nc_optoken('~')
};

const operators = chains(contraignant_operators, {}, element => "TOKEN_OPERATOR_"+element);

operators.states['-@chain']['='] = nc_optoken('-=');
operators.states['-@chain']['-'] = nc_optoken('--');

operators.states['+@chain']['='] = nc_optoken('+=');
operators.states['+@chain']['+'] = nc_optoken('++');

operators.states['*@chain']['='] = nc_optoken('*=');

operators.states['/@chain']['='] = nc_optoken('/=');
operators.states['/@chain']['*'] = "multiline_comment";
operators.states['/@chain']['/'] = "singleline_comment";

operators.states['/@chain'][' '] = operators.states['/@chain'].default;
operators.states['/@chain']['\n'] = operators.states['/@chain'].default;
operators.states['/@chain']['\t'] = operators.states['/@chain'].default;
operators.states['/@chain']['\f'] = operators.states['/@chain'].default;
operators.states['/@chain']['\r'] = operators.states['/@chain'].default;
operators.states['/@chain']['\v'] = operators.states['/@chain'].default;

operators.states['%@chain']['='] = nc_optoken('%=');

operators.states['&@chain']['='] = nc_optoken('&=');
operators.states['&@chain']['&'] = nc_optoken('&&');

operators.states['|@chain']['='] = nc_optoken('|=');
operators.states['|@chain']['|'] = nc_optoken('||');

operators.states['>@chain']['='] = nc_optoken('>=');
operators.states['>>@chain']['='] = nc_optoken('>>=');

operators.states['<@chain']['='] = nc_optoken('<=');
operators.states['<<@chain']['='] = nc_optoken('<<=');

operators.states['=@chain']['>'] = nc_optoken('=>');

operators.states['!=@chain']['='] = nc_optoken('!==');
operators.states['^@chain']['='] = nc_optoken('^=');

operators.states['.@chain'] = Object.assign( operators.states['.@chain'], range('0', '9', "float_number"));

const keyword_list = ["asm", "bool", "break", "char", "class", "const", "continue", "delete", "double", "else", "enum", "export", "ext", "float",
"global", "goto", "if", "impl", "import", "int", "is", "let", "long", "model", "new", "ptr", "quad", "ret", "struct", "throw",
"type", "uchar", "uint", "ulong", "until", "unstable", "use", "uword", "while", "word"];

const keywords = chains(keyword_list, identifier, element => "TOKEN_KEYWORD_"+element.toUpperCase());
/*const operators = chains(operator_list, {}, element => "TOKEN_OPERATOR_"+element);*/

const INIT_STATE = {
	...identifier,
	...keywords.chain,
	...operators.chain,
	...non_contraignant_operators_chain,
	' ': "INIT_STATE",
	'\t': "INIT_STATE",
	'\n': "INIT_STATE",
	'\r': "INIT_STATE",
	'\f': "INIT_STATE",
	'\v': "INIT_STATE",
	'"': "string",
	'\'': "char_literal",
	'0': "prefixed_number",
	'@': "tag",
	...range('1', '9', "number"),
	default: "FINAL_STATE"
};


module.exports = {
	INIT_STATE: INIT_STATE,
	
	RECORD_NEEDED: "marker",

	identifier: identifier,
	
	identifier_utf8_2B: { default: "identifier" },
	identifier_utf8_3B: { default: "identifier_utf8_2B" },
	identifier_utf8_4B: { default: "identifier_utf8_3B" },

	tag: {
		...range('A', 'Z', "tag"),
		...range('a', 'z', "tag"),
		...range('0', '9', "tag"),
		'$': "tag", // $ symbol is supported as tag part
		/* support utf-8 tags */
		...range( hex('C2'), hex('DF') , "tag_utf8_2B"), 
		...range( hex('E1'), hex('EF') , "tag_utf8_3B"),
		...range( hex('F0'), hex('F4') , "tag_utf8_4B"), 
		
		'_': "tag",
		default: "TOKEN_TAG"
	},

	tag_utf8_2B: { default: "tag" },
	tag_utf8_3B: { default: "tag_utf8_2B" },
	tag_utf8_4B: { default: "tag_utf8_3B" },

	prefixed_number: {
		'o': "oct_number",
		'x': "hex_number",
		'b': "bin_number",
		...range('0', '9', "number"),
		default: "TOKEN_NUMBER"
	},
	
	oct_number: {
		...range('0', '7', "oct_number"),
		'_': 'oct_number',
		default: "TOKEN_OCT_NUMBER"
	},
	
	hex_number: {
		...range('0', '9', "hex_number"),
		...range('A', 'F', "hex_number"),
		...range('a', 'f', "hex_number"),
		'_': 'hex_number',
		default: "TOKEN_HEX_NUMBER"
	},
	
	bin_number: {
		'0': "bin_number",
		'1': "bin_number",
		'_': 'bin_number',
		default: "TOKEN_BIN_NUMBER"
	},
	
	number: {
		...range('0', '9', "number"),
		'_': 'number',
		'.': "float_number",
		'e': "exponent_number",
		default: "TOKEN_NUMBER"
	},
	
	float_number: {
		...range('0', '9', "float_number"),
		'e': "exponent_float_number",
		default: "TOKEN_FLOAT_NUMBER"
	},
	
	exponent_number: {
		'-': "exponent_number_u",
		...range('0', '9', "exponent_number_u"),
	},
	
	exponent_float_number: {
		'-': "exponent_float_number_u",
		...range('0', '9', "exponent_float_number_u"),
	},
	
	exponent_number_u: {
		'-': "exponent_number_u",
		...range('0', '9', "exponent_number_u"),
		default: "TOKEN_EXPONENT_NUMBER"
	},
	
	exponent_float_number_u: {
		'-': "exponent_float_number_u",
		...range('0', '9', "exponent_float_number_u"),
		default: "TOKEN_EXPONENT_FLOAT_NUMBER"
	},

	string: {
		'"': "TOKEN_STRING",
		'\0': "FINAL_STATE",
		...range( hex('C2'), hex('DF') , "string_utf8_2B"), 
		...range( hex('E1'), hex('EF') , "string_utf8_3B"),
		...range( hex('F0'), hex('F4') , "string_utf8_4B"),
		default: "string"
	},

	string_utf8_2B: { default: "string" },
	string_utf8_3B: { default: "string_utf8_2B" },
	string_utf8_4B: { default: "string_utf8_3B" },

	char_literal: {
		'\'': "TOKEN_CHAR",
		'\0': "FINAL_STATE",
		default: "end_char_literal"
	},

	end_char_literal: {
		'\'': "TOKEN_CHAR",
		'\0': "FINAL_STATE",
		default: "FINAL_STATE"
	},
	...keywords.states,

	RECORD_NOTNEEDED: "marker",
	
	/*whitespace: {
		' ': "whitespace",
		'\t': "whitespace",
		'\n': "whitespace",
		'\r': "whitespace",
		'\f': "whitespace",
		default: "TOKEN_WHITESPACE"
	},*/

	multiline_comment: {
		'*': "end_multiline_comment",
		'\0': "FINAL_STATE",
		default: "multiline_comment"
	},
	
	end_multiline_comment: {
		'/': "INIT_STATE",
		'\0': "FINAL_STATE",
		default: "multiline_comment"
	},
	
	singleline_comment: {
		'\n': "INIT_STATE", // TOKEN_SINGLELINE_COMMENT
		'\0': "FINAL_STATE",
		default: "singleline_comment"
	},
	
	/*multiline_comment: {
		'*': "end0_multiline_comment",
		'\0': "FINAL_STATE",
		default: "multiline_comment"
	},
	
	end0_multiline_comment: {
		'/': "end1_multiline_comment",
		'\0': "FINAL_STATE",
		default: "multiline_comment"
	},
	
	end1_multiline_comment: {
		default: "INIT_STATE" // TOKEN_MULTILINE_COMMENT
	},
	
	singleline_comment: {
		'\n': "INIT_STATE", // TOKEN_SINGLELINE_COMMENT
		'\0': "FINAL_STATE",
		default: "singleline_comment"
	},*/
	
	...operators.states,
	
	FINAL_STATE: "token",

	RECORD_NEEDED_TOKENS: "marker",

	TOKEN_NUMBER: "token",
	TOKEN_BIN_NUMBER: "token",
	TOKEN_OCT_NUMBER: "token",
	TOKEN_HEX_NUMBER: "token",
	TOKEN_FLOAT_NUMBER: "token",
	TOKEN_EXPONENT_NUMBER: "token",
	TOKEN_EXPONENT_FLOAT_NUMBER: "token",
	TOKEN_IDENTIFIER: "token",
	TOKEN_TAG: "token",

	RECORD_NOTNEEDED_TOKENS: "marker",

	...keywords.generated_states,
	...operators.generated_states,

	//TOKEN_WHITESPACE: "token",
	FORWARDLOOK_NEEDED: "marker",
	TOKEN_STRING: "token",
	TOKEN_CHAR: "token",
	...nc_optokens,

	RECORD_STATE: "token",

	//TOKEN_MULTILINE_COMMENT: "token",
	//TOKEN_SINGLELINE_COMMENT: "token",
};
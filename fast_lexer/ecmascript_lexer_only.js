const { range, chains } = require('./spreadtable.js');

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
	'-', '--', '+', '++', '(', ')','[',']','{','}','*','/',',','.',';',':','!','>','>=','>>','>>>','~','&','&&','|','||','^',
	'==', '!=', '<', '<=', '<<', '=>', '?', '**', '=',
	'-=', '+=', '*=', '/=', '%=', '>>=', '<<=', '>>>=', '&=', '|=', '^=', '**='
];

const contraignant_operators = ['==', '!=', '-', '.', '+', '<', '<<' , '>', '>>', '*', '/', '%', '^', '!', '=', '&', '|', '**'];


const nc_optokens = {};

/* And a non contraignant operator state, and get his table identifier */
const nc_optoken =  element => { 
	const table_id = "TOKEN_OPERATOR_"+element ;
	nc_optokens[table_id] = null;
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
operators.states['**@chain']['='] = nc_optoken('**=');

operators.states['/@chain']['='] = nc_optoken('/=');
operators.states['/@chain']['*'] = "multiline_comment";
operators.states['/@chain']['/'] = "singleline_comment";

operators.states['/@chain'][' '] = operators.states['/@chain'].default;
operators.states['/@chain'][' '] = operators.states['/@chain'].default;

operators.states['%@chain']['='] = nc_optoken('%=');

operators.states['&@chain']['='] = nc_optoken('&=');
operators.states['&@chain']['&'] = nc_optoken('&&');

operators.states['|@chain']['='] = nc_optoken('|=');
operators.states['|@chain']['|'] = nc_optoken('||');

operators.states['>@chain']['='] = nc_optoken('>=');
operators.states['>>@chain']['='] = nc_optoken('>>=');
operators.states['>>@chain']['>'] = nc_optoken('>>>');

operators.states['<@chain']['='] = nc_optoken('<=');
operators.states['<<@chain']['='] = nc_optoken('<<=');

operators.states['=@chain']['>'] = nc_optoken('=>');
operators.states['==@chain']['='] = nc_optoken('===');

operators.states['!=@chain']['='] = nc_optoken('!==');
operators.states['^@chain']['='] = nc_optoken('^=');

operators.states['.@chain'] = Object.assign( operators.states['.@chain'], range('0', '9', "float_number"));

console.log(operators.states['&@chain'])

const keyword_list = ["of","do","if","in","for","let","new","try","var","case","else","enum","eval","null","this","void","with",
"await","break","catch","class","const","false","super","throw","while","yield","delete","export","import","public","return",
"static","switch","typeof","default","extends","finally","package","private","continue","debugger","function","arguments",
"interface","protected","implements","instanceof"];

const keywords = chains(keyword_list, identifier, element => "TOKEN_KEYWORD_"+element.toUpperCase());
/*const operators = chains(operator_list, {}, element => "TOKEN_OPERATOR_"+element);*/

const INIT = {
	...identifier,
	...keywords.chain,
	...operators.chain,
	...non_contraignant_operators_chain,
	' ': "whitespace",
	'\t': "whitespace",
	'\n': "whitespace",
	'\r': "whitespace",
	'\f': "whitespace",
	'"': "dq_string",
	'\'': "sq_string",
	'`': "format_string",
	'0': "prefixed_number",
	...range('1', '9', "number"),
	default: "FINAL_STATE"
};


module.exports = {
	INIT: INIT,
	
	REGEXBACKLOOKING_INIT:
	{
		...INIT,
		'/': "REGEXBACKLOOKING_START",
		' ': "whitespace_beforeregex",
		'\t': "whitespace_beforeregex",
		'\n': "whitespace_beforeregex",
		'\r': "whitespace_beforeregex",
		'\f': "whitespace_beforeregex",
	},
	
	

	REGEXBACKLOOKING_START: {
		'/': "singleline_comment",
		'*': "multiline_comment",
		default: "regex"
	},
	
	identifier: identifier,
	
	identifier_utf8_2B: { default: "identifier" },
	identifier_utf8_3B: { default: "identifier_utf8_2B" },
	identifier_utf8_4B: { default: "identifier_utf8_3B" },
	
	whitespace: {
		' ': "whitespace",
		'\t': "whitespace",
		'\n': "whitespace",
		'\r': "whitespace",
		'\f': "whitespace",
		default: "TOKEN_WHITESPACE"
	},
	
	whitespace_beforeregex: {
		' ': "whitespace_beforeregex",
		'\t': "whitespace_beforeregex",
		'\n': "whitespace_beforeregex",
		'\r': "whitespace_beforeregex",
		'\f': "whitespace_beforeregex",
		default: "TOKEN_WHITESPACE_BEFOREREGEX"
	},
	
	multiline_comment: {
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
		default: "TOKEN_MULTILINE_COMMENT"
	},
	
	singleline_comment: {
		'\n': "TOKEN_SINGLELINE_COMMENT",
		'\0': "FINAL_STATE",
		default: "singleline_comment"
	},
	
	prefixed_number: {
		'o': "oct_number",
		'x': "hex_number",
		'b': "bin_number",
		...range('0', '9', "number"),
		default: "TOKEN_NUMBER"
	},
	
	oct_number: {
		...range('0', '7', "oct_number"),
		default: "TOKEN_OCT_NUMBER"
	},
	
	hex_number: {
		...range('0', '9', "hex_number"),
		...range('A', 'F', "hex_number"),
		...range('a', 'f', "hex_number"),
		default: "TOKEN_HEX_NUMBER"
	},
	
	bin_number: {
		'0': "bin_number",
		'1': "bin_number",
		default: "TOKEN_BIN_NUMBER"
	},
	
	number: {
		...range('0', '9', "number"),
		'.': "float_number",
		'e': "exposant_number",
		default: "TOKEN_NUMBER"
	},
	
	float_number: {
		...range('0', '9', "float_number"),
		'e': "exposant_float_number",
		default: "TOKEN_FLOAT_NUMBER"
	},
	
	exposant_number: {
		'-': "exposant_number_u",
		...range('0', '9', "exposant_number_u"),
	},
	
	exposant_float_number: {
		'-': "exposant_float_number_u",
		...range('0', '9', "exposant_float_number_u"),
	},
	
	exposant_number_u: {
		'-': "exposant_number_u",
		...range('0', '9', "exposant_number_u"),
		default: "TOKEN_EXPOSANT_NUMBER"
	},
	
	exposant_float_number_u: {
		'-': "exposant_float_number_u",
		...range('0', '9', "exposant_float_number_u"),
		default: "TOKEN_EXPOSANT_FLOAT_NUMBER"
	},

	dq_string: {
		'\\': "dq_string_escape",
		'"': "TOKEN_STRING",
		'\0': "FINAL_STATE",
		default: "dq_string"
	},
	
	sq_string: {
		'\\': "sq_string_escape",
		'\'': "TOKEN_STRING",
		'\0': "FINAL_STATE",
		default: "sq_string"
	},
	
	format_string: {
		'`': "TOKEN_FORMAT_STRING",
		'\\': "format_string_escape",
		'\0': "FINAL_STATE",
		default: "format_string",
	},
	
	format_string_escape: {
		default: "format_string"
	},
	
	sq_string_escape: {
		default: "sq_string"
	},
	
	dq_string_escape: {
		default: "dq_string"
	},
	
	regex: {
		'\\': "regex_escape",
		'/': "regex_end",
		default: "regex"
	},
	
	regex_escape: { default: "regex" },
	regex_end: {
		...range('a', 'z', "regex_end"),
		...range('A', 'Z', "regex_end"),
		default: "TOKEN_REGEX"
	},
	
	
	...keywords.states,
	
	...operators.states,
	
	FINAL_STATE: null,
	TOKEN_MULTILINE_COMMENT: null,
	TOKEN_SINGLELINE_COMMENT: null,
	TOKEN_NUMBER: null,
	TOKEN_BIN_NUMBER: null,
	TOKEN_OCT_NUMBER: null,
	TOKEN_HEX_NUMBER: null,
	TOKEN_FLOAT_NUMBER: null,
	TOKEN_EXPOSANT_NUMBER: null,
	TOKEN_EXPOSANT_FLOAT_NUMBER: null,
	TOKEN_IDENTIFIER: null,
	TOKEN_REGEX: null,
	TOKEN_WHITESPACE: null,
	
	REGEXBACKLOOKING_STATE: null,
	
	...keywords.generated_states,
	
	TOKEN_WHITESPACE_BEFOREREGEX: null,
	
	...operators.generated_states,
	
	NON_CONTRAIGNANT_STATE: null,
	
	TOKEN_MULTILINE_COMMENT_BEFOREREGEX: null,
	TOKEN_SINGLELINE_COMMENT_BEFOREREGEX: null,
	TOKEN_STRING: null,
	TOKEN_FORMAT_STRING: null,
	
	...nc_optokens,
};
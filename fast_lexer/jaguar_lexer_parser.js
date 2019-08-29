const { range, chains } = require('./spreadtable.js');

const hex = hx => String.fromCharCode(parseInt(hx, 16));

const identifier = 
{
	...range('A', 'Z', "identifier"),
	...range('a', 'z', "identifier"),
	...range('0', '9', "identifier"),
	
	/* support utf-8 identifiers */
	...range( hex('C2'), hex('DF') , "identifier_utf8_2B"), 
	...range( hex('E1'), hex('EF') , "identifier_utf8_3B"),
	...range( hex('F0'), hex('F4') , "identifier_utf8_4B"),
	
	'_': "identifier",
	default: "TOKEN_IDENTIFIER"
};

const tag = 
{
	...range('A', 'Z', "tag"),
	...range('a', 'z', "tag"),
	...range('0', '9', "tag"),

	/* support utf-8 tags */
	...range( hex('C2'), hex('DF') , "tag_utf8_2B"), 
	...range( hex('E1'), hex('EF') , "tag_utf8_3B"),
	...range( hex('F0'), hex('F4') , "tag_utf8_4B"),
	
	'_': "tag",
	default: "TOKEN_TAG"
};

const contraignant_operators = ['-', ':', '.', '+', '<', '<<' , '>', '>>', '*', '/', '%', '^', '!', '=', '&', '|', '**'];


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
	',': nc_optoken(','),
	'?': nc_optoken('?'),
	'~': nc_optoken('~'),
	'#': nc_optoken('#')
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

operators.states[':@chain']['='] = nc_optoken(':=');

operators.states['%@chain']['='] = nc_optoken('%=');

operators.states['&@chain']['='] = nc_optoken('&=');
operators.states['&@chain']['&'] = nc_optoken('&&');

operators.states['|@chain']['='] = nc_optoken('|=');
operators.states['|@chain']['|'] = nc_optoken('||');
operators.states['|@chain']['>'] = nc_optoken('|>');

operators.states['>@chain']['='] = nc_optoken('>=');
operators.states['>>@chain']['='] = nc_optoken('>>=');

operators.states['<@chain']['='] = nc_optoken('<=');
operators.states['<<@chain']['='] = nc_optoken('<<=');

operators.states['=@chain']['>'] = nc_optoken('=>');
operators.states['=@chain']['='] = nc_optoken('==');

operators.states['!@chain']['='] = nc_optoken('!=');

operators.states['^@chain']['='] = nc_optoken('^=');

operators.states['.@chain'] = Object.assign( operators.states['.@chain'], range('0', '9', "float_number"));


operators.states['.@chain']['.'] = "..@chain";
operators.states['..@chain'] = { '.': nc_optoken('...'), default: "FINAL_STATE" };

const keyword_list = ["do","if","let","new","case","else","enum","null","this","true",
"break","class","const","false","super","while","delete","export","import","return",
"switch","default","extends","module","continue","function","macro","struct",
"public", "private", "protected", "using", "assert"];

const keywords = chains(keyword_list, identifier, element => "TOKEN_KEYWORD_"+element.toUpperCase());
/*const operators = chains(operator_list, {}, element => "TOKEN_OPERATOR_"+element);*/



module.exports = {
	INIT: {
		...identifier,
		...keywords.chain,
		...operators.chain,
		...non_contraignant_operators_chain,
		' ': "whitespace",
		'\t': "whitespace",
		'\n': "whitespace",
		'\r': "whitespace",
		'\f': "whitespace",
		'"': "string",
		'\'': "char",
		'\\': "escape",
		'@': "tag",
		'0': "prefixed_number",
		...range('1', '9', "number"),
		default: "FINAL_STATE"
	},
	
	identifier: identifier,
	
	identifier_utf8_2B: { default: "identifier" },
	identifier_utf8_3B: { default: "identifier_utf8_2B" },
	identifier_utf8_4B: { default: "identifier_utf8_3B" },
	
	tag: tag,

	tag_utf8_2B: { default: "tag" },
	tag_utf8_3B: { default: "tag_utf8_2B" },
	tag_utf8_4B: { default: "tag_utf8_3B" },

	escape: {
		'>': "TOKEN_ESCAPE_OPERATOR_>",
		'<': "TOKEN_ESCAPE_OPERATOR_<",
		default: "FINAL_STATE"
	},
	
	whitespace: {
		' ': "whitespace",
		'\t': "whitespace",
		'\n': "whitespace",
		'\r': "whitespace",
		'\f': "whitespace",
		default: "TOKEN_WHITESPACE"
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
		'.': "float_number",
		...range('0', '9', "number"),
		'_': "number",
		default: "TOKEN_NUMBER"
	},
	
	oct_number: {
		...range('0', '7', "oct_number"),
		'_': "oct_number",
		default: "TOKEN_OCT_NUMBER"
	},
	
	hex_number: {
		...range('0', '9', "hex_number"),
		...range('A', 'F', "hex_number"),
		...range('a', 'f', "hex_number"),
		'_': "hex_number",
		default: "TOKEN_HEX_NUMBER"
	},
	
	bin_number: {
		'0': "bin_number",
		'1': "bin_number",
		'_': "bin_number",
		default: "TOKEN_BIN_NUMBER"
	},
	
	number: {
		...range('0', '9', "number"),
		'.': "float_number",
		'_': "number",
		/*'e': "exposant_number",*/
		default: "TOKEN_NUMBER"
	},
	
	float_number: {
		...range('0', '9', "float_number"),
		'_': "float_number",
		/*'e': "exposant_float_number",*/
		default: "TOKEN_FLOAT_NUMBER"
	},
	
	/*exposant_number: {
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
	},*/

	string: {
		'\\': "string_escape",
		'"': "TOKEN_STRING",
		'\0': "FINAL_STATE",
		...range( hex('C2'), hex('DF') , "string_utf8_2B"), 
		...range( hex('E1'), hex('EF') , "string_utf8_3B"),
		...range( hex('F0'), hex('F4') , "string_utf8_4B"),
		default: "string"
	},
	
	'char': {
		'\\': "char_escape",
		'\'': "TOKEN_CHAR",
		'\0': "FINAL_STATE",
		...range( hex('C2'), hex('DF') , "FINAL_STATE"), // utf8 are not expected in char
		...range( hex('E1'), hex('EF') , "FINAL_STATE"), // utf8 are not expected in char
		...range( hex('F0'), hex('F4') , "FINAL_STATE"), // utf8 are not expected in char
		default: "char"
	},
	
	char_escape: {
		default: "char"
	},
	
	string_escape: {
		default: "string"
	},
	
	string_utf8_2B: { default: "string" },
	string_utf8_3B: { default: "string_utf8_2B" },
	string_utf8_4B: { default: "string_utf8_3B" },
	
	...keywords.states,
	
	...operators.states,
	
	FINAL_STATE: null,
	
	TOKEN_CHAR: null,
	TOKEN_STRING: null,
	
	...nc_optokens,
	
	'TOKEN_ESCAPE_OPERATOR_<': null,
	'TOKEN_ESCAPE_OPERATOR_>': null,
	
	/* AFTER THIS COMMENT FORWARDLOOK NEEDED */
	
	TOKEN_NUMBER: null,
	TOKEN_BIN_NUMBER: null,
	TOKEN_OCT_NUMBER: null,
	TOKEN_HEX_NUMBER: null,
	TOKEN_FLOAT_NUMBER: null,
	/*TOKEN_EXPOSANT_NUMBER: null,
	TOKEN_EXPOSANT_FLOAT_NUMBER: null,*/
	TOKEN_IDENTIFIER: null,
	TOKEN_TAG: null,
	
	
	...keywords.generated_states,
	
	...operators.generated_states,
	
	/* AFTER THIS COMMENT ALL STATES CAN BE SKIPPED */
	
	TOKEN_WHITESPACE: null,
	TOKEN_MULTILINE_COMMENT: null,
	TOKEN_SINGLELINE_COMMENT: null,

};
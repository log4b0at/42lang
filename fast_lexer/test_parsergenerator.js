/* Jaguar grammar */

const declarations_branch = {
	"public": "declarations",
	"protected": "declarations",
	"private": "declarations",
	"class": "class_declaration",
	"enum": "enum_declaration",
	"function": "function_declaration"
};

module.exports = {
	
	tokens: {
		identifier: { forwardlook: true, lexer_state: "TOKEN_IDENTIFIER" },
		'public': { forwardlook: true },
		'private': { forwardlook: true },
		'protected': { forwardlook: true },
		'class': { forwardlook: true },
	},
	
	memory: { 
		privacy: "int" ,
		identifier: "rstr",
		static_reference: "rstr*"
	},
	
	rules:{
		module: {
			stuff: { branch_ways: { ...declarations_branch, "identifier": "static_reference" } }
		},
		
		declarations: {
			privacy: { ways: [ 'public', 'private', 'protected' ], store_token: '@privacy' },
			declaration: { branch_ways: { 'class': 'class_declaration', 'enum': 'enum_declaration', 'function': 'function_declaration' } }
		},
		
		"class_declaration": [
			'class',
			{ 'identifier': '@identifier' },
			_=> `auto class_declaration = new ClassDeclaration(${_.privacy}, ${_.identifier})`,
			{
				'extends': [
					{ 'identifier': "static_reference" },
					_=> `class_declaration.extends_from = ${_.identifier}`,
					{ '{' : '!next' }
				],
				'{': '!next'
			},
			instructions
		]
	}
}
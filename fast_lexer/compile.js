
/* WARNING: YOU NEED NPM MODULE "COLORS-CLI" INSTALLED LOL, just do: 
	- npm i -g colors-cli
	- npm link colors-cli
 */

const {code_tables, gen_c_code} = require('./spreadtable.js');


const process = require('process'), fs = require('fs'), path = require('path'), cc = require('colors-cli');

const input = process.argv[2];
const output = process.argv[3];
console.log(input, output);
if( output && input ) {
	
	const input_path = path.resolve(__dirname, input),
		 output_path = path.resolve(__dirname, output);
	
	if(!fs.existsSync(output_path)){
		fs.appendFileSync(output_path, '');
	}
	
	if(!fs.existsSync(input_path)) throw new Error(cc.red("input file does'nt exist."));
	
	const lexer_model = require(input_path);
	console.log( cc.green('lexer model loaded.') );
	const code_table = code_tables(lexer_model, 'FINAL_STATE');
	console.log( cc.green('code table built.') );
	const c_code = gen_c_code(code_table);
	
	console.log( cc.green('c code successfully generated.') );
	
	fs.writeFileSync( output_path, c_code );
	
	console.log( cc.green('code saved at \xAB '+output_path+' \xBB.') );
	
}
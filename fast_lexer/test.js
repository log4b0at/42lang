const readline = require('readline');
	process = require('process'), fs = require('fs'), path = require('path');
	
const encoder = new TextEncoder("utf-8");
const decoder = new TextDecoder("utf-8");
const {code_tables} = require('./spreadtable.js');

const lexer_model_path = path.resolve(__dirname, process.argv[2]);
const target_example_path = path.resolve(__dirname, process.argv[3]);


const lexer_model = require(lexer_model_path);

const code_table = code_tables(lexer_model, 'FINAL_STATE');

"use strict";


function lex( code_table, input )
{
	let _inline_table = [];
	
	const code_map = new Map();
	for(const i in code_table)
	{
		const table = code_table[i];
		code_map.set(table.state_index, i);
		if(table.matrix !== null) _inline_table = _inline_table.concat(table.matrix);
	}
	
	const inline_table = new Uint32Array(_inline_table);
	
	
	input += '\0';
	
	const INIT = code_table.INIT.state_index;
	const REGEXBACKLOOKING_INIT = code_table.REGEXBACKLOOKING_INIT.state_index;
	const FINAL_STATE = code_table.FINAL_STATE.state_index;
	const NON_CONTRAIGNANT_STATE = code_table.NON_CONTRAIGNANT_STATE.state_index;
	const REGEXBACKLOOKING_STATE = code_table.REGEXBACKLOOKING_STATE.state_index;
	const TOKEN_WHITESPACE = code_table.TOKEN_WHITESPACE.state_index;
	const TOKEN_WHITESPACE_BEFOREREGEX = code_table.TOKEN_WHITESPACE_BEFOREREGEX.state_index;
	const TOKEN_IDENTIFIER = code_table.TOKEN_IDENTIFIER.state_index;
	let state=0, i=0, start_i;
	
	
	
	
	const input_buffer = encoder.encode(input);
	
	const prove = [];
	
	const st = process.hrtime();
	
	while(state !== FINAL_STATE){
		state = state > REGEXBACKLOOKING_STATE ? REGEXBACKLOOKING_INIT: INIT;
		
		start_i = i;
		
		do {
			const ch = input_buffer[i++];
			state = inline_table[state + ch];
		} while(state < FINAL_STATE);
		
		if(state < NON_CONTRAIGNANT_STATE) i--;
		
		if(state === TOKEN_IDENTIFIER) {
			const token_content = /*decoder.decode(*/input_buffer.slice(start_i, i)/*)*/;
			prove.push(token_content);
		}
		
		/*console.log( code_map.get(state) + (state !== FINAL_STATE && state !== TOKEN_WHITESPACE && state !== TOKEN_WHITESPACE_BEFOREREGEX  ? ` \xAB ${token_content.replace(/\s/g, ' ')} \xBB`:'') );*/
	}
	
	console.log(state);
	
	const et = process.hrtime();
	
	if( i < input.length-2)
	{
		console.error(`unexpected character \xAB ${String.fromCharCode(input_buffer[i])} \xBB`);
	}
	
	console.log(prove);

	const time = ( (et[0]*10000000 + et[1] / 1000) - (st[0]*10000000 + st[1] / 1000) ) / 10;

	console.log('took '+Math.round(time*10)/10+'µs');
}



lex(code_table, fs.readFileSync(target_example_path, 'utf8').toString() + '\0' );
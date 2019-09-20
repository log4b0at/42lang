const { build_state_table, gen_c_code, gen_c_header } = require("./state_machine.js");
const lexer = require("./lexer");

const readline = require('readline'),
	fs = require('fs'), path = require('path'), util = require('util');

const lexer_model = lexer;

const state_table = build_state_table(lexer_model, 'FINAL_STATE');

fs.writeFileSync("./srcs/ftlex/state_table.c", gen_c_code(state_table));
fs.writeFileSync("./includes/state_table.h", gen_c_header(state_table, ['INIT_STATE']));

/*function lex( state_table )
{
	let _inline_table = [];
	
	const states_names = new Map();
	for(const i in state_table)
	{
		const table = state_table[i];
		states_names.set(table.state_index, i);
		if(table.matrix !== null) _inline_table = _inline_table.concat(table.matrix);
	}
	
	const inline_table = new Uint32Array(_inline_table);
	
	const INIT = state_table.INIT.state_index;
	const FINAL_STATE = state_table.FINAL_STATE.state_index;
	const FORWARDLOOK_NEEDED = state_table.FORWARDLOOK_NEEDED.state_index;
	const TOKEN_WHITESPACE = state_table.TOKEN_WHITESPACE.state_index;

	let state=0
	let i = 0;
	let k = 0;
	let size = 0;
	let save_k;
	let chunk;
	
	const st = process.hrtime();

	state = INIT;
	save_k = k;
	process.stdin.on('readable', () => {
		while ((chunk = process.stdin.read(5)) !== null)
		{
			k = 0;
			size += chunk.length;
			
			console.log("[", chunk.toString(), "]");
			
			while (k < chunk.length)
			{
				const ch = chunk[k++];
				state = inline_table[state + ch];

				if (state >= FINAL_STATE) {
					if (state === FINAL_STATE) {
						console.log(`unexpected character \xAB ${String.fromCharCode(chunk[k - 1])} \xBB`);
						process.stdin.end();
						return;
					}

					if (state < FORWARDLOOK_NEEDED)
						k--;

					const token_content = decoder.decode(chunk.slice(save_k, k));
					console.log(states_names.get(state) + (state !== FINAL_STATE && state !== TOKEN_WHITESPACE ? ` \xAB ${token_content.replace(/\s/g, ' ')} \xBB` : ''));

					state = INIT;
					save_k = k;
					i += k;
				}
			}
		}
	});
	
	process.stdin.on('end', () => {
		const et = process.hrtime();

		const time = ( (et[0]*10000000 + et[1] / 1000) - (st[0]*10000000 + st[1] / 1000) ) / 10;

		console.log('took '+Math.round(time*10)/10+'µs');
	});
}

lex(state_table);*/
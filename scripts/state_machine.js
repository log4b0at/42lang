function
gen_table(table_part, default_value)
{
	const table = new Array(256);
	for(let i = 0; i < 256; i++)
	{ 
		const table_part_val = table_part[String.fromCharCode(i)];
		if(table_part_val !== undefined)
			table[i] = table_part_val;
		else table[i] = default_value;
	};
	return table;
}

function
build_state_table(tables, default_table_name)
{
	let i = 0; let result = []; let v = 0;
	
	for(const table_name in tables)
	{
		const table_part = tables[table_name];
		if(table_part === "token" || table_part === "marker" || !table_part)
		{
			tables[table_name] = {__type: table_part, __null: true, index: (i-v)*256+v};
			if (table_part === "token")
			{
				v++;
				i++;
			}
		}
		else {
			table_part.index = i*256;
			i++;
		}
	}
	
	
	for(const table_name in tables)
	{
		const table_part = tables[table_name];
		if(table_part.__null === true) 
		{ 
			result[table_name] = {type: table_part.__type, state_index: table_part.index, matrix:null};
			continue;
		}
		const table = gen_table(table_part, table_part.default || default_table_name);
		
		const table_result = [];
		for(let j = 0; j < table.length; j++)
		{
			const value = table[j];
			if(tables[value]!==undefined)
			{
				table[j] = tables[value].index;
				table_result.push(table[j]);
			}
			else throw new ReferenceError(`table \xAB ${value} \xBB is not defined.`);
		}
		result[table_name] = {state_index: table_part.index, matrix:table_result};
	}
	
	return result;
}

function 
gen_c_code( code_table ) 
{

	let size = 0;
	
	for(const i in code_table)
	{
		const table = code_table[i];
		if(table.matrix !== null) size += 256;
	}
	
	const unit = 4; // 32 bits = 4bytes

	let c_code = `/* (size=${Math.round(size*unit/1000)}kb)*/\n`;

	c_code += "int	state_table[] = {";
	
	for(const i in code_table)
	{
		const table = code_table[i];
		const matrix = table.matrix;
		
		if(matrix !== null){
			c_code += `\n\n/* matrix "${i}" (offset=${table.state_index}) */\n`;
			for(let j = 0; j < matrix.length; j++)
			{
				if(j%16===0)
				c_code += "\n"
				
				c_code += matrix[j]+', ';
			}
		}
		else if (table.type === "marker")
		{
			c_code += `\n/* marker "${i}" (fake_offset=${table.state_index}) */`;
		}
		else if (table.type === "token")
		{
			c_code += `\n/* token "${i}" (fake_offset=${table.state_index}) */`;
		}
	}

	c_code += "\n};\n\nchar	*tokens_labels[] = {\n";

	let k = 0;
	const labels = [];
	for(const i in code_table)
	{
		const table = code_table[i];
		const matrix = table.matrix;
		if (table.type === "token")
		{
			labels.push('\t"'+ i + "\" /* "+ k + " */");
			k++;
		}
	}

	c_code += labels.join(",\n")/*.replace('%', '\\%')*/;

	c_code += "};";
	
	return c_code;
}

function
is_alpha(str)
{
	let i = 0;

	while (i < str.length)
	{
		const c = str[i].charCodeAt(0);
		if ((c < 65 || c > 90) && (c < 98 || c > 122) && c != 95)
			return (0);
		i++;
	}
	return (1);
}

function 
gen_c_header( code_table, other_stuff = [] ) 
{
	let c_code = `#ifndef STATE_TABLE_H\n\n# define STATE_TABLE_H\n\n`;
	
	for(const i in code_table)
	{
		const table = code_table[i];
		const matrix = table.matrix;
		
		// macros cant have other symbols than alphas and underscore
		if (matrix === null && is_alpha(i) || other_stuff.includes(i))
			c_code += `# define ${i} ${table.state_index}\n`;
	}

	c_code += "\n#endif\n";

	return c_code;
}


function
range(start, end, value)
{
	const result_object = {};
	const start_from = start.charCodeAt(0);
	const end_to = end.charCodeAt(0);
	
	for(let i = start_from; i <= end_to; i++)
	{
		result_object[ String.fromCharCode(i) ] = value;
	}
	
	return result_object;
}

function
chains(elements, default_object, gen_goal )
{
	const chain = {};
	const states = {};
	const generated_states = {};
	
	for(const element of elements)
	{
		let state;
		for(let i = element.length-1; i >= 0; i--)
		{
			state = states[element.slice(0, i+1)+"@chain"];
			
			if(state === undefined)
			{
				state = states[element.slice(0, i+1)+"@chain"] = Object.assign({}, default_object);
				if(i===0) chain[element[0]] = element[0]+"@chain";
			}
			
			if(i === element.length-1)
			{
				const generated = gen_goal(element);
				state[ 'default' ] = generated;
				generated_states[ generated ] = "token";
			}
			else 
			{
				state[ element[i+1] ] = element.slice(0, i+2)+"@chain";
			}
			
		}
	}
	
	return { chain, states, generated_states };
}

module.exports={gen_c_code, gen_c_header, chains, gen_table, range, build_state_table};
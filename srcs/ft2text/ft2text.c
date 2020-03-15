#include "state_table.h"

#include <stdio.h>
#include <stdlib.h>

char	*tokens_labels[] = {
	"FINAL_STATE" /* 0 */,
	"TOKEN_NUMBER" /* 1 */,
	"TOKEN_BIN_NUMBER" /* 2 */,
	"TOKEN_OCT_NUMBER" /* 3 */,
	"TOKEN_HEX_NUMBER" /* 4 */,
	"TOKEN_FLOAT_NUMBER" /* 5 */,
	"TOKEN_EXPONENT_NUMBER" /* 6 */,
	"TOKEN_EXPONENT_FLOAT_NUMBER" /* 7 */,
	"TOKEN_IDENTIFIER" /* 8 */,
	"TOKEN_TAG" /* 9 */,
	"TOKEN_KEYWORD_ASM" /* 10 */,
	"TOKEN_KEYWORD_BOOL" /* 11 */,
	"TOKEN_KEYWORD_BREAK" /* 12 */,
	"TOKEN_KEYWORD_CHAR" /* 13 */,
	"TOKEN_KEYWORD_CLASS" /* 14 */,
	"TOKEN_KEYWORD_CONST" /* 15 */,
	"TOKEN_KEYWORD_CONTINUE" /* 16 */,
	"TOKEN_KEYWORD_DELETE" /* 17 */,
	"TOKEN_KEYWORD_DOUBLE" /* 18 */,
	"TOKEN_KEYWORD_ELSE" /* 19 */,
	"TOKEN_KEYWORD_ENUM" /* 20 */,
	"TOKEN_KEYWORD_EXPORT" /* 21 */,
	"TOKEN_KEYWORD_EXT" /* 22 */,
	"TOKEN_KEYWORD_FLOAT" /* 23 */,
	"TOKEN_KEYWORD_GLOBAL" /* 24 */,
	"TOKEN_KEYWORD_GOTO" /* 25 */,
	"TOKEN_KEYWORD_IF" /* 26 */,
	"TOKEN_KEYWORD_IMPL" /* 27 */,
	"TOKEN_KEYWORD_IMPORT" /* 28 */,
	"TOKEN_KEYWORD_INT" /* 29 */,
	"TOKEN_KEYWORD_IS" /* 30 */,
	"TOKEN_KEYWORD_LET" /* 31 */,
	"TOKEN_KEYWORD_LONG" /* 32 */,
	"TOKEN_KEYWORD_MODEL" /* 33 */,
	"TOKEN_KEYWORD_NEW" /* 34 */,
	"TOKEN_KEYWORD_PTR" /* 35 */,
	"TOKEN_KEYWORD_QUAD" /* 36 */,
	"TOKEN_KEYWORD_RET" /* 37 */,
	"TOKEN_KEYWORD_STRUCT" /* 38 */,
	"TOKEN_KEYWORD_THROW" /* 39 */,
	"TOKEN_KEYWORD_TYPE" /* 40 */,
	"TOKEN_KEYWORD_UCHAR" /* 41 */,
	"TOKEN_KEYWORD_UINT" /* 42 */,
	"TOKEN_KEYWORD_ULONG" /* 43 */,
	"TOKEN_KEYWORD_UNTIL" /* 44 */,
	"TOKEN_KEYWORD_UNSTABLE" /* 45 */,
	"TOKEN_KEYWORD_USE" /* 46 */,
	"TOKEN_KEYWORD_UWORD" /* 47 */,
	"TOKEN_KEYWORD_WHILE" /* 48 */,
	"TOKEN_KEYWORD_WORD" /* 49 */,
	"TOKEN_OPERATOR_==" /* 50 */,
	"TOKEN_OPERATOR_!=" /* 51 */,
	"TOKEN_OPERATOR_-" /* 52 */,
	"TOKEN_OPERATOR_." /* 53 */,
	"TOKEN_OPERATOR_+" /* 54 */,
	"TOKEN_OPERATOR_<" /* 55 */,
	"TOKEN_OPERATOR_<<" /* 56 */,
	"TOKEN_OPERATOR_>" /* 57 */,
	"TOKEN_OPERATOR_>>" /* 58 */,
	"TOKEN_OPERATOR_*" /* 59 */,
	"TOKEN_OPERATOR_/" /* 60 */,
	"TOKEN_OPERATOR_%" /* 61 */,
	"TOKEN_OPERATOR_^" /* 62 */,
	"TOKEN_OPERATOR_!" /* 63 */,
	"TOKEN_OPERATOR_=" /* 64 */,
	"TOKEN_OPERATOR_&" /* 65 */,
	"TOKEN_OPERATOR_|" /* 66 */,
	"TOKEN_STRING" /* 67 */,
	"TOKEN_CHAR" /* 68 */,
	"TOKEN_OPERATOR_(" /* 69 */,
	"TOKEN_OPERATOR_)" /* 70 */,
	"TOKEN_OPERATOR_[" /* 71 */,
	"TOKEN_OPERATOR_]" /* 72 */,
	"TOKEN_OPERATOR_{" /* 73 */,
	"TOKEN_OPERATOR_}" /* 74 */,
	"TOKEN_OPERATOR_;" /* 75 */,
	"TOKEN_OPERATOR_:" /* 76 */,
	"TOKEN_OPERATOR_," /* 77 */,
	"TOKEN_OPERATOR_?" /* 78 */,
	"TOKEN_OPERATOR_~" /* 79 */,
	"TOKEN_OPERATOR_-=" /* 80 */,
	"TOKEN_OPERATOR_--" /* 81 */,
	"TOKEN_OPERATOR_+=" /* 82 */,
	"TOKEN_OPERATOR_++" /* 83 */,
	"TOKEN_OPERATOR_*=" /* 84 */,
	"TOKEN_OPERATOR_/=" /* 85 */,
	"TOKEN_OPERATOR_%=" /* 86 */,
	"TOKEN_OPERATOR_&=" /* 87 */,
	"TOKEN_OPERATOR_&&" /* 88 */,
	"TOKEN_OPERATOR_|=" /* 89 */,
	"TOKEN_OPERATOR_||" /* 90 */,
	"TOKEN_OPERATOR_>=" /* 91 */,
	"TOKEN_OPERATOR_>>=" /* 92 */,
	"TOKEN_OPERATOR_<=" /* 93 */,
	"TOKEN_OPERATOR_<<=" /* 94 */,
	"TOKEN_OPERATOR_=>" /* 95 */,
	"TOKEN_OPERATOR_!==" /* 96 */,
	"TOKEN_OPERATOR_^=" /* 97 */,
	"RECORD_STATE" /* 98 */};

unsigned char	next()
{
	return (unsigned char) fgetc(stdin);
}

int		get_int()
{
	int	i;
	fread((char*)&i, 4, 1, stdin);
	return i;
}


double	get_double()
{
	double d;
	fread((char*)&d, 8, 1, stdin);
	return d;
}

char	get_char()
{
	return fgetc(stdin);
}

char	*get_string()
{
	const int size = get_int();
	char	*str = malloc(size + 1);
	if (str == 0)
		return 0;
	str[size] = 0;
	fread(str, size, 1, stdin);
	return str;
}

char	*get_identifier(char *id)
{
	const int size = get_char();
	id[size] = 0;
	fread(id, size, 1, stdin);
	return id;
}

int		main(void)
{
	int token;
	char	id_buffer[256];
	while ((token = next()) != 255)
	{
		printf("%s (%i)\n", tokens_labels[token], token);
		token += FINAL_STATE;
		
		switch(token) {
			case TOKEN_IDENTIFIER:
				printf("RECORD ID: \"%s\"\n", get_identifier(id_buffer));
				break;
			case TOKEN_TAG:
				printf("RECORD TAG ID: \"%s\"\n", get_identifier(id_buffer));
				break;
			case TOKEN_CHAR:
				printf("RECORD: '%c'\n", get_char());
				break;
			case TOKEN_STRING:
				printf("RECORD: \"%s\"\n", get_string());
				break ;
			case TOKEN_NUMBER:
			case TOKEN_BIN_NUMBER:
			case TOKEN_HEX_NUMBER: 
			case TOKEN_OCT_NUMBER:
				printf("RECORD NUMBER: %i\n", get_int());
				break;
			case TOKEN_FLOAT_NUMBER:
			case TOKEN_EXPONENT_NUMBER: 
			case TOKEN_EXPONENT_FLOAT_NUMBER:
				printf("RECORD NUMBER: %f\n", get_double());
				break;
			default: break;
		}
	}
}
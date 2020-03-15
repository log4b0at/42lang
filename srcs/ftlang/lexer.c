#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <fcntl.h>
#include "ftlang.h"
#include "state_table.h"

extern int	state_table[];
extern char	*tokens_labels[];

char	g_buffer[BUFFER_SIZE];
char	g_record_buffer[4096];
int		g_record_started = 0;
int		g_record_counter = 0;
int		token = -1;
long	n;
double	d;
size_t		len = 0;
size_t		k = 0;

size_t		save_k = 0;
size_t		full_size = 0;

/*int main()
{
	//_setmode(_fileno(stdin), _O_BINARY);
	int token;
	while ((token = next()))
	{
		printf("TOKEN RECEIVED: %i %s value:%ld\n", token, tokens_labels[token], n);
	}
}*/

int		next()
{
	register int	state = INIT_STATE;

	do
	{
		if (k >= len)
		{
			if (g_record_started)
				ft_record(save_k, len);
			len = read(0, g_buffer, BUFFER_SIZE);
			if (len <= 0)
				return (token = 0);
			full_size += k;
			k = 0;
			save_k = 0;
		}

		state = state_table[state + g_buffer[k]];

		if (state >= RECORD_NEEDED)
		{
			if (state >= FINAL_STATE)
			{
				if (state == FINAL_STATE)
				{
					ft_unexpected_char(g_buffer[k++]);
					return (token = 0);
				}
				else
				{
					
					if (state < RECORD_NOTNEEDED_TOKENS || state == TOKEN_STRING || state == TOKEN_CHAR)
					{
						if(!g_record_started)
							ft_start_record();
						ft_record(save_k, k);
						switch(state)
						{
							case TOKEN_NUMBER:
								dec_number();
							break;
							case TOKEN_FLOAT_NUMBER:
							case TOKEN_EXPONENT_FLOAT_NUMBER:
							case TOKEN_EXPONENT_NUMBER:
								float_number();
							break;
							case TOKEN_HEX_NUMBER:
								hex_number();
							break;
							case TOKEN_BIN_NUMBER:
								bin_number();
							break;
							case TOKEN_OCT_NUMBER:
								oct_number();
							break;
						}
						ft_end_record();
					}
					else if(g_record_started)
						ft_end_record();
					
					if (state >= FORWARDLOOK_NEEDED)
						k++;
					
					token = state - FINAL_STATE;
					return token;
				}
			}
			else if (state < RECORD_NOTNEEDED && !g_record_started)
			{
				save_k = k;
				ft_start_record();
			}
			
		}
		k++;
	}
	while (1);

	return 0;
}


void	ft_unexpected_char(char c)
{
	fwrite("unexpected char '", 17, 1, stderr);
	fwrite(&c, 1, 1, stderr);
	fwrite("'\n", 2, 1, stderr);
}

void	ft_start_record()
{
	g_record_started = 1;
	g_record_counter = 0;
}

void	ft_end_record()
{
	g_record_started = 0;
}

void	ft_record(const int start, const int end)
{
	const int record_counter = g_record_counter;

	//memcpy(g_record_buffer + record_counter, g_buffer + start, end - start);
	
	int i = 0;
	while (i < end-start)
	{
		g_record_buffer[record_counter+i] = g_buffer[start+i];
		i++;
	}
	g_record_counter += i;
	//g_record_counter += end - start;
}

void	bin_number()
{
	n = 0;
	int i = 2;
	while (i < g_record_counter)
	{
		const char c = g_record_buffer[i];
		if(c != '_')
		{
			n <<= 1;
			if (c == '1') n++;
		}
		i++;
	}
}

void	hex_number()
{
	n = 0;
	int i = 2;
	while (i < g_record_counter)
	{
		const char c = g_record_buffer[i];
		if(c!='_')
			n = n*16 + 9*(c>>6)+(c&017);
		i++;
	}
}

void	oct_number()
{
	n = 0;
	int i = 2;
	while (i < g_record_counter)
	{
		const char c = g_record_buffer[i];
		if(c!='_')
			n = n*8 + c - '0';
		i++;
	}
}

void	dec_number()
{
	n = 0;
	int i = 0;
	while (i < g_record_counter)
	{
		const char c = g_record_buffer[i];
		if(c!='_')
			n = n*10 + c - '0';
		i++;
	}
}

void	float_number()
{
	d = strtod(g_record_buffer, NULL);
}
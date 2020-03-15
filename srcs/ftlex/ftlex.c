#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <fcntl.h>
#include "ftlex.h"
#include "state_table.h"


extern int	state_table[];
extern char	*tokens_labels[];

char	g_buffer[BUFFER_SIZE];
char	g_record_buffer[4096];
int		g_record_started = 0;
int		g_record_counter = 0;

int		main(void)
{
	_setmode(_fileno(stdin), _O_BINARY);
	_setmode(_fileno(stdout), _O_BINARY);
	ft_output_binary();
	return (0);
}

void	ft_output_binary()
{
	int	len;
	int	k;
	int	state;
	int	save_k;

	len = BUFFER_SIZE;
	state = INIT_STATE;
	while (len > 0)
	{
		len = read(0, g_buffer, BUFFER_SIZE);
		k = 0;
		save_k = 0;
		while (k < len)
		{
			state = state_table[state + g_buffer[k]];
			if (state >= FINAL_STATE)
			{
				if (state == FINAL_STATE)
					ft_unexpected_char(g_buffer[k++]);
				else
				{
					ft_send_token(state - FINAL_STATE);
					if (state < RECORD_NOTNEEDED_TOKENS || state == TOKEN_STRING || state == TOKEN_CHAR)
					{
						if(!g_record_started)
							ft_start_record();
						ft_record(save_k, k);
						switch(state)
						{
							case TOKEN_IDENTIFIER:
								fwrite(&g_record_counter, 1, 1, stdout);
								fwrite(g_record_buffer, g_record_counter, 1, stdout);
								break;
							case TOKEN_NUMBER:
								write_dec_number();
							break;
							case TOKEN_CHAR:
								write_char_literal();
								break;
							case TOKEN_STRING:
								write_string();
							break;
							case TOKEN_FLOAT_NUMBER:
							case TOKEN_EXPONENT_FLOAT_NUMBER:
							case TOKEN_EXPONENT_NUMBER:
								write_float_number();
							break;
							case TOKEN_TAG:
								write_tag();
							break;
							case TOKEN_HEX_NUMBER:
								write_hex_number();
							break;
							case TOKEN_BIN_NUMBER:
								write_bin_number();
							break;
							case TOKEN_OCT_NUMBER:
								write_oct_number();
							break;
						}
						ft_end_record();
					}
					else if(g_record_started)
						ft_end_record();
					if (state >= FORWARDLOOK_NEEDED)
						k++;
					save_k = k;
					state = INIT_STATE;
					continue ;
				}
				state = INIT_STATE;
			}
			k++;
		}
		if (state >= RECORD_NEEDED && state < RECORD_NOTNEEDED)
		{
			if (!g_record_started)
				ft_start_record();
			ft_record(save_k, len);
			save_k = 0;
		}
	}
}

void	ft_send_token(int token)
{
	fwrite(&token, 1, 1, stdout);
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
	int i = 0;
	const int record_counter = g_record_counter;

	while (i < end-start)
	{
		g_record_buffer[record_counter+i] = g_buffer[start+i];
		i++;
	}
	g_record_counter += i;
}

void	write_char_literal()
{
	fwrite(g_record_buffer+1, 1, 1, stdout);
}

void	write_bin_number()
{
	int total = 0;
    int i = 2;
	while (i < g_record_counter)
    {
		const char c = g_record_buffer[i];
        if(c != '_')
        {
            total <<= 1;
            if (c == '1') total++;
        }
        i++;
    }
	fwrite(&total, 4, 1, stdout);
}

void	write_hex_number()
{
	int total = 0;
    int i = 2;
	while (i < g_record_counter)
    {
		const char c = g_record_buffer[i];
        if(c!='_')
            total = total*16 + 9*(c>>6)+(c&017);
        i++;
    }
	fwrite(&total, 4, 1, stdout);
}

void	write_oct_number()
{
	int total = 0;
    int i = 2;
	while (i < g_record_counter)
    {
		const char c = g_record_buffer[i];
        if(c!='_')
            total = total*8 + c - '0';
        i++;
    }
	fwrite(&total, 4, 1, stdout);
}

void	write_dec_number()
{
	int total = 0;
	int i = 0;
	while (i < g_record_counter)
    {
		const char c = g_record_buffer[i];
        if(c!='_')
            total = total*10 + c - '0';
        i++;
    }
	fwrite((char*)&total, 4, 1, stdout);
}

void	write_string()
{
	g_record_counter--;
	fwrite(&g_record_counter, 4, 1, stdout); // count \0 here
	fwrite(g_record_buffer + 1, g_record_counter, 1, stdout);
}

void	write_float_number()
{
	const double d = strtod(g_record_buffer, NULL);
	fwrite(&d, 8, 1, stdout);
}

void	write_tag()
{
	g_record_counter--;
	fwrite(&g_record_counter, 1, 1, stdout);
	fwrite(g_record_buffer+1, g_record_counter, 1, stdout);
}
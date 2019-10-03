
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include "ftlex.h"
#include "state_table.h"

extern int	state_table[];
extern char	*tokens_labels[];

char	g_buffer[BUFFER_SIZE];
char	g_record_buffer[4096];
int		g_record_started = 0;
int		g_record_counter = 0;

int		main(int ac, char **av)
{
	if (ac == 2)
	{
		if (strcmp(av[1], "-b") == 0)
			ft_output_binary();
		else if (strcmp(av[1], "-t") == 0)
			ft_output_text();
	}
	else
		write(2, "usage: ftlex [-b|-t]\n", 21);
	return (1);
}

void	ft_output_text()
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
					ft_send_text_token(state - FINAL_STATE);
					if (state < RECORD_NOTNEEDED_TOKENS || state == TOKEN_STRING)
					{
						if(!g_record_started)
							ft_start_record();
						ft_record(save_k, k);
						write(1,"RECORD: \"", 9);
						switch(state)
						{
							case TOKEN_IDENTIFIER:
								write(1, g_record_buffer, g_record_counter);
								break;
							case TOKEN_NUMBER:
								write_dec_number();
							break;
							case TOKEN_STRING:
								write_string();
							break;
							case TOKEN_FLOAT_NUMBER:
								write_float_number();
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
						write(1, "\"\n", 2);
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
					if (state < RECORD_NOTNEEDED_TOKENS || state == TOKEN_STRING)
					{
						if(!g_record_started)
							ft_start_record();
						ft_record(save_k, k);
						switch(state)
						{
							case TOKEN_IDENTIFIER:
								write(1, g_record_buffer, g_record_counter);
								break;
							case TOKEN_NUMBER:
								write_dec_number();
							break;
							case TOKEN_STRING:
								write_string();
							break;
							case TOKEN_FLOAT_NUMBER:
								write_float_number();
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

void	ft_send_text_token(int token)
{
	char a[3];
	char *text = tokens_labels[token];
	write(1, text, strlen(text));
	ft_itoa(token, a);
	write(1, " (", 2);
	write(1, a, strlen(a));
	write(1, ") \n", 3);
}

void	ft_send_token(int token)
{
	unsigned char to_send = (unsigned char)token;
	write(1, &to_send, 1);
}

void	ft_unexpected_char(char c)
{
	write(2, "unexpected char '", 17);
	write(2, &c, 1);
	write(2, "'\n", 2);
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

void	write_bin_number()
{
	int total = 0;
    int i = 0;
	while (i < g_record_started)
    {
		const char c = g_record_buffer[i];
        if(c != '_')
        {
            total *= 2;
            if (c == '1') total++;
        }
        i++;
    }
	write(1, &total, 4);
}

void	write_hex_number()
{
	int total = 0;
    int i = 0;
	while (i < g_record_counter)
    {
		const char c = g_record_buffer[i];
        if(c!='_')
            total = total*16 + 9*(c>>6)+(c&017);
        i++;
    }
	write(1, &total, 4);
}

void	write_oct_number()
{
	int total = 0;
    int i = 0;
	while (i < g_record_counter)
    {
		const char c = g_record_buffer[i];
        if(c!='_')
            total = total*8 + c - '0';
        i++;
    }
	write(1, &total, 4);
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
	write(1, &total, 4);
}

void	write_string()
{
	g_record_buffer[g_record_counter] = 0;
	write(1, g_record_buffer + 1, g_record_counter);
}

void	write_float_number()
{
	g_record_buffer[g_record_counter] = 0;
	write(1, g_record_buffer + 1, g_record_counter);
}
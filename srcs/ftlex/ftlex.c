
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include "ftlex.h"
#include "state_table.h"

extern int	state_table[];
extern char	*tokens_labels[];

char	g_buffer[BUFFER_SIZE];
int		g_record_started = 0;

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
					if (g_record_started)
					{
						ft_record(save_k, k);
						g_record_started = 0;
						write(1, "\"\n", 2);
					} 
					else if ((state >= RECORD_NEEDED_TOKENS && state < RECORD_NOTNEEDED_TOKENS) || state == TOKEN_STRING)
					{
						write(1,"RECORD: \"", 9);
						ft_record(save_k, k);
						write(1, "\"\n", 2);
					}
					ft_send_text_token(state - FINAL_STATE);
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
			{
				write(1,"RECORD: \"", 9);
				g_record_started = 1;
			}
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

	state = INIT_STATE;
	while ((len = read(0, g_buffer, BUFFER_SIZE)) > 0)
	{
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
					if (g_record_started)
					{
						ft_record(save_k, k);
						ft_end_record();
					} 
					else if ((state >= RECORD_NEEDED_TOKENS && state < RECORD_NOTNEEDED_TOKENS) || state == TOKEN_STRING)
					{
						ft_start_record();
						ft_record(save_k, k);
						ft_end_record();
					}
					ft_send_token(state - FINAL_STATE);
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
	}
	if (state >= RECORD_NEEDED && state < RECORD_NOTNEEDED)
	{
		if (!g_record_started)
			ft_start_record();
		ft_record(save_k, len);
		save_k = 0;
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
	const char c = RECORD_STATE - FINAL_STATE;
	g_record_started = 1;
	write(1, &c, 1);
}

void	ft_end_record()
{
	write(1, ".", 1);
	g_record_started = 0;
}

void	ft_record(int start, int end)
{
	write(1, g_buffer + start, end - start);
}
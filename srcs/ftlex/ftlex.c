
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include "./ftlex.h"

#define BUFFER_SIZE		1

#define INIT_STATE		0
#define FINAL_STATE		66048

extern int state_table[];

char	g_buffer[BUFFER_SIZE];

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

	len = BUFFER_SIZE;
	state = INIT_STATE;
	while (len > 0)
	{
		len = read(0, g_buffer, BUFFER_SIZE);
		k = 0;
		while (k < len)
		{
			state = state_table[state + g_buffer[k]];
			if (state >= FINAL_STATE)
			{
				if (state == FINAL_STATE)
					ft_unexpected_char(g_buffer[k]);
				else
					ft_send_text_token(state - FINAL_STATE);
				state = INIT_STATE;
			}
			k++;
		}
	}
}

void	ft_output_binary()
{
	int	len;
	int	k;
	int	state;

	len = BUFFER_SIZE;
	state = INIT_STATE;
	while (len > 0)
	{
		len = read(0, g_buffer, BUFFER_SIZE);
		k = 0;
		while (k < len)
		{
			state = state_table[state + g_buffer[k]];
			if (state >= FINAL_STATE)
			{
				if (state == FINAL_STATE)
					ft_unexpected_char(g_buffer[k]);
				else
					ft_send_token(state - FINAL_STATE);
				state = INIT_STATE;
			}
			k++;
		}
	}
}

void	ft_send_text_token(int token)
{
	char a[3];
	ft_itoa(token, a);
	write(1, a, strlen(a));
	write(1, "\n", 1);
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

#ifndef FTLEX_H

# define FTLEX_H

#include "./utils.h"

void	ft_unexpected_char(char c);
void	ft_send_text_token(int token);
void	ft_send_token(int token);
void	ft_output_text();
void	ft_output_binary();

#endif
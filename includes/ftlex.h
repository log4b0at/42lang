
#ifndef FTLEX_H

# define FTLEX_H

# include "./utils.h"

# define BUFFER_SIZE		1

void	ft_unexpected_char(char c);
void	ft_send_text_token(int token);
void	ft_send_token(int token);
void	ft_output_text();
void	ft_output_binary();
void	ft_start_record();
void	ft_end_record();
void	ft_record(int start, int end);

#endif
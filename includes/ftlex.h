
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
void	write_oct_number();
void	write_hex_number();
void	write_dec_number();
void	write_bin_number();
void	write_float_number();
void	write_string();

#endif
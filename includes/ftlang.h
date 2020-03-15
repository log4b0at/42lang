
#ifndef FTLANG_H

# define FTLANG_H

# include "./utils.h"
# include <stdlib.h>
# include <stdio.h>

# define BUFFER_SIZE		(1 << 16)

extern size_t	full_size;
extern size_t	k;
extern long		n;
extern double	d;
extern int		token;
extern size_t	save_k;
extern char		g_record_buffer[4096];

void	ft_unexpected_char(char c);
void	ft_start_record();
void	ft_end_record();
void	ft_record(int start, int end);
void	oct_number();
void	hex_number();
void	dec_number();
void	bin_number();
void	float_number();
int		next();

#endif
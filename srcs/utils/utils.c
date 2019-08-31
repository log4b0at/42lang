
void	ft_itoa(int num, char *buffer)
{
	int	save_num;

	save_num = num;
	if (num < 0)
	{
		*buffer++ = '-';
		save_num *= -1;
	}
	while (num /= 10)
		buffer++;
	*(buffer + 1) = 0;
	*buffer-- = '0' + save_num % 10;
	while (save_num /= 10)
		*buffer-- = '0' + save_num % 10;
}

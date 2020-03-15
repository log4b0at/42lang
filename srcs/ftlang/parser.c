
#include "ftlang.h"
#include "vector.h"
#include "state_table.h"
#include <stdlib.h>

#define LIST(LST, F, IS_END)\
{\
	typeof(LST) vec = malloc(1 * sizeof(*LST));\
	if (!vec)\
		return 0;\
	size_t	capacity = 1;\
	list_length = 0;\
	while (!(IS_END)) {\
		if (list_length >= capacity)\
			if((vec = realloc(vec, (capacity *= 2) * sizeof(*LST))) == 0)\
				return 0;\
		vec[list_length++] = (typeof(*LST))F();\
	}\
	LST = realloc(vec, list_length * sizeof(*LST)); \
}

#define LIST_WITH_SEP(LST, F, IS_END, IS_SEP)\
{\
	typeof(LST) vec = malloc(1 * sizeof(*LST));\
	if (!vec)\
		return 0;\
	size_t	capacity = 1;\
	list_length = 0;\
	if (!(IS_END)) {\
		do {\
			if (list_length >= capacity)\
				if((vec = realloc(vec, (capacity *= 2) * sizeof(*LST))) == 0)\
					return 0;\
			vec[list_length++] = (typeof(*LST))F();\
		} while(IS_SEP);\
		LST = realloc(vec, list_length * sizeof(*LST));\
	} else LST = vec;\
}

long	parseNumber()
{
	long number = n;
	printf("num: %i\n", n);
	next();
	return number;
}

long	*parseProgram()
{
	long	*list;
	size_t list_length, i = 0;

	next();
	LIST(list, parseNumber, token == 0);


	while (i < list_length)
		printf("A number in the list: %ld\n", list[i++]);

	char c;
	read(0, &c, 1);
	return (long*)list;
}

int main()
{
	free(parseProgram());
}
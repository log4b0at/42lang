
#include <stdlib.h>
#include <stdio.h>

typedef struct	s_vector
{
	size_t	capacity;
	size_t	size;
}				*vector;

void	*vector_init_alloc(size_t init_byte_capacity)
{
	vector	vec = (vector)malloc(sizeof(vector) + init_byte_capacity);
	if (!vec)
	    return 0;
	vec->capacity = init_byte_capacity;
	vec->size = 0;
	return vec + 1;
}

vector	vector_grow(vector vec)
{
    printf("vector: %p, capacity will became: %ld\n", vec, sizeof(vector) + vec->capacity * 2);
    vector v = (vector)realloc(vec, sizeof(vector) + (vec->capacity *= 2));
    printf("realloc %p to %p and capacity became %ld bytes\n", vec, v, vec->capacity);
    return v;
}

vector vector_shrink(vector vec)
{
    vec->capacity = vec->size;
    return (vector)realloc(vec, sizeof(vector) + vec->capacity);
}

#define vector_push(vec, element) {\
typeof(vec) v = (vec); vector ve = (vector)v - 1;\
if (ve->size >= ve->capacity) { ve = vector_grow(ve); v = (typeof(v))(ve + 1); (vec) = v; printf("ve = %p, v = %p\n", ve, v); };\
v[ve->size / sizeof(*v)] = (element); ve->size += sizeof(*v); \
printf("size=%ld, capacity=%ld, set %ld to %ld\n", ve->size, ve->capacity, ve->size / sizeof(*v), element);}
#define vector_new(type, init_capacity) (type*)vector_init_alloc((init_capacity)*sizeof(type))
#define vector_length(vec) ((vector)(vec)-1)->size/sizeof(*vec)

int main()
{
    int *vec = vector_new(int, 2);
    vector_push(vec, 785);
    vector_push(vec, 343);
    vector_push(vec, 341);
    vector_push(vec, 342);
    vector_push(vec, 66047748);
    vector_push(vec, 45145);
    vector_push(vec, 1451515);
    for (size_t i = 0; i < vector_length(vec); i++)
    {
        printf("%ld: %i\n", i, vec[i]);
    }
    return vec[0];
}
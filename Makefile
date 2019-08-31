SRCS_DIR	= srcs
OBJS_DIR	= objs
OUT_DIR 	= dist
INC_DIR		= includes

NAME		= ftlang
SRCS		= $(wildcard $(SRCS_DIR)/$(NAME)/*.c)
OBJS		= $(subst $(SRCS_DIR),$(OBJS_DIR),$(SRCS:.c=.o))

LEXER_NAME	= ftlex
LEXER_SRCS	= $(wildcard $(SRCS_DIR)/$(LEXER_NAME)/*.c)
LEXER_OBJS	= $(subst $(SRCS_DIR),$(OBJS_DIR),$(LEXER_SRCS:.c=.o))

UTILS_SRCS	= $(wildcard $(SRCS_DIR)/utils/*.c)
UTILS_OBJS	= $(subst $(SRCS_DIR),$(OBJS_DIR),$(UTILS_SRCS:.c=.o))

CC			= cc 
CFLAGS		= -Wall -Wextra -Werror
RM			= rm -f

all: $(LEXER_NAME)

$(LEXER_NAME): $(UTILS_OBJS) $(LEXER_OBJS)
	$(CC) $(CFLAGS) $(UTILS_OBJS) $(LEXER_OBJS) -o $(OUT_DIR)/$(LEXER_NAME)

$(NAME): $(UTILS_OBJS) $(OBJS)
	$(CC) $(CFLAGS) $(UTILS_OBJS) $(OBJS) -o $(OUT_DIR)/$(NAME)

$(OBJS_DIR)/%.o: $(SRCS_DIR)/%.c
	$(CC) $(CFLAGS) -c $< -o $@ -I$(INC_DIR)

clean:
	$(RM) -r $(UTILS_OBJS) $(LEXER_OBJS) $(OBJS)

fclean: clean
	$(RM) $(LEXER_NAME) $(NAME)

re: fclean all

.PHONY: re fclean clean all
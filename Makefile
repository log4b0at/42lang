SRCS_DIR	= srcs
OBJS_DIR	= objs
INC_DIR		= includes
SCRIPTS_DIR	= scripts

NAME		= ftlang
SRCS		= $(wildcard ./$(SRCS_DIR)/$(NAME)/*.c)
OBJS		= $(subst $(SRCS_DIR),$(OBJS_DIR),$(SRCS:.c=.o))

LEXER_NAME	= ftlex
LEXER_SRCS	= $(wildcard ./$(SRCS_DIR)/$(LEXER_NAME)/*.c)
LEXER_OBJS	= $(subst $(SRCS_DIR),$(OBJS_DIR),$(LEXER_SRCS:.c=.o))

2TEXT_NAME	= ft2text
2TEXT_SRCS	= $(wildcard ./$(SRCS_DIR)/$(2TEXT_NAME)/*.c)
2TEXT_OBJS	= $(subst $(SRCS_DIR),$(OBJS_DIR),$(2TEXT_SRCS:.c=.o))

UTILS_SRCS	= $(wildcard ./$(SRCS_DIR)/utils/*.c)
UTILS_OBJS	= $(subst $(SRCS_DIR),$(OBJS_DIR),$(UTILS_SRCS:.c=.o))

CC			= gcc
CFLAGS		= -Wall -Wextra -Werror
RM			= rm -f

all: $(SRCS_DIR)/$(LEXER_NAME)/state_table.c $(LEXER_NAME) $(2TEXT_NAME)

bnfcompiler:
	mingw32-make -C bnf

$(LEXER_NAME): $(UTILS_OBJS) $(LEXER_OBJS)
	$(CC) $(CFLAGS) $(UTILS_OBJS) $(LEXER_OBJS) -o $(LEXER_NAME)

$(2TEXT_NAME): $(UTILS_OBJS) $(2TEXT_OBJS)
	$(CC) $(CFLAGS) $(UTILS_OBJS) $(2TEXT_OBJS) -o $(2TEXT_NAME)

$(NAME): $(UTILS_OBJS) $(OBJS)
	$(CC) $(CFLAGS) $(UTILS_OBJS) $(OBJS) -o $(NAME)

$(OBJS_DIR)/%.o: $(SRCS_DIR)/%.c
	$(CC) $(CFLAGS) -Ofast -c $< -o $@ -I$(INC_DIR)

$(SRCS_DIR)/$(NAME)/state_table.c: $(SCRIPTS_DIR)/gen_state_table.js $(SCRIPTS_DIR)/lexer.js $(SCRIPTS_DIR)/state_machine.js
	node ./$(SCRIPTS_DIR)/gen_state_table.js

clean:
	$(RM) -r $(UTILS_OBJS) $(LEXER_OBJS) $(2TEXT_OBJS) $(OBJS)

fclean: clean
	$(RM) $(LEXER_NAME) $(2TEXT_NAME) $(NAME)

re: fclean all

.PHONY: re fclean clean all

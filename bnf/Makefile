
NAME		= simple
CFFILES		= simple.cf
YACCSRCS	= $(NAME).tab.c
YACCFILES	= $(YACCSRCS) $(NAME).tab.h
FLEXSRCS	= lex.yy.c
FLEXFILES	= $(FLEXSRCS)
BNFCSRCS	= Absyn.c Printer.c Skeleton.c Test.c
BNFCFILES	= $(BNFCSRCS) Absyn.h Printer.h Skeleton.h Parser.h $(NAME).y $(NAME).l

CPPFLAGS	=  -Ofast
RM			= del

all: $(NAME)

$(NAME):  $(YACCSRCS) $(FLEXSRCS) $(BNFCSRCS)
	gcc $(CPPFLAGS) $(BNFCSRCS) $(YACCSRCS) $(FLEXSRCS) -o $(NAME) -I.

%.y: %.cf
	bnfc -c $<

%.tab.c: %.y
	bison -d $<
	flex $(subst .y,.l,$<)

clean:
	$(RM) $(BNFCFILES) $(YACCFILES) $(FLEXFILES) 

fclean: clean
	$(RM) $(NAME)

re: fclean all
NAME				= ftlang.exe
BUILD				= out
PREBUILT			= $(BUILD)/prebuilt
PARSER				= $(BUILD)/parser
SRC					= src
LIB					= lib
GRAMMAR				= $(SRC)/lbnf/ftlang.cf
CC					= g++
CPPC				= g++
LD					= g++

ARCHIVE_EXTENSION 	= tar.gz
ARCHIVE_EXTRACTOR 	= tar -xf
ARCHIVE_OUTPUT_OPT	= -C

BUILD_REPO_URL		= https://github.com/log4b0at/ftlang-build
LLVM_VERSION		= 10.0.1
LLVM_ARCHIVE 		= $(LLVM_PREBUILT)/$(LLVM_VERSION).$(ARCHIVE_EXTENSION)
LLVM_PREBUILT		= $(PREBUILT)/llvm

LLVM_BACKEND_NAME	= llvmftlang.exe
LLVM_BACKEND_SRC	= $(SRC)/llvm
LLVM_BACKEND_INC	= $(LLVM_BACKEND_SRC)/inc
LLVM_BACKEND_BUILD	= $(BUILD)/llvm
LLVM_BACKEND_LIBS	= core executionengine mcjit interpreter analysis native bitwriter
LLVM_BACKEND_CFLAGS	= -g `$(LLVM_PREBUILT)/bin/llvm-config --cflags`
LLVM_BACKEND_LDFLAGS = `$(LLVM_PREBUILT)/bin/llvm-config --cxxflags --ldflags --libs $(LLVM_BACKEND_LIBS) --system-libs` -L$(LLVM_PREBUILT)/lib
LLVM_BACKEND		= $(BUILD)/$(LLVM_BACKEND_NAME)
LLVM_BACKEND_FILES  = $(wildcard $(LLVM_BACKEND_SRC)/*.cpp) $(wildcard $(LLVM_BACKEND_SRC)/*.c)
LLVM_BACKEND_OBJS	= $(subst $(LLVM_BACKEND_SRC),$(LLVM_BACKEND_BUILD), $(subst .c,.o,$(LLVM_BACKEND_FILES:.cpp=.o)))

RM			= rm -rf
MV			= mv
CP			= cp
CD			= cd
LN			= ln
MKDIR		= mkdir

all: $(BUILD)/$(NAME)

# MAIN COMPILER

$(BUILD)/$(NAME): $(LLVM_BACKEND)
	$(LN) $(LLVM_BACKEND) $(BUILD)/$(NAME)

# LLVM BACKEND

$(LLVM_BACKEND): $(LLVM_BACKEND_OBJS) $(LLVM_BACKEND_BUILD) $(LLVM_PREBUILT)  # $(BUILD)/parser $(LLVM_PREBUILT)
	$(LD) $< $(LLVM_BACKEND_LDFLAGS) -o $@

$(LLVM_BACKEND_BUILD)/%.o: $(LLVM_BACKEND_SRC)/%.cpp
	$(CPPC) $(LLVM_BACKEND_CFLAGS) -I$(LIB) -I$(LLVM_BACKEND_INC) -c $< -o $@

$(LLVM_BACKEND_BUILD)/%.o: $(LLVM_BACKEND_SRC)/%.c
	$(CC) $(LLVM_BACKEND_CFLAGS) -I$(LIB) -I$(LLVM_BACKEND_INC) -c $< -o $@

$(LLVM_BACKEND_BUILD):
	$(MKDIR) -p $(LLVM_BACKEND_BUILD)

# PARSER

$(BUILD)/parser:
	bnfc -m -cpp $(GRAMMAR) -o $(BUILD)/parser
	$(CD) $(BUILD)/parser && $(MAKE)

$(PREBUILT):
	git clone $(BUILD_REPO_URL) $(PREBUILT)

$(LLVM_PREBUILT): $(PREBUILT)
	$(MKDIR) $(LLVM_PREBUILT)
	$(ARCHIVE_EXTRACTOR) $(LLVM_ARCHIVE) $(ARCHIVE_OUTPUT_OPT) $(LLVM_PREBUILT)

clean:
	$(RM) $(wildcard $(BUILD)/*.o)

re:	clean all

.PHONY: all re clean

CC=g++
CFLAGS=-g `/cygdrive/c/Users/alpin/Downloads/llvmbuild/bin/llvm-config --cflags`
LD=g++
LDFLAGS= `/cygdrive/c/Users/alpin/Downloads/llvmbuild/bin/llvm-config --cxxflags --ldflags --libs core executionengine mcjit interpreter analysis native bitwriter --system-libs`

all: backend

clean:
	rm -rf *.o

.c.o:
	$(CC) $(CFLAGS) -I../includes -c $<

backend: backend.o
	$(LD) $< $(LDFLAGS) -o $@
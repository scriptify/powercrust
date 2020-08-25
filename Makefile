CC     = emcc
CPLUS  = emcc
# CC     = gcc
# CPLUS  = g++
AR     = ar
CFLAGS = -g -Wall -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s ALLOW_MEMORY_GROWTH=1 -s EXIT_RUNTIME=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["FS"]'
# CFLAGS = -g -Wall
_OBJS  = hull.o ch.o io.o crust.o power.o rand.o pointops.o fg.o math.o \
			   predicates.o heap.o label.o
OBJS   = $(patsubst %,src/%, $(_OBJS))
_HDRS  = hull.h points.h pointsites.h stormacs.h
HDRS   = $(patsubst %,src/%, $(_HDRS))
_SRC   = hull.c ch.c io.c crust.c power.c rand.c pointops.c fg.c math.c \
			   predicates.c heap.c label.c
SRC    = $(patsubst %,src/%, $(_SRC))
PROG   = powercrust
LIB    = lib$(PROG).a


all	: $(PROG) simplify orient

$(OBJS) : $(HDRS)

hullmain.o	: $(HDRS)

$(PROG)	: $(OBJS) src/hullmain.o
	mkdir lib/wasm
	$(CC) $(CFLAGS) $(OBJS) src/hullmain.o -o lib/wasm/$(PROG).js -lm
	# $(CC) $(CFLAGS) $(OBJS) src/hullmain.o -o lib/wasm/$(PROG) -lm
	$(AR) rcv lib/wasm/$(LIB) $(OBJS)

simplify: src/powershape.C src/sdefs.h
	$(CPLUS) -o lib/wasm/simplify src/powershape.C -lm

orient: src/setNormals.C src/ndefs.h
	$(CPLUS) -o lib/wasm/orient src/setNormals.C -lm

clean	:
	-rm -f $(OBJS) src/hullmain.o
	-rm -rf lib/wasm

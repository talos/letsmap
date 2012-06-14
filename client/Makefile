# tr -us "[:space:]" " " < templates/app.mustache | sed "s/ /\\\ /g"
# --define APP_TEMPLATE=\'`tr -d "[:space:]" < templates/app.mustache`\' \
#
all:
	mkdir -p public/js/lib
	cp -r lib public/js/lib
	cp -r ../research public/research
	cat src/letsmap.js \
	    src/views/* \
	    src/AnimatedTileLayer.js \
	    src/Magic8Ball.js \
	    > public/js/letsmap.js
	java -jar ../tools/closure-compiler/compiler.jar \
	    --compilation_level SIMPLE_OPTIMIZATIONS \
	    --process_jquery_primitives \
	    --summary_detail_level 3 \
	    --warning_level VERBOSE \
	    --externs externs/* \
	    --js src/letsmap.js \
	    --js src/views/* \
	    --js_output_file  public/js/letsmap.min.js
	cp -R lib public/js/

clean:
	rm -r public/js/*

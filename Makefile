all: clean js

clean:
	rm flickr.api.js
	rm flickr.api.min.js

js:
	cat src/md5.js > flickr.api.js
	echo "\n" >> flickr.api.js
	cat src/flickr.api.js >> flickr.api.js

	java -Xmx64m -jar lib/google-compiler/compiler-20100616.jar --js flickr.api.js > flickr.api.min.js
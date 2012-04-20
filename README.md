flickrapi-js
--

A Javascript library for talking to the Flickr API.

Uploads in Webkit related browsers should be possible (but aren't unless you
count uploading empty images as technically "working") and I've not gotten
around to working out the details yet.

Here's an example of how you might upload the contents of a `canvas` element to
Flickr:

	var api_key = 'FLICKR_API_KEY';
	var api_secret = 'FLICKR_API_SECRET';
	var auth_token = 'FLICKR_AUTH_TOKEN';

	var canvas = document.getElementById("some-canvas-thing");

	// note: the base64_decode function is left as an exercise to
	// the reader; I use the canvas2bytes method in 'canvasutils-js'
	// https://github.com/straup/canvasutils-js
	
	var data = canvas.toDataURL();
	var enc = data.replace("data:image/png;base64,", "");
	var bytes = base64_decode(enc);
	
	// note: technically the fully qualified namespace is
	// 'from.yahoo.flickr' but when possible that's aliased
	// to just plain old 'flickr'
	
	var fl = flickr.api(api_key, api_secret);
	fl.upload(bytes, {'auth_token': auth_token});

To do a plain old un-authenticated API call you might do:

	var callback = function(rsp){
		console.log(rsp);
	};
	
	var fl = flickr.api(api_key);
	fl.api_call('flickr.photos.getInfo', {'photo_id': 6948301294}, callback);

IMPORTANT: This is still plain old Javascript and if you fill in all those
FLICKR `API` and `AUTH` variables with real data and then put them on the
public Internet **anyone will be able to see them, steal them and start
uploading stuff to that account**.

This is not a magic pony so be careful how you use it and where.

Caveats
--

* Uploading files still only works in Firefox and Opera.

* Uploading files still lack a callback mechanism/flow.

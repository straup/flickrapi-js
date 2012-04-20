var from = {
    yahoo: {
	flickr: {}
    }
};

if (flickr === undefined){
    var flickr = from.yahoo.flickr;
}

from.yahoo.flickr.api = function(api_key, api_secret){

    var api_key = api_key;
    var secret = api_secret;

    var fl = {};

    fl.api_call = function(method, args, callback){

	args['api_key'] = api_key;
	args['method'] = method;
	args['format'] = 'json';
	args['nojsoncallback'] = 1;

	if (args['auth_token']){
	    api_sig = this.sign_args(args);
	    args['api_sig'] = api_sig;
	}

	var fd = new FormData();

	for (var k in args){
	    fd.append(k, args[k]);
	}

	var xhr = new XMLHttpRequest();  
        xhr.open("POST", 'http://api.flickr.com/services/rest/', true);

        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4){

		if (! callback){
		    return;
		}

		try {
		    rsp = JSON.parse(xhr.responseText);
		    callback(rsp);
		}

		catch(e){
		    callback({'stat': 'error', 'error': { 'code': 999, 'message': 'failed to parse JSON' }});
		}

            }
        };

	xhr.send(fd);
    };

    fl.upload = function(bytes, args){

	args['api_key'] = api_key;

	api_sig = this.sign_args(args);

	args['api_sig'] = api_sig;
	args['photo'] = bytes;

	if (typeof(bytes) === 'string'){
	    return this._upload_binary(args);
	}

	/*
	  this doesn't work as expected yet, I'm not sure
	  why but I am assuming it has to do with remaining
	  weirdness around how blobs are implemented...
	*/
	   
	return this._upload_blob(args);
    };
    
    fl.sign_args = function(args){

	var argument_pairs= [];

	for (var key in args){
            argument_pairs[argument_pairs.length] = [key, args[key]];
	}
    
	argument_pairs.sort(function(a, b){

            if (a[0] == b[0]){
		return 0;
	    }

            if (a[0] < b[0]){
		return -1;
	    }

	    return 1;
	});

	var raw = secret;

	for (var i=0; i < argument_pairs.length; i++){
            raw += argument_pairs[i][0];
            raw += argument_pairs[i][1];
	}

	return hex_md5(raw);	
    };

    /*
      this is the "correct" way to do things except for the
      part where it just causes a black square to be uploaded
      in firefox and a white one in safari...
    */

    fl._upload_blob = function(args){

	var fd = new FormData();

	for (var k in args){
	    fd.append(k, args[k]);
	}

	var xhr = new XMLHttpRequest();  
        xhr.open("POST", 'http://api.flickr.com/services/upload/', true);

        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4){
		// DO SOMETHING HERE...
                // console.log(xhr);
            }
        };

	xhr.send(fd);
    };

    /* https://github.com/igstan/ajax-file-upload */

    fl._upload_binary = function(params){

        var boundary = this._generate_multipart_boundary();
        var xhr = new XMLHttpRequest;

        xhr.open("POST", 'http://api.flickr.com/services/upload/', true);

        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
		// DO SOMETHING HERE...
                // console.log(xhr);
            }
        };

        var contentType = "multipart/form-data; boundary=" + boundary;
        xhr.setRequestHeader("Content-Type", contentType);

        xhr.sendAsBinary(this._build_multipart_message(params, boundary));
    };

    fl._generate_multipart_boundary = function(){
        return "---------------------------" + (new Date).getTime();
    };

    /* this is very much flickr specific */

    fl._build_multipart_message = function(params, boundary){
        var CRLF  = "\r\n";
        var parts = [];

	for (var k in params){

            var part = "";

            if (k == 'photo'){
                var fieldName = 'photo';
                var fileName  = 'photo';

                part += 'Content-Disposition: form-data; ';
                part += 'name="' + fieldName + '"; ';
                part += 'filename="'+ fileName + '"' + CRLF;
                part += "Content-Type: application/octet-stream" + CRLF + CRLF;
                part += params[k] + CRLF;
            }

	    else {
                part += 'Content-Disposition: form-data; ';
                part += 'name="' + k + '"' + CRLF + CRLF;
                part += params[k] + CRLF;
            }

            parts.push(part);
        }

        var request = "--" + boundary + CRLF;
            request+= parts.join("--" + boundary + CRLF);
            request+= "--" + boundary + "--" + CRLF;

        return request;
    };

    return fl;
};

/* http://javascript0.org/wiki/Portable_sendAsBinary */

if (XMLHttpRequest.prototype.sendAsBinary == undefined){

    /*
      this only seems to work in opera so far, webkit
      won't fail but will only send a black or white
      image instead of the thing you're trying to upload
    */

    XMLHttpRequest.prototype.sendAsBinary = function(datastr){

	function byteValue(x) {
	    return x.charCodeAt(0) & 0xff;
	}

	var ords = Array.prototype.map.call(datastr, byteValue);
	var ui8a = new Uint8Array(ords);

	this.send(ui8a.buffer);
    };

}

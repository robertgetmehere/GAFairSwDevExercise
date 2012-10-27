(function() {

    /* REQUIRED INCLUDES */
    var url             = require('url');
    var util            = require('util');
    var _               = require('underscore');
    var http            = require('http');
    var fs              = require('fs');

    /*INITIALIZE SERVER*/

    var express = require('express')
        ,app = express.createServer(
                    express.cookieParser()
                    ,express.session({ secret: 'xDe45Xc12_45tyu', maxAge: 86400000 })
                )
    ;

    app.set("view options", {layout:false});
    app.use(express.static(__dirname + '/public'));

    app.configure(function () {
        app.use(express.bodyParser({keepExtensions: true,uploadDir: '/tmp'}));
        app.use(express.methodOverride());
        app.register('.html', {
            compile:function (str, options) {
                return function (locals) {
                    return str;
                };
            }
        });
    });

    app.post('/',function(req,res){
        if (req.files.fileName.length > 0 && typeof req.body.searchText != 'undefined') {
            var readStream = fs.ReadStream(req.files.fileName.path);
            readStream.setEncoding('ascii');
            var out = '';

            readStream.on('data', function(textData) {
                out += textData;
            });

            readStream.on('close', function () {
                console.log("I finished reading - now start processing");
                console.log('file is ' + out.length + ' characters in length');
                //step 1: clean out punctuation and consolidate white space
                out = out.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
                //step 2: convert to lower case
                out = out.toLowerCase();
                //step 3: strip title text - begin at chapter 1
                //this could be a parameter in the form
                //as could where to stop too

                out = out.substring(out.indexOf('chapter 1')+9,out.length);

                //step 4: split into words
                var words = out.split(/[\s\/]+/g);

                //step 5: calculate frequency and position

                res.send();
            });


        } else {
            logError(res,'file required');
        }
    });
    app.listen(8443);

    var logError=function(res,msg) {
        console.log(msg);
        res.send({errorLevel: 1,message:msg});

    }

}).call(this);

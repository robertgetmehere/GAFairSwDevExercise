(function() {

    /* REQUIRED INCLUDES */
    var url             = require('url');
    var util            = require('util');
    var _               = require('underscore');
    var http            = require('http');
    var fs              = require('fs');
    var debug           = false;

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
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.set('view options', {layout : false})

/*        app.register('.html', {
            compile:function (str, options) {
                return function (locals) {
                    return str;
                };
            }
        });*/
    });

    app.get('/', function(req, res){
        res.render('index', {layout : false});
    });

    app.get('/result',function(req,res){
        res.render('result');
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


                console.log("finished reading file - start processing");

                console.log('\n>>file is ' + out.length + ' characters in length\n');

                console.log('step 1: clean out punctuation and consolidate white space');

                out = out.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");

                console.log('step 2: convert to lower case');

                out = out.toLowerCase();

                console.log('step 3: start at chapter 1 - ignore title and terms');

                out = out.substring(out.indexOf('chapter 1')+9,out.length);

                console.log('step 4: split into words');

                var words = out.split(/[\s\/]+/g);

                console.log('\n>>found ' + words.length + ' words\n');

                console.log('step 5: calculate frequency and position');

                var counts = new Array(); // object for math
                var totalCount = 0;
                for (var i=0; i<words.length; i++) {
                    var sWord = words[i];
                    if (sWord == req.body.searchText.toLowerCase()) {
                        if (debug) console.log('found ' + req.body.searchText + ' at position ' + i);
                        counts.push(i);
                        totalCount++;
                    }
                }

                console.log('\n>>found ' + req.body.searchText + ' a total of ' + totalCount + ' times\n');

                console.log('step 6: calculate average number of words between each occurrence');

                var tmp = 0;
                for (var i=0;i<counts.length-1;i++){
                    tmp += counts[i+1]-counts[i];
                    if (debug) console.log('words between is ' + (counts[i+1]-counts[i]));
                }

                console.log('\n>>average number of words between each occurrence is ' + Math.round(tmp/totalCount,2) + '\n');

                console.log('step 7: find the most common 3 word phrase in the text');
                //use a rolling average as we don't know where a 3 word phrase starts or finishes
                //store each 3 word triple in a new array (threeword)

                var threeword = new Array();
                for (var i=0;i<words.length-2;i++) {
                    threeword.push(words[i] + ' ' + words[i+1] + ' ' + words[i+2]);
                }

                console.log('step 8: count the number of occurrences of each 3 word triple');
                //store occurrences in object literal so we can reference occurrences
                //if word is not yet in list add it and increment count of occurrences by 1
                //if word is already in list then increment number of occurrences by 1

                var threecounts = {};
                for (var i=1;i<threeword.length;i++) {
                    var sWord = threeword[i];
                    threecounts[sWord] = threecounts[sWord] || 0;
                    threecounts[sWord]++;
                }

                var most = {triple: '',frequency:0};

                console.log('step 9: work out which 3 word triple is the most common');

                for (sWord in threecounts) {
                    var r={
                        triple: sWord,
                        frequency: threecounts[sWord]
                    };
                    if (r.frequency > most.frequency) {
                        most.triple = r.triple;
                        most.frequency = r.frequency;
                    }
                }

                console.log('\n>>most common three word phrase is "' + most.triple + '" which occurs ' + most.frequency + ' times\n');

                console.log('step 10: create output object to store calculated results');

                var ret = {
                    errorLevel:             0
                    ,searchWord:            req.body.searchText
                    ,timesFound:            totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    ,averageWordDistance:   Math.round(tmp/totalCount,2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    ,fileLength:            out.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    ,wordCount:             words.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    ,tripleWord:            most

                };

                console.log('step 8: return result to result.jade template');

                res.render('result',{result:ret,layout : false});
            });


        } else {
            logError(res,'file required');
        }
    });

    app.listen(8443);

    var logError=function(res,msg) {
        console.log(msg);
        ret = {errorLevel: 1,message:msg};
        res.render('result',{result: ret,layout:false});
    }

}).call(this);

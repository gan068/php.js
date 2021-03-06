/* 
* @author Niklas von Hertzen <niklas at hertzen.com>
* @created 9.7.2012 
* @website http://hertzen.com
 */
var fs = require('fs'),
vm = require('vm'),
url = require("url");

function parsePHPT( src ) {



    var types = ["TEST","DESCRIPTION","CREDITS","SKIPIF","REQUEST","POST","PUT","POST_RAW","GZIP_POST","DEFLATE_POST","GET","COOKIE","STDIN","INI","ARGS","ENV","FILE","FILEEOF","FILE_EXTERNAL","REDIRECTTEST","HEADERS","CGI","XFAIL","EXPECTHEADERS","EXPECT","EXPECTF","EXPECTREGEX","CLEAN","EXPECTTOKEN"];

    var re = new RegExp("--(" + types.join("|") + ")--\\s+");

    var results = src.toString().split( re ).slice(1);

    var result = {};

    for (var i = 0, len = results.length; i < len; i+=2) {
        result[ results[ i ].trim() ] = results[ i + 1 ];
    }


    return  result;


}

function diff( expect, result ) {
                
    var len = expect.length;
                
                
    for (var i = 0; i < len; i++) {
        if (expect[ i ] !== result[ i ]) {
            console.log( "Diff at #", i , expect[ i ], result[ i ], expect.charCodeAt( i ), result.charCodeAt( i ), expect.charCodeAt( i + 1 ), result.charCodeAt( i + 1 ), expect.charCodeAt( i - 1 ), result.charCodeAt( i - 1 ) );
            return;
        }
    }
                
          
                
              
                
};

function runTest ( file ) {




    fs.readFile(file, function (err, data) {
        if (err) throw err;
        var test = parsePHPT( data );
        
        var content = fs.readFileSync( 'PHP.js', 'utf8') ;


        eval(content + "GLOBAL.PHP = PHP; ");
      
        
        var engine = {},
                
        opts = {
            POST: test.POST,
            RAW_POST: test.POST_RAW,
            GET: test.GET,
            //        POST: ( test.POST !== undefined ) ? PHP.Utils.QueryString( test.POST ) : (test.POST_RAW !== undefined ) ? RAW.Post() : {},
            //      GET: ( test.GET !== undefined ) ? PHP.Utils.QueryString( test.GET ) : {},
            //    RAW_POST: ( test.POST !== undefined ) ?  test.POST.trim()  : (test.POST_RAW !== undefined ) ? RAW.Raw() : "",
            SERVER: {
                SCRIPT_FILENAME: __dirname.replace(/\\/g,"/") + "/" + file.substring(5, file.length - 1)
            },
            ini: (test.INI !== undefined ) ? PHP.ini( test.INI ) : {},
        //       FILES: (test.POST_RAW !== undefined ) ? RAW.Files() : {}
        };
                    
                   
                    
        if (test.ARGS !== undefined ) {
            var args = test.ARGS.trim().split(/\s/);
                       
            args.unshift( file ); // first argument is filename
                        
            opts.SERVER.argc = args.length;
            opts.SERVER.argv = args;
                        
        } else if (test.GET !== undefined) {
            var args = test.GET.replace(/\+/g," ").trim().split(/\s/);
            opts.SERVER.argc = args.length;
            opts.SERVER.argv = args;
        }
                    
        opts.filesystem = fs;
                    

        //     var exec = new Function( "test", "opts", content + "return new PHP( PHP.Lexer(test.FILE), opts );" );
        //    engine = exec.call({}, test, opts);
        var log = console.log;
         
             engine = new PHP( test.FILE, opts );

        

              
        var expect = ((test.EXPECT === undefined) ? test.EXPECTF : test.EXPECT ).trim(),
        output = engine.vm.OUTPUT_BUFFER.replace(/\n/g, "\r\n").trim(),
        expectResult;
                    
        if (test.EXPECT === undefined ) {
            var shouldBef = expect.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            shouldBef = shouldBef.replace(/\%d/g,"\\d+");
            shouldBef = shouldBef.replace(/\%s/g,".+");
            shouldBef = shouldBef.replace(/\%S/g,".*?");
                        
            var re = new RegExp("^" + shouldBef + "$", "i");
                    
            expectResult = re.test( output );
                        
        } else {
            //   diff( expect, output );

            expectResult = (expect === output);
        }
            
                           log( output );       
        if ( expectResult ) {
        //     console.log( "SUCCESS " + file, output );
                     
            log("SUCCESS")
        } else {
    //   console.log( "FAILED " + file, output );
           log("FAILED")
    }
        
        
        
        
  
        
    
        
        
        
    }); 
            
}




runTest("tests/php/basic/rfc1867_post_max_filesize.phpt");
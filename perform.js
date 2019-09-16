var vm = require('vm');
var request = require('request').defaults({ encoding: null });

function perform_function(context,request,response){
  var job_id = context.jobconfig.job_id;
  var transaction_id = context.transaction.id;
  var param = context.jobconfig.data_out.param;
  var data = request.data;
  var meta = request.meta;

  var output_type = 'text';
  var url = param.url;
  var body = param.body;
  var env = {
    'output' : {
      'meta' : meta,
      'data' : data
    },
    'url' : '',
    'body':'',
    'meta' : meta,
    'data' : data
  }

  var script = new vm.Script("url=`" + url + "`;body=`" + body + "`");
  var context = new vm.createContext(env);
  script.runInContext(context);
  
  url = env.url;
  body = env.body;


  var reject = true;
  if(typeof param.reject != 'undefined' && param.reject.toString()=="false"){reject=false;}

  var encode = 'utf8'

  //Http Header
  var http_headers = {};
  if(param.auth){
    if(param.auth.type == 'basic'){
      var auth_header  = "Basic " + new Buffer(param.auth.username + ":" + param.auth.password).toString("base64");
      http_headers.Authorization = auth_header;
    }
  }

  
  if(typeof param.headers == 'object')
  {
    http_headers = Object.assign(http_headers,param.headers)
  }
  
  var method = param.method || 'GET'
  var option = {'method': method,'url':url,'headers':http_headers ,'encoding':encode}
  
  // Setup Body if POST or PUT
  if(method == 'POST' || method == 'PUT') {
    //console.log(body)
    if(option.headers['content-type'] && option.headers['content-type'] == 'application/json') {  
        option.body = JSON.parse(body.replace(/\n/g, "\\n"))
        option.json = true 
    } else {
        option.body = body
    }
  }
  //console.log(option);  
  send_request(option,function(err){
    
    if(!err){
      response.success();
    }else{
      //console.log(err)
      response.error(err);
    }
  })
}
function send_request(option,cb){
  console.log(option);
  request(option, function (error, resp, body) {
    if (!error && resp.statusCode == 200) {
      var r = JSON.parse(body);
      if(r.status==200){
        cb(null,r.body);
      }else{
        cb(new Error("send error"));
      }
    }else{
      console.log(error);
      console.log(option);
      cb(new Error("Error"))
    }
  });
}

module.exports = perform_function;


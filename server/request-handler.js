const http = require('http');
const url = require('url');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

var exports = module.exports = {};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var fileSender = function(pathname, response, contentType) {
  var oldMessage = fs.readFile(pathname, function (err, data) {
    if (err) {
      console.log('error getting ', pathname);
      response.statusCode = 500;
      response.end('error getting ', pathname);
    } else {
      console.log('success getting ', pathname);
      response.setHeader('Content-type', contentType);
      response.end(data);
    }
  });
};

exports.requestHandler = function(request, response) {

  var headers = defaultCorsHeaders;
  var statusCode = 200;

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  var parsedUrl = url.parse(request.url);
  
  var pathname = `client${parsedUrl.pathname}`;
  
  if (pathname === 'client/chatterbox') {
    pathname = 'client/';
  }
  
  console.log('the pathname is ', pathname);
  
  //CASE: url is {base}/chatterbox/classes/messages. GET request
  if (pathname === 'client/chatterbox/classes/messages' && request.method === 'GET') {
    fileSender('messages.json', response, 'application/json');
    return;
  } else if (pathname === 'client/chatterbox/classes/messages' && request.method === 'OPTIONS') {
    response.writeHead(200, 'OK', headers);
    return;
  } else if (pathname === 'client/chatterbox/classes/messages' && request.method === 'POST') {
    var body = '';
    request.on('data', (chunk) => {
      body += chunk;
      response.writeHead(200, 'OK', headers);
    });

    request.on('end', function() {
      try {
        var post = querystring.parse(body);
        console.log('post received');
        //handle data here:
        fs.readFile('messages.json', (err, data) => {
          //if (err) throw err;
          let messages = JSON.parse(data);
          post.objectId = messages.results.length;
          messages.results.push(post);
          fs.writeFile('messages.json', JSON.stringify(messages), (err) => {
            //if (err) throw err;
          });
        });
        
      } catch(e) {
        console.error(e.message);
      }
    }).on('error', (e) => { console.error(`Got error: ${e.message}`); });
    return;
  }
  
  
  
  
  

  
  
  //CASE: static file serving


  //check if file exists
  fs.exists(pathname, function (exist) {
    if (!exist) {
      response.statusCode = 404;
      response.end(`File ${pathname} not found!`);
      return;
    } else {
      console.log('the file exists!', pathname);
    }
  });
  
  //check if is a directory
  if (fs.statSync(pathname).isDirectory()) {
    pathname = 'client/index.html';
  }
  
  //read file
  fileSender(pathname, response, '');
  return;
  
  

    
};



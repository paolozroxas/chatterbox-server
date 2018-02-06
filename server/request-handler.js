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

exports.requestHandler = function(request, response) {

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  var statusCode = 200;

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  var parsedUrl = url.parse(request.url);
  
  
  // if (request.method === 'POST') {
  //   var body = '';
  //   request.on('data', function() {
  //     body += data;
  //   });

  //   request.on('end', function() {
  //     var post = querystring.parse(body);
  //   });
  // }
  var pathname = `client${parsedUrl.pathname}`;
  
  if (pathname === 'client/chatterbox') {
    pathname = 'client/';
  }
  
  console.log('the pathname is ', pathname);

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

  if (pathname === 'client/') {
    
    //check if is a directory
    if (fs.statSync(pathname).isDirectory()) {
      pathname = 'client/index.html';
    }
    
    //read file
    fs.readFile(pathname, function (err, data) {
      if (err) {
        console.log('error getting ', pathname);
        response.statusCode = 500;
        response.end('error getting ', pathname);
      } else {
        console.log('success getting ', pathname);
        response.setHeader('Content-type', 'text/html');
        response.end(data);
      }
    });
    
  }
};



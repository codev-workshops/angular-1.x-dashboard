'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');
var root = path.resolve(__dirname, '..');
var port = Number(process.env.PORT || 3000);
var appIndex = path.join(root, 'harness/angular/index.html');
var mime = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript',
  '.png': 'image/png'
};

http.createServer(function (request, response) {
  var requestPath = decodeURIComponent(request.url.split('?')[0]);
  var filePath = path.resolve(root, '.' + requestPath);
  if (filePath.indexOf(root + path.sep) !== 0 && filePath !== root) {
    response.writeHead(403);
    return response.end('Forbidden');
  }
  fs.stat(filePath, function (error, stats) {
    if (error || !stats.isFile()) {
      if (requestPath.indexOf('/src/') === 0 ||
          requestPath.indexOf('/dist/') === 0 ||
          requestPath.indexOf('/harness/') === 0) {
        response.writeHead(404);
        return response.end('Not found');
      }
      response.writeHead(200, { 'Content-Type': 'text/html' });
      return fs.createReadStream(appIndex).pipe(response);
    }
    response.writeHead(200, {
      'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(response);
  });
}).listen(port, function () {
  console.log('Serving ' + root + ' at http://localhost:' + port);
});

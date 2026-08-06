#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '../..');
const root = __dirname;
const port = Number(process.env.PORT || 8000);
const mappings = [
  ['/app/', path.join(repo, 'src/app')],
  ['/template/', path.join(repo, 'src/app/template')],
  ['/components/', path.join(repo, 'src/components')],
  ['/dist/', path.join(repo, 'dist')],
  ['/bower_components/', path.join(repo, 'bower_components')],
  ['/src/', path.join(repo, 'src')],
];

function fileFor(urlPath) {
  if (urlPath === '/' || urlPath === '/index.html') {
    return path.join(root, 'index.html');
  }
  if (urlPath === '/app/template/WidgetSpecificSettings.html') {
    return path.join(repo, 'src/app/template/widgetSpecificSettings.html');
  }
  for (const [prefix, directory] of mappings) {
    if (urlPath.startsWith(prefix)) {
      return path.join(directory, urlPath.slice(prefix.length));
    }
  }
  if (urlPath === '/favicon.ico') {
    return path.join(repo, 'src/favicon.ico');
  }
  if (urlPath === '/person.png') {
    return path.join(repo, 'src/person.png');
  }
  return path.join(root, urlPath.replace(/^\/+/, ''));
}

const mime = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript',
  '.png': 'image/png',
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const filename = fileFor(pathname);
  fs.stat(filename, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
    });
    fs.createReadStream(filename).pipe(response);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Legacy demo server listening at http://127.0.0.1:${port}`);
});

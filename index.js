var publicFolder = '/folder'; // pasta onde fica os arquivos
var scrapperConf = require("./config/scrapperConf");
var config = require('config');
var path = require('path');
var fs = require('fs');
var http = require('http');
var mime = require('mime');
var filesInConfig = require("./config/files");
if (process.env.http_proxy) {
  scrapperConf['proxy'] = process.env.http_proxy;
}
var sendHeader = function (mimeType, response) {
  response.setHeader('Connection', 'Transfer-Encoding');
  response.setHeader('Content-Type', mimeType + '; charset=utf-8');
  response.setHeader('Transfer-Encoding', 'chunked');
};
var sendOutput = function (data, response) {
  response.write('');
  response.write(data);
  response.end();
}
var outputDir = function (filename, response) {
  sendHeader('text/html', response);
  var out;
  try {
    out = require('child_process').execSync('ls -lA1 ' + filename + '');
    out = '<h1>Diretorio: ' + filename + '</h1>\n<pre>' + out + '</pre>';
  } catch (e) {
    out = '<h1> Ocorreu um erro no diretorio</h1>\n' + e.message;
  }
  sendOutput(out, response);
};
var requestListener = function (request, response) {
  'use strict';
  var uri, filename, mimeType;
  uri = require('url').parse(request.url).pathname;
  filename = path.join(process.cwd() + publicFolder, uri);
  if (uri === '/') {
    uri = 'index.html';
    filename = filename + 'index.html';
  }
  uri = uri.replace(/\//g, ''); // remove slashes before comparation
  mimeType = mime.lookup(filename);
  var isFile, isDir;
  try {
    isFile = fs.lstatSync(filename).isFile();
    isDir = fs.lstatSync(filename).isDirectory();
  } catch (e) {
    isFile = false;
    isDir = false;
  }
  var existInConfig = typeof filesInConfig[uri] !== 'undefined'
  if (isFile || existInConfig) {
    sendHeader(mimeType, response);
    fs.exists(filename, function (exists) {
      if (exists) {
        fs.readFile(filename, 'utf8', function (err, source) {
          if (existInConfig) {
            filesInConfig[uri](source, response);
          } else {
            fs.createReadStream(filename).pipe(response);
            return;
          }
        });
      } else {
        sendOutput('404 Not Found\n', response);
      }
    });
  } else if(isDir) {
    // caso diferente do previsto, eh um diretorio 
    sendHeader('text/html', response);
    if (isDir) {
      outputDir(filename, response);
    } else {
      sendOutput('404 Not Found dir \n', response);
    }
  } else {
    sendOutput('404 Not Found file or dir\n', response);
  }
};
console.log(
  'HOSTNAME: ' + config.util.getEnv('HOSTNAME'),
  'PROXY', process.env.http_proxy,
  'Scrapperconf:', scrapperConf
);
http.createServer(requestListener).listen(8888);
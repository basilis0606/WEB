// Node does not execute code directly but it wraps each module in
// an immediately invoked function 'ifi'. As node is a runtime environment
// at runtime the code is wrapped in a LOCAL function as follows:
// (function (exports, require, module, __filename __dirname)) { code })
// The fact that the wrapper is local makes the require field mandatory.
// We can export a function using the export keyword in ES modules.
// Use module.exports.object = object or module.exports = function 
// in CommonJS in order to export code.

"use strict";

import { mariadbConnection } from './mariadb.mjs';
import { EventEmitter } from 'events';
import { createServer } from 'http';
import { parse } from 'url';
import { readFile } from 'fs';

// emmiter is the created object from the
// imported class EventEmitter();
const emitter = new EventEmitter();
const port = 8080;

// Create an event handler for not founding files:
let eventFileNotFound = function( fileName ){
    console.log('File : ' + fileName + ' Not Found');
}

// Assign the event handler to and event === Name the event:
emitter.on('fileNotFound', eventFileNotFound);
await mariadbConnection()

// http module is used to create a Server. the Server class
// inherits from net.Server which in turn is an EventEmitter
// extension.
// Everytime there is a new connection or an new request 
// the server raises a new event.
// We can create eventlisteners to handle those events
// Or usually we create a callback function(req,res)

const server = createServer( function(request,result){
    result.writeHead(200, { 'Content-type': 'text/html'});
    let requestedFile = '../htmlResources/' + parse(request.url, true).pathname;
    readFile( requestedFile, function(error,data){
        if ( !error ) {
            result.write(data);
        } else {
            result.writeHead(404);
            result.write('Error: File Not Found');

            // A good practice is to actually wrap event arguments
            // into a created object { arguments }
            emitter.emit('fileNotFound',requestedFile);
        }
        result.end();
    })
}).listen(port);

// In truth we do never want to build a backend server statically 
// just using the http module. We use express framework that is 
// build ontop of http module to handle http requests/respones

// USE nodemon : 
// 1. insert into package.json under "scripts" : 
// { "devStart": "nodemon server.js" , ...}
// 2. npm run devStart -> dynamic backend for 
// Development
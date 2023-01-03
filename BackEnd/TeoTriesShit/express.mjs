"use strict";
import { storesToGeoJson,tableInfo,storeInfo } from './dbToNode.mjs';
import express from 'express';
import * as url from 'url'
import path from 'path';

// 1 day in ms
const ms1d = 86400000

// Create the express Server Object. By default 4 methods are available:
// put, post, get and delete which corespond to the known HTTP methods
const server = express();

// Get the absolut file path of the server
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __basename = path.join(__dirname,'..');

// Query the needed arrays from the database:
let stores = await storesToGeoJson();
let categories = await tableInfo('categories',['*']);

// Lets create an endpoint for a http get request: url, callback.
// The callback will be executed when we have an HTTP Get request 
// at the specified path. The callback Function is also called
// A Route Handler

// Send the Map
server.get('/', (req,res) => {
	let options = {
		root: path.join(__basename,'htmlResources'),
		// Set the maxAge in the http header. This must be tuned later.
		// Also consider immutable and headers options
		maxAge:  ms1d	
	}
	let fileName = "/map.html";
	res.sendFile(fileName, options, (err)=>{
		if(err){res.status(404);} 
	});
});

// Send Custom Icons
server.get('/iconResources/:file',(req, res)=>{
	let options = {
		root: path.join(__basename,'iconResources'),
		maxAge: 30*ms1d
	}
	res.sendFile(req.params.file, options, (err)=>{
		if(err){res.status(404);} 
	});
});

// Request available Stores
server.get('/api/stores/', (req,res) => {
	res.send(JSON.stringify(stores));
});

// Request information about a Store based on id:
server.get('/api/store/:id', (req,res) => {
	// if store id does not exists
	// json.stringify(result)=[]
	// Empty json will be returned
	// If we want to alter this behavior
	// we need to query the amount of stores
	// in our database and check whether
	// the wanted id exists or not
	let store = storeInfo(req.params.id);
	store.then((result)=>{
		res.send(JSON.stringify(result));
	});
	store.catch(()=>{
		res.status(500);
	})
});

// Request Categories
server.get('/api/categories', (req,res) =>{
	res.send(JSON.stringify(categories));
})

// Atlernate the port value dynamically based on the process's environment
// export SRV_PORT=8080 ( set for windows )
const port = process.env.SRV_PORT || 3000;

// We also need to listen to a specified port, we can also pass a callback 
// Function to be executed when the server starts
server.listen(port, () => {
	console.log(`Listening at port ${port}..`);
});

/*============================== Examples ============================== */


// This is called route pararemeters
// Example Url: root/api/stores/1/2/etc
// The parameters can be chained
server.get('/api/example/:id', (req,res) => {
	res.send(req.params.id);
});

// We can also incorporate query string
// parameters -> symbolized with
// ?name_value=pairs and can be chained
// using ?name1=v1&&name2=v2
// We use query sting parameters to provide
// additional/optional data to the backend
server.get('/api/example/:id', (req,res) => {
	// Check if the data exists 
	// else by rest standards return
	// 404 status code
	const example = examples.find( c => c.id === parseInt(req.params.id));
	if (!example) res.status(404).send('example not found');
	res.send(req.query);
});

// In order to parse the body of a request
// as a json object, we have to enable 
// the feature.-> server.use(express.json())
// We are using a layer of middlewear ->
// express.json() and we are using it with
/// server.use
server.post('/api/examples',(req,res)=>{
	// In order to use req.body.name
	// use(express.json()) is mandatoty
	const example = {
		name: req.body.name
	};
	// Do something with example
	// Validate the input
	// In case of user error:
	// return res.status(400)  
	//console.log(example);
	// After We commonly may need to 
	// send this object back to the 
	// client to update a json array
	// use it .. etc.
	res.send(example);
	// In a real application is it 
	// is always better to validate 
	// the input
})

// We are updating a specific object
// Thats why we are using route parameters
// Firstly check if the object beeing 
// updated exists, if not return 404
// Secondly validate the input
server.put('/api/example/:id',(res,req)=>{
	const example = examples.find( c => c.id === parseInt(req.params.id))
	if (!example) return res.status(404).send('example not found');
	// Validate the input -- may use joi npm package
	example.name = req.body.name;
	// Update the client
	res.send(example);	
});

// Lastly as it is logically extracted
// with the same way we deal .delete http
// requests.
server.delete('/api/example/:id',(res,req)=>{
	// 1. Check if object under deletion exists
	// Else return 404
	const example = examples.find( c => c.id === parseInt(req.params.id))
	if (!example) return res.status(404).send('example not found');
	// Get the wanted index of the object array
	const index = examples.indexOf(example)
	examples.splice(index,1); // or delete examples[index]

})

'use strict'

import path from 'path';
import express from 'express';
import * as url from 'url';
import fs from 'fs';
import { tableInfo } from '../dbToNode.mjs';

//current directory
const __dirname = url.fileURLToPath(new URL('..', import.meta.url));

export const adminRouter = express.Router();

//use of static admin home page assets
adminRouter.use('/', express.static(path.join( __dirname, 'users')));

//get, post, modify ?? what's it gonna be? change in the fetch request as well
adminRouter.get('/products', (req, res) => {
    //path to json
    const jsonFilePath = path.join(__dirname, 'dataJSONs/product_categories.json');
    //read the JSON file asynchronously
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Internal Server Error');
        }
        try {
            const jsonData = JSON.parse(data);
            res.send(jsonData);

        //send the html table code back to the front end. 
        } catch (jsonErr) {
            console.error('Error parsing JSON:', jsonErr);
            return res.status(500).send('Internal Server Error');
        }
    })

    //what about avg prices? (admin will not even modify them anyways)
    //if we want them, query the db and send JSON.stringify(result)

    
})

adminRouter.get('/stores', async(req,res) => {
    //get stores info from DB and send to front-end
    try {
        let storesInfo = await tableInfo('stores', ['id', 'sale_exists','lat', 'lon']);
        res.send(JSON.stringify(storesInfo));
    }catch(error){
        res.status(500).send('Error 500: Internal server error.');
    }
})

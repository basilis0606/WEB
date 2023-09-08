//necessary because in DB we only had id and name of stores, but we need more for the front-end.
//So, we take the info from the json, but it has different ids for the stores
import fs from 'fs'
import path from 'path'
import * as url from 'url';

//current directory
const __dirname = url.fileURLToPath(new URL('..', import.meta.url));
const filepath = path.join(__dirname, 'dataJSONs/ot_patra.json')

// Read the JSON file
fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading input file:', err);
        return;
    }

    try {
        // Parse the JSON data into an array of objects
        const jsonArray = JSON.parse(data);
        let i=1;
        // Modify the specific key's value in each object
        jsonArray.elements.forEach((jsonObj) => {
            // Replace 'keyToChange' with the key you want to modify
            jsonObj.id = i; // Replace 'new_value' with the desired value
            i++;
        });

        // Convert the updated array back to a JSON string
        const updatedJsonString = JSON.stringify(jsonArray, null, 2);

        // Write the updated JSON string to the output file
        fs.writeFile(filepath, updatedJsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing output file:', err);
        } else {
            console.log('JSON objects updated and saved to output file.');
        }
        });
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
})
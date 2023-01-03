"use strict"
import { Mariadb } from "./mariadb.mjs";
const mariadb = await Mariadb.createConnection();

export async function storesToGeoJson(){
	let stores = await mariadb.query("select * from stores");
	// Initialize the geojson features
	// Using the data from the stores
	// return call
	const stores_geojson = {
		type: "FeatureCollection",
		features: [],
	};
	
	for(let i=0; i<stores.length; i++){
		stores_geojson.features.push({
			"type": "Feature",
			"geometry": {
			  "type": "Point",
			  "coordinates": [ stores[i].lon, stores[i].lat]
			},
			"properties": {
			  "id": stores[i].id,
			  "sale_exists": stores[i].sale_exists,
			  "name": stores[i].name
			}
		});
	}
	return stores_geojson;
}

export async function storeInfo(storeId){
	let query = `select name, price, criteria_ok, date_created, likes_num, dislikes_num,\
	stock from sales inner join products on product_id = products.id where active=1 \
	and store_id = ${storeId}`;
	let result = await mariadb.query(query);
	return result;
}

export async function tableInfo(tableName, tableFields){
	let fields = tableFields[0];
	for (let i=1;i<tableFields.length;i++){
		fields+= ','+tableFields[i];
	}
	let table_json = await mariadb.query(`select ${fields} from ${tableName}`);
	return table_json;
}

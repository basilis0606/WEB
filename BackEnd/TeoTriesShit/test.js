"use strict";

import { Mariadb } from './mariadb.mjs';

const mariadb = await Mariadb.createConnection();

let rows = await mariadb.query("SELECT name FROM stores");
for (let i = 0, len = rows.length; i < len; i++) {
	console.log('name = ' + rows[i].name );
}

mariadb.destructor();

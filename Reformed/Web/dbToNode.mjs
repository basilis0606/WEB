"use strict"

import bcrypt from 'bcrypt';

import { Mariadb } from "./mariadb.mjs";
const mariadb = await Mariadb.createConnection();

/*================================ Login ================================ */

export async function validateLogin(user, password, type) {
	let query;

	if (type) {
		query = `SELECT id, passwd FROM users WHERE email = ?;`;
	} else {
		query = `SELECT id, passwd FROM users WHERE username = ?;`;
	}

	try {
		const result = await mariadb.paramQuery(query, [user]);
		if (result.length > 0) {
			const passwordMatch = await bcrypt.compare(password, result[0].passwd);
			if (passwordMatch) {
				return { success: true, userId: result[0].id };
			} else {
				return { success: false, message: 'Incorrect password, please try again.' };
			}
		} else {
			return { success: false, message: 'User not found, please register first.' };
		}
	} catch (error) {
		console.error('Error validating login:', error);
		return { success: false, message: 'Sorry, An internal error occurred.' };
	}
}

export async function isAdmin(user_id){
	let adminquery = `SELECT id FROM admins WHERE users_id= ?;`; 
	try {
  		const answer = await mariadb.paramQuery(adminquery, [user_id]);
		if (answer.length > 0) {
			return { admin_access: true};
		}
		else {
			return { admin_access: false };
		}
	}catch (error){
		console.error('Error while looking for admin');
		return { admin_access: false };
	}

}

/*================================ Update ================================ */

export async function updateCredentials(userId, newUsername=null, hashedNewPassword=null) {
    try {
        // Check if new username or email already exists
        const userExistQuery = `SELECT COUNT(*) AS count FROM users WHERE ((username = ? OR email = ?) AND id != ?);`;
        const userExistResult = await mariadb.paramQuery(userExistQuery, [newUsername, newUsername, userId]);

        if (userExistResult[0].count > 0) {
            return { success: false, message: 'Username or email already in use' };
        }

        // If new credentials are valid, update the user's credentials
        let updateCredentialsQuery = 'UPDATE users SET ';
        const params = [];

        if (newUsername) {
            updateCredentialsQuery += 'username = ?, ';
            params.push(newUsername);
        }

        if (hashedNewPassword) {
            updateCredentialsQuery += 'passwd = ?, ';
            params.push(hashedNewPassword);
        }

        updateCredentialsQuery = updateCredentialsQuery.slice(0, -2);  // Remove the last comma and space
        updateCredentialsQuery += ' WHERE id = ?;';
        params.push(userId);

        await mariadb.paramQuery(updateCredentialsQuery, params);

        // Commit the changes
        await mariadb.commit();

        return { success: true };
    } catch (error) {
        console.error('Error updating credentials:', error);
        return { success: false, message: 'An internal error occurred' };
    }
}


/*================================ Info ================================ */

export async function getUserInfo(userId) {
    try {
        const query = `SELECT username, email, sum_score, sum_tokens, monthly_score, monthly_tokens FROM users WHERE id = ?;`;
        const result = await mariadb.paramQuery(query, [userId]);

        if (result.length > 0) {
            return { success: true, userInfo: result[0] };
        } else {
            return { success: false, message: 'User not found.' };
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}

/*================================ Password ================================ */
export async function getUserPassword(userId) {
    try {
        const query = `SELECT passwd FROM users WHERE id = ?;`;
        const result = await mariadb.paramQuery(query, [userId]);

        if (result.length > 0) {
            return { success: true, userInfo: result[0] };
        } else {
            return { success: false, message: 'User not found.' };
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}

/*================================ Register ================================ */

export async function registerUser(username, email, password) {
	try {
		// Check if username or email already exist
		const userExistQuery = `SELECT COUNT(*) AS count FROM users WHERE username = ? OR email = ?;`;
		const userExistResult = await mariadb.paramQuery(userExistQuery, [username, email]);
		
		if (userExistResult[0].count > 0) {
			return { success: false, message: 'Username or email already in use' };
		}

		// If not exists, insert the new user
		const hashedPassword = await bcrypt.hash(password, 10);
		const insertUserQuery = `INSERT INTO users (username, email, passwd) VALUES (?, ?, ?);`;
		await mariadb.paramQuery(insertUserQuery, [username, email, hashedPassword]);
		
		// Commit the changes
    const commitResult = await mariadb.commit();
		if ( typeof(commitResult) == 'undefined') {
			return { success: false, message: 'An internal error occurred, make sure the username is under 25 characters long and the email under 40' };
		}

		return { success: true };
	} catch (error) {
		console.error('Error registering user:', error);
		return { success: false, message: 'An internal error occurred' };
	}
}

/*================================ Likes user did ================================ */
export async function getLikes(userId) {
    try {
        const query = `SELECT
                            p.name AS product_name,
                            st.name AS store_name
                        FROM
                            likes l
                        JOIN sales s ON l.sales_id = s.id
                        JOIN stores st ON s.store_id = st.id
                        JOIN products p ON s.product_id = p.id
                        WHERE
                            l.user_liked = ?`;
        const result = await mariadb.paramQuery(query, [userId]);

        if (result.length > 0) {
            return { success: true, userLikes: result };
        } else {
            return { success: false, message: 'No likes found for the user.' };
        }
    } catch (error) {
        console.error('Error getting user likes:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}

/*================================ Dislikes user did ================================ */
export async function getDislikes(userId) {
    try {
        const query = `SELECT
                            p.name AS product_name,
                            st.name AS store_name
                        FROM
                            dislikes d
                        JOIN sales s ON d.sales_id = s.id
                        JOIN stores st ON s.store_id = st.id
                        JOIN products p ON s.product_id = p.id
                        WHERE
                            d.user_disliked = ?`;
        const result = await mariadb.paramQuery(query, [userId]);

        if (result.length > 0) {
            return { success: true, userDislikes: result };
        } else {
            return { success: false, message: 'No dislikes found for the user.' };
        }
    } catch (error) {
        console.error('Error getting user dislikes:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}


/*================================ Offers user did ================================ */

export async function getSubmittedOffers(userId) {
    try {
        const query = `SELECT
                            p.name AS product_name,
                            st.name AS store_name,
                            s.price,              
                            s.date_created     
                        FROM
                            sales s
                        JOIN stores st ON s.store_id = st.id
                        JOIN products p ON s.product_id = p.id
                        WHERE
                            s.user_suggested = ?`;
        const result = await mariadb.paramQuery(query, [userId]);

        if (result.length > 0) {
            return { success: true, userOffers: result };
        } else {
            return { success: false, message: 'No offers found for this user.' };
        }
    } catch (error) {
        console.error('Error getting user submitted offers:', error);
        return { success: false, message: 'An internal error occurred.' };
    }
}


/*=============================== Usefull Funtions =============================== */

function arrayjsonFormatter(input, format) {
	let output = []
	for (let i = 0; i < input.length; i++) {
		output.push(format(input[i]));
	}
	return output;
}

// SOS: Prepared statements are not supported for table names and column names
// Only values can be parametrized
export async function tableInfo(tableName, tableFields) {
  try {
    const fields = tableFields.join(', ');
    const query = `SELECT ${fields} FROM ${tableName};`;
    const table_json = await mariadb.query(query);
    return table_json;
  } catch (error) {
    console.error('Error in tableInfo:', error);
    throw new Error('An error occurred while fetching table information.');
  }
}

/*================================ Stores - App ================================ */

function storesGeoJsonFormat(input) {
	let storeFormat = {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [input.lon, input.lat]
		},
		"properties": {
			"id": input.id,
			"sale_exists": input.sale_exists,
			"name": input.name
		}
	}
	return storeFormat;
}

export async function storesToGeoJson() {
	let stores = await mariadb.query("select * from stores");
	
	const stores_geojson = {
		type: "FeatureCollection",
		features: arrayjsonFormatter(stores, storesGeoJsonFormat)
	};
	return stores_geojson;
}

export async function storeInfo(storeId) {
  try {
    const query = `SELECT name, price, criteria_ok, date_created, likes_num, dislikes_num, stock
                   FROM sales
                   INNER JOIN products ON product_id = products.id
                   WHERE active = 1 AND store_id = ?`;

    const result = await mariadb.paramQuery(query, [storeId]);
    return result;
  } catch (error) {
    console.error('Error in storeInfo:', error);
    throw new Error('An error occurred while fetching store information.');
  }
}

export async function storesFromCategory(categoryId) {
  try {
    const query = `SELECT stores.id, stores.name, stores.lon, stores.lat, stores.sale_exists
                   FROM categories
                   INNER JOIN subcategories ON categories.id = subcategories.categories_id
                   INNER JOIN products ON subcategories.id = products.subcategories_id
                   INNER JOIN sales ON products.id = sales.product_id
                   INNER JOIN stores ON stores.id = sales.store_id
                   WHERE categories.id = ?`;

    const result = await mariadb.paramQuery(query, [categoryId]);
    
    const stores_geojson = {
      type: "FeatureCollection",
      features: arrayjsonFormatter(result, storesGeoJsonFormat)
    };
    return stores_geojson;
  } catch (error) {
    console.error('Error in storesFromCategory:', error);
    throw new Error('An error occurred while fetching stores from category.');
  }
}


//select stores.id,stores.name,stores.lon,stores.lat,stores.sale_exists from categories inner join subcategories on categories.id = subcategories.categories_id inner join products on subcategories.id = products.subcategories_id inner join sales on products.id = sales.product_id inner join stores on stores.id = sales.store_id where categories.id = 1
//select * from stores inner join sales on stores.id = sales.store_id
//select * from sales inner join stores on stores.id = sales.store_id

/*================================ Other ================================ */
function jsonToGeoJson(input, format) {
	const geojson = {
		type: "FeatureCollection",
		features: [],
	};
	for (let i = 0; i < input.length; i++) {
		let featureProperties = [];
		for (let j = 0; format.properties.length; j++) {

		}
		stores_geojson.features.push({
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [input[i].format[longitude], input[i].format[latitude]]
			},
			"properties": {
				"id": input[i].id,
				"sale_exists": input[i].sale_exists,
				"name": input[i].name
			}
		});
	}
	return geojson;
}

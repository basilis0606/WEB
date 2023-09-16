'use strict';

import * as url from 'url';
import { getUserPassword, registerUser } from './dbToNode.mjs';
import { getUserInfo, updateCredentials, getLikes, getDislikes, getSubmittedOffers } from './dbToNode.mjs';
import { routerUsers } from './routes/users.mjs';

//test getUserInfo
//let user = await getUserInfo(57);
//console.log(user);
//test ok

//test getUserPassword
//let user = await getUserPassword(58);
//console.log(user);
//test ok

//test if update-credentials is working
//let user = await updateCredentials(57, 'basilis', 'Basilis06!', 'Basilis06!');
//console.log(user);
//test ok

//test routerUser.patch('/update-credentials') if it is working
//let user = await routerUsers.patch('/update-credentials', async (req, res) => {



//let user = await registerUser('mpill','basilis0606@protonmail.com', 'Basilis06!');
//console.log(user);

//test getLikes
let user = await getLikes(12);
console.log(user);

//test getDislikes
//let user1 = await getDislikes(12);
//console.log(user1);

//test getOffers
//let user2 = await getSubmittedOffers(12);
//console.log(user2);
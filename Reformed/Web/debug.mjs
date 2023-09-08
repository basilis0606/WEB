'use strict';

import * as url from 'url';
import { registerUser } from './dbToNode.mjs';
import { getUserInfo } from './dbToNode.mjs';

//test getUserInfo
let user = await getUserInfo(57);
console.log(user);

//test routerUsers.get('/info')

//let user = await registerUser('mpill','basilis0606@protonmail.com', 'Basilis06!');
//console.log(user);


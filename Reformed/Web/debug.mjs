'use strict';

import * as url from 'url';

import { getUserInfo } from './dbToNode.mjs';

let user = await getUserInfo(10);
console.log(user);


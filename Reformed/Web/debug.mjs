'use strict';

import * as url from 'url';
import { registerUser } from './dbToNode.mjs';

//let user = await registerUser('mpill','basilis0606@protonmail.com', 'Basilis06!');
//console.log(user);

const axios = require('axios');

axios.post('http://localhost:3000/users/profile.html', { key: 'value' })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

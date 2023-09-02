'use strict';

import path from 'path';
import * as url from 'url';
import express from 'express';
import { auth } from '../express.mjs';
import { getUserInfo, updateCredentials } from '../dbToNode.mjs';

const password_regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{7,19}$/gm;

export const __basename = url.fileURLToPath(new URL('..', import.meta.url));

// Router for the homepage
export const routerUsers = express.Router();

//Use the auth miidleware to restrict access to the /users/info route
routerUsers.use('/info', auth);

// Serve user-specific files using the express.static middleware
routerUsers.use('/',express.static(path.join( __basename, 'users')));

routerUsers.get('/info', async(req, res) => {
  try{
    // get the user id from the session
    let userId = req.session.userId;
    
    // get the user info from the database
    let userInfo = await getUserInfo(userId);
    
    // Check if user info is found
    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    // send the user info to the client
    res.status(200).json(userInfo);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

routerUsers.post('/update-credentials', async (req, res) => {
  try {
    // get the user id from the session
    let userId = req.session.userId;

    // get new username, password, and current password from the request body
    const { newUsername, newPassword, currentPassword } = req.body;

    // get the current user info from the database
    const currentUserInfo = await getUserInfo(userId);

    // Check if password is valid
    if (!password_regex.test(password)) {
      return res.status(400).json({
      message: 'Please provide a valid password. Password must contain at least 8 characters and an uppercase letter, a number and a special character.'
      });
    }
    
    // check if the provided current password is correct
    if (currentUserInfo.password !== currentPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // update the user's credentials
    const result = await updateCredentials(userId, newUsername || currentUserInfo.username, newPassword || currentUserInfo.password);

    // Check if the update was successful
    if (!result) {
      return res.status(400).json({ error: 'Failed to update credentials' });
    }

    res.status(200).json({ message: 'Credentials updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
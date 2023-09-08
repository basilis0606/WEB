'use strict';

import bcrypt from 'bcrypt';
import path from 'path';
import * as url from 'url';
import express from 'express';
import { getUserInfo, updateCredentials } from '../dbToNode.mjs';

const password_regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

export const __basename = url.fileURLToPath(new URL('..', import.meta.url));

// Router for the homepage
export const routerUsers = express.Router();

// Serve user-specific files using the express.static middleware
routerUsers.use('/', express.static(path.join(__basename, 'users')));

routerUsers.get('/info', async (req, res) => {
  let userId = req.session.userId;
  let userInfo = getUserInfo(userId);
  console.log(userInfo);

  userInfo.then((result) => {
    if (result.success) {
      res.status(200).json(result);
    }
    else {
      res.status(401).json({ message: result.message });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  });
});

routerUsers.put('/update-credentials', async (req, res) => {
  try {
    let userId = req.session.userId;  
    console.log(userId);
    const { newUsername, newPassword, currentPassword } = req.body;
    console.log(newUsername, newPassword, currentPassword);
    const currentUserInfo = await getUserInfo(userId);
    console.log(currentUserInfo);

    // Check new password against the regex if it's provided
    if (newPassword && !password_regex.test(newPassword)) {
      return res.status(400).json({
        message: 'Please provide a valid password. Password must contain at least 8 characters and an uppercase letter, a number and a special character.'
      });
    }

    // Check the currentPassword against stored password
    const isMatch = await bcrypt.compare(currentPassword, currentUserInfo.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedNewPassword = newPassword ? await bcrypt.hash(newPassword, 10) : currentUserInfo.password;

    const result = await updateCredentials(userId, newUsername || currentUserInfo.username, hashedNewPassword);

    if (!result) {
      return res.status(400).json({ error: 'Failed to update credentials' });
    }

    res.status(200).json({ message: 'Credentials updated successfully' });

  } catch (error) {
    console.error('Error in /update-credentials:', error.message, error.stack);
    res.status(500).json({ error: 'An error occurred' });
  }
});


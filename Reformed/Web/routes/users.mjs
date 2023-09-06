'use strict';

import path from 'path';
import * as url from 'url';
import express from 'express';
import bcrypt from 'bcryptjs';
import { auth } from '../express.mjs';
import { getUserInfo, updateCredentials } from '../dbToNode.mjs';

const password_regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{7,19}$/gm;

export const __basename = url.fileURLToPath(new URL('..', import.meta.url));

// Router for the homepage
export const routerUsers = express.Router();

//Use the auth middleware to restrict access to the /users/info route
routerUsers.use('/info', auth);

// Serve user-specific files using the express.static middleware
routerUsers.use('/', express.static(path.join(__basename, 'users')));

routerUsers.get('/info', async(req, res) => {
  try {
    let userId = req.session.userId;
    let userInfo = await getUserInfo(userId);
    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

routerUsers.post('/update-credentials', async (req, res) => {
  try {
    let userId = req.session.userId;
    const { newUsername, newPassword, currentPassword } = req.body;
    const currentUserInfo = await getUserInfo(userId);

    // Check new password against the regex if it's provided
    if (newPassword && !password_regex.test(newPassword)) {
      return res.status(400).json({
        message: 'Please provide a valid password. Password must contain at least 8 characters and an uppercase letter, a number and a special character.'
      });
    }

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
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

routerUsers.post('/update-username', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { newUsername, currentPassword } = req.body;

    const currentUserInfo = await getUserInfo(userId);
    const isMatch = await bcrypt.compare(currentPassword, currentUserInfo.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const result = await updateCredentials(userId, newUsername, currentUserInfo.password);
    if (!result) {
      return res.status(400).json({ error: 'Failed to update username' });
    }

    res.status(200).json({ message: 'Username updated successfully' });
    console.log(req.body);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

routerUsers.get('/get-username', auth, async (req, res) => {
  try {
      const userId = req.session.userId;
      const userInfo = await getUserInfo(userId); // Assuming `getUserInfo` is a function that fetches user details from your database.

      if (!userInfo) {
          return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ username: userInfo.username });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred' });
  }
});

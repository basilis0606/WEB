'use strict';

import path from 'path';
import * as url from 'url';
import express from 'express';
import bcrypt from 'bcrypt';
import { getUserInfo, getUserPassword, updateCredentials, tableInfo, getLikes, getDislikes, getSubmittedOffers  } from '../dbToNode.mjs';

const password_regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

export const __basename = url.fileURLToPath(new URL('..', import.meta.url));

// Router for the homepage
export const routerUsers = express.Router();

// Serve user-specific files using the express.static middleware
routerUsers.use('/', express.static(path.join(__basename, 'users')));

routerUsers.get('/username', (req, res) => {
  // get the user id from the session
  let userId = req.session.userId;

  // Call getUserInfo and just return the username
  let userInfo = getUserInfo(userId);

  userInfo.then((result) => {
    if (result.success) {
      res.send(JSON.stringify(result.userInfo.username));
    } else {
      res.status(401).json({ message: result.message });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  });
});

routerUsers.get('/info', async (req, res) => {
  let userId = req.session.userId;
  let userInfo = getUserInfo(userId);
  console.log("This from the info", userInfo);

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

routerUsers.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('authToken');
  res.redirect('/login.html');
});

//=========================GET USER INFO=========================

routerUsers.get('/info', async (req, res) => {
  let userId = req.session.userId;
  let userInfo = getUserInfo(userId);

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

//=========================UPDATE USER INFO=========================

routerUsers.post('/update-credentials', async (req, res) => {
  try {
    let userId = req.session.userId;  
    console.log(userId);
    const { username, password: currentPassword, newPassword } = req.body;
    console.log(username, currentPassword, newPassword);
    const currentUserPassword = await getUserPassword(userId);
    console.log(currentUserPassword.userInfo.passwd);
    console.log(currentUserPassword);

    // Check new password against the regex if it's provided
    if (newPassword && !password_regex.test(newPassword)) {
      return res.status(400).json({
        message: 'Please provide a valid password. Password must contain at least 8 characters and an uppercase letter, a number and a special character.'
      });
    }

    // Check the currentPassword against stored password
    const isMatch = await bcrypt.compare(currentPassword, currentUserPassword.userInfo.passwd);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Hash the new password if it's provided
    const hashedNewPassword = newPassword ? await bcrypt.hash(newPassword, 10) : currentUserPassword.userInfo.passwd;

    // Update the user's credentials
    const result = await updateCredentials(userId, username, hashedNewPassword);

    // Check if the update was successful
    if (!result) {
      return res.status(400).json({ error: 'Failed to update credentials' });
    }

    res.status(200).json({ message: 'Credentials updated successfully' });

  } catch (error) {
    console.error('Error in /update-credentials:', error.message, error.stack);
    res.status(500).json({ error: 'An error occurred' });
  }
});

//=========================GET USER LIKES=========================
routerUsers.get('/likes', async (req, res) => {
  let userId = req.session.userId;
  try {
    let likes = await getLikes(userId);
    if (likes.success) {
      res.status(200).json(likes);
    } else {
      res.status(404).json({ message: likes.message });  // Using 404 if no likes found
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//=========================GET USER DISLIKES=========================
routerUsers.get('/dislikes', async (req, res) => {
  let userId = req.session.userId;
  let dislikes = getDislikes(userId);

  dislikes.then((result) => {
    if (result.success) {
      res.status(200).json(result);
    }
    else {
      res.status(404).json({ message: result.message });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  });
});


//=========================GET USER SALES HISTORY=========================
routerUsers.get('/sales-history', async (req, res) => {
  let userId = req.session.userId;
  let salesHistory = tableInfo('sales_history', userId);

  salesHistory.then((result) => {
    if (result.success) {
      res.status(200).json(result);
    }
    else {
      res.status(404).json({ message: result.message });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  });
});

//=========================GET USER SUBMIT HISTORY=========================
routerUsers.get('/submitted-offers', async (req, res) => {
  let userId = req.session.userId;
  let offers = getSubmittedOffers(userId);

  offers.then((result) => {
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

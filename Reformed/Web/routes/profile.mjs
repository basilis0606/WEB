'use strict';

import express from 'express';
import { updateCredentials } from '../dbToNode.mjs';

const password_regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{7,19}$/gm;

export const routerProfile = express.Router();

//Change username
routerProfile.post('/username', (req, res) => {
    const { userId, newUsername } = req.body;
    
    if (!userId || !newUsername) {
        return res.status(400).json({ message: 'Please provide both userId and new username.' });
    }
    
    updateCredentials(userId, newUsername, null).then((result) => {
        if (result.success) {
        res.status(200).json({ message: 'Username updated successfully.' });
        } else {
        res.status(400).json({ message: result.message });
        }
    });
    });

//Change password
routerProfile.post('/password', (req, res) => {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
        return res.status(400).json({ message: 'Please provide both userId and new password.' });
    }
    if (!password_regex.test(newPassword)) {
        return res.status(400).json({
        message: 'Please provide a valid password. Password must contain at least 8 characters and an uppercase letter, a number and a special character.'
        });
    }
    
    updateCredentials(userId, null, newPassword).then((result) => {
        if (result.success) {
        res.status(200).json({ message: 'Password updated successfully.' });
        } else {
        res.status(400).json({ message: result.message });
        }
    });
    });

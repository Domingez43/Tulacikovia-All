const express = require('express')
const router = express.Router();
const {StorageClient} = require('./database');
const { Authenticator } = require('../authentication/AuthService');
const fs = require('fs');
import { extname } from 'path';

module.exports = router;

router.post('/upload', StorageClient.upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const { originalname, filename, size, path } = req.file;
  
    // File uploaded successfully
    return res.status(200).json({ status: 'uploaded', uri: 'https://api.relyonproject.com/content/' + path });
});

router.get('/getImageInfo', Authenticator.UserAuth, (req, res) => {
    var { imageName } = req.query;

    try {``
        fs.stat('public/' + imageName, (err, stats) => {
            if (err) {
            if (err.code === 'ENOENT') {
                res.status(200).json({ status: 'success', contentInfo: {
                    exists: false,
                    size: null,
                    type: null
                }});
            } else {
                res.status(500).json({ error: 'Some other error occurred' });
            }
            } else {
                var type = extname(imageName);
                res.status(200).json({ status: 'success', contentInfo: {
                    exists: true,
                    size: stats.size,
                    type: type
                }});
            }
        });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }

});
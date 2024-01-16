"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const Authenticator = require('./bff/authentication/AuthRoutes');
const UserDataManager = require('./bff/userData/UserDataRoutes');
//
// Definition of server configuration and variables
//
const { PORT = '443' } = process.env;
const UNSECURED_PORT = '8081';
const app = express();
const ver = '0.0.1';
const env = 'DEV';
// If running on local machine, change to false due to certs needed for TLS
const useSecuredCommunications = false;
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(bodyParser.json());
app.use(Authenticator);
app.use(UserDataManager);
if (useSecuredCommunications) {
    //
    // Initialization of HTTPs credentials and certs
    //
    const privateKey = fs.readFileSync('certs/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('certs/cert.pem', 'utf8');
    const ca = fs.readFileSync('certs/chain.pem', 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT, () => {
        console.log('Tulacikovia WEB SERVER - [server node.js] build ver: ' + ver);
        console.log('Server executed and listenes on PORT: ' + PORT);
        console.log('Excecution enviroment: ' + env);
    });
}
else {
    //
    // Initialization of unsecured HTTP server
    //
    const unsecuredServer = http.createServer(app);
    unsecuredServer.listen(PORT == 443 ? UNSECURED_PORT : PORT, () => {
        console.log('Tulacikovia WEB SERVER - [server node.js] build ver: ' + ver);
        console.log('Server executed and listenes on PORT: ' + (PORT == 443 ? UNSECURED_PORT : PORT));
        console.log('Excecution enviroment: ' + env);
        console.log('! [IMPORTANT] Server is executed on unsecured communication channel !');
    });
}
//
// Attaching API services to server
//
// const RelyonApiRunner = new RelyonAPI(app);
// RelyonApiRunner.attachServices();

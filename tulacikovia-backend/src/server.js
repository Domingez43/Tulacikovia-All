import "reflect-metadata";
import console from "console";
import { couldStartTrivia } from "reflec-ts";
// import { RelyonAPI } from './RelyonAPIs/RelyonAPI';

const fs = require('fs');
const https = require('https');
const http =  require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { validateEmail, validatePassword, validatePasswordMatch } = require('./validation');

const EventAndAppealManager = require('./eventsAndAppeals/EventAndAppealRoutes');
const StorageRoutes = require('./database/StorageRoutes');
const AnimalsRoutes = require('./animals/AnimalsRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require ('swagger-jsdoc');
var cors = require('cors');

var path = require('path')

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
    },
    apis: [path.join(__dirname, './swagger/openapi.yaml')],
  };

const swaggerSpec = swaggerJsDoc(options);
//
// Definition of server configuration and variables
//

const { PORT = '443' } = process.env
const UNSECURED_PORT = '3033';
const app = express()
const ver = '0.0.1';
const env = 'DEV';
// If running on local machine, change to false due to certs needed for TLS
const useSecuredCommunications = false;

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json())
app.use(EventAndAppealManager)
app.use(StorageRoutes)
app.use(AnimalsRoutes)


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use('/content/public', express.static(path.join(__dirname, '../public')));

app.get('/healthcheck', (req, res) => {
    const currentTime = new Date().toString();
    const status = 'OK';
    const healthCheckResponse = { datetime: currentTime, status: status };
  
    res.json(healthCheckResponse);
});


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if(useSecuredCommunications) {

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
        console.log('Tulacikovia BACKEND - [server node.js] build ver: ' + ver);
        console.log('Server executed and listenes on PORT: ' + PORT);
        console.log('Excecution enviroment: ' + env);
    });

} else {

    //
    // Initialization of unsecured HTTP server
    //

    const unsecuredServer = http.createServer(app)

    unsecuredServer.listen(PORT == 443 ? UNSECURED_PORT : PORT, () => {
        console.log('Servity BACKEND[server node.js] build ver: ' + ver);
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
import bodyParser from 'body-parser';
import express from 'express';
import * as logger from 'winston';

import expressValidator from 'express-validator';
import route from './routes';
import morgan from 'morgan';

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import proxy from 'http-proxy-middleware';

import session from 'express-session';
import Keycloak from 'keycloak-connect';
import * as axios from "axios";
import moment from 'moment';
import helmet from 'helmet';
import frameguard from 'frameguard';

if (process.env.NODE_ENV === 'production') {
    logger.info('Setting ca bundle');
    const trustedCa = [
        '/etc/ssl/certs/ca-bundle.crt'
    ];

    https.globalAgent.options.ca = [];
    for (const ca of trustedCa) {
        https.globalAgent.options.ca.push(fs.readFileSync(ca));
    }
    logger.info('ca bundle set...');
}

let kcConfig = {
    clientId: process.env.AUTH_CLIENT_ID,
    serverUrl: process.env.AUTH_URL,
    realm: process.env.AUTH_REALM
};

axios.interceptors.request.use(
    (config) => {
        logger.info('Request: [%s] "%s %s"', moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'), config.method.toUpperCase(), config.url);
        return config
    },
    (error) => {
        return Promise.reject(error);
    });

axios.interceptors.response.use((response) => {
    if (response) {
        logger.info('Response: [%s] "%s %s" %s', moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'), response.config.method.toUpperCase(), response.config.url, response.status);
    }
    return response
}, (error) => {
    logger.error('Error: [%s] [%s]',
        moment().utc().format('D/MMM/YYYY:HH:mm:ss ZZ'),
        JSON.stringify(error.message)
    );
    return Promise.reject(error);
});


const app = express();

const port = process.env.PORT || 8080;

app.set('port', port);

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({store: memoryStore}, kcConfig);
const platformDataUrl = process.env.PLATFORM_DATA_URL;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    name: process.env.SESSION_NAME
}));

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(helmet());
app.use(keycloak.middleware());
app.disable('x-powered-by');

app.use(frameguard({
    action: 'allow-from',
    domain: process.env.WHITE_LISTED_DOMAIN
}));

app.use('/api/reports', route.allRoutes(keycloak));

app.use('/public', express.static(path.join(__dirname, '../public')));

app.use('/api/platform-data', proxy(
    {
        target: platformDataUrl,
        pathRewrite: {
            '^/api/platform-data/': ''
        },
        onProxyReq: function onProxyReq(proxyReq, req, res) {
            console.log('Platform Data Proxy -->  ', req.method, req.path, '-->', platformDataUrl, proxyReq.path);
        },
        onError: function onError(err, req, res) {
            console.error(err);
            res.status(500);
            res.json({error: 'Error when connecting to remote server.'});
        },
        logLevel: 'debug',
        changeOrigin: true,
        secure: false
    }
));

const server = http.createServer(app).listen(app.get('port'), function () {
    logger.info('Listening on port %d', port);
});


process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
process.on('SIGQUIT', shutDown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}


module.exports = app;
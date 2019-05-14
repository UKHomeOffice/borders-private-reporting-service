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

import Keycloak from 'keycloak-connect';
import * as axios from "axios";
import moment from 'moment';
import helmet from 'helmet';
import frameguard from 'frameguard';


import redis from "redis";
import session from "express-session";

const RedisStore = require('connect-redis')(session);

const app = express();

const port = process.env.PORT || 8080;

app.set('port', port);
let sessionStore;

if (process.env.NODE_ENV === 'production') {
    const redisUrl = process.env.PRIVATE_REDIS_URL || 'localhost';
    const redisPort = process.env.PRIVATE_REDIS_PORT || 6379;
    const redisAuthToken = process.env.PRIVATE_REDIS_TOKEN || '';
    const redisClient = redis.createClient({
            host: redisUrl,
            port: redisPort,
            no_ready_check: true,
            auth_pass: redisAuthToken,
            tls: {
                servername: redisUrl
            }

        }
    );
    sessionStore = new RedisStore({client: redisClient});
    logger.info("Session store ...redisStore...");
    logger.info('Setting ca bundle');
    const trustedCa = [
        '/etc/ssl/certs/ca-bundle.crt'
    ];

    https.globalAgent.options.ca = [];
    for (const ca of trustedCa) {
        https.globalAgent.options.ca.push(fs.readFileSync(ca));
    }
    logger.info('ca bundle set...');
} else {
    sessionStore = new session.MemoryStore();
    logger.info('in local dev mode');
    app.use(frameguard({
        action: 'allow-from',
        domain: process.env.WHITE_LISTED_DOMAIN
    }));
}

const kcConfig = {
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


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    name: process.env.SESSION_NAME
}));
const keycloak = new Keycloak({store: sessionStore}, kcConfig);

app.use(helmet.noCache());
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(helmet());
app.use(keycloak.middleware());
app.disable('x-powered-by');

app.enable('trust proxy');

app.use('/api/reports', route.allRoutes(keycloak));

app.use('/reportspublic', express.static(path.join(__dirname, '../reportspublic')));


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
    logger.info('Received kill signal, shutting down gracefully');
    server.close(() => {
        logger.info('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}


module.exports = app;

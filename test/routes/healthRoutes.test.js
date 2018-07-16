process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET="test";
process.env.SESSION_NAME="test";
process.env.WHITE_LISTED_DOMAIN = 'http://localhost:8000';
process.env.PLATFORM_DATA_PROXY_URL = 'http://localhost:9000';

import * as logger from 'winston';
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
const should = chai.should();


chai.use(chaiHttp);

describe('Health Routes', () => {
    describe('/GET healthz', () => {
        it('it should return a body of {status:OK}', (done) => {
            chai.request(server)
                .get('/api/reports/healthz')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.include({"status": "OK"});
                    done();
                });
        });
    });
    describe ("/GET readiness", () => {
        it('it should return a body of {ready:true}', (done) => {
            chai.request(server)
                .get('/api/reports/readiness')
                .end((err, res) => {
                    logger.info(JSON.stringify(res));
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.include({"ready": true});
                    done();
                });
        });
    })

});
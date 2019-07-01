process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET="test";
process.env.SESSION_NAME="test";
process.env.WHITE_LISTED_DOMAIN = 'http://localhost:8000';
process.env.OPERATIONAL_DATA_URL = 'http://data.example.com';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
chai.should();
chai.use(chaiHttp);

describe('Config route', () => {
  describe('Get /api/reports/config', () => {
    it('should return a config object', () => {
      chai.request(server)
        .get('/api/reports/config')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.include({"OPERATIONAL_DATA_URL": "http://data.example.com"});
        });
    });
  });
});

import ConfigController from "../../src/controllers/ConfigController.js"
import httpMocks from 'node-mocks-http';
import expect from 'expect';

const testConfig = {
    services: {
        platformData: {
            url: 'http://localhost:9000'
        }
    }
};


describe("Config Controller", () => {
  const controller = new ConfigController(testConfig);
  const res = httpMocks.createResponse();

  it('Should return a config object with the operation data url', () => {
    controller.clientConfig(null, res);

    const data = JSON.parse(res._getData());
    expect(data.OPERATIONAL_DATA_URL).toEqual("http://localhost:9000");
  })
});

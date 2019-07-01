import responseHandler from "../utilities/handlers/responseHandler";

class ConfigController {
  constructor(configuration) {
    this.operationalDataUrl = configuration.services.platformData.url;
    this.clientConfig = this.clientConfig.bind(this);
  }

  clientConfig(req, res) {
    responseHandler.res(null, {
      "OPERATIONAL_DATA_URL": this.operationalDataUrl
    }, res);
  }
}

export default ConfigController;

import * as logger from 'winston';
import axios from "axios";

class PlatformDataService {

    constructor(config) {
        this.config = config;
        this.currentUserShift = this.currentUserShift.bind(this);
    }

    async currentUserShift(email, token) {
        try {
            const response = await axios({
                url: `${this.config.services.platformData.url}/v1/shift?email=eq.${email}`,
                method: 'GET',
                timeout: 1500,
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                }
            });
            const shiftDetails = response.data ? response.data[0] : null;
            logger.info(`Shift details ${JSON.stringify(shiftDetails)}`);
            if (shiftDetails) {
              shiftDetails.team = await this.teamById(shiftDetails.teamid, token)
            }
            return shiftDetails;
        } catch (err) {
            logger.error(`Failed to get shift details ${err.toString()}`);
            return null;
        }
    }

    async teamById(teamId, token) {
          const response = await axios({
              url: `${this.config.services.platformData.url}/v1/team?id=eq.${teamId}`,
              method: 'GET',
              timeout: 1500,
              headers: {
                  'Content-Type' : 'application/json',
                  'Authorization' : `Bearer ${token}`
              }
          });
          return response.data ? response.data[0] : null;
    }
}

export default PlatformDataService;

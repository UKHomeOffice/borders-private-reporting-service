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
                url: `${this.config.services.platformData.url}/shift?email=eq.${encodeURIComponent(email)}&select=email,team(teamcode,teamid),roles`,
                method: 'GET',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                }
            });
            const shiftDetails = response.data ? response.data[0] : null;
            logger.info(`Shift details ${JSON.stringify(shiftDetails)}`);
            return shiftDetails;
        } catch (err) {
            logger.error(`Failed to get shift details ${err.toString()}`);
            return null;
        }
    }
}

export default PlatformDataService;
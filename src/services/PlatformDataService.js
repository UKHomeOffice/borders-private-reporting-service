import * as logger from 'winston';
import axios from "axios";

class PlatformDataService {

    constructor(config) {
        this.config = config;
        this.currentUserShift = this.currentUserShift.bind(this);
    }

    async currentUserShift(email) {
        try {
            const response = await axios({
                url: `${this.config.platformDataProxyUrl}/api/platform-data/shift?email=eq.${email}`,
                method: 'GET',
                headers: {
                    'Content-Type' : 'application/json'
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
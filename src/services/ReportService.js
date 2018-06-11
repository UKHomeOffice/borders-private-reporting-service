import fs from 'fs';
import cheerio from 'cheerio';
import {promisify} from "util";

const readFile = promisify(fs.readFile);
const readFiles = promisify(fs.readdir);

class ReportService {
    constructor(config) {
        this.reports = this.reports.bind(this);
        this.config = config;
    }

    async reports(baseUrl) {
        const files = await readFiles(this.config.reportsDir);
        return Promise.all(files.map(async (file) => {
            const fileLocation = `${this.config.reportsDir}/${file}`;
            const fileContent = await readFile(fileLocation,'utf8');
            const html = cheerio.load(fileContent);
            return {
                name: html("meta[name='title']").attr("content"),
                description: html("meta[name='description']").attr("content"),
                url: `${baseUrl}${file}`
            };
        }));
    }

}

export default ReportService;
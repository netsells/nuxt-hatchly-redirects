import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default (options) => {
    const axiosClient = axios.create({
        baseURL: options.apiUrl,
    });

    return async (req, res, next) => {
        const redirectsFilePath = path.resolve('.nuxt/hatchly-redirects/redirects.json');

        let redirects = {
            redirects: {},
        };

        if (fs.existsSync(redirectsFilePath)) {
            redirects = require(redirectsFilePath);
        }

        const redirectRequest = async () => {
            const { data: { data: redirects } } = await axiosClient.get('redirects');

            fs.writeFileSync(redirectsFilePath, JSON.stringify({ redirects }, null, 4));

            return { redirects };
        };

        if (!fs.existsSync(redirectsFilePath)) {
            redirects = await redirectRequest();
        } else {
            redirectRequest();
        }

        let routePath = req.url;
        if (routePath.startsWith('/') && routePath !== '/') {
            routePath = routePath.substring(1);
        }

        const foundRedirect = redirects.redirects.find(({ source }) => source === routePath);

        if (foundRedirect) {
            let destination = foundRedirect.destination;

            if (!destination.startsWith('/') && !destination.startsWith('http')) {
                destination = `${ process.env.APP_URL }/${ destination }`;
            }

            res.writeHead(foundRedirect.type, { Location: destination });
            res.end();

            return;
        }

        next();
    };
};

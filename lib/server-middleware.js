import path from 'path';
import fetchRedirects from './fetch-redirects';

export default (options) => {
    return async (req, res, next) => {
        const redirectsFilePath = path.resolve('.nuxt/hatchly-redirects/redirects.json');

        const { redirects } = require(redirectsFilePath);

        if (!redirects.length) {
            await fetchRedirects(options);
        } else {
            fetchRedirects(options);
        }

        let routePath = req.url;
        if (routePath.startsWith('/') && routePath !== '/') {
            routePath = routePath.substring(1);
        }

        const foundRedirect = redirects.find(({ source }) => source === routePath);

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

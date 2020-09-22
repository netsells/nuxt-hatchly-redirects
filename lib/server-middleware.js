import fetchRedirects from './fetch-redirects';

let redirects = [];

export default (options) => {
    return async (req, res, next) => {
        if (!redirects.length) {
            redirects = await fetchRedirects(options);
        } else {
            fetchRedirects(options)
                .then((data) => redirects = data);
        }

        global.hatchlyRedirects = redirects;

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

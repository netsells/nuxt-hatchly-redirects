import Middleware from '../middleware';

Middleware.redirects = async ({ route, redirect }) => {
    let redirects = [];
    const requireCustomFile = require.context(
        './', false, /redirects.json$/,
    );

    if (requireCustomFile.keys().length) {
        requireCustomFile.keys().forEach((fileName) => {
            redirects = requireCustomFile(fileName).redirects;
        });
    }

    let path = route.fullPath;
    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    const currentRedirect = redirects.find(({ source }) => source === path);

    if (currentRedirect) {
        redirect(currentRedirect.type, `/${ currentRedirect.destination }`);
    }
};

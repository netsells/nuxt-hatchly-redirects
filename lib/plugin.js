import Middleware from '../middleware';
import fetchRedirects from './fetch-redirects';

const config = <%= JSON.stringify(options) %>;
let redirects = [];

fetchRedirects(config);

Middleware.redirects = async ({ route, redirect }) => {
    let path = route.fullPath;
    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    const currentRedirect = redirects.find(({ source }) => source === path);

    if (currentRedirect) {
        redirect(currentRedirect.type, `/${ currentRedirect.destination }`);
    }
};

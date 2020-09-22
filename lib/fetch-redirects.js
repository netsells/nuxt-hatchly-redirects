import fs from 'fs';
import axios from 'axios';
import path from 'path';

/**
 * Fetch the redirects from the API and store them as json.
 *
 * @param {object} options
 *
 * @returns {Promise<{redirects: *[]}>}
 */
export default async function fetchRedirects(options) {
    const redirectsFilePath = path.resolve('.nuxt/hatchly-redirects/redirects.json');

    const axiosClient = axios.create({
        baseURL: options.apiURL,
    });

    const { data: { data: redirects } } = await axiosClient.get('redirects');

    fs.writeFileSync(redirectsFilePath, JSON.stringify({ redirects }, null, 4));

    return { redirects };
}

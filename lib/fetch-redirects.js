import axios from 'axios';

/**
 * Fetch the redirects from the API and store them as json.
 *
 * @param {object} options
 *
 * @returns {Promise<{redirects: *[]}>}
 */
export default async function fetchRedirects(options) {
    const axiosClient = axios.create({
        baseURL: options.apiURL,
    });

    const { data: { data: redirects } } = await axiosClient.get('redirects');

    return redirects;
}

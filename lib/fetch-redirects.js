import fs from 'fs';
import axios from 'axios';
import path from 'path';

export default async function fetchRedirects(options) {
    const redirectsFilePath = path.resolve('.nuxt/hatchly-redirects/redirects.json');

    const axiosClient = axios.create({
        baseURL: options.apiUrl,
    });

    const { data: { data: redirects } } = await axiosClient.get('redirects');

    fs.writeFileSync(redirectsFilePath, JSON.stringify({ redirects }, null, 4));

    return { redirects };
}

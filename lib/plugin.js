import Middleware from '../middleware';
import logger from './logger';

const config = {};

const cache = {
    data: [],
    timestamp: null,
};

Middleware.redirects = async ({ route, redirect, store }) => {
    const { redirects } = store.state.redirects;

    let path = route.fullPath;
    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    const currentRedirect = redirects.find(({ source }) => source === path);

    if (currentRedirect) {
        redirect(currentRedirect.type, `/${ currentRedirect.destination }`);
    }
};

/**
 * Register the Vuex module to fetch the redirects.
 *
 * @param {object} store
 */
export const registerStoreModule = (store) => {
    store.registerModule('redirects', {
        namespaced: true,

        state: () => ({
            redirects: [],
        }),

        mutations: {
            /**
             * Set the data in the store.
             *
             * @param {object} state
             * @param {Array} data
             */
            set(state, data) {
                state.redirects = data;
            },
        },

        actions: {
            /**
             * Fetch the redirect data from the api.
             *
             * @param {Function} commit
             *
             * @returns {Promise<void>}
             */
            async get({ commit }) {
                logger.info(`Fetching redirects from [${ config.endpoint }]`);

                const { data } = await this.$axios.$get(config.endpoint);

                commit('set', data);

                return data;
            },
        },
    });
};

/**
 * Run the call to fetch the redirects from the API.
 *
 * @param {Function} dispatch
 *
 * @returns {Promise<*>}
 */
const fetchRedirects = async ({ dispatch }) => {
    try {
        const response = await dispatch('redirects/get');

        logger.log(`Found ${ response.length } redirects.`);

        return response;
    } catch (e) {
        if (e.response && e.response.status === 404) {
            logger.error(`Module is not installed at [${ config.endpoint }].`);
        } else {
            logger.error(`Module at [${ config.endpoint }] returned an error (${ e.response.status }).`);
            logger.error(new Error(e));
        }

        throw new Error(e);
    }
};

/**
 * Setup the plugin.
 *
 * @param {object} context
 * @param {object} context.app
 * @param {object} context.$config
 *
 * @returns {Promise<void>}
 */
export default async function({ app, $config, route }) {
    config.endpoint = $config.hatchly.redirects.endpoint;

    registerStoreModule(app.store);

    if (!process.server) {
        return;
    }

    const forceClear = route.query.cache === 'clear';

    const now = () => Math.round(new Date().getTime() / 1000);
    const generateCacheTimeout = () => now() + <%- options.cacheTimeout %>;

    const request = () => fetchRedirects(app.store).then((data) => {
        cache.data = data;
        cache.timestamp = generateCacheTimeout();

        return data;
    });

    try {
        if (forceClear || !cache.timestamp || cache.timestamp <= now()) {
            if (forceClear) {
                logger.log('Cache clear was forced');
            } else if (!cache.timestamp) {
                logger.log('Populating cache for the first time');
            } else {
                logger.log('Cache expired, fetching...');
            }

            cache.data = await request();
            cache.timestamp = generateCacheTimeout();
        } else {
            logger.log('Using cached data');
            app.store.commit('redirects/set', cache.data);
        }
    } catch (e) {
        logger.error('Unable to fetch redirects');
    }
};

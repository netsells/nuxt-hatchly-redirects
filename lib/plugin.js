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
                const { data } = await this.$axios.$get(`${ config.requestUrl }/redirects`);

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
        return await dispatch('redirects/get');
    } catch (e) {
        if (e.response && e.response.status === 404) {
            logger.error(`Module is not installed at [${ config.requestUrl }].`);
            return;
        }

        logger.error(`Module at [${ config.requestUrl }] returned an error.`);
        logger.error(new Error(e));
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
    config.apiPath = '<%- options.apiPath %>';
    config.apiUrl = $config.hatchly.redirects.apiUrl;
    config.requestUrl = `${ config.apiUrl }/${ config.apiPath }`;

    registerStoreModule(app.store);

    if (process.server) {
        // Invalidate every hour
        const cacheTimeout = (new Date()).setHours(-1);
        const forceClear = route.query.cache === 'clear';

        const request = () => fetchRedirects(app.store).then((data) => {
            cache.data = data;
            cache.timestamp = (new Date()).getTime();

            return data;
        });

        if (forceClear || !cache.timestamp || cache.timestamp <= cacheTimeout) {
            logger.log('Cache expired, fetching...');
            cache.data = await request();
            cache.timestamp = (new Date()).getTime();
        } else {
            logger.log('Using cached data');
            app.store.commit('redirects/set', cache.data);
        }
    }
};

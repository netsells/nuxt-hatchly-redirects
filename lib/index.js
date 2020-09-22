import { resolve } from 'path';
import serverMiddleware from './server-middleware';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default async function SnippetsModule(moduleOptions = {}) {
    const { nuxt } = this;

    const hatchlyOptions = {
        apiPath: '_hatchly/api',
        ...this.options.hatchly || {},
    };

    const options = {
        baseURL: process.env.API_URL,
        browserBaseURL: process.env.API_URL_BROWSER,
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).redirects || {},
    };

    if (options.apiPath.endsWith('/')) {
        options.apiPath = options.apiPath
            .split('/')
            .slice(0, -1)
            .join('/');
    }

    if (options.apiPath.startsWith('/')) {
        const parts = options.apiPath.split('/');
        parts.unshift();
        options.apiPath = parts.join('/');
    }

    nuxt.options.publicRuntimeConfig.hatchly = {
        ...nuxt.options.publicRuntimeConfig.hatchly,
        redirects: {
            ...options,
            ...nuxt.options.publicRuntimeConfig.hatchly,
            ...(nuxt.options.publicRuntimeConfig.hatchly && nuxt.options.publicRuntimeConfig.hatchly.redirects),
        },
    };

    nuxt.options.privateRuntimeConfig.hatchly = {
        ...nuxt.options.privateRuntimeConfig.hatchly,
        redirects: {
            ...options,
            ...nuxt.options.privateRuntimeConfig.hatchly,
            ...(nuxt.options.privateRuntimeConfig.hatchly && nuxt.options.privateRuntimeConfig.hatchly.redirects),
        },
    };

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-redirects/logger.js',
    });

    this.addTemplate({
        src: resolve(__dirname, './redirects.json'),
        fileName: './hatchly-redirects/redirects.json',
    });

    this.addTemplate({
        src: resolve(__dirname, './fetch-redirects.js'),
        fileName: './hatchly-redirects/fetch-redirects.js',
    });

    const { dst } = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-redirects/plugin.js',
        options,
    });

    this.options.plugins.push(resolve(this.options.buildDir, dst));

    this.options.router.middleware.unshift('redirects');

    this.options.serverMiddleware.unshift(serverMiddleware({
        ...options,
        ...nuxt.options.privateRuntimeConfig.hatchly.redirects,
        ...nuxt.options.publicRuntimeConfig.hatchly.redirects,
        apiURL: `${ options.baseURL }/${ options.apiPath }`,
    }));
}

import { resolve } from 'path';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function RedirectsModule(moduleOptions = {}) {
    const { nuxt } = this;
    
    const hatchlyOptions = {
        apiPath: '_hatchly/api',
        ...this.options.hatchly || {},
    };

    const options = {
        apiUrl: process.env.API_URL,
        browserApiUrl: process.env.API_URL_BROWSER,
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
            apiUrl: process.env.API_URL_BROWSER || '${API_URL_BROWSER}',
        },
    };

    nuxt.options.privateRuntimeConfig.hatchly = {
        ...nuxt.options.privateRuntimeConfig.hatchly,
        redirects: {
            apiUrl: process.env.API_URL || '${API_URL}',
        },
    };

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-redirects/logger.js',
    });

    const { dst } = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-redirects/plugin.js',
        options,
    });

    this.options.plugins.push(resolve(this.options.buildDir, dst));

    this.options.router.middleware.unshift('redirects');
}

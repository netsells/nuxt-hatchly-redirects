import { resolve } from 'path';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function RedirectsModule(moduleOptions = {}) {
    const hatchlyOptions = {
        ...this.options.hatchly || {},
    };

    const options = {
        cacheTimeout: (24 * 60 ) * 60, // 24 hours default
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).redirects || {},
    };

    this.options.publicRuntimeConfig.hatchly = {
        ...this.options.publicRuntimeConfig.hatchly,
        redirects: {
            endpoint: `${ process.env.API_URL_BROWSER || process.env.API_URL }/_hatchly/api/redirects`,
            ...(this.options.publicRuntimeConfig.hatchly || {}).redirects,
        },
    };

    this.options.privateRuntimeConfig.hatchly = {
        ...this.options.privateRuntimeConfig.hatchly,
        redirects: {
            endpoint: `${ process.env.API_URL }/_hatchly/api/redirects`,
            ...(this.options.privateRuntimeConfig.hatchly || {}).redirects,
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

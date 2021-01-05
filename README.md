# Nuxt Hatchly Redirects Module

> Module to easily implement redirects from the `hatchly/redirects` api

## Installation

```bash
yarn add @hatchly/nuxt-redirects-module
```

Register the module in your nuxt applications config file:

```js
module.exports = {
    // Nuxt config
    modules: {
        // Other Modules
        ['@hatchly/nuxt-redirects-module', {
            // Options
        }],
    },

    hatchly: {
        redirects: {
            // Options can also be defined here
        },
    },
};
```

Add the API url to your .env:

```
API_URL=http://my-application.localhost
```

## Options

The options object can contain the following values: 

```js
{
    cacheTimeout: '',
},
```

Each option is described below.

### `cacheTimeout`

> The duration, in seconds, until the cached date is refreshed. The cache can be disabled completely by passing a falsey value.

- Default: `86400` (24 hours)
- Type: `number|boolean`

### Runtime config

By default, this package will utilise `API_URL` and `API_URL_BROWSER` variables as defined in your env. These are injected as runtime variables for you.

You can supply your endpoint manually to the module via the `publicRuntimeConfig` and `privateRuntimeConfig` objects, e.g.:

```js
module.exports = {
    publicRuntimeConfig: {
        hatchly: {
            redirects: {
                // Overwrite options for the redirects module
                endpoint: process.env.REDIRECTS_API_URL,
            },
        },    
    },
};
```

## Usage

All redirects are downloaded server side and will automagically handle them on page load.

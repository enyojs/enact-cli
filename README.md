# @enact/cli [![Travis](https://img.shields.io/travis/com/enactjs/cli/master?style=flat-square)](https://app.travis-ci.com/github/enactjs/cli) [![NPM](https://img.shields.io/npm/v/@enact/cli.svg?style=flat-square)](https://www.npmjs.com/package/@enact/cli)

> A standalone toolkit for rapid Enact app development.

## Installation

All that's needed to install @enact/cli is to use npm to install it globally. For Linux `sudo` may be required.
```
npm install -g @enact/cli
```

>Note: Node 16 or greater required.

## Creating a new App

The only time you're ever want to directly use the Enact CLI is when you want to create a new project.

```sh
enact create [directory]
```

This will generate a basic App template, complete with npm scripts and dependencies. If no directory path is specified, it will be generated within the working directory.

>Advanced: If you've used `npm link` on separate installations of the Enact repo, you can run `enact link` afterwards to link in any available Enact libraries.

## Available Commands

Enact supports several commands, each accessible through the `enact` command and through npm aliases in **package.json**. For help on individual commands, add `--help` following the command name. The commands are:

### `enact serve` (aliased as `npm run serve`)

Builds and serves the app in the development mode.<br>
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.<br>

### `enact pack` (aliased as `npm run pack`, `npm run pack-p`, and `npm run watch`)

Builds the project in the working directory. Specifically, `pack` builds in development mode with code un-minified and with debug code included, whereas `pack-p` builds in production mode, with everything minified and optimized for performance. Be sure to avoid shipping or performance testing on development mode builds.

### `enact clean` (aliased as `npm run clean`)

Deletes previous build fragments from ./dist.

### `enact lint` (aliased as `npm run lint`)

Runs the Enact configuration of ESLint on the project for syntax analysis.

### `enact test` (aliased as `npm run test` and `npm run test-watch`)

These tasks will execute all valid tests (files that end in `-specs.js`) that are within the project directory. The `test` is a standard single execution pass, while `test-watch` will set up a watcher to re-execute tests when files change.

### `enact license` (aliased as `npm run license`)

Outputs a JSON representation of the licenses for modules referenced by the current project as well as any licenses of modules used by `@enact/cli` that may be included in a production build of an app.


## Enact Build Options

The @enact/cli tool will check the project's **package.json** looking for an optional `enact` object for a few customization options:

* `template` _[string]_ - Filepath to an alternate HTML template to use with the [Webpack html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin).
* `isomorphic` _[string]_ - Alternate filepath to a custom isomorphic-compatible entry point. Not needed if main entry point is already isomorphic-compatible.
* `title` _[string]_ - Title text that should be put within the HTML's `<title></title>` tags. Note: if this is a webOS-project, the title will, by default, be auto-detected from the **appinfo.json** content.
* `alias` _[object]_ - String mapping of webpack alias paths to use when building.
* `theme` _[object]_ - A simplified string name to extrapolate `fontGenerator`, `ri`, and `screenTypes` preset values from. For example, `"sandstone"`.
* `fontGenerator` _[string]_ - Filepath to a CommonJS fontGenerator module which will build locale-specific font CSS to inject into the HTML. By default, will use any preset for a specified theme or fallback to sandstone.
* `ri` _[object]_ - Resolution independence options to be forwarded to the [postcss-resolution-independence](https://github.com/enactjs/postcss-resolution-independence). By default, will use any preset for a specified theme or fallback to sandstone.
	* `baseSize` _[number]_ - The root font-size to use when converting the value of the base unit to a resolution-independent unit. For example, when `baseSize` is set to 24, 48px in the LESS file will be converted to 2rem.
* `screenTypes` _[array|string]_ - Array of 1 or more screentype definitions to be used with prerender HTML initialization. Can alternatively reference a json filepath to read for screentype definitions.  By default, will use any preset for a specified theme or fallback to sandstone.
* `nodeBuiltins` _[object]_ - Configuration settings for polyfilling NodeJS built-ins. See `node` [webpack option](https://webpack.js.org/configuration/node/).
* `resolveFallback` _[object]_ - Configuration settings for redirecting module requests when normal resolving fails. See `resolve.fallback` [webpack option](https://webpack.js.org/configuration/resolve/#resolvefallback).
* `externalStartup` _[boolean]_ - Flag whether to externalize the startup/update js that is normally inlined within prerendered app HTML output.
* `forceCSSModules` _[boolean]_ - Flag whether to force all LESS/CSS to be processed in a modular context (not just the `*.module.css` and `*.module.less` files).
* `deep` _[string|array]_ - 1 or more JavaScript conditions that, when met, indicate deeplinking and any prerender should be discarded.
* `target` _[string|array]_ - A build-type generic preset string (see `target` [webpack option](https://webpack.js.org/configuration/target/)) or alternatively a specific [browserslist array](https://github.com/browserslist/browserslist) of desired targets.
* `publicUrl` _[string]_ - Public path URL at which the app is served or destined to be hosted. This can also be set via the package.json `homepage` field.
* `proxy` _[string]_ - Proxy target during project `serve` to be used within the [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).

For example:
```js
{
	...
	"enact": {
		"theme": "sandstone",
		"resolveFallback": {
			fs: false,
			net: false,
			tls: false
		}
	}
	...
}
```

## Displaying Lint Output in the Editor

Some editors, including Visual Studio Code, Sublime Text, and Atom provide plugins for ESLint.

They are not required for linting. You should see the linter output right in your terminal. However, if you prefer the lint results to appear right in your editor, there are some extra steps you can do.

You would need to install an ESLint plugin for your editor first.

Ever since ESLint 6, global installs of ESLint configs are no longer supported.
To work around this new limitation, while still supporting in-editor linting, we've created a new [eslint-config-enact-proxy](https://github.com/enactjs/eslint-config-enact-proxy) package.
The [eslint-config-enact-proxy](https://github.com/enactjs/eslint-config-enact-proxy) acts like a small proxy config, redirecting ESLint to use a globally-installed Enact ESLint config.
`eslint-config-enact-proxy` needs to be installed locally on a project to enable in-editor linting:

```sh
npm install --save-dev eslint-config-enact-proxy
```

Also, you need to modify `eslintConfig` property in `package.json`:

```json
  "eslintConfig": {
    "extends": "enact-proxy"
  },
```
>**NOTE**: For strict mode, use `"extends": "enact-proxy/strict"`.

In order for in-editor linting to work with our updated ESLint config, you'll need to upgrade to ESLint 7 or later. This can be installed globally by running:

```sh
npm install -g eslint
```

Then, you will need to uninstall any previous globally-installed Enact linting package (everything but eslint itself):

```sh
npm uninstall -g eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-babel @babel/eslint-parser eslint-plugin-jest eslint-plugin-enact eslint-config-enact
```

## Documentation
* [Enact CLI Development Tool](https://enactjs.com/docs/developer-tools/cli/)

## Copyright and License Information

Unless otherwise specified, all content, including all source code files and documentation files in this repository are:

Copyright (c) 2016-2025 LG Electronics

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Portions of this project are based upon [create-react-app](https://github.com/facebookincubator/create-react-app), Copyright (C) 2016-present Facebook, Inc.

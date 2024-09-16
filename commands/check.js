/* eslint-env node, es6 */
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const glob = require('glob');
const minimist = require('minimist');

const globOpts = {
	ignore: [
		'**/node_modules/**',
		'build/**',
		'**/dist/**',
		'coverage/**',
		'tests/**',
		'**/*-specs.js',
		'**/index.js',
		'samples/**',
		'**/util.js',
		'**/utils.js',
		'**/validators.js'
	],
	nodir: true
};

const readFile = promisify(fs.readFile);
const globPromise = promisify(glob);

function displayHelp() {
	let e = 'node ' + path.relative(process.cwd(), __filename);
	if (require.main !== module) e = 'enact check';

	console.log('  Checks for potential missing class definitions');
	console.log();
	console.log('  Usage');
	console.log(`    ${e} [options]`);
	console.log();
	console.log('  Arguments');
	console.log();
	console.log('  Options');
	console.log('    -v, --version     Display version information');
	console.log('    -h, --help        Display help information');
	console.log();
	process.exit(0);
}

function logWarnings(missingClassNames) {
	if (missingClassNames.length) {
		console.log();
		console.warn('  There might be missing class definitions in the following less files:');
		console.log();

		missingClassNames.forEach(component => {
			const componentName = Object.keys(component)[0];
			console.log(`  ${componentName}`);
			console.log(component[componentName]);
			console.log();
		});
	} else {
		console.log('  No problems found.');
	}
}

function getMissingClassNames(lessFile, classNames) {
	return new Promise((resolve, reject) => {
		const missingClassNames = {[lessFile]: []};

		if (lessFile) {
			readFile(lessFile, 'utf8')
				.then(data => {
					// const componentName = file.match(/([^\/]+)(?=\.\w+$)/g)[0];
					// const lessFileName = data.match(/\w*\.module\.less/g);
					classNames.forEach(name => {
						if (!data.includes(name)) {
							missingClassNames[lessFile].push(name);
						}
					});

					resolve(missingClassNames[lessFile].length === 0 ? null : missingClassNames);
				})
				.catch(err => reject(err));
		}
	});
}

// function getDefaultClasses(classNameArray, component) {
// 	const newArray = [...getDefaultClasses];
// 	//TODO
// 	return newArray;
// }

function getClassNamesUsed(files) {
	return new Promise((resolve, reject) => {
		const promisesToResolve = [];

		files.forEach((file, index) => {
			readFile(file, 'utf8')
				.then(data => {
					const lessFileName = data.match(/\w*\.module\.less/g);
					const dataWithoutComments = data.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
					const classNamesUsed = dataWithoutComments.match(/css\.\w*/g);
					// classNamesUsed = getDefaultClasses(classNamesUsed, dataWithoutComments);

					if (lessFileName && classNamesUsed) {
						const componentDirectory = file.match(/^(.+)\//g)[0];
						const classNames = classNamesUsed.map(name => name.split('.')[1]);

						promisesToResolve.push(
							getMissingClassNames(`${componentDirectory}${lessFileName[0]}`, classNames)
						);
					}

					if (index === files.length - 1) {
						return promisesToResolve;
					}
				})
				.then(promises => (promises ? resolve(promises) : null))
				.catch(err => reject(err));
		});
	});
}

function getJSfiles() {
	return new Promise((resolve, reject) => {
		globPromise('**/*.js', globOpts)
			.then(files => {
				resolve(files);
			})
			.catch(err => reject(err));
	});
}

function api() {
	return Promise.resolve().then(() =>
		getJSfiles()
			.then(files => getClassNamesUsed(files))
			.then(promises => Promise.all(promises))
			.then(results => logWarnings(results.filter(result => result)))
			.catch(err => console.err(err))
	);
}

function cli(args) {
	const opts = minimist(args, {
		boolean: ['help'],
		alias: {h: 'help'}
	});
	if (opts.help) displayHelp();

	api(args).catch(() => {
		process.exit(1);
	});
}

module.exports = {api, cli};
if (require.main === module) cli(process.argv.slice(2));

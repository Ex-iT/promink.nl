const fs = require('fs');
const chalk = require('chalk');
const postcss = require('postcss');
const precss = require('precss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const syntax = require('postcss-scss');

const { path } = require('./config');

fs.readFile(`${path.source}index.scss`, (err, css) => {
	postcss([precss, autoprefixer, cssnano])
		.process(css, { syntax, from: `${path.source}/index.css`, to: `${path.dest}/index.css`, map: { inline: false } })
		.then(result => {
			fs.writeFile(`${path.dest}index.css`, result.css, err => {
				if (err) {
					console.log(chalk.red(`✘ HTML render error\n`, err));
				} else {
					console.log(chalk.green(`✓ HTML pages saved to ${path.dest}index.css`));
				}
			});
			if (result.map) fs.writeFile(`${path.dest}/index.css.map`, result.map);
		});
});
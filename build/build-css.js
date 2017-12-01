const fs = require('fs');
const postcss = require('postcss');
const precss = require('precss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const syntax = require('postcss-scss');

const { path } = require('./config');

fs.readFile(`${path.source}index.scss`, (err, css) => {
	postcss([precss, autoprefixer, cssnano])
		.process(css, { syntax, from: `${path.source}/index.css`, to: `${path.dest}/index.css` })
		.then(result => {
			fs.writeFile(`${path.dest}/index.css`, result.css, err => { if (err) console.log(err); });
			if (result.map) fs.writeFile(`${path.dest}/index.css.map`, result.map);
		});
});
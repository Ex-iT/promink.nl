const chalk = require('chalk');
const fse = require('fs-extra');
const path = require('path');
const nunjucks = require('nunjucks');
const slugify = require('slugify');

const data = require('../src/data');

const rootDir = path.join(__dirname, '..');
const inputDir = 'src';
const outputDir = path.join(rootDir, 'dist');
nunjucks.configure(inputDir, { watch: false });

const slugifyConfig = { 
	lower: true,
	remove: /[$*_+~.()'"!?\-:@]/g
};

renderAll(data);

function renderAll(data) {
	const navigationItems = getNavigation(data.pages);
	Object.assign(data, { navigationItems });

	return Promise.all([
		createRedirects(data.redirects),
		renderHome(data),
		renderPages(data)
	])
		.then(() => console.log(chalk.green(`✓ HTML pages saved to ${path.relative(rootDir, outputDir)}/`)))
		.catch((err) => console.log(chalk.red(`✘ HTML render error\n`, err)));
}

function createRedirects(data) {
	Object.keys(data).map(key => {
		return renderView('redirect', { redirectUrl: data[key], script: `window.location = '${data[key]}';` })
			.then(html => fse.outputFile(`${outputDir}/${key}`, html));
	});
}

function getNavigation(pages) {
	return pages.map(page => {
		return {
			title: page.title,
			special: page.special,
			slug: `/${slugify(page.title, slugifyConfig)}`
		};
	});
}

function renderHome(data) {
	const baseUrl = './';
	Object.assign(data, { baseUrl });
	return renderViewToFile('home', data);
}

function renderPages(data) {
	return Promise.all(data.pages.map(page => {
		const slug = slugify(page.title, slugifyConfig);
		return renderPage({ page, navigationItems: data.navigationItems, contactInfo: data.contactInfo, slug });
	}));
}

function renderPage(data) {
	return renderViewToFile('page', data, data.slug);
}

function renderView(view, data) {
	return new Promise((resolve, reject) => nunjucks.render(`views/${view}.html`, data, (err, html) => {
		err ? reject(err) : resolve(html);
	}));
}

function renderViewToFile(view, data, slug) {
	const baseUrl = slug ? `${path.relative(slug, './')}/` : './';
	const dirName = slug ? slug + '/' : '';
	Object.assign(data, { baseUrl, env: process.env.NODE_ENV });
	return renderView(view, data)
		.then(html => fse.outputFile(`${outputDir}/${dirName}index.html`, html));
}

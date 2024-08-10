const esbuild = require('esbuild');
const watch = process.argv[2]?.includes('watch');

/** @type {esbuild.BuildOptions} */
const buildOptions = {
	entryPoints: [ `${__dirname}/src/index.ts` ],
	bundle: true,
	format: 'esm',
	treeShaking: true,
	minify: process.env.NODE_ENV === 'production',
	sourcemap: true,
	absWorkingDir: __dirname,
	outbase: `${__dirname}/src`,
	outdir: `${__dirname}/dist`,
	loader: {
		'.ts': 'ts'
	},
	tsconfig: `${__dirname}/tsconfig.json`,
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
	}
};

(async () => {
	if (!watch) {
		await esbuild.build(buildOptions);
		console.log('done');
	} else {
		const context = await esbuild.context(buildOptions);
		await context.watch();
		console.log('watching...');
	}
})();
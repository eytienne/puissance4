// Webpack uses this to work with directories
const path = require('path');
const glob = require('glob');

const myPlugins = []

// This is main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {

	// Path to your entry point. From this file Webpack will begin his work
	entry: function () {
		const ret = {};
		glob.sync("./src/**/*.[tj]s").reduce(function (buf, path) {
			buf[path] = path;
			return buf;
		}, ret);
		return ret;
	},

	// Path and filename of your result bundle.
	// Webpack will bundle all JavaScript into this file
	output: {
		publicPath: '/public/',
		path: path.resolve(__dirname, 'public', 'build'),
		filename: function (data) {
			const ret = data.chunk.name.split('./src/').pop().replace('.ts', '.js');
			console.log('id:', ret)
			return ret;
		}
	},
	module: {
		rules: [
			{ // babel
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
				}
			},
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					}
				]
			},
			{ // style
				// Apply rule for .sass, .scss or .css files
				test: /\.(s(a|c)|c)ss$/,

				// Set loaders to transform files.
				// Loaders are applying from right to left(!)
				// The first loader will be applied after others
				use: [
					{
						// This loader resolves url() and @imports inside CSS
						loader: "style-loader",
					},
					{
						// This loader resolves url() and @imports inside CSS
						loader: "css-loader",
					},
					{
						// Then we apply postCSS fixes like autoprefixer and minifying
						loader: "postcss-loader"
					},
					{
						// First we transform SASS to standard CSS
						loader: "sass-loader",
						options: {
							implementation: require("sass")
						}
					}
				]
			},
			{ // images
				// Now we apply rule for images
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						// Using file-loader for these files
						loader: "file-loader",

						// In options we can set different things like format
						// and directory to save
						options: {
						}
					}
				]
			},
			{ // fonts
				// Apply rule for fonts files
				test: /\.(woff|woff2|ttf|otf|eot)$/,
				use: [
					{
						// Using file-loader too
						loader: "file-loader",
						options: {
							publicPath: "/public/build/"
						}
					}
				]
			}
		]
	},
	plugins: myPlugins,
	resolve: {
		alias: {
			'root': path.resolve(__dirname)
		},
	},
	// Default mode for Webpack is production.
	// Depending on mode Webpack will apply different things
	// on final bundle. For now we don't need production's JavaScript 
	// minifying and other thing so let's set mode to development

	mode: 'development',

	devtool: 'source-map'
};
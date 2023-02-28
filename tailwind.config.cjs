/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			width: {
				content: '66ch',
			}
		},
	},
	plugins: [
	 require('@tailwindcss/typography'),
	],
}

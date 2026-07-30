// `@csstools/postcss-global-data` (Reshaped's recommended way to inject its
// `@custom-media` definitions) is deliberately not used here — its raw
// `fs.readFileSync` on an absolute path falls outside Turbopack's tracked
// module graph, and Turbopack's postcss-transform sandbox redirects such
// untracked reads into its own `.next/` build cache instead of the real
// file (reproducible even with turbopack.root correctly set in
// next.config.ts). Importing reshaped/themes/slate/media.css as a real ES
// import in app/layout.tsx, ahead of bundle.css, puts the same `@custom-
// media` definitions in Turbopack's tracked graph instead, in the same
// concatenated global stylesheet as bundle.css's `@media (--rs-viewport-*)`
// usages — so postcss-custom-media alone can resolve them.
//
// cssnano is left out too: Next.js already minifies CSS in production, and
// running Reshaped's own cssnano pass first risks double-processing the
// same output.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-custom-media": {},
  },
};

export default config;

# Contributing

Use Bun 1.3.14 and keep changes inside the documented public boundary.

1. Install dependencies with `bun install --frozen-lockfile`, then provision the pinned browser with `bun run browser:install`.
2. Add focused regression evidence for each behavior or presentation contract change.
3. Update `DesignSystemGallery` when a public recipe changes.
4. Run `bun run check`.

Keep portable controls and React Aria behavior in `@hraness/ui`. Treat its
supported peer range and the repository's exact development pin as separate
contracts, and update package-consumer evidence when either changes. Include
upstream license and provenance updates with every vendor-derived change.

## npm

After the GitHub Release, the release workflow's `npm` job publishes the
tagged commit to npm as `@hraness/design-kit` with a provenance attestation. It uses npm
trusted publishing, so GitHub Actions proves the workflow's identity to npm
and no npm token is stored anywhere. No one needs to approve a release. The
job skips a version that npm already has.

npm only accepts trusted publishing for a package that already exists, so the
job warns and skips until a maintainer does this once:

1. From a clean checkout of the newest `v*` tag, which the release workflow
   has already checked, publish the first version by hand:
   `bun install --frozen-lockfile --ignore-scripts && bun run check:publication-ready && npm publish --access public --ignore-scripts`.
2. Let this workflow publish from now on:
   `npm trust github @hraness/design-kit --repo hraness/design-kit --file release.yml --allow-publish --yes`
   (npm 11.16 or newer).
3. In the package settings on npmjs.com, require two-factor authentication and
   disallow tokens.

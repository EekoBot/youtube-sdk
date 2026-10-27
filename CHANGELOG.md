# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-10-27

The SDK is regenerated with skmtc 0.9. The generator 1.0.1 was built with
ran on a hosted skmtc service (Deno Deploy Classic) that no longer exists,
so the package could not be rebuilt at all. Generation now runs locally:
`npm run generate` (Deno 2.9+) runs the stack in `.skmtc/youtube-sdk` —
stock `@skmtc/gen-zod` and `@skmtc/gen-typescript` for the models, and
`gen-youtube-client`, a port of the old client generator to the current
skmtc engine.

Every exported name is unchanged: `YouTubeClient`, its 76 methods with the
same signatures, the 96 `…ApiArgs`/`…ApiResponse` types, and the 186 model
types and schemas.

### Changed
- **Breaking:** the schemas are zod 4 (`zod` ^4.6.7, was ^3.24.1). Code that
  composes them with its own zod 3 schemas has to move to zod 4 too.
- **Breaking (types):** `date-time` fields are typed `string`, not `Date`, and
  their schemas no longer coerce. The client never parsed responses, so at
  runtime these were always strings; the types now say so.
- `YouTubeClient` is a class declaration (`export class`), so it can be used as
  a type as well as constructed.

### Fixed
- Request URLs no longer contain a double slash
  (`https://youtube.googleapis.com//youtube/v3/...`).
- The per-file modules in `dist/` (`dist/YouTubeClient.generated.*`,
  `dist/types/*`) imported unresolvable `@/...` paths; they now use relative
  imports, so their types resolve instead of degrading to `any`.
- CI could not build: it ran an unpinned skmtc CLI and `rollup-plugin-typescript2`,
  which no longer transforms files under current rollup 4. The CLI is pinned and
  the bundle uses `@rollup/plugin-typescript`; the spec-validation tests now run.


### Added
- Initial release of YouTube SDK
- Generated from OpenAPI specification using SKMTC CLI
- Full TypeScript support with comprehensive type definitions
- Live Chat API support including:
  - Get live chat messages
  - Send live chat messages  
  - Delete live chat messages
  - Moderate live chat messages (approve/reject)
- Support for all live chat message types:
  - Text messages
  - Super Chat
  - Super Stickers
  - Member milestone chats
  - New sponsor notifications
  - Membership gifting
  - User bans
  - Message deletions and retractions
  - Polls
- Universal compatibility (Node.js, browsers, Cloudflare Workers, Deno)
- GitHub Actions automation for code generation and publishing
- Comprehensive documentation and usage examples

### Technical Details
- Generated from SKMTC CLI version 0.0.153
- TypeScript 5.0+ support
- ES2022 target with CommonJS and ESM builds
- Tree-shakeable exports
- Source maps and declaration files included

## [1.0.0] - TBD

### Added
- Initial stable release
# ratemyhospitalfood.com production security release

Released October 24, 2026, with the owner’s explicit production authorization.

## 1. Identity and PHP2Shell

Repository: Jethro-Chu/ratemyhospitalfood.com, production branch main. Vercel project ratemyhospitalfood (`prj_MqwjrsQhlE9RSdUEymNYidBMdwLs`). Production deployment `dpl_5k9kpzHF7oaNQntY88ygrycg95xA` serves commit `3a88ac28c5d59fbd640cdb26c4829392bb44b269`. Its authenticated Git record and aliases include both custom domains; live headers and HTML were checked through Cloudflare after READY. The original Documents checkout remains untouched; development is in `/Users/jethrochu/dev/ratehospitalfood`.

Frontend: Next 15.5.28 / React 18.3.1. Backend: Vercel Next route handlers and Server Actions, configured Node 24.x. The production Vercel database environment was privately inspected, independently confirming the Neon endpoint previously found locally: project crimson-fire-13331353, ep-small-cake-ahohq618, database neondb, PostgreSQL 17.11. The application now uses the separate restricted LOGIN food_app_20261024. Production photo storage remains the existing Vercel Blob store at zzpawzswkmo8mdxz.public.blob.vercel-storage.com. The SDK uses its Vercel OIDC store binding when available.

The official [CVE-2026-109618 OOM advisory](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) and [CVE-2026-109619 stale-state advisory](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) were rechecked October 24. Both affect PHP, with supported fixes 8.2.35, 8.3.36, 8.4.27, and 8.5.12. No application PHP runtime, Composer dependency, or customer-managed PHP container was identified in the confirmed Next/Node/PostgreSQL/Blob path. No PHP runtime update was necessary. Undisclosed services and provider-internal software remain unverified.

## 2. Deployed fixes and configuration

- Removed the public /seed schema-administration route and runtime schema-repair DDL.
- Added streamed request limits, strict review/action validation, exact photo-host/path checks, signed HttpOnly/Strict photo receipts and reaction ownership cookies, and shared atomic PostgreSQL quotas.
- Photos are decoded under pixel/size limits, resized and re-encoded as JPEG without EXIF, with random names. Fake image input is rejected.
- Reactions use an atomic ownership ledger. Repeated additions do not inflate counts; a visitor cannot remove another visitor’s reaction. Existing unattributable totals remain a baseline.
- Updated Next and affected compatible dependencies, restricted image optimization to the known photo store, and added browser security headers.
- Applied migrations/20261021_security.sql through a direct administrator connection. All 417 hospitals and 25 reviews were preserved. New constraints apply to new writes while retaining historical rows.
- Created food_app_20261024 with food_runtime membership and no administrator capabilities. Read-only production catalog checks confirm no schema CREATE, review deletion, review-content UPDATE, or review ownership.
- Replaced every known database URL, username and password alias in production, preview and development. Application environments no longer contain the owner connection through those aliases. New builds receive separate runtime credentials. Historical immutable deployments can retain their old snapshots; an old deployment URL checked during release required Vercel sign-in.
- Installed a random server-only APP_SECURITY_SECRET. New preview/development environments use isolated test DB/storage/signing configuration. Local .env.local is ignored, permission-restricted and points only at test services.

No credential leak was confirmed by the pattern scans. No secret was printed or committed. Generated credentials are stored privately under ~/.config/website-security, outside the repositories.

## 3. Verification

The local production build and 45 security assertions passed, including an isolated PostgreSQL engine with a fake Blob provider. The hosted isolated preview then passed 21 HTTP checks against a dedicated database and Blob store: real PNG upload converted to JPEG, signed receipt required, review saved and included in rendered feed data, invalid image/rating rejection, cross-origin rejection, idempotent reactions, other-actor undo denial, owner undo, and review quota exhaustion returning 429. Image optimization returned 200; decoded output was an 8x8 JPEG without EXIF. Runtime-role schema modification, review-text UPDATE and DELETE attempts were denied on the isolated database.

Preview and production group roles are separate. Read-only catalog checks after production migration confirmed the preview LOGIN has no production table read or write grants and no production runtime group membership. Reactions still passed after this separation. Production permission verification used catalog reads, not attempted schema/data writes.

The first hosted upload check caught the SDK preferring the original OIDC Blob store binding over the preview write token. One generated 8x8 test image reached the original store. Testing stopped before any review submission; that exact generated object was deleted and a subsequent GET returned 404. The preview OIDC store binding was corrected before all subsequent successful flow tests. No existing photo or production review was changed.

Production deployment reached READY with the expected Git SHA and aliases. Live checks: homepage 200 with expected data and headers, /seed 404, malformed review 400, cross-origin review 403, invalid reaction 400. Test fixtures are absent from the production homepage. The portfolio queue checks also passed in the same verification run. No production review, hospital or reaction test data was created. No error/fatal log groups were returned for this deployment during the checked 15-minute window; this is a point-in-time check.

Production browser smoke confirmed the homepage counts and a hospital detail page loaded its six reviews through the Server Action. One legacy photo reference returned 404 directly from the original Blob store, while another existing photo and its optimizer URL returned 200. Recovering the missing original needs a backup or replacement photo; the security release did not change that stored URL.

The original audit contains the dependency inventory, full local test scope and limitations. Runtime code, pages and games retain their existing visual design. The new production write flow was exercised in the isolated hosted environment rather than against real reviews.

## 4. Remaining hosting work, rotations and access

No additional hosting change is needed to activate this release. Remaining operational work:

- Coordinate rotation of the old neondb_owner password after identifying other admin/integration consumers and retiring historical deployment snapshots. It was removed from new application environments; it was not rotated because unknown consumers could be disrupted. This is recommended credential retirement after privilege reduction, not evidence of a leak. Existing owner credentials in the original local checkout also need updating after rotation.
- Review Cloudflare zone/Worker/WAF rules, origin bypass policy and spending controls with the Cloudflare account. That account was unavailable. Per-client proxy logic is covered by spoofing tests, but the complete production proxy chain was not independently traced.
- Arrange administrator maintenance for expired quota rows and orphaned uploads. The migration includes a safe expired-row cleanup query, but no recurring job was installed.
- Recover or replace the missing original photo referenced by the Huntington Hospital review. No source image was available to restore.
- Review moderation/CAPTCHA needs and provider budget alerts. Anonymous quotas are not proof of identity and do not prevent coordinated fraud.
- Keep the isolated database security_preview_20261024 and Blob store food-security-preview-20261024 for test use, or remove them through a separately reviewed cleanup. They contain synthetic test data, not production copies.

Vercel CLI access worked after refresh even though connector environment endpoints remained denied. Neon management-console access and Cloudflare account access are still needed for provider-level settings and coordinated owner-key retirement. The database connection itself allowed the reviewed migration and privilege reduction.

## 5. Unverified and residual scope

Exact managed Node patch, Cloudflare rules/Workers/cache policy, full WAF configuration, complete Blob OIDC/token ACLs, all historical uploads, service internals, provider billing alerts, complete logs and compromise history remain unverified. Existing public photo content was not scanned or cleaned; metadata stripping applies to new uploads. Production valid submissions were not exercised with real data. One OSV match remains for braces 3.0.3 in build tooling, with no published patch at audit time and no identified public-input path. The CSP is focused rather than a complete script policy. This audit does not establish complete security.

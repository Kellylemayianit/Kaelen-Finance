# Research desk
A research dashboard on Cloudflare: a Worker serves the site and a small API, and a D1 database keeps your check-ins, theses, typed-in EXY rows and CFTC positioning. Everything deploys from GitHub Actions. You never run a terminal.

## One-time setup (all in the browser)
1. **Cloudflare API token.** Cloudflare dashboard, My Profile, API Tokens, Create Token, start from the "Edit Cloudflare Workers" template, then add the permission **Account, D1, Edit**. Copy the token.
2. **Account ID.** Cloudflare dashboard, Workers and Pages, the Account ID shows on the right.
3. **A write key.** Make up a long passphrase. It protects your private data.
4. **GitHub secrets.** In the repo: Settings, Secrets and variables, Actions, New repository secret. Add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `WRITE_KEY`.
5. **Upload the files** to the repo root (Add file, Upload files). The `.github/workflows/deploy.yml` file may not come through a folder drag. If it is missing, use Add file, Create new file, type `.github/workflows/deploy.yml` as the name and paste the contents.
6. Commit to `main`. Open the **Actions** tab and watch the run. When it is green, the site is live at the Worker URL shown in the run log (and under Workers and Pages in Cloudflare).

## What the pipeline does on every push to main
syntax check, backend tests, apply D1 migrations, deploy the Worker and site, set the `WRITE_KEY` secret, smoke test `/api/health`, then run a first CFTC positioning sync.

## First visit
Open the site. When it asks for the write key, enter the `WRITE_KEY` passphrase. It is stored only in that browser.

## Layout
- `public/` the site (vanilla JS modules, no build step)
- `src/` the Worker API. Public: `/api/health`, `/api/flow`, `/api/yields`, `/api/cot`. Needs the key: `/api/checkins`, `/api/exy`, `/api/thesis`, `/api/cot/sync`
- `migrations/` D1 schema. Add `0002_...sql` for changes, never edit an applied file
- `test/run.mjs` backend tests (`node --experimental-sqlite test/run.mjs`)
- `wrangler.jsonc` Worker, assets, D1 binding and the Friday sync schedule

## Notes
- Check-ins and theses are append-only: the API has no edit or delete for them.
- Price charts still draw a placeholder line until a price feed is connected.
- To lock the whole site, put Cloudflare Access in front of the Worker in the Cloudflare dashboard.
- CFTC data: Traders in Financial Futures, futures only, leveraged funds net (long minus short). Markets: DXY (098662), Euro FX (099741), British pound (096742), Japanese yen (097741).

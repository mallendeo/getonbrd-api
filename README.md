# Development

- Create a `.dev.vars` file
- Set `GOB_SESSION` and `GOB_CSRF_TOKEN` vars on that file
- `npm start -- --local`

## Production

- `wrangler secret put GOB_SESSION`
- `wrangler secret put GOB_CSRF_TOKEN`

## Public API

https://getonbrd-api.chilesh.workers.dev

e.g

https://getonbrd-api.chilesh.workers.dev/filter?salary=2000-3200&offset=0
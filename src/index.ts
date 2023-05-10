import { RouteContext, WorkerRouter } from '@worker-tools/router'
import { JSONResponse, ok, unprocessableEntity } from '@worker-tools/shed'
import { createGOB } from './scraper'
import yn from 'yn'

const initWithCtx = (ctx: RouteContext) => {
	const gob = createGOB(ctx.env.GOB_SESSION, ctx.env.GOB_CSRF_TOKEN)
	return {
		gob,
		env: ctx.env,
	}
}

export const router = new WorkerRouter()

router.get('/filter', async (req, ctx) => {
	const params = new URL(req.url).searchParams
	const salaryParam = (params.get('salary') as string) || ''
	const offsetParam: number = +(params.get('offset') ?? 0)
	const salaryRange: number[] | null = salaryParam
		? salaryParam.split(/[,:-]/g).map(Number)
		: null
	const remote = yn(params.get('remote'))

	const { gob } = initWithCtx(ctx)
	const { jobs, meta } = await gob.navJobs(salaryRange, offsetParam, remote)

	return new JSONResponse({ jobs, meta }, ok())
})

router.get('/jobs/*', async (req, ctx) => {
	const path = new URL(req.url).pathname
	const [, slug] = path.match(/^(?:\/jobs\/)?(.+)/)
	if (!slug) {
		return new JSONResponse({ error: 'Wrong format' }, unprocessableEntity())
	}

	const { gob } = initWithCtx(ctx)
	const jobInfo = await gob.getJob(slug)

	return new JSONResponse(jobInfo, ok())
})

router.get('/jobs-*', async (req, ctx) => {
	const path = new URL(req.url).pathname
	const term = path.match(/jobs-(.+)/)[1]

	const { gob } = initWithCtx(ctx)
	const jobs = await gob.search(term)

	return new JSONResponse({ jobs }, ok())
})

export default router

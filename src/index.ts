import process from 'node:process'
import yn from 'yn'
import { createGOB } from './scraper'

const initWithCtx = (env: NodeJS.ProcessEnv) => {
  const gob = createGOB(env.GOB_SESSION!, env.GOB_CSRF_TOKEN!)
  return {
    gob,
    env,
  }
}

const PORT = process.env.PORT || 8787

Bun.serve({
  port: PORT,
  fetch: async (req) => {
    const url = new URL(req.url)
    const params = url.searchParams
    const { pathname } = url

    const { gob, env } = initWithCtx(process.env)

    if (pathname === '/filter') {
      const salaryParam = (params.get('salary') as string) || ''
      const offsetParam = +(params.get('offset') ?? 0)

      const salaryRange: number[] | null = salaryParam
        ? salaryParam.split(/[,:-]/g).map(Number)
        : null
      const remote = yn(params.get('remote'))

      const { jobs, meta } = await gob.navJobs(salaryRange, offsetParam, remote)
      return new Response(JSON.stringify({ jobs, meta }))
    }

    if (pathname.startsWith('/jobs/')) {
      const slug = pathname.split('/')[2]
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Wrong format' }), {
          status: 422,
        })
      }
      const jobInfo = await gob.getJob(slug)
      return new Response(JSON.stringify(jobInfo))
    }

    if (pathname.startsWith('/jobs-')) {
      const term = pathname.split('-')[1]
      const jobs = await gob.search(term)
      return new Response(JSON.stringify({ jobs }))
    }

    // default response
    return new Response('Route not found', { status: 404 })
  },
})

console.log(`Server listening on :${PORT}`)
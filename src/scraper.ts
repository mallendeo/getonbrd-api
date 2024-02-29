import { load } from 'cheerio'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { getUnit, txt, extractFromArr, PropMapRules } from './helpers'

import type { Job, JobData, JobSearchMeta } from './types'

export const createGOB = (session: string, token: string) => {
	const navJobs = async (
		salary: [number, number] | number[] | null,
		offset = 0,
		remote = false,
	): Promise<{ jobs: Job[]; meta: JobSearchMeta }> => {
		const params = {
			offset,
			webpro: {
				remote_jobs: remote ? 'true' : 'false',
				min_salary: salary ? salary[0] : null,
				max_salary: salary ? salary[1] : null,
			},
		}

		const BASE_URL = `https://www.getonbrd.com/webpros/search_jobs.json`

		console.log('finalUrl', BASE_URL)
		if (process.env.DEBUG) console.log(BASE_URL, params, token, session)

		const res = await fetch(BASE_URL, {
			headers: {
				'Content-Type': 'application/json',
				Cookie: `_getonboard_session=${session};`,
			},
			method: 'POST',
			body: JSON.stringify(params)
		})

		return res.json()
	}

	const getJob = async (slug: string): Promise<JobData> => {
		const res = await fetch(`https://www.getonbrd.com/jobs/${slug}`)
		const html = await res.text()
		const $ = load(html)

		const _title = $('.gb-landing-cover__title')
		const title = txt(_title.find('[itemprop="title"]'))
		const level = txt($('[itemprop="qualifications"]'))
		const jobArea = txt($('[itemprop="qualifications"] ~ .color-inherit'))
		const type = txt($('[itemprop="employmentType"]'))
		const _salary = $('[itemprop="baseSalary"]')
		const _location = txt($('[itemprop="address"]'))
		const tags = $('[itemprop="skills"] > a')
			.map((_, el) => txt($(el)))
			.get()
		const _company = $('[itemprop="hiringOrganization"]')
		const company = {
			slug: _company.find('a').attr('href').match(/companies\/(.+)/)[1],
			name: txt(_company.find('[itemprop="name"]')),
			logo: txt(_company.find('[itemprop="logo"]')),
		}
		const date = txt(_company.find('time'))
		const url = $(`link[itemprop='url']`).attr('href')
		const locModality = _location.toLowerCase().match(/remote|hybrid/)?.[0]
		const location = {
			modality: locModality,
			place: _location.match(/((?!remote|hybrid|\(|\s).)*/)?.[0] || locModality,
		}

		const salary = {
			type: _salary.find('.hide-on-small-mobile').text().match(/gross/i)
				? 'gross'
				: 'net',
			min: +_salary.find('[itemprop="minValue"]').attr('content'),
			max: +_salary.find('[itemprop="maxValue"]').attr('content'),
			unit: _salary.find('[itemprop="unitText"]').attr('content'),
			currency: _salary.find('[itemprop="currency"]').attr('content'),
		}

		const otherInfo = $('.size0')
			.first()
			.text()
			.split(/\n\n/)
			.map((l) => l.replace(/\n/g, ' ').trim())
			.filter((l) => l)

		const description = NodeHtmlMarkdown.translate(
			$('[itemprop="description"]').html(),
		)

		const propMapRules: PropMapRules = {
			applications: [/(\d+) app/i, (match) => +match],
			repliesIn: [
				/repl.*? (.+)/i,
				(match) => {
					const unit = getUnit(match)
					if (match.includes('same')) return [unit, 0]
					if (match.match(/in \d*/)) return [unit, +match.match(/in (\d*)/)[1]]
					const split = match.split('and').map((s) => s.match(/(\d+)/)[1])
					return [unit, ...split.map(Number)]
				},
			],
			lastChecked: [
				/last check.*? (.+)/i,
				(match) => {
					const unit = getUnit(match)
					const [, digit] = match.match(/(\d+)/) || []
					return [unit, +digit || match]
				},
			],
			requiresApplyingIn: [/applying in (.+)/i, (match) => match.toLowerCase()],
		}

		const job: JobData = {
			url,
			date,
			title,
			area: jobArea,
			level,
			type,
			salary: salary.min && salary.max ? salary : null,
			description,
			location,
			tags,
			company,
			...extractFromArr(otherInfo, propMapRules),
		}

		return job
	}

	const search = async (term: string) => {
		const res = await fetch(
			`https://www.getonbrd.com/jobs-${term.replace(/\s+/, '-')}`,
		)
		const html = await res.text()
		const $ = load(html)
		const results = $('.gb-results-list > div')
			.map((_, el) => {
				const url = $(el).find('a').attr('href')
				const info = {
					url,
					slug: url.match(/jobs\/(.+)/)[1],
				}

				return info
			})
			.get()

		return results
	}

	return {
		navJobs,
		getJob,
		search,
	}
}

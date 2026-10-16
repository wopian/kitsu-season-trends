import { stat } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] ?? '.output/public')
const port = Number(process.env.PORT ?? 4173)
const server = Bun.serve({
  hostname: '127.0.0.1',
  port,
  async fetch(request) {
    const url = new URL(request.url)
    let path: string
    try {
      path = resolve(root, `.${decodeURIComponent(url.pathname)}`)
    } catch {
      return new Response('Bad path', { status: 400 })
    }
    if (path !== root && !path.startsWith(root + sep))
      return new Response('Forbidden', { status: 403 })
    const info = await stat(path).catch(() => null)
    if (info?.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        url.pathname += '/'
        return Response.redirect(url.href, 308)
      }
      path = join(path, 'index.html')
    }
    const file = Bun.file(path)
    if (await file.exists())
      return new Response(file, { headers: { 'Cache-Control': 'no-cache' } })
    return new Response(Bun.file(join(root, '404.html')), {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  },
})
console.log(`Static preview: ${server.url}`)

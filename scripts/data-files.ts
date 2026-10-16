import {
  readdir,
  readFile,
  mkdir,
  rename,
  writeFile,
  unlink,
} from 'node:fs/promises'
import { join, dirname } from 'node:path'
import JSON5 from 'json5'
export async function sourceFiles(root = 'data'): Promise<string[]> {
  const result: string[] = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) result.push(...(await sourceFiles(path)))
    else if (entry.name.endsWith('.json5')) result.push(path)
  }
  return result.sort()
}
export async function readDocument<T>(path: string): Promise<T> {
  return JSON5.parse(await readFile(path, 'utf8')) as T
}
export async function animeSourceFiles() {
  return (await sourceFiles()).filter((path) =>
    /^(?:data\/)(?:\d{4}-(?:winter|spring|summer|autumn)|id\/\d+)\.json5$/.test(path.replaceAll('\\', '/')),
  )
}
export async function writeDocuments(
  documents: { path: string; data: unknown }[],
) {
  const staged: { temporary: string; path: string }[] = []
  try {
    for (const { path, data } of documents) {
      await mkdir(dirname(path), { recursive: true })
      const temporary = `${path}.${process.pid}.tmp`
      staged.push({ temporary, path })
      await writeFile(temporary, JSON5.stringify(data, { space: 1 }) + '\n')
    }
    for (const { temporary, path } of staged) await rename(temporary, path)
  } finally {
    await Promise.all(
      staged.map(({ temporary }) => unlink(temporary).catch(() => {})),
    )
  }
}

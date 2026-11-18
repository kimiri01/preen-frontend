import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'

const source = await readFile(new URL('../src/features/rooms/utils/spotifyTrack.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { spotifyTrackId } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
const id = '4Dr2hJ3EnVh2Aaot6fRwDO'
test('accept raw track ID, official share URL and URI', () => {
  for (const input of [id, `spotify:track:${id}`, `https://open.spotify.com/track/${id}?si=share`, `https://open.spotify.com/intl-ko/track/${id}`]) assert.equal(spotifyTrackId(input), id)
})
test('reject foreign hosts, credentials, non-tracks and invalid IDs', () => {
  for (const input of ['', 'abc', `https://evil.invalid/track/${id}`, `https://open.spotify.com.evil.invalid/track/${id}`, `https://open.spotify.com@evil.invalid/track/${id}`, `https://user:pass@open.spotify.com/track/${id}`, `http://open.spotify.com/track/${id}`, `https://open.spotify.com/album/${id}`, `https://open.spotify.com/playlist/${id}`]) assert.equal(spotifyTrackId(input), null)
})

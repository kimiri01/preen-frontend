import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'

// Execute the production TypeScript helpers without adding a test framework.
const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64')
const datesUrl = moduleUrl(await readFile(new URL('../src/common/utils/date.ts', import.meta.url), 'utf8'))
const source = await readFile(new URL('../src/features/rooms/utils/staySelection.ts', import.meta.url), 'utf8')
const { validateStaySelection: validate, roomGuestLimit } = await import(moduleUrl(source.replace('@/common/utils/date', datesUrl)))
const { todayKst, addDays, upcomingWeekend } = await import(datesUrl)

test('Korean midnight and leap/month boundaries', () => {
  assert.equal(todayKst(new Date('2026-11-17T15:00:00Z')), '2026-11-18')
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
})
test('reject past, absent, impossible and reversed dates', () => {
  for (const [start, end] of [['2026-11-17', '2026-11-19'], ['', ''], ['2026-02-30', '2026-12-01'], ['2026-12-02', '2026-12-02'], ['2026-12-03', '2026-12-02']]) {
    assert.notEqual(validate(start, end, '2', '2026-11-18', 4), '')
  }
  assert.equal(validate('2026-11-18', '2026-11-19', '2', '2026-11-18', 4), '')
})
test('reject guest count outside actual room capacity', () => {
  assert.equal(roomGuestLimit([{ maxCapacity: 2 }, { maxCapacity: 4 }]), 4)
  assert.equal(roomGuestLimit([]), 1)
  for (const count of ['0', '-1', '1.5', '5', 'abc', '']) assert.notEqual(validate('2026-12-01', '2026-12-02', count, '2026-11-18', 4), '')
  assert.equal(validate('2026-12-01', '2026-12-02', '4', '2026-11-18', 4), '')
})

test('weekend shortcuts respect Saturday and Sunday', () => {
  assert.deepEqual(upcomingWeekend('2026-11-21'), { checkIn: '2026-11-21', checkOut: '2026-11-22' })
  assert.deepEqual(upcomingWeekend('2026-11-22'), { checkIn: '2026-11-28', checkOut: '2026-11-29' })
})

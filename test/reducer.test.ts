import test from 'node:test'
import { strict as assert } from 'node:assert'

const hostWindow = {
  APPDATA_PATH: '/tmp/poi-plugin-hensei-nikki-test',
  getStore: () => 'test-member',
  i18n: { resources: { __: (value: string) => value } },
  toggleModal: () => undefined,
}

;(globalThis as { window?: typeof hostWindow }).window = hostWindow

test('reducer preserves add, rename, note, and delete workflows', async () => {
  const { onDeleteData, onSaveData, onSaveNote, onSaveTitle, reducer } = await import('../redux')
  let state = reducer(undefined, { type: '@@poi-plugin-hensei-nikki@init' })

  state = reducer(state, onSaveData('Alpha', {
    version: 'poi-h-v1',
    note: 'before',
    fleets: [[{ id: 1, lv: 1, slots: [] }]],
  }))
  assert.equal(state.henseiData.data.Alpha.note, 'before')

  state = reducer(state, onSaveTitle('Alpha', 'Bravo'))
  state = reducer(state, onSaveNote('Bravo', 'after'))
  assert.equal(state.henseiData.data.Alpha, undefined)
  assert.equal(state.henseiData.data.Bravo.note, 'after')

  state = reducer(state, onDeleteData('Bravo'))
  assert.equal(state.henseiData.data.Bravo, undefined)
})

test('reducer imports valid records and ignores invalid file values', async () => {
  const { onImportFile, reducer } = await import('../redux')
  let state = reducer(undefined, { type: '@@poi-plugin-hensei-nikki@init' })
  const imported = {
    Alpha: {
      version: 3,
      ships: {
        version: 3,
        f1: { s1: { id: 7, lv: 20, items: { i1: { id: 8, rf: 2 } } } },
      },
      tags: ['legacy'],
    },
  }

  state = reducer(state, onImportFile(imported))
  assert.deepEqual(state.henseiData.data.Alpha, {
    version: 'poi-h-v1',
    note: 'legacy',
    fleets: [[{ id: 7, lv: 20, slots: [{ id: 8, lv: 2 }] }]],
  })

  const before = state.henseiData.data
  state = reducer(state, onImportFile('not an object'))
  assert.deepEqual(state.henseiData.data, before)
})

import test from 'node:test'
import { strict as assert } from 'node:assert'

const hostWindow = {
  APPDATA_PATH: '/tmp/poi-plugin-hensei-nikki-file-test',
  getStore: () => 'test-member',
  i18n: { resources: { __: (value: string) => value } },
  toggleModal: () => undefined,
}

;(globalThis as { window?: typeof hostWindow }).window = hostWindow

test('saveData reuses one writer queue for successive snapshots', async () => {
  const moduleLoader = require('module')
  const originalLoad = moduleLoader._load
  const writers: Array<{ writes: Array<{ path: string, data: string }> }> = []

  class FakeFileWriter {
    writes: Array<{ path: string, data: string }> = []

    constructor() {
      writers.push(this)
    }

    write(path: string, data: string) {
      this.writes.push({ path, data })
    }
  }

  moduleLoader._load = function (request: string, parent: unknown, isMain: boolean) {
    if (request === 'views/utils/file-writer') return { default: FakeFileWriter }
    return originalLoad.call(this, request, parent, isMain)
  }

  try {
    const { saveData } = await import('../utils/file')
    saveData({})
    assert.equal(writers.length, 0)
    saveData({ Alpha: { version: 'poi-h-v1' } })
    saveData({ Alpha: { version: 'poi-h-v1', note: 'newer' } })
  } finally {
    moduleLoader._load = originalLoad
  }

  assert.equal(writers.length, 1)
  assert.deepEqual(writers[0].writes, [
    {
      path: '/tmp/poi-plugin-hensei-nikki-file-test/hensei-nikki/test-member.json',
      data: '{"Alpha":{"version":"poi-h-v1"}}',
    },
    {
      path: '/tmp/poi-plugin-hensei-nikki-file-test/hensei-nikki/test-member.json',
      data: '{"Alpha":{"version":"poi-h-v1","note":"newer"}}',
    },
  ])
})

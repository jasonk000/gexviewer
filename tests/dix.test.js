import { beforeEach, test } from '@jest/globals';
import * as dix from '../functions/dix';
var fs = require('fs')

beforeEach(() => {
    fetchMock.resetMocks()
})

test('parsing calls fetch', async () => {
  const csvData = fs.readFileSync('./tests/fixture/dix.csv')
  fetch.mockResponseOnce(csvData)

  const now = Date.now()
  const url = `https://squeezemetrics.com/monitor/static/DIX.csv?_t=${now}`

  const response = await dix.handleGet(url)

  expect(fetch).toHaveBeenCalledTimes(1)
})



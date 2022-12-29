import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from '@jest/globals'
import { subworkflowMapResult, workflowMapResult } from '../lib/fs.js'

const subworkflows_paths = [
  path.join('assets', 'subworkflows', 'get_dates_and_timestamps.yml')
]

const workflows_paths = [path.join('assets', 'workflows', 'send-hello.yaml')]

describe('subworkflowMapResult', () => {
  it('returns a result whose value matches and empty hash map', async () => {
    const paths = []

    const result = await subworkflowMapResult(paths)

    expect(result.error).not.toBeDefined()
    expect(result.value).toBeDefined()
    expect(result.value).toMatchObject({})
  })

  it('returns a result containing an error and no value, when the subworkflow path does not exist', async () => {
    const paths = [path.join('assets', 'subworkflows', 'nonexistent.yml')]

    const result = await subworkflowMapResult(paths)

    expect(result.error).toBeDefined()
    expect(result.value).not.toBeDefined()
  })

  it('returns a result whose value is a hash map that has a `get_dates_and_timestamps` key', async () => {
    const result = await subworkflowMapResult(subworkflows_paths)

    expect(result.error).not.toBeDefined()
    expect(result.value).toBeDefined()
    expect(result.value['get_dates_and_timestamps']).toBeDefined()
  })
})

describe('workflowMapResult', () => {
  it('returns a result whose value matches and empty hash map', async () => {
    const paths = []

    const result = await workflowMapResult(paths)

    expect(result.error).not.toBeDefined()
    expect(result.value).toBeDefined()
    expect(result.value).toMatchObject({})
  })

  it('returns a result whose value is a hash map that has a `send-hello` key', async () => {
    const result = await workflowMapResult(workflows_paths)

    expect(result.error).not.toBeDefined()
    expect(result.value).toBeDefined()
    expect(result.value['send-hello']).toBeDefined()
  })
})

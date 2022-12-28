import path from 'node:path'
import { describe, expect, it } from '@jest/globals'
import { buildOne } from '../lib/build-one.js'
import { makeSubworkflowReducer } from '../lib/reducer.js'

describe('buildOne', () => {
  const subworkflows_dir = path.join('assets', 'subworkflows')
  const subworkflowReducer = makeSubworkflowReducer({ subworkflows_dir })

  const workflow_id = 'references-nonexistent-subworkflow'
  const input_filepath = path.join('assets', 'workflows', `${workflow_id}.yaml`)

  const output_dir = 'dist'
  const include_header = false
  const include_footer = false

  it('throws the expected error when the subworkflow file does not exist', async () => {
    const expected = `ENOENT: no such file or directory, open 'assets/subworkflows/this_subworkflow_does_not_exist.yaml`

    await expect(
      buildOne({
        input_filepath,
        output_dir,
        include_header,
        include_footer,
        subworkflowReducer
      })
    ).rejects.toThrow(expected)
  })
})

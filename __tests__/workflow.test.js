import { describe, expect, it } from '@jest/globals'
import { makeSubworkflowsReducer } from '../lib/reducer.js'
import { buildOne } from '../lib/workflow.js'

describe('buildOne', () => {
  const subworkflows_map = {}
  const subworkflowsReducer = makeSubworkflowsReducer({ subworkflows_map })

  const workflow_id = 'references-nonexistent-subworkflow'

  const workflow = {
    id: workflow_id,
    body: `
main:
  steps:
    - dates_and_timestamps:
        call: get_dates_and_timestamps
        result: dt
    - assign_telegram_text:
        assign:
          - telegram_text: <b>Hello</b>`
  }

  const output_dir = 'dist'
  const include_header = false
  const include_footer = false

  it('returns an error that mentions which workflow could not be built', () => {
    const result = buildOne({
      workflow,
      subworkflowsReducer,
      output_dir,
      include_header,
      include_footer
    })

    expect(result.value).not.toBeDefined()
    expect(result.error).toBeDefined()
    expect(result.error.title).toContain(`Could not build workflow`)
    expect(result.error.title).toContain(workflow_id)
  })

  it('returns at least one helpful tip in the error', () => {
    const { error } = buildOne({
      workflow,
      subworkflowsReducer,
      output_dir,
      include_header,
      include_footer
    })

    expect(error).toBeDefined()
    expect(error.tips).toBeDefined()
    expect(error.tips.length).toBeGreaterThanOrEqual(1)
  })
})

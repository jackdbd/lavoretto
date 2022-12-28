import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { describe, expect, it } from '@jest/globals'
import { makeSubworkflowReducer } from '../lib/reducer.js'

describe('subworkflowReducer', () => {
  const subworkflows_dir = path.join('assets', 'subworkflows')
  const subworkflowReducer = makeSubworkflowReducer({ subworkflows_dir })

  const subworkflow_id = 'get_dates_and_timestamps'
  const subworkflow_path = path.join(subworkflows_dir, `${subworkflow_id}.yaml`)
  const subworkflow_body = yaml.load(fs.readFileSync(subworkflow_path, 'utf-8'))

  it('copies the subworkflow in the generated workflow', () => {
    const step = {
      series_one: {
        steps: [
          {
            dates_and_timestamps_one: {
              call: subworkflow_id,
              result: 'dt_one'
            }
          },
          {
            step_a: {
              steps: [
                {
                  step_a_inner: {
                    call: 'http.get',
                    args: {
                      url: 'https://host.com/api1'
                    },
                    result: 'api_response1'
                  }
                },
                {
                  dates_and_timestamps_two: {
                    call: subworkflow_id,
                    result: 'dt_two'
                  }
                }
              ]
            }
          },
          {
            dates_and_timestamps_two: {
              call: subworkflow_id,
              result: 'dt_two'
            }
          },
          {
            step_b: {
              assign: [
                {
                  varA: 'Monday'
                },
                {
                  varB: 'Tuesday'
                }
              ]
            }
          }
        ]
      }
    }

    const reduced = subworkflowReducer({}, step)

    expect(reduced).toMatchObject({
      [subworkflow_id]: {
        id: subworkflow_id,
        body: subworkflow_body,
        filepath: subworkflow_path
      }
    })
  })
})

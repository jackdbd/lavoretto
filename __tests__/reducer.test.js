import { describe, expect, it } from '@jest/globals'
import { makeSubworkflowsReducer } from '../lib/reducer.js'

const retrieve_stripe_api_key_body = `
params: [secret_id, secret_version]
steps:
  - retrieve_secret_from_secret_manager:
      call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
      args:
        project_id: __sys.get_env('GOOGLE_CLOUD_PROJECT_ID')__
        secret_id: __secret_id__
        version: __secret_version__
      result: text_secret
  - return_api_key:
      return: __text_secret__`

const retrieve_telegram_chat_id_and_token_body = `
params: [secret_id, secret_version]
steps:
  - retrieve_secret_from_secret_manager:
      call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
      args:
        project_id: __sys.get_env('GOOGLE_CLOUD_PROJECT_ID')__
        secret_id: __secret_id__
        version: __secret_version__
      result: json_secret
  - return_chat_id_and_token:
      return:
        chat_id: "__json.decode(json_secret).chat_id__"
        token: "__json.decode(json_secret).token__`

const subworkflows_map = {
  retrieve_stripe_api_key: {
    id: 'retrieve_stripe_api_key',
    body: retrieve_stripe_api_key_body
  },
  retrieve_telegram_chat_id_and_token: {
    id: 'retrieve_telegram_chat_id_and_token',
    body: retrieve_telegram_chat_id_and_token_body
  }
}

describe('makeSubworkflowsReducer', () => {
  const subworkflowReducer = makeSubworkflowsReducer({ subworkflows_map })

  const subworkflow_id = 'get_dates_and_timestamps'

  const step_references_non_existent_subworkflow = {
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

  const step_references_existent_subworkflow = {
    series_one: {
      steps: [
        {
          telegram_chat_id_and_bot_token: {
            call: subworkflows_map.retrieve_telegram_chat_id_and_token.id,
            result: 'telegram'
          }
        }
      ]
    }
  }

  it('returns an error that mentions that the workflow references a nonexistent subworkflow', () => {
    const result = subworkflowReducer(
      {},
      step_references_non_existent_subworkflow
    )

    expect(result.value).not.toBeDefined()
    expect(result.error).toBeDefined()
    expect(result.error.title).toContain(
      `Workflow references nonexistent subworkflow`
    )
  })

  it('returns at least one helpful tip in the error', () => {
    const { error } = subworkflowReducer(
      {},
      step_references_non_existent_subworkflow
    )

    expect(error).toBeDefined()
    expect(error.tips).toBeDefined()
    expect(error.tips.length).toBeGreaterThanOrEqual(1)
  })

  it('returns the portion of the subworkflows_map containing the subworkflows referenced by the specified step', () => {
    const { error, value } = subworkflowReducer(
      {},
      step_references_existent_subworkflow
    )

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
    expect(value).toMatchObject({
      retrieve_telegram_chat_id_and_token:
        subworkflows_map.retrieve_telegram_chat_id_and_token
    })
  })

  it('does not return the entire subworkflows_map if the specified step does not reference some subworkflows', () => {
    const { error, value } = subworkflowReducer(
      {},
      step_references_existent_subworkflow
    )

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
    expect(value).not.toMatchObject(subworkflows_map)
  })
})

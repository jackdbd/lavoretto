import makeDebug from 'debug'
import { CLI_NAME, WORKFLOWS_STANDARD_LIBRARY_FUNCTIONS } from './constants.js'

const debug = makeDebug(`${CLI_NAME}:reducer`)

const stdlib = new Set(WORKFLOWS_STANDARD_LIBRARY_FUNCTIONS)

export const makeSubworkflowsReducer = ({ subworkflows_map }) => {
  debug(`hash map containing all subworkflows %O`, subworkflows_map)

  return function subworkflowsReducer(m, step) {
    const step_id = Object.keys(step)[0]
    debug(`step '${step_id}' %O`, step[step_id])

    const { steps } = step[step_id]

    if (steps) {
      return steps.reduce(subworkflowsReducer, m)
    } else {
      debug(`step '${step_id}' has no substeps`)
    }

    const { call } = step[step_id]

    if (call && !stdlib.has(call)) {
      const sub = subworkflows_map[call]
      if (!sub) {
        const title = `Workflow references nonexistent subworkflow`
        const details = [
          `step '${step_id}' calls subworkflow '${call}', which does NOT appear in the subworkflows hash map`
        ]
        const tips = [
          `double check the subworkflows referenced at step '${step_id}'`,
          `double check the glob patterns used to find your subworkflows in the filesystem and to construct the subworkflows hash map`
        ]
        debug(`!!! ${details[0]}`)
        return { error: { title, details, tips } }
      }

      debug(`step '${step_id}' calls subworkflow '${sub.id}' (${sub.filepath})`)
      return { value: { ...m.value, [sub.id]: sub } }
    } else {
      return m
    }
  }
}

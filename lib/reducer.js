import fs from 'node:fs'
import path from 'node:path'
import makeDebug from 'debug'
import yaml from 'js-yaml'
import { CLI_NAME, WORKFLOWS_STANDARD_LIBRARY_FUNCTIONS } from './constants.js'

const debug = makeDebug(`${CLI_NAME}:reducer`)

const stdlib = new Set(WORKFLOWS_STANDARD_LIBRARY_FUNCTIONS)

export const makeSubworkflowReducer = ({ subworkflows_dir }) => {
  debug(`look for subworkflows YAML files in ${subworkflows_dir}`)

  return function subworkflowReducer(m, step) {
    const step_id = Object.keys(step)[0]
    debug(`step ${step_id} %O`, step[step_id])

    const { steps } = step[step_id]
    if (steps) {
      return steps.reduce(subworkflowReducer, m)
    } else {
      debug(`step ${step_id} has no substeps`)
    }

    const { call } = step[step_id]

    if (call && !stdlib.has(call)) {
      const filepath = path.join(subworkflows_dir, `${call}.yaml`)
      const id = path.basename(filepath, '.yaml')
      debug(`step ${step_id} calls subworkflow ${id} (${filepath})`)
      const seen = m[id]
      if (!seen) {
        const body = yaml.load(fs.readFileSync(filepath, 'utf-8'))
        debug(`subworkflow ${id} %O`, body)
        return { ...m, [id]: { id, body, filepath } }
      } else {
        debug(`subworkflow ${id} already seen (skip)`)
        return m
      }
    } else {
      return m
    }
  }
}

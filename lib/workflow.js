import path from 'node:path'
import makeDebug from 'debug'
import yaml from 'js-yaml'
import { header, footer } from './comments.js'
import { CLI_NAME } from './constants.js'

const debug = makeDebug(`${CLI_NAME}:workflow`)

export const buildOne = ({
  workflow,
  subworkflowsReducer,
  output_dir,
  include_header,
  include_footer
}) => {
  debug(
    `combine workflow '${workflow.id}' from ${workflow.filepath} with all subworkflows that it references`
  )

  const doc = yaml.load(workflow.body)

  const { error, value } = doc.main.steps.reduce(subworkflowsReducer, {})

  if (error) {
    const title = `Could not build workflow '${workflow.id}' from ${workflow.filepath}`
    debug(`!!! ${title}: ${error.details}`)

    return {
      error: {
        title,
        details: [...error.details],
        id: workflow.id,
        tips: [...error.tips]
      }
    }
  }

  const subworkflows = Object.values(value)
  debug(
    `workflow '${workflow.id}' references ${subworkflows.length} subworkflow/s from the subworkflows hash map`
  )

  const obj = subworkflows.reduce((acc, sub) => {
    return { ...acc, [sub.id]: yaml.load(sub.body) }
  }, doc)

  let s = yaml.dump(obj, { indent: 2 })

  if (include_header) {
    const head = header({ subworkflows })
    s = s.padStart(s.length + head.length, head)
  }

  if (include_footer) {
    s = s.concat(footer({ subworkflows }))
  }

  const input_name = path.basename(workflow.filepath)

  const output_name =
    input_name === 'main.yaml' || input_name === 'main.yml'
      ? `${path.basename(path.dirname(workflow.filepath))}.yaml`
      : input_name

  const output_filepath = path.join(output_dir, output_name)

  return { value: { id: workflow.id, body: s, filepath: output_filepath } }
}

export const buildAll = ({
  workflows_map,
  subworkflowsReducer,
  output_dir,
  include_header,
  include_footer
}) => {
  const results = Object.values(workflows_map).map((workflow) => {
    return buildOne({
      workflow,
      subworkflowsReducer,
      output_dir,
      include_header,
      include_footer
    })
  })

  const errors = results.filter((r) => r.error).map((r) => r.error)

  if (errors.length > 0) {
    const ids = errors.flatMap((e) => e.id)
    const details = [
      ...errors.map((e) => e.title),
      ...errors.flatMap((e) => e.details)
    ]
    const tips = errors.flatMap((e) => e.tips)

    const title =
      ids.length === 1
        ? `Could not build workflow '${ids[0]}'`
        : `Could not build ${ids.length} workflows: ${ids
            .map((id) => `'${id}'`)
            .join(', ')}`

    return {
      error: { title, details, tips }
    }
  } else {
    const m = results
      .filter((r) => r.value)
      .reduce((acc, { value }) => {
        return { ...acc, [value.id]: value }
      }, {})

    return { value: m }
  }
}

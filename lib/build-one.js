import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import c from 'ansi-colors'
import makeDebug from 'debug'
import yaml from 'js-yaml'
import { header, footer } from './comments.js'
import { CLI_NAME } from './constants.js'

const writeFileAsync = promisify(fs.writeFile)

const debug = makeDebug(`${CLI_NAME}:build-one`)

/**
 * Builds a single workflow file
 */
export const buildOne = async ({
  input_filepath,
  output_dir,
  include_header,
  include_footer,
  subworkflowReducer
}) => {
  const input_name = path.basename(input_filepath)
  debug(`build workflow ${input_filepath}`)

  const output_name =
    input_name === 'main.yaml' || input_name === 'main.yml'
      ? `${path.basename(path.dirname(input_filepath))}.yaml`
      : input_name

  const doc = yaml.load(fs.readFileSync(input_filepath, 'utf-8'))

  const subworkflows_map = doc.main.steps.reduce(subworkflowReducer, {})
  const subworkflows = Object.values(subworkflows_map)

  const workflow = subworkflows.reduce((acc, { id, body }) => {
    return { ...acc, [id]: body }
  }, doc)

  let s = yaml.dump(workflow, { indent: 2 })

  if (include_header) {
    const head = header({ subworkflows })
    s = s.padStart(s.length + head.length, head)
  }

  if (include_footer) {
    s = s.concat(footer({ subworkflows }))
  }

  const output_filepath = path.join(output_dir, output_name)

  if (!fs.existsSync(output_filepath)) {
    fs.mkdirSync(output_dir, { recursive: true })
  }

  await writeFileAsync(output_filepath, s, { encoding: 'utf-8' })
  debug(`wrote ${output_filepath}`)

  return {
    message: `${c.symbols.check} ${input_filepath} => ${output_filepath}`
  }
}

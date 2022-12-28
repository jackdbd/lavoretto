import fs from 'node:fs'
import path from 'node:path'
import makeDebug from 'debug'
import { buildOne } from './build-one.js'
import { CLI_NAME } from './constants.js'
import { makeSubworkflowReducer } from './reducer.js'

const debug = makeDebug(`${CLI_NAME}:build-all`)

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach((f) => {
    const dir_path = path.join(dir, f)
    const is_dir = fs.statSync(dir_path).isDirectory()
    is_dir ? walkDir(dir_path, callback) : callback(path.join(dir, f))
  })
}

/**
 * Builds a single workflow file, or all files in a directory.
 */
export const buildAll = async ({
  input,
  output_dir,
  include_header,
  include_footer,
  subworkflows_dir
}) => {
  const inputs = []
  if (fs.lstatSync(input).isDirectory()) {
    const cb = (filepath) => {
      inputs.push(filepath)
    }
    walkDir(input, cb)
  } else {
    inputs.push(input)
  }
  debug(`build all %O`, inputs)

  const subworkflowReducer = makeSubworkflowReducer({ subworkflows_dir })

  const promises = inputs.map((input_filepath) => {
    return buildOne({
      input_filepath,
      output_dir,
      include_header,
      include_footer,
      subworkflowReducer
    })
  })

  const arr = await Promise.all(promises)
  debug(`${arr.length} workflow/s built`)

  return { message: arr.map((d) => d.message).join('\n') }
}

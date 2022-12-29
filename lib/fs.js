import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import makeDebug from 'debug'
import { CLI_NAME } from './constants.js'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const debug = makeDebug(`${CLI_NAME}:fs`)

const readFileResult = async (kind, filepath) => {
  let id = filepath.endsWith('.yml')
    ? path.basename(filepath, '.yml')
    : path.basename(filepath, '.yaml')

  id = id !== 'main' ? id : path.basename(path.dirname(filepath))

  try {
    const body = await readFileAsync(filepath, { encoding: 'utf-8' })
    debug(`read ${kind} %o`, { filepath, id })
    return { value: { id, body, filepath } }
  } catch (err) {
    const title = `Could not read ${filepath}`
    debug(`!!! could NOT read ${kind} %O`, {
      filepath,
      id,
      error_message: err.message
    })

    return {
      error: {
        title,
        details: [err.message],
        id,
        tips: [`Double check that ${filepath} exists`]
      }
    }
  }
}

const mapResult = async (kind, paths) => {
  const mapper = readFileResult.bind(null, kind)
  const results = await Promise.all(paths.map(mapper))

  const errors = results.filter((r) => r.error).map((r) => r.error)

  if (errors.length > 0) {
    const ids = errors.flatMap((e) => e.id)

    const title =
      ids.length === 1
        ? `Could not read ${kind} '${ids[0]}'`
        : `Could not read ${ids.length} ${kind}s: ${ids
            .map((id) => `'${id}'`)
            .join(', ')}`

    return {
      error: {
        title,
        details: errors.flatMap((e) => e.details),
        tips: errors.flatMap((e) => e.tips)
      }
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

export const subworkflowMapResult = async (paths) => {
  return mapResult('subworkflow', paths)
}

export const workflowMapResult = async (paths) => {
  return mapResult('workflow', paths)
}

export const workflowWriteResult = async ({ output_dir, workflow }) => {
  if (!fs.existsSync(workflow.filepath)) {
    fs.mkdirSync(output_dir, { recursive: true })
  }

  try {
    await writeFileAsync(workflow.filepath, workflow.body, 'utf-8')
  } catch (err) {
    const title = `Could not write workflow '${workflow.id}' to ${workflow.filepath}`
    debug(`!!! ${title}: ${err.message}`)

    return {
      error: { title, details: [err.message], tips: [] }
    }
  }

  const message = `workflow '${workflow.id}' written to ${workflow.filepath}`
  debug(message)

  return {
    value: { message }
  }
}

export const workflowsWriteResult = async ({ output_dir, workflows_map }) => {
  const promises = Object.values(workflows_map).map((workflow) => {
    return workflowWriteResult({ output_dir, workflow })
  })

  const results = await Promise.all(promises)

  const errors = results.filter((r) => r.error).map((r) => r.error)

  if (errors.length > 0) {
    const title = `Some workflows could not be written to the filesystem`
    debug(`!!! ${title}`)

    return {
      error: {
        title,
        details: errors.flatMap((e) => e.details),
        tips: errors.flatMap((e) => e.tips)
      }
    }
  } else {
    const details = results.filter((r) => r.value).map((r) => r.value.message)

    return {
      value: {
        title: `Wrote ${details.length} workflows to ${output_dir}`,
        details
      }
    }
  }
}

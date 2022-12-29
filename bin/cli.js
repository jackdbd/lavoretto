#!/usr/bin/env node
import path from 'node:path'
import { globby } from 'globby'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import {
  subworkflowMapResult,
  workflowMapResult,
  workflowsWriteResult
} from '../lib/fs.js'
import { makeSubworkflowsReducer } from '../lib/reducer.js'
import { renderError, renderSuccess } from '../lib/renderers.js'
import { buildAll } from '../lib/workflow.js'

// glob patterns can only contain forward-slashes, not backward-slashes, so if
// you want to construct a glob pattern from path components, you need to use
// use path.posix.join()
const WORKFLOWS_PATTERNS = [
  path.posix.join('**', 'workflows', '**', '*.(yaml|yml)'),
  path.posix.join('**', '*workflow*', '*.(yaml|yml)'),
  path.posix.join('!**', 'subworkflows', '**', '*.(yaml|yml)'),
  path.posix.join('!**', '*subworkflow*', '*.(yaml|yml)'),
  path.posix.join('!**', 'dist', '**', '*.(yaml|yml)')
]

const SUBWORKFLOWS_PATTERNS = [
  path.posix.join('**', 'subworkflows', '**', '*.(yaml|yml)'),
  path.posix.join('**', '*subworkflow*', '*.(yaml|yml)'),
  path.posix.join('!**', 'workflows', '**', '*.(yaml|yml)')
]

const USAGE = [
  `$0 - keep your subworkflows out of your workflows, so you can reuse them`,
  `Usage:`,
  `  $0 [options]`
].join('\n')

const invoke = async () => {
  const argv = yargs(hideBin(process.argv))
    .usage(USAGE)
    .example(
      '$0 -o dist/workflows --no-header',
      'Output the generated workflows to dist/workflows. Do not add a comment at the beginning of each generated YAML file.'
    )
    .option('workflows', {
      alias: 'w',
      default: WORKFLOWS_PATTERNS,
      describe: 'Glob patterns for the workflows you want to build',
      type: 'array'
    })
    .option('subworkflows', {
      alias: 's',
      default: SUBWORKFLOWS_PATTERNS,
      describe: 'Glob patterns for your subworkflows',
      type: 'array'
    })
    .option('outdir', {
      alias: 'o',
      default: path.join('dist', 'workflows'),
      describe: 'Directory where to put the generated workflows',
      type: 'string'
    })
    .option('header', {
      default: true,
      describe:
        'Whether to include a comment at the top of each generated workflow',
      type: 'boolean'
    })
    .option('footer', {
      default: false,
      describe:
        'Whether to include a comment at the bottom of each generated workflow',
      type: 'boolean'
    })
    .help('help').argv

  const [workflows_paths, subworkflows_paths] = await Promise.all(
    [argv.workflows, argv.subworkflows].map((patterns) => {
      return globby(patterns, {
        expandDirectories: { extensions: ['yaml', 'yml'] }
      })
    })
  )

  // uncomment to test errors
  // workflows_paths.push('assets/workflows/nonexistent.yaml')
  // subworkflows_paths.push('assets/subworkflows/nonexistent.yaml')

  const sres = await subworkflowMapResult(subworkflows_paths)

  if (sres.error) {
    console.log(renderError(sres.error))
    process.exit(1)
  }
  const subworkflows_map = sres.value

  const subworkflowsReducer = makeSubworkflowsReducer({ subworkflows_map })

  const wres = await workflowMapResult(workflows_paths)

  if (wres.error) {
    console.log(renderError(wres.error))
    process.exit(1)
  }
  const workflows_map = wres.value

  const { error: build_error, value: output_workflows_map } = buildAll({
    workflows_map,
    subworkflowsReducer,
    output_dir: argv.outdir,
    include_header: argv.header,
    include_footer: argv.footer
  })

  if (build_error) {
    console.log(renderError(build_error))
    process.exit(1)
  }

  const { error, value: success } = await workflowsWriteResult({
    output_dir: argv.outdir,
    workflows_map: output_workflows_map
  })

  if (error) {
    console.log(renderError(error))
    process.exit(1)
  }

  console.log(renderSuccess(success))
}

invoke()

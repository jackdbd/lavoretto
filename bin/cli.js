#!/usr/bin/env node
import c from 'ansi-colors'
import yargs from 'yargs'
import { buildAll } from '../lib/build-all.js'

const invoke = async () => {
  const argv = yargs(process.argv.slice(2))
    .usage(
      'Retrieves subworkflows and copy-paste them in your workflow.\nUsage: $0 -i <input>'
    )
    .option('input', {
      alias: 'i',
      describe: 'path to the workflow file/directory to build',
      demandOption: true
    })
    .option('outdir', {
      alias: 'o',
      describe: 'directory where this tool will put the generated workflows',
      default: 'dist'
    })
    .option('subworkflows', {
      alias: 's',
      describe:
        'path to the directory where you keep your subworkflow YAML files',
      default: 'assets/subworkflows'
    })
    .option('header', {
      type: 'boolean',
      describe:
        'whether to include a comment at the beginning of the output file',
      default: true
    })
    .option('footer', {
      type: 'boolean',
      describe: 'whether to include a comment at the bottom of the output file',
      default: false
    })
    .help('help').argv

  const { message } = await buildAll({
    input: argv.input,
    output_dir: argv.outdir,
    subworkflows_dir: argv.subworkflows,
    include_header: argv.header,
    include_footer: argv.footer
  })

  console.log(c.green(message))
}

invoke()

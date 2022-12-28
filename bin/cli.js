#!/usr/bin/env node
import c from 'ansi-colors'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { buildAll } from '../lib/build-all.js'

const invoke = async () => {
  const argv = yargs(hideBin(process.argv))
    .usage('$0 -i <input> -s <subworkflows> -o <output> <options>')
    .option('input', {
      alias: 'i',
      default: 'src/workflows',
      demandOption: true,
      describe: 'workflow file/directory to build',
      type: 'string'
    })
    .option('subworkflows', {
      alias: 's',
      default: 'src/subworkflows',
      demandOption: true,
      describe: 'subworkflows directory',
      type: 'string'
    })
    .option('outdir', {
      alias: 'o',
      default: 'dist',
      demandOption: true,
      describe: 'directory where to put the generated workflows',
      type: 'string'
    })
    .option('header', {
      default: true,
      describe:
        'whether to include a comment at the top of each generated workflow',
      type: 'boolean'
    })
    .option('footer', {
      default: false,
      describe:
        'whether to include a comment at the bottom of each generated workflow',
      type: 'boolean'
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

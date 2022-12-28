# lavoretto

![CI workflow](https://github.com/jackdbd/lavoretto/actions/workflows/ci.yaml/badge.svg)
[![npm version](https://badge.fury.io/js/@jackdbd%2Flavoretto.svg)](https://badge.fury.io/js/@jackdbd%2Flavoretto)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Flavoretto)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

Reuse your subworkflows.

*lavorétto* (Italian for "work of little importance or of little effort") is a tiny tool useful when working with Google Cloud Platform [Workflows](https://cloud.google.com/workflows).

## Installation

```sh
npm install --save-dev lavoretto
```

## Usage

Generate a single workflow:

```sh
lavoretto \
  -i path/to/your/workflow-file \
  --subworkflows path/to/your/subworkflows-directory
```

Generate all single workflows found in a (possibly nested) directory:

```sh
lavoretto \
  -i path/to/your/workflows-directory \
  --subworkflows path/to/your/subworkflows-directory
```

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `input` | `undefined` | Path to the workflow file/directory to build. |
| `outdir` | `dist` | Directory where this tool will put the generated workflows. |
| `header` | `true` | Whether to include a comment at the beginning of each generated workflow. Use `--no-header` if you don't want it. |
| `footer` | `false` | Whether to include a comment at the bottom of each generated workflow. |

See a few more examples in [scripts](./scripts/README.md).

## Troubleshoot

This tool uses [debug](https://github.com/debug-js/debug) for its logs. You can set the environment variable `DEBUG=lavoretto:*` to troubleshoot this tool.


## Useful links

- [YAML Lint](https://www.yamllint.com/)

npm run release:dry-run
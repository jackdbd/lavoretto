#!/bin/bash
set -euxo pipefail

# generate the workflow
lavoretto \
  -i assets/workflows/nested.yaml \
  --subworkflows assets/subworkflows \
  --no-header

# view the generated workflow
bat dist/nested.yaml

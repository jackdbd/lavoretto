#!/bin/bash
set -euxo pipefail

# generate all workflows found in a (possibly nested) directory
lavoretto -i assets/workflows --subworkflows assets/subworkflows

ls -lh dist

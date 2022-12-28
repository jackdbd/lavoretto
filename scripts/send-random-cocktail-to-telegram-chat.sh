#!/bin/bash
set -euxo pipefail

# generate the workflow
lavoretto -i assets/workflows/send-random-cocktail-to-telegram-chat/main.yaml --subworkflows assets/subworkflows

# deploy the generated workflow
gcloud workflows deploy send-random-cocktail-to-telegram-chat \
  --source "dist/send-random-cocktail-to-telegram-chat.yaml" \
  --service-account "${SA_WORKFLOWS_RUNNER}"

# run/execute the generated workflow
gcloud workflows execute send-random-cocktail-to-telegram-chat

#!/bin/bash
set -euxo pipefail

# generate the workflow
lavoretto \
  -i assets/workflows/send-hello-to-telegram-chat/main.yaml \
  --subworkflows assets/subworkflows

# deploy the generated workflow
gcloud workflows deploy send-hello-to-telegram-chat \
  --source "dist/send-hello-to-telegram-chat.yaml" \
  --service-account "${SA_WORKFLOWS_RUNNER}"

# run/execute the generated workflow
gcloud workflows execute send-hello-to-telegram-chat

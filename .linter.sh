#!/bin/bash
cd /home/kavia/workspace/code-generation/color-coded-event-scheduler-24717-bef149db/color_coded_event_scheduler
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


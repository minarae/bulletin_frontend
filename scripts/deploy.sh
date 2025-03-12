#!/bin/bash

npm run build

wrangler pages deploy out --project-name bulletin

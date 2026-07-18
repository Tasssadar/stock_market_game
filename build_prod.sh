#!/bin/bash

mkdir -p .backup
if [ -f ".output/game.db" ]; then
  cp -a .output/game.db* .backup/
fi

pnpm build
cp -a stock_market.db .output/
cp -a .backup/* .output/

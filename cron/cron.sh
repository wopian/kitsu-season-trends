#!/bin/bash

set -e

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

git config user.name "$GH_USERNAME"
git config user.email "$GH_EMAIL"
git remote add upstream "https://$GH_TOKEN@github.com/wopian/kitsu-season-trends.git"
git fetch upstream
git reset upstream/master

touch .

git add -A .
git commit -a -m "chore: add ratings for $(date +%F)"
git push -q upstream HEAD:master > /dev/null 2>&1

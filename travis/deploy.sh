#!/bin/bash

set -e

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

timestamp() {
  date +"%Y/%m/%d %H:%M"
}

git config user.name "$GH_USERNAME"
git config user.email "$GH_EMAIL"

touch .

git add -A .
git commit -a -m "chore: add ratings for ${timestamp}"
git push -q origin HEAD:master > /dev/null 2>&1

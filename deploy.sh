#!/bin/bash

set -e

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

cd public

git init
git config user.name "$GH_USERNAME"
git config user.email "$GH_EMAIL"

git remote add upstream "https://$GH_TOKEN@github.com/wopian/kitsu-season-trends.git"
git fetch upstream
git reset upstream/gh-pages

echo "season.wopian.me" > CNAME

# Dummy 404 for front-end routing
cp index.html 404.html

# Dummy routes for existing data (so the above doesn't kill all SEO)
FILES="$PWD/../data/"*
for f in $FILES
do
  file=$(basename "$f")
  filename="${file%.*}"
  IFS=- read year season <<< "$filename"
  mkdir -p $year/$season
  cp index.html $year/$season/index.html
done

touch .

git add -A .
git commit -a -m "chore: deploy ${rev}"
git push -q upstream HEAD:gh-pages > /dev/null 2>&1

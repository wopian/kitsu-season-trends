# Season Trends

[![web badge]][web]
[![uptime badge]][web]
[![travis badge]][travis]
[![donate badge]][donate]

[Kitsu] season trends for the currently airing anime

## Using the Data

All the data is free to use and available in JSON format in `./data`, or online at `season.moe/data/{year}-{season}.json`

The JSON data is aggressively minified, as each season becomes a fairly large data dump

```js
{
  data: {
    '12': { // Kitsu anime ID
      i: 12, // Kitsu anime ID
      s: 'one-piece', // Kitsu slug
      t: 'One Piece', // Canonical title
      u: 0, // Subtype (0: TV, 1: ONA)
      d: [ // Data array containing each daily update
        {
          i: 0, // Index
          d: 416359, // Hours since epoch (x3600000 to get datetime)
          m: 8.54,  // Mean score (omitted if 0)
          r: 14030, // Users Rated (omitted if 0)
          u: 25518, // Users (omitted if 0)
          f: 2387, // Users Favourited (omitted if 0)
        }
      ]
    }
  },
  meta: {
    current: 65, // Total started airing this season
    total: 277 // Total shows being tracked
  }
  updated: '2017-07-22T15:12:09.391Z' // ISO date of the last cron update
}
```

## Development

### Requirements

- [git] >2.0.0
- [node.js] >7.0.0
- [yarn] >0.21.0

### Commands

- `yarn start` - live reload local server
- `yarn lint` - lint source code
- `yarn build` - build from source
- `yarn cron` - manually run cron task to fetch new data

### Guide

1. [Fork the repo]

2. Clone the repo (`git clone https://github.com/{yourusername}/api-docs.git`)

3. Create a new branch (`git checkout -b improve-docs`)

4. Install dependencies (`yarn install`)

5. Make the appropriate changes in the source files

6. Check your changes for issues (`yarn test`)

7. Commit your changes (`git commit -am 'Improve docs'`)

8. Push to your branch (`git push origin improve-docs`)

9. [Create a Pull Request]

## License

All code released under the [MIT] license

[Kitsu]:https://kitsu.io
[Fork the repo]:https://help.github.com/articles/fork-a-repo/#fork-an-example-repository
[Create a Pull Request]:https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request
[MIT]:https://github.com/wopian/kitsu-season-trends/blob/master/LICENSE.md
[git]:https://git-scm.com
[node.js]:https://nodejs.org
[yarn]:https://yarnpkg.com

[web]:https://season.moe
[web badge]:https://img.shields.io/website-up-down-green-red/https/season.wopian.me.svg?style=flat-square&label=web
[uptime badge]:https://img.shields.io/uptimerobot/ratio/7/m779133972-4da0d8f104f1d6ffaf921257.svg?style=flat-square

[travis]:https://travis-ci.org/wopian/kitsu-season-trends
[travis badge]:https://img.shields.io/travis/wopian/kitsu-season-trends/master.svg?style=flat-square&label=linux

[donate]:https://www.paypal.me/wopian
[donate badge]:https://img.shields.io/badge/£-donate-ff69b4.svg?style=flat-square

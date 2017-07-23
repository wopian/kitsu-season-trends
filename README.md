# Season Trends

[![Web]][5]
[![Uptime]][5]
[![Travis]][3]

[Kitsu][0] season trends for the currently airing anime

## Using the Data

All the data is free to use and available in JSON format in `./data`, or online at `season.wopian.me/data/{year}-{season}.json`

The JSON data is aggressively minified to avoid huge dumps for each season - saving >300kb/season

Most numbers are encoded in [Base 65503] (B65503)

```js
{
  data: {
    '12': { // ID of the show
      i: '+', // B65503 show ID
      s: 'one-piece', // Slug
      t: 'One Piece', // Canonical title
      p: '夁', // B65503 cache value of poster image. Constructed with `https://media.kitsu.io/anime/poster_images/{i}/medium.jpg?{p}
      u: 'tv', // Subtype
      a: 'Ž븯ゑ', // B65503 start date (epoch timestamp)
      d: [ // Data array containing each daily update
        {
          i: 0, // Index
          d: 'ż쉉⃍', // B65503 epoch timestamp
          m: 8.54,  // Mean score
          r: '㜰', // B65503 usersRated count
          u: '昨', // B65503 user count
          f: 'ণ', // B65503 favourites count
        }
      ]
    }
  },
  updated: '2017-07-22T15:12:09.391Z' // ISO date of the last cron update
}
```

## Development

### Requirements

- [git](https://git-scm.com) >2.0.0
- [node.js](https://nodejs.org) >7.0.0
- [yarn](https://yarnpkg.com) >0.21.0

### Commands

- `yarn start` - live reload local server
- `yarn run lint` - lint source code
- `yarn run build` - build from source
- `yarn run cron` - manually run cron task to fetch new data

### Guide

1. [Fork the repo][1]

2. Clone the repo (`git clone https://github.com/{yourusername}/api-docs.git`)

3. Create a new branch (`git checkout -b improve-docs`)

4. Install dependencies (`yarn install`)

5. Make the appropriate changes in the source files

6. Check your changes for issues (`yarn test`)

7. Commit your changes (`git commit -am 'Improve docs'`)

8. Push to your branch (`git push origin improve-docs`)

9. [Create a Pull Request][2]

## License

All code released under the [MIT license][4]

[0]:https://kitsu.io
[1]:https://help.github.com/articles/fork-a-repo/#fork-an-example-repository
[2]:https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request
[3]:https://travis-ci.org/wopian/kitsu-season-trends
[4]:https://github.com/wopian/kitsu-season-trends/blob/master/LICENSE.md
[5]:https://season.wopian.me

[travis]:https://img.shields.io/travis/wopian/kitsu-season-trends/master.svg?style=flat-square&label=linux
[web]:https://img.shields.io/website-up-down-green-red/https/season.wopian.me.svg?style=flat-square&label=web
[uptime]:https://img.shields.io/uptimerobot/ratio/7/m779133972-4da0d8f104f1d6ffaf921257.svg?style=flat-square
[Base 65503]:https://yarn.fyi/base-65503

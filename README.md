# Season Trends

[![web badge]][web]
[![uptime badge]][web]
[![contributors badge]][contributors]
[![actions badge]][actions]
[![david badge]][david]
[![david dev badge]][david dev]

[Kitsu] season trends for the currently airing anime

## Using the Data

All the data is free to use and available from:

- JSON format in `./data` or online at `season.moe/data/{year}-{season}.json`
- [MessagePack] format online at `season.moe/msgpack/{year}-{season}.msgpack`

## Data Format

Property names are compressed to save storage space and bandwidth.

```js
{
  data: [
    {
      i: 12, // Kitsu anime ID
      t: 'One Piece', // Canonical title
      u: 0, // Subtype (0: TV, 1: ONA)
      n: 0, // 0: Leftover, 1: New
      d: [ // Data array containing each daily update
        {
          i: 0, // Index
          d: 450263, // Hours since epoch (x3600000 to get datetime)
          w: 82.19, // Wilson's confidence level (0.95) out of 100 (omitted if 0)
          l: 82.4, // Laplace smoothing out of 100 (omitted if 0)
          p: 100359.75, // Upvotes, ratings >= 3 out of 5, omitted if 0)
          o: 21433.25, // Downvotes, ratings < 3 out of 5, omitted if 0)
          r: 121793, // Users Rated (omitted if 0)
          u: 186101, // Users (omitted if 0)
          f: 6578 // Users Favourited (omitted if 0)
        }
      ]
    }
  ],
  meta: {
    current: 52, // Total started airing this season
    total: 226 // Total shows being tracked
  },
  updated: '2021-05-13T23:03:55.841Z' // ISO date of the last cron update
}
```

## Development

### Requirements

- [git] `>= 2.0.0`
- [node.js] `>= 8.0.0`
- [yarn] `>= 1.0.0`

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
[MessagePack]:https://msgpack.org
[Fork the repo]:https://help.github.com/articles/fork-a-repo/#fork-an-example-repository
[Create a Pull Request]:https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request
[MIT]:https://github.com/wopian/kitsu-season-trends/blob/master/LICENSE.md
[git]:https://git-scm.com
[node.js]:https://nodejs.org
[yarn]:https://yarnpkg.com

[web]:https://season.moe
[web badge]:https://flat.badgen.net/uptime-robot/status/m779133972-4da0d8f104f1d6ffaf921257
[uptime badge]:https://flat.badgen.net/uptime-robot/month/m779133972-4da0d8f104f1d6ffaf921257

[david]:https://david-dm.org/wopian/kitsu-season-trends
[david badge]:https://flat.badgen.net/david/dep/wopian/kitsu-season-trends

[david dev]:https://david-dm.org/wopian/kitsu-season-trends?type=dev
[david dev badge]:https://flat.badgen.net/david/dev/wopian/kitsu-season-trends

[actions]:https://github.com/wopian/kitsu-season-trends/actions/workflows/ci.yml
[actions badge]:https://flat.badgen.net/github/checks/wopian/kitsu-season-trends/master/ci

[contributors]:https://github.com/wopian/kitsu-season-trends/graphs/contributors
[contributors badge]:https://flat.badgen.net/github/contributors/wopian/kitsu-season-trends

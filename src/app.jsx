import React from 'react'
import Trend from 'react-trend'
import { season, year } from './season'
import '../styles/index.scss'

const { data } = require(`../data/${year()}-${season()}.json`)

export default class App extends React.Component {
  render() {
    return (
      <div className='container'>
        {Object.entries(data).map((entry, index) => {
          return <div key={index} className='trend'>
            <a href={"//kitsu.io/anime/" + entry[1].slug}>
              <img src={entry[1].poster}/>
              <span>{entry[1].title}</span>
            </a>
            <Trend
              smooth
              autoDraw
              autoDrawDuration={3000}
              autoDrawEasing="ease-out"
              data={entry[1].mean}
              gradient={['#222']}
              radius={2}
              strokeWidth={2}
              strokeLinecap={'round'}
            />
          </div>
        })}
      </div>
    )
  }
}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return a.value - b.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}

console.log(sortObject(data))

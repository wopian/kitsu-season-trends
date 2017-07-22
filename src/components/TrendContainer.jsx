import React from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { decode } from 'base-65503'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import MdGroup from 'react-icons/lib/md/group'
import MdFavorite from 'react-icons/lib/md/favorite'
import MdStar from 'react-icons/lib/md/star'
import MdThumbsUpDown from 'react-icons/lib/md/thumbs-up-down'

class TrendTooltip extends React.Component {
  render () {
    const { active } = this.props

    if (active) {
      return (
        <p>Hello</p>
      )
    }

    return null
  }
}

export function TrendContainer ({ start, id, slug, poster, title, data }) {

  return (
    <div className='trend'>
      <a href={"//kitsu.io/anime/" + slug}>
        <img src={`https://media.kitsu.io/anime/poster_images/${decode(id)}/medium.jpg?${decode(poster)}`}/>
        <div className='title'>{title}</div>
      </a>
      <ResponsiveContainer width='100%' height={100}>
        <LineChart data={data}>
          <Tooltip
            isAnimationActive={false}
            /*content={<TrendTooltip/>}*/
          />

          <Line
            yAxisId='1..20'
            activeDot={{ stroke: '#332532', strokeWidth: 2, r: 2 }}
            dot={false}
            type='natural'
            isAnimationActive={false}
            dataKey='m'
            stroke='#332532'
            strokeWidth={1.5}
          />

          <Line
            yAxisId='0..max'
            activeDot={{ stroke: '#332532', strokeWidth: 2, r: 2 }}
            dot={false}
            type='natural'
            isAnimationActive={false}
            dataKey='r'
            stroke='green'
            strokeWidth={1.5}
          />

          <Line
            yAxisId='0..max'
            activeDot={{ stroke: '#332532', strokeWidth: 2, r: 2 }}
            dot={false}
            type='natural'
            isAnimationActive={false}
            dataKey='u'
            stroke='blue'
            strokeWidth={1.5}
          />

          <Line
            yAxisId='0..max'
            activeDot={{ stroke: '#332532', strokeWidth: 2, r: 2 }}
            dot={false}
            type='natural'
            isAnimationActive={false}
            dataKey='f'
            stroke='red'
            strokeWidth={1.5}
          />

          <YAxis
            yAxisId='1..20'
            hide
            domain={[1, 10]}
            ticks={[0]}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId='0..max'
            hide
            domain={[0, 'max']}
            ticks={[0]}
            tickLine={false}
            axisLine={false}
          />

          <XAxis
            type='number'
            hide
            domain={[start, 'max']}
            namekey='d'
            dataKey='d'
            ticks={[0]}
            tickLine={false}
            axisLine={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

TrendContainer.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  slug: PropTypes.string,
  poster: PropTypes.string,
  data: PropTypes.array,
  start: PropTypes.number
}

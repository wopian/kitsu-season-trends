import React from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { decode } from 'base-65503'
import PropTypes from 'prop-types'
import { TrendTooltip } from './TrendTooltip'
import MdGroup from 'react-icons/lib/md/group'
import MdFavorite from 'react-icons/lib/md/favorite'
import MdStar from 'react-icons/lib/md/star'
import MdThumbsUpDown from 'react-icons/lib/md/thumbs-up-down'

function posOrNeg (number) {
  if (number > 0) return `+${number}`
  else if (number < 0) return number
  else return `±${number}`
}

export function TrendContainer ({ start, id, slug, poster, title, data }) {

  const today = data.slice(-1)[0]
  const yesterday = data.slice(-2)[0]

  return (
    <div className='trend'>
      <a href={"//kitsu.io/anime/" + slug}>
        <img src={`https://media.kitsu.io/anime/poster_images/${decode(id)}/medium.jpg?${decode(poster)}`}/>
        <div className='title'>
          <span>{title}</span>
          <div className='changes'>
            <span>
              <MdStar/> {/* Mean */}
              <span>{posOrNeg((today.m - yesterday.m).toFixed(2))}</span>
            </span>
            <span>
              <MdGroup style={{color: '#b9b9ff'}}/> {/* Users */}
              <span>{posOrNeg(today.u - yesterday.u)}</span>
            </span>
            <span>
              <MdThumbsUpDown style={{color: '#b9ffb9'}}/> {/* Users Rated */}
              <span>{posOrNeg((Number.isFinite((today.r - yesterday.r) / today.u) ? (today.r - yesterday.r) / today.u : 0).toFixed(2))}%</span>
            </span>
            <span>
              <MdFavorite style={{color: '#ffb9b9'}}/> {/* Favourites */}
              <span>{posOrNeg(today.f - yesterday.f)}</span>
            </span>
          </div>
          </div>
      </a>
      <ResponsiveContainer width='100%' height={100}>
        <LineChart data={data}>
          <Tooltip
            isAnimationActive={false}
            content={<TrendTooltip/>}
          />

          <Line
            yAxisId='0..max'
            activeDot={{ stroke: '#ffb9b9', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='f'
            stroke='#ffb9b9'
            strokeWidth={1.5}
          />

          <Line
            yAxisId='0..max'
            activeDot={{ stroke: '#b9ffb9', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='r'
            stroke='#b9ffb9'
            strokeWidth={1.5}
          />

          <Line
            yAxisId='0..max'
            activeDot={{ stroke: '#b9b9ff', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='u'
            stroke='#b9b9ff'
            strokeWidth={1.5}
          />

          <Line
            yAxisId='1..20'
            activeDot={{ stroke: '#332532', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='m'
            stroke='#332532'
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

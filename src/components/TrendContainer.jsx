import React from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { decode } from 'base-65503'
import PropTypes from 'prop-types'
import classnames from 'classnames'
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
              <span className={classnames({
                pos: today.m - yesterday.m > 0,
                neg: today.m - yesterday.m < 0
              })}>{posOrNeg((today.m - yesterday.m).toFixed(2))}</span>
            </span>
            <span>
              <MdGroup style={{color: '#8686CC'}}/> {/* Users */}
              <span className={classnames({
                pos: today.u - yesterday.u > 0,
                neg: today.u - yesterday.u < 0
              })}>{posOrNeg(today.u - yesterday.u)}</span>
            </span>
            <span>
              <MdThumbsUpDown style={{color: '#86CC86'}}/> {/* Users Rated */}
              <span className={classnames({
                pos: (Number.isFinite((today.r - yesterday.r) / today.u) ? (today.r - yesterday.r) / today.u : 0).toFixed(2) > 0,
                neg: (Number.isFinite((today.r - yesterday.r) / today.u) ? (today.r - yesterday.r) / today.u : 0).toFixed(2) < 0
              })}>{posOrNeg((Number.isFinite((today.r - yesterday.r) / today.u) ? (today.r - yesterday.r) / today.u : 0).toFixed(2))}%</span>
            </span>
            <span>
              <MdFavorite style={{color: '#CC8686'}}/> {/* Favourites */}
              <span className={classnames({
                pos: today.f - yesterday.f > 0,
                neg: today.f - yesterday.f < 0
              })}>{posOrNeg(today.f - yesterday.f)}</span>
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

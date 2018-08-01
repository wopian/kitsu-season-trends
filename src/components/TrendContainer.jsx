import React from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { TrendTooltip } from './TrendTooltip'
import MdGroup from 'react-icons/lib/md/group'
import MdFavorite from 'react-icons/lib/md/favorite'
import MdStar from 'react-icons/lib/md/star'
import MdThumbsUpDown from 'react-icons/lib/md/thumbs-up-down'
import MdCircle from 'react-icons/lib/md/local-library'

function posOrNeg (number) {
  if (number > 0) return `+${number}`
  else if (number < 0) return `−${Math.abs(number)}`
  else return `±${number}`
}

function TrendChanges ({ title, icon, today, yesterday, decimalPlaces = 0 }) {
  const diff = today - yesterday

  return (
    <span title={title}>
      {icon}
      <span className={classnames({
        pos: diff > 0,
        neg: diff < 0
      })}>
        &nbsp;{posOrNeg(diff.toFixed(decimalPlaces))}
      </span>
    </span>
  )
}

TrendChanges.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
  today: PropTypes.number,
  yesterday: PropTypes.number,
  decimalPlaces: PropTypes.number
}

function TrendHeader ({ rank, id, newAnime, title, today, yesterday }) {
  const animeURI = `//kitsu.io/anime/${id}`
  const animePoster = `//media.kitsu.io/anime/poster_images/${id}/tiny.jpg`

  return (
    <a href={animeURI} data-rank={rank}>
      <img src={animePoster}/>
      <div className='title'>
        <div title={newAnime === 1 ? 'New' : 'Leftover' }>
          <MdCircle className={classnames({
            new: newAnime === 1,
            leftover: newAnime === 0
          })}/>
          <div>{title}</div>
        </div>
        <div className='changes'>
          <TrendChanges
            title='Score'
            icon={<MdStar/>}
            today={today.m}
            yesterday={yesterday.m}
            decimalPlaces={2}
          />
          <TrendChanges
            title='Users'
            icon={<MdGroup style={{color: '#8686CC'}}/>}
            today={today.u}
            yesterday={yesterday.u}
          />
          <TrendChanges
            title='Users Rated'
            icon={<MdThumbsUpDown style={{color: '#86CC86'}}/>}
            today={today.r}
            yesterday={yesterday.r}
          />
          <TrendChanges
            title='Favourites'
            icon={<MdFavorite style={{color: '#CC8686'}}/>}
            today={today.f}
            yesterday={yesterday.f}
          />
        </div>
      </div>
    </a>
  )
}

TrendHeader.propTypes = {
  rank: PropTypes.number,
  id: PropTypes.number,
  title: PropTypes.string,
  newAnime: PropTypes.number,
  today: PropTypes.object,
  yesterday: PropTypes.object
}

function TrendBody ({ data, start }) {
  return (
    <ResponsiveContainer width='100%' height={100}>
      <LineChart width={300} data={data}>
        <XAxis
          type='number'
          hide
          domain={[start, 'dataMax']}
          namekey='d'
          dataKey='d'
          tick={false}
          tickLine={false}
          axisLine={false}
        />
        {/* Mean Score */}
        <YAxis
          yAxisId='1..20'
          hide
          domain={[1, 10]}
          ticks={[0]}
          tickLine={false}
          axisLine={false}
        />
        {/* Users, Rated & Favourites */}
        <YAxis
          yAxisId='0..max'
          hide
          domain={[0, 'max']}
          ticks={[0]}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          isAnimationActive={false}
          content={<TrendTooltip/>}
        />
        <Line
          yAxisId='0..max'
          activeDot={{ stroke: '#ffb9b9', strokeWidth: 0, r: 0 }}
          dot={false}
          type='monotone'
          isAnimationActive={false}
          dataKey='f'
          stroke='#ffb9b9'
          strokeWidth={0}
        />
        <Line
          yAxisId='0..max'
          activeDot={{ stroke: '#b9ffb9', strokeWidth: 2, r: 2 }}
          dot={false}
          type='monotone'
          isAnimationActive={false}
          dataKey='r'
          stroke='#86cc86'
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
      </LineChart>
    </ResponsiveContainer>
  )
}

TrendBody.propTypes = {
  data: PropTypes.array,
  start: PropTypes.number
}


export function TrendContainer ({ rank, start, id, title, data, newAnime }) {
  return (
    <div className='trend'>
      <TrendHeader
        rank={rank}
        id={id}
        newAnime={newAnime}
        title={title}
        today={data.slice(-1)[0]}
        yesterday={data.slice(-2)[0]}
      />
      <TrendBody
        data={data}
        start={start}
      />
    </div>
  )
}

TrendContainer.propTypes = {
  rank: PropTypes.number,
  id: PropTypes.number,
  title: PropTypes.string,
  poster: PropTypes.number,
  data: PropTypes.array,
  start: PropTypes.number,
  newAnime: PropTypes.number
}

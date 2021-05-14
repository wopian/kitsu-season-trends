import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import LazyLoad from 'react-lazy-load'
import { TrendTooltip } from './TrendTooltip'
import { MdGroup, MdStar, MdThumbUp, MdThumbDown, MdLocalLibrary } from 'react-icons/md'
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer'
import { Tooltip } from 'recharts/es6/component/Tooltip'
import { LineChart } from 'recharts/es6/chart/LineChart'
import { Line } from 'recharts/es6/cartesian/Line'
import { YAxis } from 'recharts/es6/cartesian/YAxis'
import { XAxis } from 'recharts/es6/cartesian/XAxis'
import { formatNumber } from '../util/formatNumber'

function posOrNeg (number, isPercent) {
  if (number > 0) return `+${formatNumber(number, isPercent)}`
  else if (number < 0) return `−${formatNumber(Math.abs(number), isPercent)}`
  else return `±${formatNumber(number, isPercent)}`
}

class TrendChanges extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      toggleChangesTotal: true
    }
  }

  tick() {
    this.setState(prevState => ({
      toggleChangesTotal: !prevState.toggleChangesTotal
    }))
  }

  componentDidMount() {
    if (this.props.isCurrentSeason) this.interval = setInterval(() => this.tick(), 10e3)
    else clearInterval(this.interval)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    if (this.state.toggleChangesTotal && this.props.isCurrentSeason) {
      const diff = this.props.today - this.props.yesterday
      return (
        <span title={this.props.title}>
          {this.props.icon}
          <span className={classnames({
            pos: diff > 0,
            neg: diff < 0
          })}>
            &nbsp;{posOrNeg(diff, this.props.isPercent)}
          </span>
        </span>
      )
    } else {
      return (
        <span title={this.props.title}>
          {this.props.icon}
          <span>
            &nbsp;{formatNumber(this.props.today, this.props.isPercent)}
          </span>
        </span>
      )
    }
  }
}

TrendChanges.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
  today: PropTypes.number,
  yesterday: PropTypes.number,
  isCurrentSeason: PropTypes.bool,
  isPercent: PropTypes.bool
}

function TrendHeader ({ rank, id, newAnime, title, today, yesterday, isCurrentSeason }) {
  const animeURI = `https://kitsu.io/anime/${id}`
  const animePoster = `https://media.kitsu.io/anime/poster_images/${id}/tiny.jpg`

  return (
    <a href={animeURI} data-rank={rank}>
      <img className='poster' src={animePoster} alt=''/>
      <div className='title'>
        <div title={newAnime === 1 ? 'New' : 'Leftover' }>
          <MdLocalLibrary className={classnames({
            new: newAnime === 1,
            leftover: newAnime === 0
          })}/>
          <div>{title}</div>
        </div>
        <div className='changes'>
          <TrendChanges
            title='Score'
            icon={<MdStar/>}
            today={today.w}
            yesterday={yesterday.w}
            isCurrentSeason={isCurrentSeason}
            isPercent={true}
          />
          <TrendChanges
            title='Users'
            icon={<MdGroup style={{color: '#5F5FBB'}}/>}
            today={today.u}
            yesterday={yesterday.u}
            isCurrentSeason={isCurrentSeason}
          />
          <TrendChanges
            title='Upvotes'
            icon={<MdThumbUp style={{color: '#5FBB5F'}}/>}
            today={today.p}
            yesterday={yesterday.p}
            isCurrentSeason={isCurrentSeason}
          />
          <TrendChanges
            title='Downvotes'
            icon={<MdThumbDown style={{color: '#BB5F5F'}}/>}
            today={today.o}
            yesterday={yesterday.o}
            isCurrentSeason={isCurrentSeason}
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
  yesterday: PropTypes.object,
  isCurrentSeason: PropTypes.bool
}

function TrendBody ({ data, start }) {
  return (
      <ResponsiveContainer className='body' width='100%' height={100}>
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
          {/* Score */}
          <YAxis
            yAxisId='10..100'
            hide
            domain={[10, 100]}
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
          {/* Downvotes */}
          <Line
            className='fade-line'
            yAxisId='0..max'
            activeDot={{ stroke: '#BB5F5F', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='o'
            stroke='#BB5F5F'
            strokeWidth={1.5}
          />
          {/* Upvotes */}
          <Line
            className='fade-line'
            yAxisId='0..max'
            activeDot={{ stroke: '#5FBB5F', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='p'
            stroke='#5FBB5F'
            strokeWidth={1.5}
          />
          {/* Total Users */}
          <Line
            className='fade-line'
            yAxisId='0..max'
            activeDot={{ stroke: '#5F5FBB', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='u'
            stroke='#5F5FBB'
            strokeWidth={1.5}
          />
          {/* Wilson Score */}
          <Line
            yAxisId='10..100'
            activeDot={{ stroke: '#332532', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='w'
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

export default function TrendContainer ({ rank, start, id, title, data, newAnime, isCurrentSeason }) {
  return (
    <LazyLoad className='trend' offset={132} once>
      <>
        <TrendHeader
          rank={rank}
          id={id}
          newAnime={newAnime}
          title={title}
          today={data.slice(-1)[0]}
          yesterday={data.slice(-2)[0]}
          isCurrentSeason={isCurrentSeason}
        />
        <TrendBody
          data={data}
          start={start}
        />
      </>
    </LazyLoad>
  )
}

TrendContainer.propTypes = {
  rank: PropTypes.number,
  id: PropTypes.number,
  title: PropTypes.string,
  poster: PropTypes.number,
  data: PropTypes.array,
  start: PropTypes.number,
  newAnime: PropTypes.number,
  isCurrentSeason: PropTypes.bool
}

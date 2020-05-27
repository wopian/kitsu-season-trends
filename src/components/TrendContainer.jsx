import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import LazyLoad from 'react-lazy-load'
import { TrendTooltip } from './TrendTooltip'
import { MdGroup, MdFavorite, MdStar, MdThumbsUpDown, MdLocalLibrary } from 'react-icons/md'
import ResponsiveContainer from 'recharts/es6/component/ResponsiveContainer'
import Tooltip from 'recharts/es6/component/Tooltip'
import LineChart from 'recharts/es6/chart/LineChart'
import Line from 'recharts/es6/cartesian/Line'
import YAxis from 'recharts/es6/cartesian/YAxis'
import XAxis from 'recharts/es6/cartesian/XAxis'

function posOrNeg (number) {
  if (number > 0) return `+${number}`
  else if (number < 0) return `−${Math.abs(number)}`
  else return `±${number}`
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
            &nbsp;{posOrNeg(diff.toFixed(this.props.decimalPlaces))}
          </span>
        </span>
      )
    } else {
      return (
        <span title={this.props.title}>
          {this.props.icon}
          <span>
            &nbsp;{this.props.today}
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
  decimalPlaces: PropTypes.number,
  isCurrentSeason: PropTypes.bool
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
            today={today.m}
            yesterday={yesterday.m}
            decimalPlaces={2}
            isCurrentSeason={isCurrentSeason}
          />
          <TrendChanges
            title='Users'
            icon={<MdGroup style={{color: '#5F5FBB'}}/>}
            today={today.u}
            yesterday={yesterday.u}
            isCurrentSeason={isCurrentSeason}
          />
          <TrendChanges
            title='Users Rated'
            icon={<MdThumbsUpDown style={{color: '#5FBB5F'}}/>}
            today={today.r}
            yesterday={yesterday.r}
            isCurrentSeason={isCurrentSeason}
          />
          <TrendChanges
            title='Favourites'
            icon={<MdFavorite style={{color: '#BB5F5F'}}/>}
            today={today.f}
            yesterday={yesterday.f}
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
            className='fade-line'
            yAxisId='0..max'
            activeDot={{ stroke: '#BB5F5F', strokeWidth: 0, r: 0 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='f'
            stroke='#BB5F5F'
            strokeWidth={0}
          />
          <Line
            className='fade-line'
            yAxisId='0..max'
            activeDot={{ stroke: '#5FBB5F', strokeWidth: 2, r: 2 }}
            dot={false}
            type='monotone'
            isAnimationActive={false}
            dataKey='r'
            stroke='#5FBB5F'
            strokeWidth={1.5}
          />
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

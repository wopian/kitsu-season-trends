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
    this.interval = setInterval(() => this.tick(), 15e3)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    if (this.state.toggleChangesTotal) {
      return (
        <span title={this.props.title}>
          {this.props.icon}
          <span>
            &nbsp;{this.props.today}
          </span>
        </span>
      )
    } else {
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
    }
  }
}

TrendChanges.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
  today: PropTypes.number,
  yesterday: PropTypes.number,
  decimalPlaces: PropTypes.number
}

function TrendHeader ({ rank, id, newAnime, title, today, yesterday }) {
  const animeURI = `https://kitsu.io/anime/${id}`
  const animePoster = `https://media.kitsu.io/anime/poster_images/${id}/tiny.jpg`

  return (
    <a href={animeURI} data-rank={rank}>
      <LazyLoad className='poster' offsetVertical={400} debounce={false}>
        <img src={animePoster} alt=''/>
      </LazyLoad>
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
    <LazyLoad className='body' width={300} height={100} offsetVertical={400} debounce={false}>
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
    </LazyLoad>
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

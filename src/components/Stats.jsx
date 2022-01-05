import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import PropTypes from 'prop-types'
import React from 'react'
import { Line } from 'recharts/es6/cartesian/Line'
import { XAxis } from 'recharts/es6/cartesian/XAxis'
import { YAxis } from 'recharts/es6/cartesian/YAxis'
import { LineChart } from 'recharts/es6/chart/LineChart'
import { PieChart } from 'recharts/es6/chart/PieChart'
import { Cell } from 'recharts/es6/component/Cell'
import { Legend } from 'recharts/es6/component/Legend'
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer'
import { Tooltip } from 'recharts/es6/component/Tooltip'
import { Pie } from 'recharts/es6/polar/Pie'

const COLOURS = ['#E32402', '#332532']

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return value > 0 ? (
    <text
      x={x}
      y={y}
      fill='white'
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline='central'>
      {value}
    </text>
  ) : null
}

PieLabel.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  midAngle: PropTypes.number,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  value: PropTypes.any
}

function StatsStatus({ current, total }) {
  if (typeof current === 'number' && typeof total === 'number') {
    const data = [
      {
        name: 'New',
        value: current
      },
      {
        name: 'Leftovers',
        value: total - current
      }
    ]

    return (
      <PieChart width={200} height={200}>
        <Pie
          isAnimationActive={false}
          dataKey='value'
          data={data}
          labelLine={false}
          label={PieLabel}
          startAngle={90}
          endAngle={-270}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLOURS[index]} />
          ))}
        </Pie>
        <Legend verticalAlign='bottom' height={36} />
      </PieChart>
    )
  } else return null
}

StatsStatus.propTypes = {
  current: PropTypes.number,
  total: PropTypes.number
}

export function StatsType({ data }) {
  if (data && data.length > 0) {
    const subtypes = [
      { name: 'TV', value: 0 },
      { name: 'ONA', value: 0 }
    ]

    for (const element of data) {
      if (element.u === 'TV') subtypes[0].value++
      else if (element.u === 'ONA') subtypes[1].value++
    }

    return (
      <PieChart width={200} height={200}>
        <Pie
          isAnimationActive={false}
          dataKey='value'
          data={subtypes}
          labelLine={false}
          label={PieLabel}
          startAngle={90}
          endAngle={-270}>
          {subtypes.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLOURS[index]} />
          ))}
        </Pie>
        <Legend verticalAlign='bottom' height={36} />
      </PieChart>
    )
  } else return null
}

StatsType.propTypes = {
  data: PropTypes.array
}

export function StatsAverage({ data }) {
  if (data && data.length > 0) {
    const round = number =>
      typeof number === 'number' ? +number.toFixed(2) : number
    const average = []

    for (const anime of data) {
      for (const day of anime.d) {
        average.push({ date: day.d, title: anime.t, [anime.n]: day.w })
      }
    }

    const grouped = groupBy(average, element => {
      const date = new Date(element.date)
      date.setHours(0, 0, 0, 0)
      return date
    })

    const result = []

    for (let item in grouped) {
      let NEW = []
      let LEFTOVER = []

      for (const element of grouped[item]) {
        if (element['1']) NEW.push(element['1'])
        if (element['0']) LEFTOVER.push(element['0'])
      }

      const averages = {
        NEW: NEW.length === 0 ? null : NEW.reduce((a, b) => a + b) / NEW.length,
        LEFTOVER:
          LEFTOVER.length === 0
            ? null
            : LEFTOVER.reduce((a, b) => a + b) / LEFTOVER.length
      }

      if (averages.NEW > 0 || averages.LEFTOVER > 0)
        result.push({
          New: round(averages.NEW),
          Leftovers: round(averages.LEFTOVER),
          date: new Date(item).getTime()
        })
    }

    return (
      <ResponsiveContainer width='100%' height={200}>
        <LineChart data={sortBy(result, ['date'])}>
          <pattern
            id='pattern-stripe'
            width='8'
            height='16'
            patternUnits='userSpaceOnUse'
            patternTransform='rotate(22.5)'>
            <rect
              width='5'
              height='16'
              transform='translate(0,0)'
              fill={COLOURS[0]}></rect>
          </pattern>
          <Tooltip
            formatter={value => value.toFixed(2)}
            labelFormatter={label =>
              new Date(label).toLocaleDateString(navigator.language, {
                weekDay: 'long',
                day: '2-digit',
                year: 'numeric',
                month: 'long'
              })
            }
          />
          <YAxis
            type='number'
            tickLine={false}
            axisLine={false}
            domain={[20, 90]}
            ticks={[20, 40, 60, 80]}
            allowDataOverflow={true}
            unit='%'
          />
          <XAxis
            type='number'
            hide
            domain={['dataMin', 'dataMax']}
            tick={false}
            tickLine={false}
            axisLine={false}
            dataKey='date'
          />
          <Line
            isAnimationActive={false}
            stackId='2'
            type='monotone'
            dataKey='New'
            strokeWidth={2}
            stroke={COLOURS[0]}
            dot={false}
            unit='%'
          />
          <Line
            isAnimationActive={false}
            stackId='1'
            type='monotone'
            dataKey='Leftovers'
            strokeWidth={2}
            stroke={COLOURS[1]}
            dot={false}
            unit='%'
          />
          <Legend iconType='rect' height={36} />
        </LineChart>
      </ResponsiveContainer>
    )
  } else return null
}

StatsAverage.propTypes = {
  data: PropTypes.array
}

export default function Stats({ meta, data }) {
  return meta && data ? (
    <div className='stats'>
      <StatsType data={data} />
      <StatsStatus current={meta.current} total={meta.total} />
      <StatsAverage data={data} />
    </div>
  ) : null
}

Stats.propTypes = {
  meta: PropTypes.object,
  data: PropTypes.array
}

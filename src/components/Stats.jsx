import React from 'react'
import PropTypes from 'prop-types'
import { sortBy, groupBy } from 'lodash'
import moment from 'moment'
import { AreaChart, Area, YAxis, XAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'

const COLOURS = [ '#FD755C', '#332532' ]

function PieLabel ({ cx, cy, midAngle, innerRadius, outerRadius, value }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * .4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (value > 0) return (
    <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
      {value}
    </text>
  )
  else return null
}

PieLabel.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  midAngle: PropTypes.number,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  value: PropTypes.any
}

function StatsStatus ({ current, total }) {
  if (typeof current === 'number' && typeof total === 'number') {
    const data = [
      {
        name: 'New',
        value: current,
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
          endAngle={-270}
        >
          {
            data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLOURS[index]}/>
            ))
          }
        </Pie>
        <Legend verticalAlign='bottom' height={36}/>
      </PieChart>
    )
  } else return null
}

StatsStatus.propTypes = {
  current: PropTypes.number,
  total: PropTypes.number
}

export function StatsType ({ data }) {
  if (data && data.length > 0) {
    const subtypes = [
      { name: 'TV', value: 0 },
      { name: 'ONA', value: 0 }
    ]

    data.forEach(el => {
      if (el.u === 'TV') subtypes[0].value++
      else if (el.u === 'ONA') subtypes[1].value++
    })

    return (
      <PieChart width={200} height={200}>
        <Pie
          isAnimationActive={false}
          dataKey='value'
          data={subtypes}
          labelLine={false}
          label={PieLabel}
          startAngle={90}
          endAngle={-270}
        >
          {
            subtypes.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLOURS[index]}/>
            ))
          }
        </Pie>
        <Legend verticalAlign='bottom' height={36}/>
      </PieChart>
    )
  }
  else return null
}

StatsType.propTypes = {
  data: PropTypes.array
}

export function StatsAverage ({ data }) {
  if (data && data.length > 0) {
    const average = []

    data.forEach(anime => {
      anime.d.forEach(day => {
        average.push({ date: day.d, title: anime.t, [anime.u]: day.m })
      })
    })

    const grouped = groupBy(average, el => {
      return moment(el.date).startOf('day')
    })

    const result = []

    for (let item in grouped) {
      let TV = []
      let ONA = []

      grouped[item].forEach(el => {
        if (el.TV) TV.push(el.TV)
        if (el.ONA) ONA.push(el.ONA)
      })

      const averages = {
        TV: TV.length === 0 ? null : TV.reduce((a, b) => a + b) / TV.length,
        ONA: ONA.length === 0 ? null : ONA.reduce((a, b) => a + b) / ONA.length
      }

      if (averages.TV > 0 || averages.ONA > 0)
        result.push({ TV: averages.TV, ONA: averages.ONA, name: new Date(item).getTime()})
    }

    return (
      <AreaChart width={600} height={200} data={sortBy(result, ['name'])}>
        <Tooltip
          formatter={value => value.toFixed(2)}
          labelFormatter={label => new Date(label).toLocaleDateString(navigator.langauge, {
            weekDay: 'long',
            day: '2-digit',
            year: 'numeric',
            month: 'long'
          })}
        />
        <YAxis
          hide
          ticks={['']}
          tickLine={false}
          axisLine={false}
          domain={[1, 10]}
        />
        <XAxis
          hide
          ticks={['']}
          tickLine={false}
          axisLine={false}
          dataKey='name'
        />
        <Area isAnimationActive={false} stackId='1' type='monotone' dataKey='TV'  stroke={COLOURS[0]} fill={COLOURS[0]} fillOpacity={1}/>
        <Area isAnimationActive={false} stackId='2' type='monotone' dataKey='ONA' stroke={COLOURS[1]} fill={COLOURS[1]} fillOpacity={.5}/>
        <Legend iconType='rect' height={36}/>
      </AreaChart>
    )
  }
  else return null
}

StatsAverage.propTypes = {
  data: PropTypes.array
}

export function Stats ({ meta, data }) {
  if (meta && data) {
    return (
      <div className='stats'>
        <StatsStatus current={meta.current} total={meta.total}/>
        <StatsType data={data}/>
        <StatsAverage data={data}/>
      </div>
    )
  } else return null
}

Stats.propTypes = {
  meta: PropTypes.object,
  data: PropTypes.array
}

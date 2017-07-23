import React from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, Legend } from 'recharts'

function StatsStatusLabel ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * .4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
      {value}
    </text>
  )
}

function StatsStatus ({ current, total }) {
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
  const colours = [ '#FD755C', '#332532' ]

  if (current && total) return (
    <PieChart width={200} height={200}>
      <Pie
        isAnimationActive={false}
        dataKey='value'
        data={data}
        labelLine={false}
        label={StatsStatusLabel}
        startAngle={90}
        endAngle={-270}
      >
        {
          data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colours[index]}/>
          ))
        }
      </Pie>
      <Legend verticalAlign='bottom' height={36}/>
    </PieChart>
  )
  else return null
}

export function StatsType ({ types }) {
  if (types) return (
    <text>HELLO</text>
  )
  else return null
}

export function StatsAverage ({ data }) {
  if (data) return (
    <p>More stats coming soon!</p>
  )
  else return null
}

export function Stats ({ meta, data }) {
  if (meta && data) {
    return (
      <div className='stats'>
        <StatsStatus current={meta.current} total={meta.total}/>
        <StatsType types={meta.types}/>
        <StatsAverage data={data}/>
      </div>
    )
  } else return null
}

Stats.propTypes = {
  meta: PropTypes.object
}

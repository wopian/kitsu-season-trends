import React from 'react'
import PropTypes from 'prop-types'
import { AreaChart, Area, XAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'

const COLOURS = [ '#FD755C', '#332532' ]

function PieLabel ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }) {
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

  if (current && total) return (
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
  else return null
}

export function StatsType ({ data }) {
  if (data) {
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

export function StatsAverage ({ data }) {
  if (data) {
    console.log(data['12'])
    const average = []

    data.forEach(el => {
      average.push({ name: new Date(el.a).toISOString(), title: el.t, [el.u]: el.d.slice(-1)[0].m })
    })

    console.log(average)

    return (
      <AreaChart width={600} height={200} data={average}>
        <Tooltip/>
        <XAxis dataKey='name'/>
        <Area connectNulls={true} type='number' dataKey='TV' stroke='red' fill='red' fillOpacity={0.3}/>
        <Area connectNulls={true} type='number' dataKey='ONA' stroke='blue' fill='blue' fillOpacity={0.3}/>
      </AreaChart>
    )
  }
  else return null
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
  meta: PropTypes.object
}

import React from 'react'
import PropTypes from 'prop-types'
import { MdGroup, MdStar, MdThumbUp, MdThumbDown } from 'react-icons/md'
import { formatNumber } from '../util/formatNumber'

export class TrendTooltip extends React.Component {
  render () {
    const { active } = this.props

    if (active) {
      let { payload, label } = this.props
      const date = new Date(label)
      label = date.toLocaleDateString(navigator.langauge, {
        weekDay: 'long',
        day: '2-digit',
        year: 'numeric',
        month: 'long'
      })

      const [downvotes, upvotes, users, wilson] = payload

      return (
        <div>
          {label}
          <div className='changes'>
            <span>
              <MdStar style={{color: '#332532'}}/> {/* Wilson Score */}
              <span> {formatNumber(wilson.value, true)}</span>
            </span>
            <span>
              <MdGroup style={{color: '#5F5FBB'}}/> {/* Users */}
              <span> {formatNumber(users.value)}</span>
            </span>
            <span>
              <MdThumbUp style={{color: '#5FBB5F'}}/> {/* Upvotes */}
              <span> {formatNumber(upvotes.value)}</span>
            </span>
            <span>
              <MdThumbDown style={{color: '#BB5F5F'}}/> {/* Downvotes */}
              <span> {formatNumber(downvotes.value)}</span>
            </span>
          </div>
        </div>
      )
    }

    return null
  }
}

TrendTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.number
}

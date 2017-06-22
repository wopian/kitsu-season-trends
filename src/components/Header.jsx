import React from 'react'
import { season, year } from '../util'

export function Header () {
  return (
    <header>
      <h1>Kitsu</h1>
      <h2>
        {season().toUpperCase()}
        <strong>{year()}</strong>
      </h2>
    </header>
  )
}

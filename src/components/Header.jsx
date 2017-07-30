import React from 'react'
import { season as s, year as y } from '../util'
import { GitHub } from './GitHub'

export function Header () {
  const { pathname } = new URL(window.location)
  const [ , year, season ] = pathname.split`/`

  return (
    <header>
      <h1>Kitsu</h1>
      <h2>
        {season || s()}
        <strong>{year || y()}</strong>
        <GitHub/>
      </h2>
    </header>
  )
}

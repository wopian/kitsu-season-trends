import { hot } from 'react-hot-loader/root'
import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import loadable from '@loadable/component'
import GA from 'react-ga'

const App = loadable(() => import('./app.jsx'))
const AppHot = hot(App)

render(
  <AppContainer>
    <AppHot/>
  </AppContainer>,
  document.querySelector("#app")
)

// Don't run analytics in development
if (window.location.hostname !== 'localhost') {
  GA.initialize('UA-46184267-11')
  GA.set({ page: window.location.pathname + window.location.search })
  GA.pageview(window.location.pathname + window.location.search)
}

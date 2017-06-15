import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import GA from 'react-ga'
import App from './app.jsx'

// Don't run analytics in development
if (window.location.hostname !== 'localhost') {
  GA.initialize('UA-46184267-11')
  GA.set({ page: window.location.pathname + window.location.search })
  GA.pageview(window.location.pathname + window.location.search)
}

render(
  <AppContainer>
    <App/>
  </AppContainer>,
  document.querySelector("#app")
)

if (module && module.hot) {
  module.hot.accept('./app.jsx', () => {
    const AppHot = require('./app.jsx').default
    render(
      <AppContainer>
        <AppHot/>
      </AppContainer>,
      document.querySelector("#app")
    );
  });
}

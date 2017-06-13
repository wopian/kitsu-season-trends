import React from 'react';
import Trend from 'react-trend';
import '../styles/index.scss';

export default class App extends React.Component {
  render() {
    return (
      <div className='trend'>
        <Trend
          smooth
          autoDraw
          autoDrawDuration={3000}
          autoDrawEasing="ease-out"
          data={[0,2,5,9,5,10,3,5,0,20,1,8,2,9,0,0,2,5,9,5,0,3,5]}
          gradient={['#222']}
          radius={2}
          strokeWidth={2}
          strokeLinecap={'round'}
        />
        <Trend
          smooth
          autoDraw
          autoDrawDuration={3000}
          autoDrawEasing="ease-out"
          data={[0,2,5,9,5,10,3,5,0,20,1,8,2,9,0,0,2,5,9,5,0,3,5]}
          gradient={['#222']}
          radius={2}
          strokeWidth={2}
          strokeLinecap={'round'}
        />
      </div>
    )
  }
}

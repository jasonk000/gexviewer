import { useState, useEffect } from 'react'
import './App.css';
import {GexToSpxScatter} from './GexToSpxScatter'

function App() {
  const [data, setData] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/dix')
      .then(res => res.json())
      .then(result => setData(result))
      .catch(error => setError(error))
  }, [])

  if (error) {
    return <div className="App">
      <header className="App-header">
        <p>
          Error loading: {error}
        </p>
      </header>
    </div>
  }

  if (!data || !data.gexToSpxScatter) {
    return <div className="App">
      <header className="App-header">
        <p>
          Loading ...
        </p>
      </header>
    </div>
  }

  return (
    <div className="App">
      <header className="App-header">
        <h3>Current GEX / DIX readings</h3>
        <p>TODO</p>

        <h3>GEX / SPX forward scatter (no DIX)</h3>

        <p>TODO</p>

        <h3>20-day return curve for ten closest readings</h3>

        <p>TODO</p>

        <h3>GEX/DIX 20d SPX Scatter</h3>
        <GexToSpxScatter data={data.gexToSpxScatter}/>

        <h3>Squeezemetrics images</h3>
        <img src='/images/FE1sILpXEAAtCkH.png' alt='dix 5dma / gex to 1-month spx return'/>
        <img src='/images/FCqAUd5X0AMnhcL.png' alt='dix/gex to 1-month spx return'/>

        <h3>Thinking</h3>
        <ul>
          <li>Research: what happens if GEX / DIX is 5DMA'd before shoving into the chart?</li>
          <li>Overlay last-five on GEX/DIX scatter</li>
        </ul>
      </header>
    </div>
  );
}

export default App

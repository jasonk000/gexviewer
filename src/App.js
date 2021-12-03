import { useState, useEffect } from 'react'
import './App.css';
import {GexDixSpxScatter} from './GexDixSpxScatter'
import {GexSpxScatter} from './GexSpxScatter'
import {CurrentGexDix} from './CurrentGexDix'

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
      <h4>
        Error loading: {error}
      </h4>
    </div>
  }

  if (!data || !data.gexToSpxScatter1) {
    return <div className="App">
      <h4>
          Loading ...
      </h4>
    </div>
  }

  return (
    <div className="App">
      <h4>GEX / SPX forward scatter 1d</h4>
      <GexSpxScatter data={data.gexToSpxScatter1} recentData={data.lastFive}/>

      <h4>GEX / SPX forward scatter 20d</h4>
      <GexSpxScatter data={data.gexToSpxScatter20} recentData={data.lastFive}/>

      <h4>Recent GEX / DIX readings</h4>
      <CurrentGexDix recentData={data.lastFive} />

      <h4>20-day return curve for ten closest readings</h4>
      <p>TODO</p>

      <h4>GEX/DIX 1d SPX Scatter</h4>
      <GexDixSpxScatter data={data.gexToSpxScatter1} recentData={data.lastFive}/>

      <h4>GEX/DIX 20d SPX Scatter</h4>
      <GexDixSpxScatter data={data.gexToSpxScatter20} recentData={data.lastFive}/>

      <h4>Squeezemetrics images</h4>
      <img src='/images/FE1sILpXEAAtCkH.png' alt='dix 5dma / gex to 1-month spx return'/>
      <p/>
      <img src='/images/FCqAUd5X0AMnhcL.png' alt='dix/gex to 1-month spx return'/>

      <h4>Thinking</h4>
      <ul>
        <li>Research: what happens if GEX / DIX is 5DMA'd before shoving into the chart?</li>
        <li>Overlay last-five days on GEX/DIX scatter</li>
      </ul>
    </div>
  );
}

export default App

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
        <GexToSpxScatter data={data.gexToSpxScatter}/>
      </header>
    </div>
  );
}

export default App

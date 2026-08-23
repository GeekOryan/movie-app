import { useState } from 'react'
import './App.css'

const Card = ({ title }) => {

  const [hasLiked, setHasLiked] = useState(false);

  return (
    <div className='card' style={{
      border: '1px solid #4b5362',
      padding: '20px',
      margin: '10px',
      backgroundColor: '#31363',
      borderRadius: '10px',
      minHeight: '100px',
    }}>
      <h2>{title}</h2>

      <button onClick={() => setHasLiked(!hasLiked)}>
        {hasLiked ? "❤️": "🤍"}
      </button>
    </div>
  )
}

const App = () => {
  return ( 
    <div className="card-container">
      <Card title="Avengers Doomsday" rating={10} actors={[{ name: "Robert Downey JR.", name: "Chris Hemsworth"}]}/>
      <Card title="Dune 3" />
    </div>
  )
}

export default App

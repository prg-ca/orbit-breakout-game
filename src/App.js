/* eslint-disable jsx-a11y/alt-text */
import { useState } from 'react';
import './App.css';

import BreakoutGame from './BreakoutGame_v2';
import { FinalWindow } from './FinalWindow';
import { StartWindow } from './StartWindow';

function App() {
  const [result, setResult] = useState(null)
  const [bricksCount, setBricksCount] = useState(null)
  // const [gameStarted, setGameStarted] = useState(null)

  const handleRestart = () => {
    setResult(null)
    setBricksCount(null)
  }

  return (
    <div className="App">
      {!bricksCount && 
      <StartWindow selectNum={setBricksCount}/>
      }
      { bricksCount && !result && 
      (<>
      <div className='border-bottom'></div>
      <div>
        <div className='app-frame' id="game-frame">
          <BreakoutGame onFinish={setResult} n={bricksCount}/>
        </div>
        <div className='border-bottom'></div>
      </div>
      </>
      )
      }
      {result && <FinalWindow txt={result} handleRestart={handleRestart}/> }
    </div>
  );
}

export default App;


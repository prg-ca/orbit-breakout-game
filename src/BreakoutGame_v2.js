import {useGesture} from '@use-gesture/react'
import { useEffect, useRef, useState } from 'react';

const brickRowCount = 7;
const brickColumnCount = 5;
const brickOffsetTop = 10;
const brickOffsetLeft = 10;

const platformTop = 64;

const generateBricks = (n, specials) => {
  const possiblePositions = []
  let numberOfSpecial = specials
  for (let r = 0; r < brickRowCount; r++) {
    for (let c = 0; c < brickColumnCount; c++) {
      possiblePositions.push({x: c, y: r, status: 1, special: false})
    }
  }
  let bricks = []
  for (let i = 0; i < n; i++) {
    const brick = possiblePositions.splice(Math.floor(Math.random()*possiblePositions.length), 1);
    const isSpecial = numberOfSpecial > 0 ? true : false
    brick[0].special = isSpecial
    bricks = [...bricks, ...brick]
    numberOfSpecial--
  }
  // console.log(bricks)
  return bricks;
}

const iniDxs = [1.8, 2, 2.2, 2.4, 2.6, 2.8]

function BreakoutGame({ n=20, specials=4, onFinish }) {
  const [platformPosition, setPlatformPosition] = useState(100)
  const [stopped, setStopped] = useState(false)
  const platformRef = useRef()
  const containerRef = useRef()
  const overlayRef = useRef()

  const [gameState, setGameState] = useState({
    bricks: generateBricks(n, specials),
    dXs: [...iniDxs],
    ballPosition: {x: 140, y: platformTop + 10, dx: iniDxs[Math.floor(Math.random()*iniDxs.length)], dy: 3},
    elapsedTime: 0,
    needAcceleration: false,
    accelerationLimits: [0.6, 0.4, 0.2],
  })

  
  // console.log(gameState)
  // console.log(iniDxs[Math.floor(Math.random()*iniDxs.length)])

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const ballSize = 20
  const brickHeight = 20;
  const brickPadding = 5;
  const brickWidth = (window.innerWidth - brickPadding * 4 - brickOffsetLeft*2) /5;
  const accelerationRate = 1.2


  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;


      setGameState(prevState => {
        // console.log(prevState)
        const newElapsedTime = prevState.elapsedTime + deltaTime;
        let newDxs = prevState.dXs
        let newDx = prevState.ballPosition.dx
        let newDy = prevState.ballPosition.dy
        let newBricks = [...prevState.bricks]
        let brokenBricksCount = newBricks.filter(el => el.status === 0).length
        const totalBricksCount = newBricks.length
        let newNeedAcceleration = prevState.needAcceleration
        const newAccelerationLimits = [...prevState.accelerationLimits]

        if (newNeedAcceleration) {
          newDxs = newDxs.map(dx => dx * accelerationRate)
          newDy = prevState.ballPosition.dy * accelerationRate 
          newDx = prevState.ballPosition.dx * accelerationRate
          newNeedAcceleration = false
        } 
        // let newDy = newNeedAcceleration ? prevState.ballPosition.dy * accelerationRate : prevState.ballPosition.dy 
        // let newDx = newNeedAcceleration ? prevState.ballPosition.dx * accelerationRate : prevState.ballPosition.dx

        // detecting game over
        if (prevState.ballPosition.y < platformTop - 5) {
          // cancelAnimationFrame(requestRef.current);
          setStopped(true)
          console.log('game over')
          onFinish('Увы, в этот раз не получилось! Попробуешь взять Orbit® и сыграть еще раз?')
        }

        if (brokenBricksCount === totalBricksCount) {
          // cancelAnimationFrame(requestRef.current);
          setStopped(true)
          console.log('you win')
          onFinish('Ура! Ты открыл второе дыхание с Orbit®! Сканируй Orbit®, чтобы участвовать в розыгрыше еженедельных призов')
        }

        const touched = (element) => {
          const ballTop = prevState.ballPosition.y 
          const ballLeft = prevState.ballPosition.x + newDx
          const ballRight = ballLeft + ballSize
          const ballBottom = ballTop -  ballSize
          const bottomSide = containerRef.current.offsetHeight - ballSize - brickHeight - element.y * (brickHeight + brickPadding)
          const topSide = bottomSide + brickHeight
          const leftSide = element.x * (brickWidth + brickPadding)
          const rightSide = leftSide + brickWidth

          // console.log('detecting',  topSide,  bottomSide)
          // console.log(ballTop, ballBottom)
          // console.log('leftSide',  leftSide,  'rightSide', rightSide)
          // console.log('ballRight',  ballRight,  'ballLeft', ballLeft)
          if (element.status === 1 
              && 
                ((
                  (ballBottom < topSide && ballTop > topSide) 
                  && ((ballRight > leftSide && ballRight < leftSide + brickWidth) || (ballLeft < rightSide && ballLeft > rightSide - brickWidth))
                ) 
                || (
                  (ballTop > bottomSide && ballBottom < bottomSide) 
                  && ((ballRight > leftSide && ballRight < leftSide + brickWidth) || (ballLeft < rightSide && ballLeft > rightSide - brickWidth))
                ))
              )
          { 
            setTimeout(() => {
              element.status = 0;
              brokenBricksCount = newBricks.filter(el => el.status === 0).length
            }, 10)
            if (element.special) {
              // setGameState(prevState => ({...prevState, paused: true}))
              console.log('special')
              setStopped(true)
              setTimeout(() => {
                setStopped(false)
              }, 1000)
            }
            return true
         
          } else {
            return false
          }
        }


        // detecting bricks collision
        if (newBricks.some(touched)) {
          // console.log("touch")
          newDy = -newDy
          brokenBricksCount += 1
          if ( (brokenBricksCount / totalBricksCount) >= newAccelerationLimits[newAccelerationLimits.length - 1]) {
            newNeedAcceleration = true;
            const acc = newAccelerationLimits.pop()
            // newDxs = newDxs.map(dx => dx * acc)
            // console.log((brokenBricksCount / totalBricksCount))
            console.log(acc)
            console.log('acceleration!')
          }
        }


        // detecting platform and walls
        if (( prevState.ballPosition.y + newDy) > containerRef.current.offsetHeight - ballSize
              || (
                  (prevState.ballPosition.y + newDy) < platformTop 
                  && platformRef.current.offsetLeft < prevState.ballPosition.x 
                  && (platformRef.current.offsetLeft + platformRef.current.offsetWidth > prevState.ballPosition.x)
                )
            ) 
        {
          // console.log('before change', newDy, newDx)
          newDx = Math.sign(newDx) * newDxs[Math.floor(Math.random()*newDxs.length)]
          newDy = -newDy
          // console.log('after change', newDy, newDx)
          // const randFactor = (Math.random() > 0.5) ? 1 + (Math.floor(Math.random() * 10)*0.02) : 1 + (Math.floor(Math.random() * 10)*0.02)
          // newDx = newDx * randFactor
        }
        if ((prevState.ballPosition.x + newDx < 0) 
            || (prevState.ballPosition.x + newDx  > containerRef.current.offsetWidth - ballSize))  
        {
          newDx = -newDx
        }

        // creating new state
        // console.log(newPaused)
        const newState = {
          bricks: newBricks,
          dXs: newDxs,
          ballPosition: {y: prevState.ballPosition.y + newDy, x: prevState.ballPosition.x + newDx, dy: newDy, dx: newDx},
          elapsedTime: newElapsedTime,
          needAcceleration: newNeedAcceleration,
          accelerationLimits: newAccelerationLimits
        }

        return newState
      })  
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  
  }
  

  useEffect(() => {
    if (!stopped) {
      overlayRef.current.classList.remove('visible')
      requestRef.current = requestAnimationFrame(animate);
    } else {
      overlayRef.current.classList.add('visible')
    }
    return () => cancelAnimationFrame(requestRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped]); 



  useGesture({
      onDrag: ({offset: [dx]}) => {
        setPlatformPosition(dx)
      },
      onDragEnd: () => {
        const platformX = platformRef.current.offsetLeft
        const platformWidth = platformRef.current.offsetWidth
        const containerWidth= containerRef.current.offsetWidth
        if (platformX < 0) {
          setPlatformPosition(0)
        } 
        if (platformX + platformWidth > containerWidth) {
          setPlatformPosition(containerWidth - platformWidth)
        }
      }
    },
    {
      drag: {
        from: () => [platformPosition]
      },
      target: platformRef,
      eventOptions: { passive: false },
    }
  )

    const bricksRendered = gameState.bricks.map(br => (
      <div className={br.special ? 'brick  brick--special' : 'brick'}
        key={`row${br.y}col${br.x}`}
        style={{
          width: brickWidth,
          top: brickOffsetTop + br.y * (brickHeight + brickPadding),
          left: brickOffsetLeft + br.x * (brickWidth + brickPadding),
          opacity: br.status
        }}
      ></div>
    ))


  return (
    <>
        <div ref={containerRef}>
          <div 
            ref={platformRef}
            className='platform'
            style={{
              touchAction: 'none',
              left: platformPosition,
            }}>
          </div>

          <div className='bricks'>
            {bricksRendered}
          </div>
          <div className='ball'
            style={{
              left: gameState.ballPosition.x,  
              bottom:  gameState.ballPosition.y,
            }}
          ></div>
          {/* <button className='btn1' onClick={() => cancelAnimationFrame(requestRef.current)}>Stop</button>
          <button className='btn2' onClick={() => requestRef.current = requestAnimationFrame(animate)}>start</button> */}
        <div className='overlay' ref={overlayRef}>
          <p>Just a second to read the text</p>
          </div>
        </div>
    </>
  )
}

export default BreakoutGame
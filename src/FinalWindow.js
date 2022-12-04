import orbitImg from './assets/final.png'
import orbitImgFail from './assets/final2.png'

export const FinalWindow = ({txt, handleRestart}) => {
  return (
    <div className="final">
      <p className='app-p'>{txt}</p>
      <button className="final-btn" onClick={handleRestart}>Играть еще</button>
      {txt.startsWith('Ура!') && <img src={orbitImg} className='final-img' alt=""/>}
      {txt.startsWith('Увы') && <img src={orbitImgFail} className='final-img--2' alt=""/>}
    </div>
  )
}
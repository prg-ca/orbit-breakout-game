export const StartWindow = ({selectNum}) => {
  return (
    <div className="start">
    <p className='app-p'>Всего сетка с кирпичами - 7&nbsp;строк на 5 колонок.
    <br />
    <br />
    <b>Выбери число кирпичиков:</b></p>
    <div className="btn-bricks" onClick={() => selectNum(15)}>15</div>
    <div className="btn-bricks" onClick={() => selectNum(20)}>20</div>
    <div className="btn-bricks" onClick={() => selectNum(25)}>25</div>
    <div className="btn-bricks" onClick={() => selectNum(30)}>30</div>
    </div>
  )
}
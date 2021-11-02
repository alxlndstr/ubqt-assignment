import { useState } from "react"
import Overlay from "../Overlay";

const DeleteTaskComponent = ({deleteTask}: DeleteTaskComponentProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  return <div className="DeleteTaskComponent">
    {
    !showConfirmDialog ? <button onClick={() => setShowConfirmDialog(true)}>
        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 197.516 197.516">
          <path d="M68.758,170.083V72.649h15v97.434H68.758z M128.758,72.649h-15v97.434h15V72.649z M140.539,0v12.631h34.885v47.746h-10.525
          v137.139H32.617V60.377H22.092V12.631h34.883V0H140.539z M149.898,60.377H47.617v122.139h102.281V60.377z M125.539,27.631V15H71.975
          v12.631H37.092v17.585h123.332V27.631H125.539z"/>
        </svg>
      </button>
    : <Overlay closeFunc={() => setShowConfirmDialog(false)}>
        <div className="DeleteTaskDialog">
          <h2>Delete Task?</h2>
          <button className="negative" onClick={() => deleteTask()}>Confirm</button>
          <button onClick={() => setShowConfirmDialog(false)}>Cancel</button>
        </div>
      </Overlay>
      }
  </div>
}

export default DeleteTaskComponent;
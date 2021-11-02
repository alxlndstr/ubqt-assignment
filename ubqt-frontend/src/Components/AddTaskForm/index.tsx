import Overlay from '../Overlay';

const AddTaskForm = ({onSubmit, parentTaskId, setShowAddTaskForm}: AddTaskFormParams) => {
  const submit = () => {
    const titleInput: HTMLInputElement = document.querySelector(`#inputAddTaskTitle_${parentTaskId || 'root'}`)!;
    const descriptionInput: HTMLInputElement = document.querySelector(`#inputAddTaskDescription_${parentTaskId || 'root'}`)!;
    if (titleInput.value == '') return;
    const newTask: TaskContent = {
      title: titleInput.value,
      description: descriptionInput.value || undefined,
      type: 'standard',
      parentTaskId,
    }
    titleInput.value = '';
    setShowAddTaskForm(false);
    onSubmit(newTask);
  }

  return (
    <Overlay closeFunc={() => setShowAddTaskForm(false)}>
      <div className='AddTaskForm' id="AddTaskForm">
        <div className="AddTaskFormTop">
          <h2 className="AddTaskFormTopTitle">Add a task:</h2>
          {
            setShowAddTaskForm && <button className="closeButton" onClick={() => setShowAddTaskForm(false)}>X</button> 
          }
        </div>
        <div className="AddTaskFormBody">
          <input className="AddTaskFormTitleInput" type='text' id={`inputAddTaskTitle_${parentTaskId || 'root'}`} placeholder='Title'></input>
          <textarea className="AddTaskFormDescriptionInput" id={`inputAddTaskDescription_${parentTaskId || 'root'}`} placeholder='Description'></textarea>
          <button onClick={submit}>Add</button>
        </div>

      </div>
    </Overlay>
  )
}

export default AddTaskForm;
import { useState } from "react";
import AddTaskForm from "../AddTaskForm";
import DeleteTaskComponent from "../DeleteTaskForm";
import InviteUserForm from "../InviteUserForm";
import Checkbox from "../Checkbox";
const Task = ({socket, taskList, taskData}: TaskProps) => {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showInviteUserForm, setShowInviteUserForm] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);

  const addSubTask = (taskContent: TaskContent) => {
    socket.emit('task', { msg: 'CREATE', props: { taskContent } });
    setShowSubTasks(true);
    setShowAddTaskForm(false);
  }
  const toggleTaskDone = () => {
    socket.emit('task', { msg: 'UPDATE', props: { taskId: taskData.taskId, updatedTaskProps: { done: !taskData.done }}});
  }
  const getAllSubTasks = (taskId: String) => {
    const subTasks: TaskInfo[] = [];
    const task = taskList.find((task) => taskId == task.taskId);
    if(!task || !task.subTaskIds) return [];
    subTasks.push(task);
    task!.subTaskIds?.forEach((subTaskId: string) => subTasks.push(...getAllSubTasks(subTaskId)))
    return subTasks;
  }
  const sendUserInvite = (email: string) => {
    const subTaskIds = totalSubTasks.map((task) => task.taskId);
    socket.emit('invite', { msg: 'NEW', props: { taskId: taskData.taskId, subTaskIds, recipient: { email }}});
  }
  const deleteTask = () => {
    const subTaskIds = totalSubTasks.map((task) => task.taskId);
    socket.emit('task', { msg: 'DELETE', props: { taskId: taskData.taskId, taskIds: subTaskIds }});
  }
  const toggleShowSubTasks = () => setShowSubTasks(!showSubTasks);

  if(!taskData) return <p>loading...</p>

  const totalSubTasks = getAllSubTasks(taskData.taskId);
  const subTaskProgress = (totalSubTasks.filter(({done, taskId}: any) => done && taskData.taskId != taskId).length/(totalSubTasks.length-1));

  const percentProgress = `${(subTaskProgress * 100).toFixed(0)}%`;
  //<input type="checkbox" checked={taskData.done} onChange={toggleTaskDone}></input>
  return (
    <div className={`Task${subTaskProgress >= 1 || (taskData.subTaskIds.length == 0 && taskData.done) ? ' TaskDone' : ''}`}>
      <div className="TaskHeader">
        <h2 className="TaskTitle">{taskData.title}</h2>
        <div className="TaskHeaderRight">
          <Checkbox checked={taskData.done} onClick={toggleTaskDone} />
          <h3>{taskData.subTaskIds.length ? `Subtasks: ${percentProgress}` : ''}</h3>
        </div>
      </div>
      { taskData.description && <p className="TaskDescription">{taskData.description}</p> }
      <div className="TaskActions">
        <button onClick={() => setShowAddTaskForm(true)}>Add Subtask</button>
        <button onClick={() => setShowInviteUserForm(true)}>Invite</button>
        <DeleteTaskComponent deleteTask={deleteTask}/>
      </div>
      { taskData.subTaskIds.length > 0 && <button className="expander" onClick={toggleShowSubTasks}>
        { showSubTasks ? `Hide Subtasks` : `Show subtasks(${taskData.subTaskIds.length})` }
      </button>
      }
      { showAddTaskForm && <AddTaskForm setShowAddTaskForm={setShowAddTaskForm} parentTaskId={taskData.taskId} onSubmit={addSubTask} /> }
      { showInviteUserForm && <InviteUserForm setShowInviteUserForm={setShowInviteUserForm} onSubmit={sendUserInvite} /> }   
      { showSubTasks && (
          <div className="subTaskContainer">
          {
            taskData.subTaskIds?.map(subTaskId => {
              const taskData = taskList!.find((task: TaskInfo) => task.taskId == subTaskId)
              if(!taskData) return;
              return <Task key={subTaskId} taskData={taskData} taskList={taskList!} socket={socket} />
            })
          }
          </div>
        )
      }

    </div>
  )
}

export default Task;
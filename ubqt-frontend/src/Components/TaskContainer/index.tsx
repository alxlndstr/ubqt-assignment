import Task from '../Task';
import AddTaskForm from '../AddTaskForm';
import { useState } from 'react';

const TaskContainer = ({socket, taskList}: TaskContainerProps) => {


  const topTasks = taskList.filter(({parentTaskId}) => !parentTaskId)
  const sharedTasks = taskList.filter(({parentTaskId}) => !taskList.find(({taskId}) => !parentTaskId || parentTaskId == taskId));
  const allTasks = [...topTasks, ...sharedTasks];
  return (
    <div className="TaskContainer">
      <div className="TaskContainerList">
        { 
          allTasks.length == 0 ? <h2 className="EmptyTaskList">No tasks added yet...</h2>
          : allTasks.map((task: TaskInfo) => <Task key={task.taskId} taskData={task} taskList={taskList!} socket={socket} />)
        }
      </div>
    </div>
  )
}

export default TaskContainer;
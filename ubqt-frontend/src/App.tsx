import './App.css';
import { useEffect, useRef, useState } from 'react';
import LoginForm from './Components/LoginForm'
import TaskContainer from './Components/TaskContainer';
import InviteContainer from './Components/InviteContainer';
import { connect, Socket } from 'socket.io-client';
import LogoutButton from './Components/LogoutButton';
import AddTaskForm from './Components/AddTaskForm';

const socket: Socket = connect();

const initialUser: UserData = {
  email: '',
  userId: '',
  userName: '',
};
const initialInvites: TaskInvite[] = [];
const initialTasks: TaskInfo[] = [];

const App = () => {
  const [_currentUser, _setCurrentUser] = useState<UserData>(initialUser);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [_inviteList, _setInvites] = useState<TaskInvite[]>(initialInvites);
  const [_taskList, _setTasks] = useState<TaskInfo[]>(initialTasks);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  const currentUser = useRef(_currentUser);
  const taskList = useRef(_taskList);
  const inviteList = useRef(_inviteList);

  const submitTaskForm = (taskContent: TaskContent) => {
    socket.emit('task', { msg: 'CREATE', props: { taskContent }});
  }
  const setCurrentUser = (user: UserData) => {
    currentUser.current = user;
    _setCurrentUser({...user});
  };
  const setTasks = (tasks: TaskInfo[]) => {
    taskList.current = tasks;
    _setTasks([...tasks]);
  };
  const setInvites = (newInvites: TaskInvite[]) => {
    inviteList.current = newInvites;
    _setInvites([...newInvites])
  }

  useEffect(() => {
    const listener = (data: { msg: string, props: any }) => {
      switch(data.msg) {
        case 'NEW': {
          const tasks = [...taskList.current];
          if(data.props.task.parentTaskId) {
            const parentTask = tasks?.find((task: TaskInfo) => task.taskId == data.props.task.parentTaskId)
            if(parentTask)
            parentTask.subTaskIds.push(data.props.task.taskId);
          }
          tasks.push(data.props.task);
          setTasks(tasks);
          break;
        }
        case 'UPDATE': {
          const tasks = [...taskList.current];
          const taskIndex = tasks?.findIndex((task: TaskInfo) => task.taskId == data.props.taskId)
          tasks[taskIndex] = {...tasks[taskIndex], ...data.props.updatedTaskProps};
          setTasks([...tasks]);
          break;
        }
        case 'DELETE': {
          const tasks = [...taskList.current];
          const newTasks = tasks.filter((task: TaskInfo) => !data.props.taskIds.includes(task.taskId));
          const parentTask = newTasks.find((task: TaskInfo) => data.props.parentTaskId == task.taskId);
          if (parentTask) {
            parentTask.subTaskIds = parentTask.subTaskIds.filter(taskId => taskId != data.props.taskId);
          }
          setTasks([...newTasks]);
          break;
        }
        case 'GET_ALL': {
          setTasks([...data.props.taskList]);
          break;
        }
        case 'GET': {
          setTasks([...taskList.current, data.props.task]);
          break;
        }
      }
    }
    socket.on('task', listener);
  }, []);

  useEffect(() => {
    const listener = (data: any) => {
      switch (data.msg) {
        case 'NEW': {
          if (!data.props.invite || !currentUser) return;
          setInvites([...inviteList.current, data.props.invite])
          return;
        }
        case 'GET_ALL': {
          setInvites([...data.props.invites]);
          return;
        }
      }
    }
    socket.on('invite', listener);

    return () => {
      socket.removeListener('invite', listener);
    }
  }, []);

  return (
      <div className="AppContainer">
        <nav className="Navbar">
          <h2 className="NavbarTitle">ListKeeper</h2>
          {
            isLoggedIn && 
            <div className="AccountActions">
              <button className="positive" onClick={() => setShowAddTaskForm(true)}>Add Task</button>
              { showAddTaskForm && <AddTaskForm setShowAddTaskForm={setShowAddTaskForm} onSubmit={submitTaskForm} /> }
              <InviteContainer socket={socket} inviteList={inviteList.current} setInvites={setInvites} />
              <LogoutButton logoutFunc={() => { setLoggedIn(false); setInvites(initialInvites); setCurrentUser(initialUser); socket.emit('disconnect') }} />
            </div>
          }
        </nav>
        { 
          !isLoggedIn ? 
          <LoginForm userState={{currentUser: currentUser.current, setCurrentUser}} setLoggedIn={setLoggedIn} socket={socket} />
          : <TaskContainer socket={socket} taskList={taskList.current} setTasks={setTasks} />
        }
      </div>
  )
  
}

export default App;

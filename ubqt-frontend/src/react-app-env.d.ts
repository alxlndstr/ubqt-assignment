/// <reference types="react-scripts" />
import { Socket } from 'socket.io-client';
declare global {
  declare type UserData = {
    userId: string,
    userName: string,
    email: string,
  }
  declare type InviteUserFormParams = {
    onSubmit: Function,
    setShowInviteUserForm: Function,
  }
  declare type InviteProps = {
    socket: Socket,
    invite: TaskInvite,
    replyInvite: Function;
  }
  declare type TaskInvite = {
    byUserId: string,
    byUserName: string,
    taskId: string,
    inviteId: string,
    taskTitle: string,
  }
  declare type LogoutButtonProps = {
    logoutFunc: Function,
  }
  declare type OverlayProps = {
    closeFunc: Function,
    children: JSX.Element,
  }
  declare type AppProps = {
    socket: Socket,
  }
  declare type NavbarProps = {
    children: any,
  }
  declare type LoginFormProps = {
    socket: Socket,
    userState: any;
    setLoggedIn: Function,
  }
  declare type TaskContainerProps = {
    socket: Socket,
    taskList: Task[];
    setTasks: Function;
  }
  declare type InviteContainerProps = {
    inviteList: TaskInvite[];
    setInvites: Function;
    socket: Socket;
  }
  declare type TaskProps = {
    socket: Socket,
    taskList: TaskInfo[],
    taskData: TaskInfo,
    parentTaskProgress?: number,
  }
  declare type DeleteTaskComponentProps = {
    deleteTask: Function,
  }
  declare type AddTaskFormParams = {
    parentTaskId?: string,
    onSubmit: Function,
    setShowAddTaskForm: Function,
  }
  declare type TaskContent = {
    title: string,
    description?: string,
    parentTaskId?: string,
    type: string,
    special?: {}
  }

  declare type TaskInfo = {
    title: string,
    taskId: string,
    type: string;
    description?: string,
    done: boolean,
    subTaskIds: string[],
    parentTaskId?: string,
    createdBy: string,
    ownerId: string,
    users: string[],
    updated: Date,
    special?: {},
  };
  declare type LoginCredentials = {
    email: string,
    password: string,
  }
}



import { Server, Socket } from "socket.io";
import { db } from './db';
import { v4 as generateId } from 'uuid';
import bcrypt from 'bcrypt';
import { bcryptConfig } from '../config';

type Task = {
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

type TaskContent = {
  title: string,
  description?: string,
  parentTaskId?: string,
  type: string,
  special?: {}
}

type TaskInvite = {
  byUserId: string,
  byUserName: string,
  taskId: string,
  taskTitle: string, 
  inviteId: string,
  subTaskIds?: string[],
}

type User = {
  userId: string,
  active: Date | boolean,
  registered: Date,
  userName: string,
  passHash: string,
  invites: TaskInvite[],
  email: string,
};

type UserSocket = {
  userId: string,
  socket: Socket,
}

const onlineUsers: UserSocket[] = [];

const validateEmail = (email: string | null | undefined) => email && /^\w+@\w+\.\w+$/g.test(email);

const storeUserSocket = (userId: string, socket: Socket) => {
  const userSocket = onlineUsers.find((element) => element.userId == userId);
  if (!userSocket) return onlineUsers.push({userId, socket});
  userSocket.socket = socket;
}
const getUserSocket = (requestedUserId: string) => onlineUsers.find(({userId}) => userId == requestedUserId) || false;
const clearUserSocket = (requestedUserId: string) => {
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].userId == requestedUserId){
      onlineUsers.splice(i,1);
      break;
    }
  }
}

export const startSocketServer = async (server: Object) => {
  const database = await db();
  const users = database.collection('users');
  const tasks = database.collection('tasks');
  const io = new Server(server);

  io.on('connection', (socket: Socket) => {
    socket.on('register', async (data: {msg: string, props: { email: string, userName: string, password: string }}) => {

      const userExists = await users.findOne({ email: data.props.email.toLowerCase() });

      if (userExists != null) return socket.emit('register', {msg: 'USER_ALREADY_EXISTS'});

      if (!validateEmail(data.props.email)) return;
    
      if (data.props.password.length < 6 || data.props.userName.length < 4) return;

      const passHash = await bcrypt.hash(data.props.password, await bcrypt.genSalt(bcryptConfig.saltRounds));
      const newUser: User = {
        userId: generateId(),
        active: false,
        invites: [],
        registered: new Date(Date.now()),
        ...data.props,
        email: data.props.email.toLowerCase(),
        passHash,
      }
      await users.insertOne(newUser);
      socket.emit('register', { msg: 'USER_CREATED' });
    });
    socket.on('login', async (data: { props: { email: string, password: string } }) => {
      const user = await users.findOne({ email: data.props.email.toLowerCase() });
      if (!user) return socket.emit('login', { msg: 'LOGIN_FAILED' });
      const authenticated = await bcrypt.compare(data.props.password, user.passHash);
      if (!authenticated) return socket.emit('login', { msg: 'LOGIN_FAILED' });
      socket.data.userId = user.userId;
      storeUserSocket(user.userId, socket);
      await users.updateOne({ userId: user.userId }, { $set: { active: true }});
      socket.emit('login', { msg: 'LOGIN_SUCCESSFUL', props: { userData: { userId: user.userId, userName: user.userName }}});
    });
    socket.on('disconnect', async () => {
      if(socket.data.userId) {
        clearUserSocket(socket.data.userId);
        await users.updateOne({ userId: socket.data.userId }, { $set: { active: new Date(Date.now()) }});
      }
    });
    socket.on('invite', async (data: {msg: string, props: any  }) => {
      console.log('invite: ' + data.msg);
      switch (data.msg) {
        case 'NEW': {
          const sender = await users.findOne({ userId: socket.data.userId});
          if (!sender) return console.log('invite sender not found!');
          const recipient = await users.findOne({ email: data.props.recipient.email.toLowerCase() });
          if (!recipient) {
            socket.emit('invite', { msg: 'RECIPIENT_EMAIL_NOT_FOUND' });
            return console.log('invite recipient not found!');
          }
          if(sender.email == recipient.email) { console.log('user invited itself'); }
          const task = await tasks.findOne({ taskId: data.props.taskId });
          if (!task) return console.log('Task not found!');
          if (task.users.includes(recipient.userId)) return console.log('user already subscribes to this task');
          const invite: TaskInvite = {
            inviteId: generateId(),
            byUserId: socket.data.userId,
            byUserName: sender.userName,
            taskId: data.props.taskId,
            taskTitle: task.title,
            subTaskIds: data.props.subTaskIds || [],
          }
          await users.updateOne({ email: data.props.recipient.email }, { $push: { invites: invite }});
          const invitedUserSocket = getUserSocket(recipient.userId);
          if (!invitedUserSocket) return console.log('Invited user not online');
          invitedUserSocket.socket.emit('invite', { msg: 'NEW', props: { invite }})
          return;
        }
        case 'ACCEPT': {
          const taskIds = [data.props.invite.taskId];
          if (data.props.invite.subTaskIds) {
            taskIds.push(...data.props.invite.subTaskIds);
          }
          tasks.updateMany({ taskId: { $in: taskIds }}, { $push: { users: socket.data.userId }});
          await users.updateOne({ userId: socket.data.userId }, { $push: { taskIds: data.props.invite.taskId }, $pull: { invites: { inviteId: data.props.invite.inviteId }}});
          socket.emit('invite', { msg: 'ACCEPTED', props: { invite: data.props.invite }})
        }
        case 'REJECT': {
          await users.updateOne({ email: data.props.email }, { $pull: { invites: { inviteId: data.props.invite.inviteId }}});
        }
        case 'GET_ALL': {
          const user = await users.findOne({ userId: socket.data.userId });
          if(!user) return;
          socket.emit('invite', { msg: 'GET_ALL', props: { invites: user.invites }});
        }
      }
    });
    socket.on('task', async (data: { msg: string, props: { userId?: string, taskIds?: string[], taskId?: string, taskContent?: TaskContent, updatedTaskProps?: { title?: string, description?: string, done?: boolean } } }) => {
      console.log('task', data.msg);
      switch (data.msg) {
        case 'GET': {
          const task = await tasks.findOne({ taskId: data.props.taskId });
          if (!task) return socket.emit('error', { msg: 'TASK_NOT_FOUND' });
          if (!task.users.includes(socket.data.userId)) return socket.emit('error', { msg: 'USER_NOT_AUTHORIZED' });
          socket.emit('task', {msg: 'GET', props: { task }});
          return;
        }
        case 'GET_ALL': {
          const taskList = await tasks.find({ users: socket.data.userId }).toArray();
          if (!taskList) return socket.emit('task', { msg: 'NO_TASKS_FOUND' });
          return socket.emit('task', { msg: 'GET_ALL', props: { taskList }});;
        }
        case 'UPDATE': {
          try {
            await tasks.updateOne({ taskId: data.props.taskId }, { $set: { ...data.props.updatedTaskProps }});
            const task = await tasks.findOne({ taskId: data.props.taskId });
            if (!task) return;
            task.users.forEach((userId: string) => {
              const userSocket = getUserSocket(userId);
              if (userSocket) userSocket.socket.emit('task', { msg: 'UPDATE', props: { taskId: data.props.taskId, updatedTaskProps: { ...data.props.updatedTaskProps }}});
            });
          } catch (err) {
            console.log(err);
          }
          break;
        }
        case 'DELETE': {
          const topTask = await tasks.findOne({ taskId: data.props.taskId });
          if (!topTask) return console.log('Task not found');
          if (!topTask.ownerId == topTask.taskId) return socket.emit('error', { msg: 'USER_NOT_AUTHORIZED' });

          const tasksToDelete = await tasks.find({ taskId: { $in: data.props.taskIds! }}).toArray();
          const concernedUsers: string[] = [];
          const allTaskIds: string[] = data.props.taskIds!;

          tasks.deleteMany({ taskId: { $in: allTaskIds }});
          if (topTask.parentTaskId) {
            tasks.updateOne({taskId: topTask.parentTaskId }, { $pull: { subTaskIds: topTask.taskId }});
          }
          tasksToDelete.forEach((task) => {
            task.users.forEach((userId: string) => !concernedUsers.includes(userId) && concernedUsers.push(userId));
          });
          concernedUsers.forEach((userId: string) => {
            const userSocket = getUserSocket(userId);
            if (userSocket) userSocket.socket.emit('task', { msg: 'DELETE', props: { taskId: data.props.taskId, parentTaskId: topTask.parentTaskId, taskIds: allTaskIds }});
          });
          break;
        }
        case 'CREATE': {
          const newTask: Task = {
            createdBy: socket.data.userId,
            done: false,
            ownerId: socket.data.userId,
            users: [socket.data.userId],
            taskId: generateId(),
            subTaskIds: [],
            updated: new Date(Date.now()),
            ...data.props.taskContent!,
          }
          try {
            if (newTask.parentTaskId) {
              const parentTask = await tasks.findOne({ taskId: newTask.parentTaskId });
              if(!parentTask) return socket.emit('task', { msg: 'PARENT_TASK_NOT_FOUND' });
              await tasks.updateOne({ taskId: newTask.parentTaskId }, { $push: { subTaskIds: newTask.taskId }});
              newTask.users = parentTask.users;
              newTask.users.forEach((userId: string) => {
                const userSocket = getUserSocket(userId);
                if (userSocket) userSocket.socket.emit('task', { msg: 'NEW', props: { task: newTask }});
              });
            } else {
              //users.updateOne({ userId: socket.data.userId }, { $push: { taskIds: newTask.taskId }});
              socket.emit('task', { msg: 'NEW', props: { task: newTask }});
            }
            await tasks.insertOne(newTask);

          } catch (error) {
            console.log(error)
          }
          return;
        }
      }
    });
  });
};
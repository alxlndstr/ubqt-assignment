import Invite from '../Invite';
import { useEffect, useState } from 'react';
const InviteContainer = ({inviteList, setInvites, socket}: InviteContainerProps) => {
  const [expanded, setExpanded] = useState(false);
  const clearInvite = (inviteId: string) => {
    const remainingInvites = inviteList.filter((_invite: TaskInvite) => _invite.inviteId != inviteId)
    setInvites([...remainingInvites]);
  }
  const replyInvite = (invite: TaskInvite, answer: boolean) => {
    if (!answer) {
      socket.emit('invite', { msg: 'REJECT', props: { inviteList }})
      return clearInvite(invite.inviteId)
    }
    const listener = (data: { msg: string, props: any }) => {
      if(data.msg != 'ACCEPTED') return;
      clearInvite(invite.inviteId);
      socket.emit('task', { msg: 'GET_ALL' });
      socket.removeListener('invite', listener);
    }
    socket.on('invite', listener)
    socket.emit('invite', { msg: 'ACCEPT', props: { invite }})
  }
  useEffect(() => {
    socket.emit('invite', { msg: 'GET_ALL' });
  }, []);
    return (
    <div className="InviteContainer">
      <button onClick={() => setExpanded(!expanded)}>Invites ({inviteList.length})</button>
      {
        expanded &&
        <div className="InviteDropDown">
          {
            inviteList.length == 0 ? <p>No invites here!</p> 
            : inviteList.map((invite: TaskInvite) => <Invite invite={invite} replyInvite={replyInvite} socket={socket} />) 
          }
        </div>
      }
    </div>
  )
}

export default InviteContainer;
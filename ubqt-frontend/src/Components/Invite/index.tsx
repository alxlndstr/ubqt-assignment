const Invite = ({replyInvite, invite}: InviteProps) => {

  return (
    <div className='Invite'>
      <h3>Invite from {invite.byUserName} to {invite.taskTitle}</h3>
      <div className='inviteActionButtons'>
        <button id='acceptInviteButton' className="positive" onClick={() => replyInvite(invite, true)}>Accept</button>
        <button id='rejectInviteButton' className="negative" onClick={() => replyInvite(invite, false)}>Reject</button>
      </div>
    </div>
  )
}
export default Invite;
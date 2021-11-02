import Overlay from '../Overlay';

const validateEmail = (email: string | null | undefined) => email && /^\w+@\w+\.\w+$/g.test(email);

const InviteUserForm = ({onSubmit, setShowInviteUserForm}: InviteUserFormParams) => {
  const submit = () => {
    const formEmail: HTMLInputElement = document.querySelector('#inputEmail')!;

    const message: HTMLElement = document.querySelector('#inviteFormMessage')!
    message.innerHTML = '';

    if(!validateEmail(formEmail.value)) {
      message.innerHTML += '<li> Please enter a valid email. </li>';
    } 
    else {
      setShowInviteUserForm(false);
      onSubmit(formEmail.value);
    }
  }

  return (
    <Overlay closeFunc={() => setShowInviteUserForm(false)}>
      <div className='InviteUserForm' id="InviteUserForm">
        <div className="InviteUserFormTop">
          <h2 className="InviteUserFormTopTitle">Invite user by email:</h2>
          { 
            setShowInviteUserForm && <button className='closeButton' onClick={() => setShowInviteUserForm(false)}>X</button> 
          }
        </div>
        <div className="InviteUserFormBody">
          <input className="InviteUserFormEmailInput" type='text' id='inputEmail' placeholder='email'></input>
          <ul id="inviteFormMessage"></ul>
          <button onClick={submit}>Add</button>
        </div>
      </div>
    </Overlay>
  )
}
export default InviteUserForm;
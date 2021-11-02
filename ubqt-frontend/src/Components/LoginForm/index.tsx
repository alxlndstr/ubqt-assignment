import { useState, useEffect } from 'react';

const validateEmail = (email: string | null | undefined) => email && /^\w+@\w+\.\w+$/g.test(email);

const getLoginCredentials = () => {
  const email = window.localStorage.getItem('email');
  const password = window.localStorage.getItem('password');
  if (!email || !password) return false;
  return {email, password};
}
const setLoginCredentials = (credentials: LoginCredentials) => {
  window.localStorage.setItem('email', credentials.email);
  window.localStorage.setItem('password', credentials.password);
}

const LoginForm = ({socket, userState, setLoggedIn}: LoginFormProps) => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    const credentials = getLoginCredentials();
    if (credentials) attemptLogin(credentials);
    socket.on('login', (data: { msg?: string, props?: { userData: { userId: string, userName: string, topLevelTaskIds: string[] }}}) => {
      switch(data.msg) {
        case 'LOGIN_SUCCESSFUL': {
          userState.setCurrentUser({
            ...data.props!.userData
          });
          socket.emit('task', { msg: 'GET_ALL' });
          setLoggedIn(true);
          break;
        }
        case 'LOGIN_FAILED': {
          const message: HTMLElement = document.querySelector('#loginFormMessage')!
          message.innerHTML += '<li> Login failed: invalid email or password! </li>';
        }
      }

    });
    socket.on('register', (data: { msg?: string, props: any }) => {
      switch (data.msg) {
        case 'USER_CREATED': return setShowRegisterForm(false);
        case 'USER_ALREADY_EXISTS': {
          const message: HTMLElement = document.querySelector('#registerFormMessage')!
          message.innerHTML += '<li> Email already registered </li>';
        }
      }
    });
  }, []);
  const attemptLogin = (credentials: LoginCredentials) => {
    setLoginCredentials(credentials);
    socket.emit('login', { props: credentials });
  }
  const getLoginCredentialsFromForm = () => {
    const formEmail: HTMLInputElement = document.querySelector('#formEmail')!;
    const formPassword: HTMLInputElement = document.querySelector('#formPassword')!;

    const message: HTMLElement = document.querySelector('#loginFormMessage')!
    message.innerHTML = '';

    if(!validateEmail(formEmail.value)) message.innerHTML += '<li> Please enter a valid email. </li>';
    if(formPassword.value.length < 4) message.innerHTML += '<li> Please enter your password. </li>';

    if (!message.children.length) return attemptLogin({email: formEmail.value, password: formPassword.value});
  }

  const attemptRegister = () => {
    const formEmail: HTMLInputElement = document.querySelector('#formEmail')!;
    const formPassword: HTMLInputElement = document.querySelector('#formPassword')!;
    const formPasswordConfirm: HTMLInputElement = document.querySelector('#formPasswordConfirm')!;
    const formUsername: HTMLInputElement = document.querySelector('#formUsername')!;

    const message: HTMLElement = document.querySelector('#registerFormMessage')!
    message.innerHTML = '';

    if (!validateEmail(formEmail.value)) message.innerHTML += '<li> Please enter a valid email. </li>';
    if (formUsername.value.length < 4) message.innerHTML += '<li> Please enter a username longer than 4 letters. </li>';
    if (formPassword.value.length < 6) message.innerHTML += '<li> Please enter a password longer than 6 letters. </li>';
    if (formPasswordConfirm.value !== formPassword?.value) message.innerHTML += '<li> Passwords do not match </li>';
    if (!message.children.length) socket.emit('register', {props: { userName: formUsername.value, email: formEmail.value, password: formPassword.value }});
  }

  if(showRegisterForm) {
    return (
      <div className="Form">
        <h2 className="FormTitle"> REGISTER </h2>
        <div className="FormInputs">
          <label htmlFor="formEmail">Email:</label>
          <input id="formEmail" type="text" placeholder="name@domain.com"></input>
          <label htmlFor="formPassword">Password:</label>
          <input id="formPassword" type="password" placeholder="********"></input>
          <label htmlFor="formPasswordConfirm">Confirm password:</label>
          <input id="formPasswordConfirm" type="password" placeholder="********"></input>
          <label htmlFor="formUsername">Username:</label>
          <input id="formUsername" type="text" placeholder="Username"></input>
        </div>
        <ul id="registerFormMessage"></ul>
        <div className="FormActions">
          <button className="positive" onClick={attemptRegister}>Register</button>
          <button onClick={() => setShowRegisterForm(false)}>Back to Login</button>
        </div>
      </div>
    )
  }
  return (
    <div className="Form">
      <h2 className="FormTitle"> LOGIN </h2>
      <div className="FormInputs">
        <label htmlFor="formEmail">Email:</label>
        <input id="formEmail" type="text" placeholder="name@domain.com"></input>
        <label htmlFor="formPassword">Password:</label>
        <input id="formPassword" type="password" placeholder="********"></input>
      </div>
      <ul id="loginFormMessage"></ul>
      <div className="FormActions">
        <button className="positive" onClick={getLoginCredentialsFromForm}>Login</button>
        <button onClick={() => setShowRegisterForm(true)}>Register</button>
      </div>
    </div>
  )
}

export default LoginForm;
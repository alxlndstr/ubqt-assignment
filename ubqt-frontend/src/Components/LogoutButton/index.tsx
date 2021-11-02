const clearLoginCredentials = () => {
  window.localStorage.removeItem('email');
  window.localStorage.removeItem('password');
}

const LogoutButton = ({logoutFunc}: LogoutButtonProps) => <button onClick={() => { clearLoginCredentials(); logoutFunc(); }}>Log out</button>
export default LogoutButton;
import logo from '../logo.svg';

export default function Login() {
    return (
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <a id="login" href="https://discord.com/api/oauth2/authorize?client_id=929695913893588994&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&response_type=code&scope=identify">Identify Yourself</a>
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
        </header>
    )
}
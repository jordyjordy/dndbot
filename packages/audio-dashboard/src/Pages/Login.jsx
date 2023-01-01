
export default function Login() {
    return (
        <header className="App-header">
            <button className="btn" onClick={() => window.location.href = process.env.REACT_APP_LOGIN_URL}>
                LOGIN
            </button>
        </header>
    )
}
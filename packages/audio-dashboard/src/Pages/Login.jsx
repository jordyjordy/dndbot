
export default function Login() {
    return (
        <header className="App-header">
            <button className="dndbtn" onClick={() => {
                    console.log(`${process.env.REACT_APP_SERVER_ADDRESS}/login?redirect=${encodeURIComponent(`${window.location.origin}/redirect`)}`);
                    window.location.href = `${process.env.REACT_APP_SERVER_ADDRESS}/login?redirect=${encodeURIComponent(`${window.location.origin}/redirect`)}`
                }}>
                LOGIN
            </button>
        </header>
    )
}
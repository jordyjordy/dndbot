
import './App.css';
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Redirect from './Pages/Redirect';
import User from './Pages/User';

function App() {

  useEffect(() => {
  }, [])

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/redirect" element={<Redirect />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

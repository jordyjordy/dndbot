import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Redirect from './Pages/Redirect';
import Overview from './Pages/Overview';
import 'bootstrap/dist/css/bootstrap.min.css';

function App (): JSX.Element {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/redirect" element={<Redirect />} />
                    <Route path="/overview" element={<Overview />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

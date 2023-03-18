import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Redirect from './Pages/Redirect';
import Overview from './Pages/Overview';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoaderSpinner from './Components/LoaderSpinner';
import { Provider } from 'react-redux';
import store from './utils/store';

function App (): JSX.Element {
    return (
        <Provider store={store}>
            <div className="App">
                <LoaderSpinner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/redirect" element={<Redirect />} />
                        <Route path="/overview" element={<Overview />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </Provider>
    );
}

export default App;

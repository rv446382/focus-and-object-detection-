import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Interview from './pages/Interview';
import Report from './pages/Report';
import Header from './components/Header';
import './styles/App.css';
import './styles/Interview.css';
import './styles/Report.css';
import './styles/Components.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Interview />} />
            <Route path="/report/:id" element={<Report />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <h1 className="logo">InterviewProctor</h1>
                <nav className="nav">
                    <a href="/" className="nav-link">New Interview</a>
                    <a href="#reports" className="nav-link">Reports</a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
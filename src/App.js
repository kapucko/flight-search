import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SearchApp from './SearchFrom';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Kiwi JS weekend</h1>
        </header>
        <p className="App-intro">
          Search for a flight.
          <SearchApp />
        </p>
      </div>
    );
  }
}

export default App;

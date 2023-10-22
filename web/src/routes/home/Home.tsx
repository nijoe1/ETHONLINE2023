import { Routes, Route, Link } from "react-router-dom";
import logo from "../../logo.svg";
import "./Home.css";
import PluginList from "../plugins/PluginList";
import CreateApp from "../zkSafePaymaster/CreateApp";

import "./Home.css";



import './Home.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Safe&#123;Core&#125; ZKSafePaymaster Plugin
        </p>
        <Link to="/zkSafePaymaster">Go to configure you ZKSafePaymaster</Link>
      </header>
    </div>
  );
}

export default Home;

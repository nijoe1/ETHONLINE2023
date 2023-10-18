import { Routes, Route, Link } from "react-router-dom";
import logo from "../../logo.svg";
import { MantineProvider, MantineThemeOverride } from "@mantine/core";

import "./Home.css";
import PluginList from "../plugins/PluginList";
import CreateApp from "../config/CreateApp";


function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} height={20} className="App-logo" alt="logo" />
        <Routes>
          <Route path="/plugins" element={<PluginList />} />
          <Route path="/config" element={<CreateApp />} />
        </Routes>
        <div>
          <Link to="/plugins">
            <button>Go to Plugins</button>
          </Link>
          <Link to="/config">
            <button>Go to Config</button>
          </Link>
        </div>
      </header>
    </div>
  );
}

export default Home;

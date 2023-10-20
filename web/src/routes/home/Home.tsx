import { Routes, Route, Link } from "react-router-dom";
import logo from "../../logo.svg";
import "./Home.css";
import PluginList from "../plugins/PluginList";
import CreateApp from "../zkSafePaymaster/CreateApp";

import "./Home.css";

function Home() {
  return (
    <div className="App">
      <Routes>
        <Route path="/plugins" element={<PluginList />} />
        <Route path="/zkSafePaymaster" element={<CreateApp />} />
      </Routes>
      <div>
        <Link to="/plugins">
          <button>Go to Plugins</button>
        </Link>
        <Link to="/zkSafePaymaster">
          <button>Go to Config</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;

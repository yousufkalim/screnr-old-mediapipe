// Init
import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { StoreProvider } from "./StoreContext";
import Routes from "./routes/index";

// Styles
import "./css/index.css";

function App() {
  return (
    <div className="App">
      {/* setting up main routing container and store container */}
      <BrowserRouter>
        <StoreProvider>
          <Routes />
        </StoreProvider>
      </BrowserRouter>
    </div>
  );
}

// Export
export default App;

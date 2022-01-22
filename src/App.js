// Init
import React from "react";
import { ToastContainer, Flip } from "react-toastify";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import PatientLayout from "./layouts/patient";
import DoctorLayout from "./layouts/doctor";
import LandingLayout from "./layouts/landing";
import { StoreProvider } from "./StoreContext";

// Files
import "./css/index.css";

// Component

function App() {
  return (
    <div className="App">
      {/* toastify Container for Notification */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
        transition={Flip}
        limit={3}
      />

      {/* setting up main routing container and store container */}
      <BrowserRouter>
        <StoreProvider>
          <Switch>
            {/* main routes */}
            <Route path="/" render={(props) => <PatientLayout {...props} />} />
          </Switch>
        </StoreProvider>
      </BrowserRouter>
    </div>
  );
}

// Export
export default App;

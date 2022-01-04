import React, { useEffect } from "react";
import { useLocation, Route, Switch } from "react-router-dom";
import { UpdateStore, Store } from "../StoreContext";
import Api from "../api/index";
import SideBar from "../components/SideBar/sidebar";
import Routes from "../routes/routes";
import FullLoader from "../components/common/FullScreenLoader";

const Doctor = (props) => {
  const location = useLocation();
  const updateStore = UpdateStore();
  const { user, loggedIn } = Store();

  useEffect(() => {
    // check if user token is valid or not
    Api("get", "/auth").then((res) => {
      updateStore({
        loggedIn: true,
        token: localStorage.getItem("token"),
        user: res.data.user,
      });
    });
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get all the routes related to the doctor
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (loggedIn) {
        if (user.role === "doctor") {
          return (
            <Route
              exact
              path={prop.layout + prop.path}
              component={prop.component}
              key={key}
            />
          );
        } else {
          return (window.location = "/patient/survey");
        }
      } else {
        return null;
      }
    });
  };

  return (
    <>
      {loggedIn ? (
        // sidebar drawer component for doctor
        <SideBar routes={Routes.DoctorRoutes}>
          <div className="main-container">
            {/* go to the default or selected route*/}
            <Switch>{getRoutes(Routes.DoctorRoutes)}</Switch>
          </div>
        </SideBar>
      ) : (
        <div>
          {/* Show loader while checking if logged in */}
          <FullLoader />
        </div>
      )}
    </>
  );
};

export default Doctor;

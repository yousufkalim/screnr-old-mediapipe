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
    // check auth
    Api("get", "/auth").then((res) => {
      updateStore({
        loggedIn: true,
        token: localStorage.getItem("token"),
        user: res.data.user,
      });
    });
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <SideBar routes={Routes.DoctorRoutes}>
          <div className="main-container">
            <Switch>{getRoutes(Routes.DoctorRoutes)}</Switch>
          </div>
        </SideBar>
      ) : (
        <div>
          <FullLoader />
        </div>
      )}
    </>
  );
};

export default Doctor;

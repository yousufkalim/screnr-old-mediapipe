// Init
import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

// Pages
import { Home } from "../pages/Home";

const index = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Redirect to="/" />
    </Switch>
  );
};

export default index;

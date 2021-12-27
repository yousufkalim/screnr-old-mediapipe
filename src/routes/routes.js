import Dashboard from "../containers/Dashboard/index";
import Patients from "../containers/Doctor/patients";
import PatientSurveys from "../containers/Doctor/survey";
import Survey from "../containers/Patient/survey";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PollIcon from "@mui/icons-material/Poll";

var DoctorRoutes = [
  {
    path: "/profile",
    name: "Dashboard",
    icon: <DashboardIcon />,
    component: Dashboard,
    layout: "/doctor",
  },
  {
    path: "/patients",
    name: "Patients",
    icon: <PersonIcon />,
    component: Patients,
    layout: "/doctor",
  },
  {
    path: "/survey",
    name: "Surveys",
    icon: <PersonIcon />,
    component: PatientSurveys,
    layout: "/doctor",
  },
];

var PatientRoutes = [
  {
    path: "/survey",
    name: "Surveys",
    icon: <PollIcon />,
    component: Survey,
    layout: "/patient",
  },
];

const Routes = {
  DoctorRoutes,
  PatientRoutes,
};

export default Routes;

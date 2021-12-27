import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../../api/index";

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    })
  );
}

// Tab component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const AnswerTypes = [
  { id: "text", label: "Text Field" },
  { id: "checkBox", label: "CheckBox" },
  { id: "multiSelect", label: "DropDown Menu" },
  { id: "multipleChoice", label: "Multiple Choice" },
  { id: "date", label: "Date" },
  { id: "time", label: "Time" },
];
// Survey Page
export default function Survey() {
  const [value, setValue] = React.useState(0);
  const [surveyForm, setSurveyForm] = React.useState([]);
  const [patient, setPatient] = React.useState("");
  const [patients, setPatients] = React.useState("");
  const [showAddQuestion, setShowAddQuestion] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [answerTypeSelect, setAnswerTypeSelect] = React.useState("");

  useEffect(() => {
    getPatients();
  }, []);

  const getPatients = async () => {
    const users = await api("get", "/users/getPatients");
    setPatients(users.data.patients);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePatientSelect = (event) => {
    setPatient(event.target.value);
    setShowAddQuestion(true);
  };
  const handleAnswerTypeSelect = (event) => {
    console.log("asdasd", event.target);
    setAnswerTypeSelect(event.target.value);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Create Survey" {...a11yProps(0)} />
          <Tab label="View Surveys" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ marginBottom: "30px" }}
            >
              Create A Survey Form
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
          <Grid
            item
            xs={12}
            md={2}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Typography variant="h6" noWrap component="div">
              Survey For:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="patientLabel">Patient</InputLabel>
              <Select
                labelId="patientLabel"
                id="patient"
                value={patient}
                label="Patient"
                onChange={handlePatientSelect}
              >
                {patients
                  ? patients.map((patient) => {
                      return (
                        <MenuItem key={patient._id} value={patient._id}>
                          {patient.name}
                        </MenuItem>
                      );
                    })
                  : null}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={12}></Grid>
        </Grid>
        {showAddQuestion ? (
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5" noWrap component="div">
                -: Add Questions :-
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" noWrap component="div">
                Question:
              </Typography>
            </Grid>
            <Grid item xs={12} md={10}>
              <TextField
                id="outlined-basic"
                variant="outlined"
                placeholder="Question Title"
                multiline
                sx={{ width: "100%" }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" noWrap component="div">
                Answer:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="answerFieldType">Field Type</InputLabel>
                <Select
                  labelId="answerFieldType"
                  id="answerFieldType"
                  value={answerTypeSelect}
                  label="Field Type"
                  onChange={handleAnswerTypeSelect}
                >
                  {AnswerTypes
                    ? AnswerTypes.map((answer) => {
                        return (
                          <MenuItem
                            key={answer.id}
                            value={answer.id}
                            name={answer.label}
                          >
                            {answer.label}
                          </MenuItem>
                        );
                      })
                    : null}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={7}></Grid>
            {answerTypeSelect && (
              <Grid
                item
                xs={12}
                md={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" noWrap component="div">
                  {answerTypeSelect}
                </Typography>
              </Grid>
            )}
          </Grid>
        ) : null}
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            {surveyForm.length > 0 ? (
              <List>
                {generate(
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary="Single-line item" />
                  </ListItem>
                )}
              </List>
            ) : null}
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
    </Box>
  );
}

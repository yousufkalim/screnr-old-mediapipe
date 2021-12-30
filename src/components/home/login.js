import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { toast } from "react-toastify";
import Api from "../../api/index";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        Screnr.com
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function SignInSide() {
  const [islogin, setIsLogin] = React.useState(true);
  const [gender, setGender] = React.useState("");
  const [role, setRole] = React.useState("");

  const handleGenderSelect = (event) => {
    setGender(event.target.value);
  };
  const handleRoleSelect = (event) => {
    setRole(event.target.value);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // eslint-disable-next-line no-console

    if (data.get("email") === "") {
      toast.error("email not found");
      return;
    }

    await Api("post", "/auth/login", {
      email: data.get("email"),
      password: data.get("password"),
    }).then((response) => {
      toast.success("Login Successful!");
      localStorage.setItem("token", response.data.token);
      if (response.data.user.role === "patient") {
        window.location = "/patient/profile";
      } else {
        window.location = "/doctor/profile";
      }
    });
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.append("gender", gender);
    data.append("role", role);
    data.append("name", data.get("firstName") + " " + data.get("lastName"));

    const response = await Api("post", "/users", data);
    // eslint-disable-next-line no-console
    if (response.statusText === "OK") {
      setIsLogin(true);
      toast.success("User has been created!");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://www.sky-futures.com/wp-content/uploads/2018/03/Artificial-Intelligence-AI-in-the-Drone-led-Industrial-Inspection-World-1080x675.png)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          {islogin ? (
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleLoginSubmit}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
                <Grid container sx={{ display: "flex", alignItems: "center" }}>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      component="h5"
                      variant="h5"
                      className="switchFormBtnText"
                    >
                      Don't have an account?
                    </Typography>
                    <Button
                      variant="text"
                      className="switchFormBtn"
                      onClick={(e) => setIsLogin(false)}
                    >
                      {" "}
                      Sign Up
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingLeft: "52px",
                paddingRight: "52px",
              }}
            >
              <Typography component="h1" variant="h5">
                Sign up
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleRegisterSubmit}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="genderLabel">Gender</InputLabel>
                      <Select
                        labelId="genderLabel"
                        id="gender"
                        value={gender}
                        label="Gender"
                        onChange={handleGenderSelect}
                      >
                        <MenuItem value={"male"}>Male</MenuItem>
                        <MenuItem value={"female"}>Female</MenuItem>
                        <MenuItem value={"other"}>Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="phone"
                      label="Phone Number"
                      name="phone"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="roledLabel">Role</InputLabel>
                      <Select
                        labelId="roledLabel"
                        id="role"
                        value={role}
                        label="Role"
                        onChange={handleRoleSelect}
                      >
                        <MenuItem value={"patient"}>Patient</MenuItem>
                        <MenuItem value={"doctor"}>Doctor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>

                <Grid container sx={{ display: "flex", alignItems: "center" }}>
                  <Grid item sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      component="h5"
                      variant="h5"
                      className="switchFormBtnText"
                    >
                      Already have an account?
                    </Typography>
                    <Button
                      variant="text"
                      className="switchFormBtn"
                      onClick={(e) => setIsLogin(true)}
                    >
                      {" "}
                      Sign in
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
          <Copyright sx={{ mt: 5 }} />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

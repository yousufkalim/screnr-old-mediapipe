import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";

export default function CircularIndeterminate() {
  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size="5rem" />
      <Typography
        sx={{
          position: "absolute",
          top: "60%",
          fontFamily: "Arial",
          letterSpacing: "1px",
        }}
      >
        Mediapipe is starting...
      </Typography>
    </Box>
  );
}

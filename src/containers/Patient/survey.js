// Init
import React from "react";
import { HolisticComponent } from "../../components/MediaPipe/Holistic";
import { PoseComponent } from "../../components/MediaPipe/Pose";
// Importing Components

// Patients Component
export default function Patients() {
  return (
    <div>
      {/* Show the pose component */}
      <PoseComponent></PoseComponent>
      {/* <HolisticComponent></HolisticComponent> */}
    </div>
  );
}

import React from "react";

const Sidebar = ({ poseSide, angles, fps, reps, phase, message }) => {
  let rep = reps[reps.length - 1];
  return (
    <div className="main_div">
      <div className="head_div">
        <h4>{fps} FPS</h4>
      </div>
      <div className="head_div">
        <h4>Pose Side</h4>
        <span>{poseSide}</span>
      </div>
      <div className="head_div">
        <h4>Shoulder Angles</h4>
        <span>
          L: {angles.shoulder?.left} - R: {angles.shoulder?.right}
        </span>
      </div>
      <div className="head_div">
        <h4>Elbow Angles</h4>
        <span>
          L: {angles.elbow?.left} - R: {angles.elbow?.right}
        </span>
      </div>
      <div className="head_div">
        <h4>Knee Angles</h4>
        <span>
          L: {angles.knee?.left} - R: {angles.knee?.right}
        </span>
      </div>
      <div className="head_div">
        <h4>Spine Angles</h4>
        <span>
          L: {angles.spine?.left} - R: {angles.spine?.right}
        </span>
      </div>
      <div className="head_div">
        <h4>Shin Angles</h4>
        <span>
          L: {angles.shin?.left} - R: {angles.shin?.right}
        </span>
      </div>
      <div className="head_div">
        <h4>OAH Angles</h4>
        <span>
          L: {angles.OAH?.left} - R: {angles.OAH?.right}
        </span>
      </div>
      <div className="head_div">
        <h4>Hip Angles</h4>
        <span>
          L: {angles.hip?.left} - R: {angles.hip?.right}
        </span>
      </div>
      <div className="head_div">
        <div>
          <h4>Rep Details</h4>
          <span>
            Phase: {phase} - Min Angle: {rep?.minAngle} - Max Angle{" "}
            {rep?.maxAngle}
          </span>
        </div>
      </div>
      <div className="head_div">
        <div>
          <h4>Message</h4>
          <span style={{ color: "rgb(250, 0, 0)" }}>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

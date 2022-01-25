import React from "react";

const Sidebar = ({ poseSide, angles, fps, reps, phase }) => {
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
        <div>
          <h4>Rep Details</h4>
          <span>
            Phase: {phase} - Min Angle: {rep?.minAngle} - Max Angle{" "}
            {rep?.maxAngle}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

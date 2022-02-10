import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as POSE from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { updateLandmarks } from "../utils/updateLandmarks";
import calculateAngles from "../utils/calculateAngles";
// import checkRules from "../utils/checkRules";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

// Connections
import left_connections from "../assets/connections/left_connections.json";
import right_connections from "../assets/connections/right_connections.json";

var camera = null;
var showPoseLandmarks = true;
var showSmoothLandmarks = true;
var landmarks = undefined; // initializing default landmarks variable to send in onResult function when loopCounter is odd
var frames = 0;

// Smooth landmarks
var frameSets = new Array();
var smoothFrame = new Array();

// Phase detection
var currentPhase = 0;
var minAngle = 100;
var maxAngle = 100;
var reps = new Array();

// Setting default cam width
window.camWidth = 1280;
window.camHeight = 720;

// Rules Data
var brokenRules = new Array();

// Pose component
export const Home = () => {
  //Initializing
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";
  const [fps, setFps] = useState(0);
  const [poseSide, setPoseSide] = useState("BACK");
  const [sessionStarted, setSessionStarted] = useState(false);
  let [message, setMessage] = useState("");
  let [loopCounter, setLoopCounter] = useState(0);
  let [takeScreenshot, setTakeScreenshot] = useState(false);
  let [image, setImage] = useState();
  let [phase, setPhase] = useState(0); // We will update this state only to track in useEffect, Cz useEffect cannot track a variable, And we are not gonna use this in rules validation, We will use currentPhase variable there.
  const [stats, setStats] = useState({
    joints: {},
    angles: {},
    leftSide: 0,
    rightSide: 0,
    phase: 0,
  });

  // Initializing the pose component and camera
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      selfieMode: false,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      // staticImageMode: true,
    });

    pose.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          setLoopCounter(loopCounter++); // Incrementing the loop counter on every frame that we are getting from webcam

          // When loop counter is even then we will call mediapipe to process the frame, That's how we are skipping every second frame
          if (loopCounter % 2 === 0) {
            await pose.send({ image: webcamRef.current.video });
          }
        },
        width: window.camWidth,
        height: window.camHeight,
      });
      camera.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Getting frames per second
  useEffect(() => {
    setInterval(() => {
      setFps(frames);
      frames = 0;
    }, 1000);
  }, []);

  // Check rules
  useEffect(() => {
    setInterval(() => {
      if (sessionStarted) {
        checkRules();
      }
    }, 4000);
  }, [sessionStarted]);

  useEffect(() => {
    if (takeScreenshot) {
      let img = webcamRef.current.getScreenshot();
      setImage(img);
    } else {
      setImage();
    }
  }, [takeScreenshot]);

  // If loop counter is odd then we will call onResult function by our own to draw previous frame's landmark
  useEffect(() => {
    if (landmarks && loopCounter % 2 !== 0) {
      onResults(landmarks);
    }
  }, [loopCounter]); // This code should run on every increment of loopCounter

  // Creating reps with rep details
  useEffect(() => {
    if (phase === 1 && minAngle < 100 && sessionStarted) {
      let repsCount = reps.length + 1;
      reps.push({ minAngle, maxAngle, repsCount });
      minAngle = 100;
      maxAngle = 100;
    }
  }, [phase]); // This code runs each time when phase update

  const onResults = (results) => {
    // FPS --> Incrementing frames variable to calculate the frames after one second, because this onResult function runs on every frame to draw landmarks
    frames++;

    landmarks = results; // Setting the result to a landmarks variable to use when we call this function odd times

    // Pushing frame at the end of frameSet array
    if (results.poseLandmarks) {
      // Disabling face landmarks by setting it's visibility to zero
      results.poseLandmarks = results.poseLandmarks.map((a, i) =>
        i < 11 ? { ...a, visibility: 0.0 } : a
      );

      frameSets.push(results.poseLandmarks);
    }

    if (frameSets.length === 8) {
      // This loop will run 33 time to make average of each joint
      for (let i = 0; i < 33; i++) {
        // Making an array of each joints coordinates
        let x = frameSets.map((a) => a[i].x);
        let y = frameSets.map((a) => a[i].y);
        let z = frameSets.map((a) => a[i].z);
        let visibility = frameSets.map((a) => a[i].visibility);

        // Sorting the array into ascending order
        x = x.sort((a, b) => a - b);
        y = y.sort((a, b) => a - b);
        z = z.sort((a, b) => a - b);
        visibility = visibility.sort((a, b) => a - b);

        // Dropping 2 min and 2 max coordinates
        x = x.slice(2, 6);
        y = y.slice(2, 6);
        z = z.slice(2, 6);
        visibility = visibility.slice(2, 6);

        // Making the average of 4 remaining coordinates
        smoothFrame[i] = {
          x: x.reduce((a, b) => a + b, 0) / x.length,
          y: y.reduce((a, b) => a + b, 0) / y.length,
          z: z.reduce((a, b) => a + b, 0) / z.length,
          visibility: visibility.reduce((a, b) => a + b, 0) / visibility.length,
        };
      }

      // Removing the first frame from frameSet
      frameSets.shift();
    }

    // after first 8 frames we have averaged coordinates, So now updating the poseLandmarks with averaged coordinates
    if (smoothFrame.length > 0 && showSmoothLandmarks) {
      results.poseLandmarks = smoothFrame;
    }

    // This function will draw the coordinates
    drawOnCanvas(results);
  };

  // Results received from the pose component
  function drawOnCanvas(results) {
    // Setting canvas dimensions
    canvasRef.current.width = window.camWidth;
    canvasRef.current.height = window.camHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.segmentationMask) {
      canvasCtx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Only overwrite existing pixels.
      if (activeEffect === "mask" || activeEffect === "both") {
        canvasCtx.globalCompositeOperation = "source-in";
        // This can be a color or a texture or whatever...
        canvasCtx.fillStyle = "#00FF007F";
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
      } else {
        canvasCtx.globalCompositeOperation = "source-out";
        canvasCtx.fillStyle = "#0000FF7F";
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
      }

      // Only overwrite missing pixels.
      canvasCtx.globalCompositeOperation = "destination-atop";
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      canvasCtx.globalCompositeOperation = "source-over";
    } else {
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
    }

    // CHECK IF RESULT CONTAINS POSE LANDMARKS
    if (results.poseLandmarks) {
      // With this function we will convert the landmarks array to an object with joint names
      const joints = updateLandmarks(results.poseLandmarks);

      // Checking phase and counting the reps
      checkPhase(calculateAngles.knee(joints));

      let angles = {
        shoulder: calculateAngles.shoulder(joints),
        elbow: calculateAngles.elbow(joints),
        knee: calculateAngles.knee(joints),
        spine: calculateAngles.spine(joints),
        shin: calculateAngles.shin(joints),
        OAH: calculateAngles.OAH(joints),
        hip: calculateAngles.hip(joints),
      };

      // Coords for left side of the body
      let leftSide =
        joints.shoulder.left_visibility +
        joints.elbow.left_visibility +
        joints.wrist.left_visibility +
        joints.hip.left_visibility +
        joints.knee.left_visibility +
        joints.ankle.left_visibility;

      // Coords for right side of the body
      let rightSide =
        joints.shoulder.right_visibility +
        joints.elbow.right_visibility +
        joints.wrist.right_visibility +
        joints.hip.right_visibility +
        joints.knee.right_visibility +
        joints.ankle.right_visibility;

      setStats({
        joints,
        angles,
        leftSide,
        rightSide,
        phase: currentPhase,
      });

      // Validate Rules
      checkPose(currentPhase, angles, leftSide, rightSide, setMessage);

      // Probability calculation for left and right sides
      let leftSideProbability = leftSide / (leftSide + rightSide);
      let rightSideProbability = rightSide / (leftSide + rightSide);

      // If both sides are facing screen, we need to draw

      if (
        leftSideProbability.toFixed(2) >= 0.57 &&
        rightSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "LEFT - " +
            "L: " +
            leftSideProbability.toFixed(2) +
            " - R: " +
            rightSideProbability.toFixed(2)
        );

        // Draw Landmarks
        drawConnectors(canvasCtx, results.poseLandmarks, right_connections, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(
          canvasCtx,
          Object.values(POSE.POSE_LANDMARKS_LEFT).map(
            (index) => results.poseLandmarks[index]
          ),
          {
            visibilityMin: 0.65,
            color: "white",
            fillColor: "orange",
            lineWidth: 3,
          }
        );
      }
      // If right side is ahead
      else if (
        rightSideProbability.toFixed(2) >= 0.57 &&
        leftSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "RIGHT - " +
            "L: " +
            leftSideProbability.toFixed(2) +
            " - R: " +
            rightSideProbability.toFixed(2)
        );

        // Draw Landmarks
        drawConnectors(canvasCtx, results.poseLandmarks, left_connections, {
          color: "white",
          lineWidth: 4,
        });
        // FACE INLINE POSE POSITIONS
        drawLandmarks(
          canvasCtx,
          Object.values(POSE.POSE_LANDMARKS_RIGHT).map(
            (index) => results.poseLandmarks[index]
          ),
          {
            visibilityMin: 0.65,
            color: "white",
            fillColor: "lightblue",
            lineWidth: 3,
          }
        );
      } else {
        setPoseSide(
          "CENTER - " +
            "L: " +
            leftSideProbability.toFixed(2) +
            " - R: " +
            rightSideProbability.toFixed(2)
        );

        // Draw Landmarks
        drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          POSE.POSE_CONNECTIONS,
          {
            color: "white",
            lineWidth: 4,
          }
        );
        drawLandmarks(
          canvasCtx,
          Object.values(POSE.POSE_LANDMARKS_LEFT).map(
            (index) => results.poseLandmarks[index]
          ),
          {
            visibilityMin: 0.65,
            color: "white",
            fillColor: "orange",
            lineWidth: 3,
          }
        );
        // FACE INLINE POSE POSITIONS
        drawLandmarks(
          canvasCtx,
          Object.values(POSE.POSE_LANDMARKS_RIGHT).map(
            (index) => results.poseLandmarks[index]
          ),
          {
            visibilityMin: 0.65,
            color: "white",
            fillColor: "lightblue",
            lineWidth: 3,
          }
        );
      }

      // taking screenshot when hand is above nose
      // if (
      //   results.poseLandmarks[20].y.toFixed(2) <
      //   results.poseLandmarks[0].y.toFixed(2)
      // ) {
      //   setTakeScreenshot(true);
      // } else if (
      //   results.poseLandmarks[19].y.toFixed(2) <
      //   results.poseLandmarks[0].y.toFixed(2)
      // ) {
      //   setTakeScreenshot(false);
      // }
    }

    canvasCtx.restore();
  }

  // Function to check phase by checking knee angle for over head squat
  const checkPhase = (kneeAngle) => {
    let { left, right } = kneeAngle;

    // If knee angle is above 110 then it's phase one otherwise it's phase 2
    if (left > 115 || right > 115) {
      // Getting max angle
      if (right > maxAngle && left > maxAngle) {
        maxAngle = right;
      }
      currentPhase = 1; // Updating currentPhase var to use in rules validation
      setPhase(1); // Updating phase state to track in useEffect
    } else if ((left < 100 || right < 100) && (left >= 25 || right >= 25)) {
      // Getting min angle
      if (right < minAngle && left < minAngle) {
        minAngle = right;
      }
      currentPhase = 2; // Updating currentPhase var to use in rules validation
      setPhase(2); // Updating phase state to track in useEffect
    }
  };

  /**
   * With this function we will check the pose of an overhead squat
   * @param {Number} phase phase can be 1 or 2
   * @param {Object} angles calculated angles from specific joints
   * @param {String} poseSide poseSide can be left, center or right
   * @return {String} error message
   */
  const checkPose = (phase, angles, leftSide, rightSide, setMessage) => {
    // Destructuring angles
    let { shoulder, shin, OAH, hip, spine } = angles;

    //   If pose side is left then we have to check angles from left side
    let visibility = leftSide < rightSide ? "right" : "left";

    // Rule 1:  If phase=1 and shoulder_angle < 170, display: "keep arms over ears"
    if (phase === 1 && shoulder[visibility] < 170) {
      setMessage("Keep arms over ears");
    }
    // Rule 2:  If phase=1 and shin_angle<175 and OAH_angle<195 then display: "stay on heels"
    else if (phase === 1 && shin[visibility] < 175 && OAH[visibility] < 195) {
      setMessage("Stay on heels");
    }
    //  Rule 3:  If phase=1 and  shin_angle<150 and OAH_angle>=185 then display: "do not let knees pass the toes"
    else if (phase === 1 && shin[visibility] < 150 && OAH[visibility] >= 185) {
      setMessage("Do not let knees pass the toes");
    }
    // Rule 4:  If phase=2 and hip_angle < 85, display: "sit hips lower"
    else if (phase === 2 && hip[visibility] < 85) {
      setMessage("Sit hips lower");
    }
    // Rule 5:  If phase=2 and spine_angle < 125, display: "keep chest up"
    else if (phase === 2 && spine[visibility] < 125) {
      setMessage("Keep chest up");
    } else {
      setMessage("");
    }
  };

  /**
   * With this function we will check the rules of an overhead squat
   * @param {Number} phase phase can be 1 or 2
   * @param {Object} angles calculated angles from specific joints
   * @param {String} poseSide poseSide can be left, center or right
   * @return {String} error message
   */
  const checkRules = () => {
    // Destructuring angles
    let { phase, leftSide, rightSide, joints, angles } = stats;
    let { shoulder, shin, OAH, hip, spine } = angles;

    //   If pose side is left then we have to check angles from left side
    let visibility = leftSide < rightSide ? "right" : "left";

    // Rule 1:  If phase=1 and shoulder_angle < 170, display: "keep arms over ears"
    if (phase === 1 && shoulder[visibility] < 170) {
      brokenRules.push({
        rule_no: 1,
        message: "Keep arms over ears",
        phase: currentPhase,
        rep_no: reps.length,
        joints: joints,
        angles: angles,
      });
    }
    // Rule 2:  If phase=1 and shin_angle<175 and OAH_angle<195 then display: "stay on heels"
    if (phase === 1 && shin[visibility] < 175 && OAH[visibility] < 195) {
      brokenRules.push({
        rule_no: 2,
        message: "Stay on heels",
        phase: currentPhase,
        rep_no: reps.length,
        joints: joints,
        angles: angles,
      });
    }
    //  Rule 3:  If phase=1 and  shin_angle<150 and OAH_angle>=185 then display: "do not let knees pass the toes"
    if (phase === 1 && shin[visibility] < 150 && OAH[visibility] >= 185) {
      brokenRules.push({
        rule_no: 3,
        message: "Do not let knees pass the toes",
        phase: currentPhase,
        rep_no: reps.length,
        joints: joints,
        angles: angles,
      });
    }
    // Rule 4:  If phase=2 and hip_angle < 85, display: "sit hips lower"
    if (phase === 2 && hip[visibility] < 85) {
      brokenRules.push({
        rule_no: 4,
        message: "Sit hips lower",
        phase: currentPhase,
        rep_no: reps.length,
        joints: joints,
        angles: angles,
      });
    }
    // Rule 5:  If phase=2 and spine_angle < 125, display: "keep chest up"
    if (phase === 2 && spine[visibility] < 125) {
      brokenRules.push({
        rule_no: 5,
        message: "Keep chest up",
        phase: currentPhase,
        rep_no: reps.length,
        joints: joints,
        angles: angles,
      });
    }
  };

  //  handleSession
  const handleSession = () => {
    if (sessionStarted) {
      setSessionStarted(false);
      console.log(brokenRules);
      console.log(reps);
    } else {
      setSessionStarted(true);
    }
  };

  return (
    <center>
      <div className="webcam">
        {/* Sidebar for statistics*/}
        <Sidebar
          poseSide={poseSide}
          angles={stats.angles}
          fps={fps}
          reps={reps}
          phase={phase}
        />

        <div className="webcam-container">
          {/* React Webcam component */}
          <Webcam
            className="webcam_main"
            ref={webcamRef}
            videoConstraints={{
              height: window.camHeight,
              width: window.camWidth,
              frameRate: { ideal: 30, max: 60 },
            }}
          />

          {/* Canvas to display th output */}
          {loopCounter === 0 ? (
            <Loader />
          ) : (
            <canvas
              id="webCan"
              ref={canvasRef}
              className="output_canvas"
            ></canvas>
          )}
        </div>

        {/* Feedback msg */}
        {message && (
          <div className="feedback_msg">
            <p>{message}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="btn-container">
          <Button
            className="show_pose_btn"
            onClick={(e) => (showPoseLandmarks = !showPoseLandmarks)}
            variant="contained"
          >
            Show Pose
          </Button>

          <Button
            className="toggle_smooth_btn"
            onClick={handleSession}
            variant="contained"
          >
            {sessionStarted ? "Session end" : "Session start"}
          </Button>
        </div>
      </div>

      {image && (
        <img
          style={{
            position: "absolute",
            zIndex: 20,
            left: 260,
            top: 100,
            width: "300px",
            height: "300px",
          }}
          src={image}
        />
      )}
    </center>
  );
};

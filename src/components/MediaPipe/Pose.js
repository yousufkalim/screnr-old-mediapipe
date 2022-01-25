import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as POSE from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { updateLandmarks } from "../../utils/updateLandmarks";
import calculateAngles from "../../utils/calculateAngles";
import checkRules from "../../utils/checkRules";
import Sidebar from "../common/Sidebar";

var camera = null;
var showPoseLandmarks = true;
var showSmoothLandmarks = true;
var landmarks = undefined; // initializing default landmarks variable to send in onResult function when loopCounter is odd
var frames = 0;

// Smooth landmarks
var frameSets = new Array();
var smoothFrame = new Array();

// Phase detection
// var phase = 0;
var minAngle = 100;
var maxAngle = 100;
var reps = new Array();

// Pose component
export const PoseComponent = () => {
  //Initializing
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";
  const [fps, setFps] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [poseSide, setPoseSide] = useState("BACK");
  const [angles, setAngles] = useState({});
  let [message, setMessage] = useState("");
  let [loopCounter, setLoopCounter] = useState(0);
  let [takeScreenshot, setTakeScreenshot] = useState(false);
  let [image, setImage] = useState();
  let [phase, setPhase] = useState(0);

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
        width: 1280,
        height: 720,
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

  // Getting current width if width changes
  useEffect(() => {
    setCurrentWidth(window.screen.width);
  }, [window.screen.width]);

  // Creating reps with rep details
  useEffect(() => {
    if (phase === 1 && minAngle < 100) {
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
    // const video = webcamRef.current.video;
    const videoWidth = 1280;
    // window.screen.width < 600 ? 1280 : webcamRef.current.video.videoWidth;
    const videoHeight = 720;
    // window.screen.width < 600 ? 720 : webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

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

      let calculatedAngles = {
        shoulder: calculateAngles.shoulder(joints),
        elbow: calculateAngles.elbow(joints),
        knee: calculateAngles.knee(joints),
        spine: calculateAngles.spine(joints),
        shin: calculateAngles.shin(joints),
        OAH: calculateAngles.OAH(joints),
        hip: calculateAngles.hip(joints),
      };

      setAngles(calculatedAngles);

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

      // Probability calculation for left and right sides
      let leftSideProbability = leftSide / (leftSide + rightSide);
      let rightSideProbability = rightSide / (leftSide + rightSide);

      // If both sides are facing screen, show center
      if (
        leftSideProbability.toFixed(2) <= 0.52 &&
        rightSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "CENTER - " +
            "L: " +
            leftSideProbability.toFixed(2) +
            " - R: " +
            rightSideProbability.toFixed(2)
        );
        // Validate Rules
        setMessage(checkRules(phase, calculatedAngles, "center"));
      }
      // If left side is ahead
      else if (
        leftSideProbability.toFixed(2) >= 0.56 &&
        rightSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "LEFT - " +
            "L: " +
            leftSideProbability.toFixed(2) +
            " - R: " +
            rightSideProbability.toFixed(2)
        );

        // Validate Rules
        setMessage(checkRules(phase, calculatedAngles, "left"));
      }
      // If right side is ahead
      else if (
        rightSideProbability.toFixed(2) >= 0.56 &&
        leftSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "RIGHT - " +
            "L: " +
            leftSideProbability.toFixed(2) +
            " - R: " +
            rightSideProbability.toFixed(2)
        );

        // Validate Rules
        setMessage(checkRules(phase, calculatedAngles, "right"));
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

      // Drawing landmarks
      if (showPoseLandmarks) {
        drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          POSE.POSE_CONNECTIONS,
          { color: "white", lineWidth: 4 }
        );
        // FACE INLINE POSE POSITIONS
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

      // Checking phase and counting the reps
      checkPhase(calculateAngles.knee(joints));
    }

    canvasCtx.restore();
  }

  // Function to check phase by checking knee angle for over head squat
  const checkPhase = (kneeAngle) => {
    let { left, right } = kneeAngle;

    // If knee angle is above 110 then it's phase one otherwise it's phase 2
    if (left > 100 && right > 100) {
      // Getting max angle
      if (right > maxAngle && left > maxAngle) {
        maxAngle = right;
      }
      setPhase(1); // Phase update
    } else if (left <= 100 && right <= 100 && left >= 33 && right >= 33) {
      // Getting min angle
      if (right < minAngle && left < minAngle) {
        minAngle = right;
      }
      setPhase(2); // Phase update
    }
  };

  return (
    <center>
      <div className="webCan">
        {/* React Webcam component */}
        <Webcam
          className="webcam_main"
          ref={webcamRef}
          videoConstraints={{
            height: 720,
            width: 1280,
            frameRate: { ideal: 30, max: 60 },
          }}
        />
        {/* side menubar */}
        <Sidebar
          poseSide={poseSide}
          angles={angles}
          fps={fps}
          reps={reps}
          phase={phase}
          message={message}
        />

        {/* Canvas to display th output */}
        <canvas id="webCan" ref={canvasRef} className="output_canvas"></canvas>

        <Button
          className="show_pose_btn"
          onClick={(e) => (showPoseLandmarks = !showPoseLandmarks)}
          variant="contained"
        >
          Show Pose
        </Button>

        <Button
          className="toggle_smooth_btn"
          onClick={(e) => (showSmoothLandmarks = !showSmoothLandmarks)}
          variant="contained"
        >
          {showSmoothLandmarks ? "Turn smooth off" : "Turn smooth on"}
        </Button>
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

import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as POSE from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

var camera = null;
var showPoseLandmarks = true;
var landmarks = undefined; // initializing default landmarks variable to send in onResult function when loopCounter is odd
var frames = 0;

// Pose component
export const PoseComponent = () => {
  //Initializing
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";
  const [fps, setFps] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [poseSide, setPoseSide] = useState("BACK");
  let [loopCounter, setLoopCounter] = useState(0);
  let [takeScreenshot, setTakeScreenshot] = useState(false);
  let [image, setImage] = useState();

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

  // Results recieved from the pose component
  function onResults(results) {
    // FPS --> Incrementing frames variable to calculate the frames after one second, because this onResult function runs on every frame to draw landmarks
    frames++;

    landmarks = results; // Setting the result to a landmarks variable to use when we call this function odd times

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
      // Angle Detection

      const left_knee_joint_angle_radians =
        Math.abs(
          Math.atan2(
            results.poseLandmarks[27].y - results.poseLandmarks[25].y,
            results.poseLandmarks[27].x - results.poseLandmarks[25].x
          )
        ) -
        Math.atan2(
          results.poseLandmarks[23].y - results.poseLandmarks[25].y,
          results.poseLandmarks[23].x - results.poseLandmarks[25].x
        );
      const left_knee_joint_angle_degrees = Math.round(
        (left_knee_joint_angle_radians * 180.0) / Math.PI,
        1
      );

      const right_knee_joint_angle_radians =
        Math.abs(
          Math.atan2(
            results.poseLandmarks[28].y - results.poseLandmarks[26].y,
            results.poseLandmarks[28].x - results.poseLandmarks[26].x
          )
        ) -
        Math.atan2(
          results.poseLandmarks[24].y - results.poseLandmarks[26].y,
          results.poseLandmarks[24].x - results.poseLandmarks[26].x
        );
      const right_knee_joint_angle_degrees = Math.round(
        (right_knee_joint_angle_radians * 180.0) / Math.PI,
        1
      );

      console.log(
        "knee_joint_angle_degrees",
        left_knee_joint_angle_degrees,
        right_knee_joint_angle_degrees
      );
      // Coords for left side of the body
      let leftSide =
        results.poseLandmarks[11].visibility +
        results.poseLandmarks[13].visibility +
        results.poseLandmarks[15].visibility +
        results.poseLandmarks[23].visibility +
        results.poseLandmarks[25].visibility +
        results.poseLandmarks[27].visibility;

      // Coords for right side of the body
      let rightSide =
        results.poseLandmarks[12].visibility +
        results.poseLandmarks[14].visibility +
        results.poseLandmarks[16].visibility +
        results.poseLandmarks[24].visibility +
        results.poseLandmarks[26].visibility +
        results.poseLandmarks[28].visibility;

      // Probability calculation for left and right sides
      let leftSideProbability = leftSide / (leftSide + rightSide);
      let rightSideProbability = rightSide / (leftSide + rightSide);

      // If both sides are facing screen, show center
      if (
        leftSideProbability.toFixed(2) <= 0.52 &&
        rightSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "CENTER " +
            "R: " +
            rightSideProbability.toFixed(2) +
            " L: " +
            leftSideProbability.toFixed(2)
        );
      }
      // If left side is ahead
      else if (
        leftSideProbability.toFixed(2) >= 0.56 &&
        rightSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "LEFT " +
            "R: " +
            rightSideProbability.toFixed(2) +
            " L: " +
            leftSideProbability.toFixed(2)
        );
      }
      // If right side is ahead
      else if (
        rightSideProbability.toFixed(2) >= 0.56 &&
        leftSideProbability.toFixed(2) <= 0.52
      ) {
        setPoseSide(
          "RIGHT " +
            "R: " +
            rightSideProbability.toFixed(2) +
            " L: " +
            leftSideProbability.toFixed(2)
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

      // Drawing landmarks
      if (showPoseLandmarks) {
        drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          POSE.POSE_CONNECTIONS,
          { color: "white", lineWidth: 1 }
        );
        // FACE INLINE POSE POSITIONS
        drawLandmarks(
          canvasCtx,
          Object.values(POSE.POSE_LANDMARKS_LEFT).map(
            (index) => results.poseLandmarks[index]
          ),
          {
            visibilityMin: 0.65,
            color: "transparent",
            fillColor: "transparent",
            lineWidth: 1,
          }
        );
        drawLandmarks(
          canvasCtx,
          Object.values(POSE.POSE_LANDMARKS_RIGHT).map(
            (index) => results.poseLandmarks[index]
          ),
          {
            visibilityMin: 0.65,
            color: "transparent",
            fillColor: "transparent",
            lineWidth: 1,
          }
        );
      }
    }

    canvasCtx.restore();
  }

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
        {/* Canvas to display th output */}
        <canvas id="webCan" ref={canvasRef} className="output_canvas"></canvas>

        {/* Button To show or hide pose */}
        <h4
          className="show_pose_side"
          style={{
            color: window.screen.width < 600 ? "black" : "white",
          }}
        >
          Pose Side: <div style={{ color: "red" }}>{poseSide}</div>{" "}
        </h4>

        <Button
          className="show_pose_btn"
          onClick={(e) => (showPoseLandmarks = !showPoseLandmarks)}
          variant="contained"
        >
          Show Pose
        </Button>
      </div>

      {/* Showing the frames per second */}
      <h1
        className="show_fps"
        style={{
          textAlign: "right",
          color: window.screen.width < 600 ? "black" : "white",
        }}
      >
        {fps} FPS
      </h1>
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

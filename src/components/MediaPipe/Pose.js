import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as POSE from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

var captured = false;
var camera = null;
var pose_side = "";
var showPoseLandmarks = true;

// Pose component
export const PoseComponent = () => {
  //Initializing
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";
  const [fps, setFps] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [poseSide, setPoseSide] = useState("BACK");
  let landmarks = [];
  let loopCounter = 0;

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
          loopCounter++;
          if (loopCounter % 2 === 0) {
            await pose.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Getting frames per second
  useEffect(() => {
    setInterval(() => {
      setFps(landmarks.length);
      landmarks = [];
    }, 1000);
  }, []);

  useEffect(() => {
    if (loopCounter % 2 !== 0) {
      onResults(landmarks.pop());
    }
  }, [landmarks]);

  // Getting current width if width changes
  useEffect(() => {
    setCurrentWidth(window.screen.width);
  }, [window.screen.width]);

  // Results recieved from the pose component
  function onResults(results) {
    // FPS --> Pushing a string into frames array in order to get it's length after one second
    landmarks.push(results);

    // const video = webcamRef.current.video;
    const videoWidth =
      window.screen.width < 600 ? 300 : webcamRef.current.video.videoWidth;
    const videoHeight =
      window.screen.width < 600 ? 380 : webcamRef.current.video.videoHeight;

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

    // CHECK IF ITS THE POSE
    if (results.poseLandmarks) {
      let leftSide =
        results.poseLandmarks[11].visibility +
        results.poseLandmarks[13].visibility +
        results.poseLandmarks[15].visibility +
        results.poseLandmarks[23].visibility +
        results.poseLandmarks[25].visibility +
        results.poseLandmarks[27].visibility;

      let rightSide =
        results.poseLandmarks[12].visibility +
        results.poseLandmarks[14].visibility +
        results.poseLandmarks[16].visibility +
        results.poseLandmarks[24].visibility +
        results.poseLandmarks[26].visibility +
        results.poseLandmarks[28].visibility;

      let leftSideProbability = leftSide / (leftSide + rightSide);
      let rightSideProbability = rightSide / (leftSide + rightSide);

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
      } else if (
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
      } else if (
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

  const handleReset = () => {
    var resetDiv = document.getElementById("POSE");
    resetDiv.innerHTML = "";
    captured = false;
  };

  return (
    <center>
      <div className="webCan">
        {/* React Webcam component */}
        <Webcam className="webcam_main" ref={webcamRef} />
        {/* Canvas to display th output */}
        <canvas id="webCan" ref={canvasRef} className="output_canvas"></canvas>

        {/* Button To show or hide pose */}
        <h4 className="show_pose_side">
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
      <h1 className="show_fps" style={{ textAlign: "right" }}>
        {fps} FPS
      </h1>
    </center>
  );
};

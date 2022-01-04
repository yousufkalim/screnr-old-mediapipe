import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as POSE from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

var captured = false;
var camera = null;
var showPoseLandmarks = true;

export const PoseComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";
  const [fps, setFps] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  let frames = [];

  useEffect(() => {
    setInterval(() => {
      setFps(frames.length);
      frames = [];
    }, 1000);
  }, []);

  useEffect(() => {
    setCurrentWidth(window.screen.width);
  }, [window.screen.width]);

  function onResults(results) {
    // FPS --> Pushing a string into frames array in order to get it's length after one second
    frames.push("frame");

    // const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.width;
    const videoHeight = webcamRef.current.video.height;

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

      console.log(
        "left:",
        leftSideProbability.toFixed(2),
        "right:",
        rightSideProbability.toFixed(2)
      );

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
          await pose.send({ image: webcamRef.current.video });
        },
        width: webcamRef.current.video.width,
        height: webcamRef.current.video.height,
      });
      camera.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <center>
      <div className="webCan">
        <Webcam
          className="webcam_main"
          ref={webcamRef}
          width={currentWidth < 600 ? 300 : 480}
          height={currentWidth < 600 ? 400 : 320}
        />
        <canvas id="webCan" ref={canvasRef} className="output_canvas"></canvas>

        <Button
          className="show_pose_btn"
          onClick={(e) => (showPoseLandmarks = !showPoseLandmarks)}
          variant="contained"
        >
          Show Pose
        </Button>
      </div>
      <h1 className="show_fps" style={{ textAlign: "right" }}>
        {fps} FPS
      </h1>
    </center>
  );
};

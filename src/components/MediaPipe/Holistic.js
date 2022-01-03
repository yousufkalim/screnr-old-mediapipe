import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
// import html2canvas from "html2canvas";
import Button from "@mui/material/Button";
import { Holistic } from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import * as HolistiC from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

var captured = false;
var camera = null;
var showPoseLandmarks = true;
var showHandsLandmarks = false;
var showFaceLandmarks = false;

export const HolisticComponent = () => {
  const [fps, setFps] = useState(0);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";
  let frames = [];

  // Calculating fps after every one second
  useEffect(() => {
    setInterval(() => {
      setFps(frames.length);
      frames = [];
    }, 1000);
  }, []);

  function onResults(results) {
    // FPS --> Pushing a string into frames array in order to get it's length after one second
    frames.push("frame");

    // const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // CREATING A MASK
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
    canvasCtx.lineWidth = 0.5;

    // Connect elbows to hands. Do this first so that the other graphics will draw
    // on top of these marks.

    // if (results.poseLandmarks) {
    //   if (results.rightHandLandmarks) {
    //     canvasCtx.strokeStyle = 'white';
    //     connect(canvasCtx, [[
    //               results.poseLandmarks[Holistic.POSE_LANDMARKS.RIGHT_ELBOW],
    //               results.rightHandLandmarks[0]
    //             ]]);
    //   }
    //   if (results.leftHandLandmarks) {
    //     canvasCtx.strokeStyle = 'white';
    //     connect(canvasCtx, [[
    //               results.poseLandmarks[Holistic.POSE_LANDMARKS.LEFT_ELBOW],
    //               results.leftHandLandmarks[0]
    //             ]]);
    //   }
    // }

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

      // console.log(
      //   "left:",
      //   leftSideProbability.toFixed(2),
      //   "right:",
      //   rightSideProbability.toFixed(2)
      // );

      if (showPoseLandmarks) {
        drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          HolistiC.POSE_CONNECTIONS,
          { color: "white", lineWidth: 1 }
        );
        // FACE INLINE POSE POSITIONS
        drawLandmarks(
          canvasCtx,
          Object.values(HolistiC.POSE_LANDMARKS_LEFT).map(
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
          Object.values(HolistiC.POSE_LANDMARKS_RIGHT).map(
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

    // CHECK IF ITS THE RIGHT HAND
    if (results.rightHandLandmarks) {
      if (
        results.rightHandLandmarks[5].y.toFixed(2) <
          results.rightHandLandmarks[16].y.toFixed(2) &&
        results.rightHandLandmarks[9].y.toFixed(2) <
          results.rightHandLandmarks[20].y.toFixed(2) &&
        results.rightHandLandmarks[12].y.toFixed(2) <
          results.rightHandLandmarks[8].y.toFixed(2) &&
        results.rightHandLandmarks[8].y.toFixed(2) <
          results.rightHandLandmarks[7].y.toFixed(2) &&
        results.rightHandLandmarks[12].y.toFixed(2) <
          results.rightHandLandmarks[11].y.toFixed(2) &&
        results.rightHandLandmarks[4].y.toFixed(2) <
          results.rightHandLandmarks[16].y.toFixed(2) &&
        results.rightHandLandmarks[4].y.toFixed(2) <
          results.rightHandLandmarks[20].y.toFixed(2)
      ) {
        // GET SCREENSHOT OF CURRENT CANVAS
        // if (!captured) {
        //   let domElement = document.getElementById("webCan");
        //   html2canvas(domElement).then((canvas) => {
        //     document.getElementById("holistic").appendChild(canvas);
        //   });
        //   captured = true;
        // }
      }
      if (showHandsLandmarks) {
        drawConnectors(
          canvasCtx,
          results.rightHandLandmarks,
          HolistiC.HAND_CONNECTIONS,
          { color: "white", lineWidth: 0.5 }
        );
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {
          color: "white",
          fillColor: "rgb(0,217,231)",
          lineWidth: 0.5,
        });
      }
    }

    // CHECK IF ITS THE LEFT HAND
    if (results.leftHandLandmarks) {
      if (
        results.leftHandLandmarks[5].y.toFixed(2) <
          results.leftHandLandmarks[16].y.toFixed(2) &&
        results.leftHandLandmarks[9].y.toFixed(2) <
          results.leftHandLandmarks[20].y.toFixed(2) &&
        results.leftHandLandmarks[12].y.toFixed(2) <
          results.leftHandLandmarks[8].y.toFixed(2) &&
        results.leftHandLandmarks[8].y.toFixed(2) <
          results.leftHandLandmarks[7].y.toFixed(2) &&
        results.leftHandLandmarks[12].y.toFixed(2) <
          results.leftHandLandmarks[11].y.toFixed(2) &&
        results.leftHandLandmarks[4].y.toFixed(2) <
          results.leftHandLandmarks[16].y.toFixed(2) &&
        results.leftHandLandmarks[4].y.toFixed(2) <
          results.leftHandLandmarks[20].y.toFixed(2)
      ) {
        // RSEST SCREENSHOT OF CURRENT CANVAS
        handleReset();
      }
      if (showHandsLandmarks) {
        drawConnectors(
          canvasCtx,
          results.leftHandLandmarks,
          HolistiC.HAND_CONNECTIONS,
          { color: "white", lineWidth: 0.5 }
        );
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {
          color: "white",
          fillColor: "rgb(255,138,0)",
          lineWidth: 0.5,
        });
      }
    }

    // CHECK IF ITS THE FACE
    if (results.faceLandmarks) {
      if (showFaceLandmarks) {
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_TESSELATION,
          { color: "cyan", lineWidth: 0.4 }
        );
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_RIGHT_EYE,
          { color: "cyan", lineWidth: 0.4 }
        );
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_RIGHT_EYEBROW,
          { color: "cyan", lineWidth: 0.4 }
        );
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_LEFT_EYE,
          { color: "cyan", lineWidth: 0.4 }
        );
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_LEFT_EYEBROW,
          { color: "cyan", lineWidth: 0.4 }
        );
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_FACE_OVAL,
          { color: "white", lineWidth: 0.4 }
        );
        drawConnectors(
          canvasCtx,
          results.faceLandmarks,
          HolistiC.FACEMESH_LIPS,
          {
            color: "cyan",
            lineWidth: 0.4,
          }
        );
      }
    }

    canvasCtx.restore();
  }
  const handleReset = () => {
    var resetDiv = document.getElementById("holistic");
    resetDiv.innerHTML = "";
    captured = false;
  };

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });

    holistic.setOptions({
      // selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      // staticImageMode: true,
    });

    holistic.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 480,
        height: 320,
      });
      camera.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <center>
      <div className="webCan">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 480,
            height: 320,
          }}
        />
        <canvas
          id="webCan"
          ref={canvasRef}
          className="output_canvas"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 480,
            height: 320,
          }}
        ></canvas>

        <Button
          style={{
            position: "absolute",
            right: 30,
            top: 170,
            zindex: 10,
            width: 130,
          }}
          onClick={(e) => (showPoseLandmarks = !showPoseLandmarks)}
          variant="contained"
        >
          Show Pose
        </Button>

        <Button
          style={{
            position: "absolute",
            right: 30,
            top: 230,
            zindex: 10,
            width: 130,
          }}
          onClick={(e) => (showHandsLandmarks = !showHandsLandmarks)}
          variant="contained"
        >
          Show Hands
        </Button>
        <Button
          style={{
            position: "absolute",
            right: 30,
            top: 290,
            zindex: 10,
            width: 130,
          }}
          onClick={(e) => (showFaceLandmarks = !showFaceLandmarks)}
          variant="contained"
        >
          Show Face
        </Button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "0",
        }}
      >
        <div id="holistic"></div>
      </div>
      <h1 style={{ textAlign: "right" }}>{fps} FPS</h1>
    </center>
  );
};

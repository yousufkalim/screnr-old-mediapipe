import React, { useRef, useEffect } from "react";
import { Holistic } from "@mediapipe/holistic";
import * as HolistiC from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";

export const HolisticComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";

  var camera = null;
  function onResults(results) {
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

    // Connect elbows to hands. Do this first so that the other graphics will draw
    // on top of these marks.
    canvasCtx.lineWidth = 0.5;
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

    // Pose...
    drawConnectors(
      canvasCtx,
      results.poseLandmarks,
      HolistiC.POSE_CONNECTIONS,
      { color: "white" }
    );
    drawLandmarks(
      canvasCtx,
      Object.values(HolistiC.POSE_LANDMARKS_LEFT).map(
        (index) => results.poseLandmarks[index]
      ),
      {
        visibilityMin: 0.65,
        color: "white",
        fillColor: "rgb(255,138,0)",
        lineWidth: 0.5,
      }
    );
    drawLandmarks(
      canvasCtx,
      Object.values(HolistiC.POSE_LANDMARKS_RIGHT).map(
        (index) => results.poseLandmarks[index]
      ),
      {
        visibilityMin: 0.65,
        color: "white",
        fillColor: "rgb(0,217,231)",
        lineWidth: 0.5,
      }
    );

    // Hands...
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

    // Face...
    drawConnectors(
      canvasCtx,
      results.faceLandmarks,
      HolistiC.FACEMESH_TESSELATION,
      { color: "#C0C0C070", lineWidth: 0.4 }
    );
    drawConnectors(
      canvasCtx,
      results.faceLandmarks,
      HolistiC.FACEMESH_RIGHT_EYE,
      { color: "rgb(0,217,231)", lineWidth: 0.4 }
    );
    drawConnectors(
      canvasCtx,
      results.faceLandmarks,
      HolistiC.FACEMESH_RIGHT_EYEBROW,
      { color: "rgb(0,217,231)", lineWidth: 0.4 }
    );
    drawConnectors(
      canvasCtx,
      results.faceLandmarks,
      HolistiC.FACEMESH_LEFT_EYE,
      { color: "rgb(255,138,0)", lineWidth: 0.4 }
    );
    drawConnectors(
      canvasCtx,
      results.faceLandmarks,
      HolistiC.FACEMESH_LEFT_EYEBROW,
      { color: "rgb(255,138,0)", lineWidth: 0.4 }
    );
    drawConnectors(
      canvasCtx,
      results.faceLandmarks,
      HolistiC.FACEMESH_FACE_OVAL,
      { color: "#E0E0E0", lineWidth: 0.4 }
    );
    drawConnectors(canvasCtx, results.faceLandmarks, HolistiC.FACEMESH_LIPS, {
      color: "#E0E0E0",
      lineWidth: 0.4,
    });

    canvasCtx.restore();
  }

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });

    holistic.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
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
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);
  return (
    <center>
      <div className="App">
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
            width: 640,
            height: 480,
          }}
        />{" "}
        <canvas
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
            width: 640,
            height: 480,
          }}
        ></canvas>
      </div>
    </center>
  );
};

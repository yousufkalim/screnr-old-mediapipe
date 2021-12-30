import React, { useRef, useEffect } from "react";
import { Holistic } from "@mediapipe/holistic";
import * as HolistiC from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";

var captured = false;
var camera = null;

export const HolisticComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let activeEffect = "mask";

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
      drawConnectors(
        canvasCtx,
        results.poseLandmarks,
        HolistiC.POSE_CONNECTIONS,
        { color: "white", lineWidth: 0.5 }
      );

      // FACE INLINE POSE POSITIONS (currently commented due to mask)
      // drawLandmarks(
      //   canvasCtx,
      //   Object.values(HolistiC.POSE_LANDMARKS_LEFT).map(
      //     (index) => results.poseLandmarks[index]
      //   ),
      //   {
      //     visibilityMin: 0.65,
      //     color: "white",
      //     fillColor: "rgb(255,138,0)",
      //     lineWidth: 0.5,
      //   }
      // );
      // drawLandmarks(
      //   canvasCtx,
      //   Object.values(HolistiC.POSE_LANDMARKS_RIGHT).map(
      //     (index) => results.poseLandmarks[index]
      //   ),
      //   {
      //     visibilityMin: 0.65,
      //     color: "white",
      //     fillColor: "rgb(0,217,231)",
      //     lineWidth: 0.5,
      //   }
      // );
    }

    // CHECK IF ITS THE RIGHT HAND
    if (results.rightHandLandmarks) {
      console.log(
        "test",
        // results.rightHandLandmarks[6].y.toFixed(2),
        // results.rightHandLandmarks[16].y.toFixed(2),
        // results.rightHandLandmarks[10].y.toFixed(2),
        // results.rightHandLandmarks[20].y.toFixed(2),
        results.rightHandLandmarks[6].y.toFixed(2) <
          results.rightHandLandmarks[16].y.toFixed(2),
        results.rightHandLandmarks[10].y.toFixed(2) <
          results.rightHandLandmarks[20].y.toFixed(2),
        results.rightHandLandmarks[12].y.toFixed(2) <
          results.rightHandLandmarks[8].y.toFixed(2),
        results.rightHandLandmarks[8].y.toFixed(2) <
          results.rightHandLandmarks[7].y.toFixed(2),
        results.rightHandLandmarks[12].y.toFixed(2) <
          results.rightHandLandmarks[11].y.toFixed(2),
        results.rightHandLandmarks[4].y.toFixed(2) <
          results.rightHandLandmarks[16].y.toFixed(2),
        results.rightHandLandmarks[4].y.toFixed(2) <
          results.rightHandLandmarks[20].y.toFixed(2)
      );

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
        if (!captured) {
          let domElement = document.getElementById("webCan");
          html2canvas(domElement).then((canvas) => {
            document.getElementById("holistic").appendChild(canvas);
          });
          captured = true;
        }
        // console.log("true");
      }

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
    }

    // CHECK IF ITS THE LEFT HAND
    if (results.leftHandLandmarks) {
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

    // CHECK IF ITS THE FACE
    if (results.faceLandmarks) {
      // Face...
      drawConnectors(
        canvasCtx,
        results.faceLandmarks,
        HolistiC.FACEMESH_TESSELATION,
        { color: "white", lineWidth: 0.4 }
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
        { color: "cyan", lineWidth: 0.4 }
      );
      drawConnectors(canvasCtx, results.faceLandmarks, HolistiC.FACEMESH_LIPS, {
        color: "cyan",
        lineWidth: 0.4,
      });
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
      selfieMode: true,
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
        width: "50%",
        height: "50%",
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
            width: "50%",
            height: "50%",
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
            width: "50%",
            height: "50%",
          }}
        ></canvas>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "0",
        }}
      >
        <div id="holistic"></div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "0",
        }}
      >
        <button onClick={handleReset}>Reset</button>
      </div>
    </center>
  );
};

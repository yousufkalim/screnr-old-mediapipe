/**
 * Convert Landmarks
 * @author Yousuf Kalim
 */

/**
 * With this function we will convert the landmarks array to an object with joint names
 * @param {Array} result
 * @return {object}
 */
export const updateLandmarks = (result) => {
  return {
    nose: {
      self: [result[0].x, result[0].y],
      visibility: result[0].visibility,
    },
    eye: {
      left: [result[2].x, result[2].y],
      left_visibility: result[2].visibility,
      right: [result[5].x, result[5].y],
      right_visibility: result[5].visibility,
    },
    ear: {
      left: [result[7].x, result[7].y],
      left_visibility: result[7].visibility,
      right: [result[8].x, result[8].y],
      right_visibility: result[8].visibility,
    },
    mouth: {
      left: [result[9].x, result[9].y],
      left_visibility: result[9].visibility,
      right: [result[10].x, result[10].y],
      right_visibility: result[10].visibility,
    },
    shoulder: {
      left: [result[11].x, result[11].y],
      left_visibility: result[11].visibility,
      right: [result[12].x, result[12].y],
      right_visibility: result[12].visibility,
    },
    elbow: {
      left: [result[13].x, result[13].y],
      left_visibility: result[13].visibility,
      right: [result[14].x, result[14].y],
      right_visibility: result[14].visibility,
    },
    wrist: {
      left: [result[15].x, result[15].y],
      left_visibility: result[15].visibility,
      right: [result[16].x, result[16].y],
      right_visibility: result[16].visibility,
    },
    pinky: {
      left: [result[17].x, result[17].y],
      left_visibility: result[17].visibility,
      right: [result[18].x, result[18].y],
      right_visibility: result[18].visibility,
    },
    index: {
      left: [result[19].x, result[19].y],
      left_visibility: result[19].visibility,
      right: [result[20].x, result[20].y],
      right_visibility: result[20].visibility,
    },
    thumb: {
      left: [result[21].x, result[21].y],
      left_visibility: result[21].visibility,
      right: [result[22].x, result[22].y],
      right_visibility: result[22].visibility,
    },
    hip: {
      left: [result[23].x, result[23].y],
      left_visibility: result[23].visibility,
      right: [result[24].x, result[24].y],
      right_visibility: result[24].visibility,
    },
    knee: {
      left: [result[25].x, result[25].y],
      left_visibility: result[25].visibility,
      right: [result[26].x, result[26].y],
      right_visibility: result[26].visibility,
    },
    ankle: {
      left: [result[27].x, result[27].y],
      left_visibility: result[27].visibility,
      right: [result[28].x, result[28].y],
      right_visibility: result[28].visibility,
    },
    heel: {
      left: [result[29].x, result[29].y],
      left_visibility: result[29].visibility,
      right: [result[30].x, result[30].y],
      right_visibility: result[30].visibility,
    },
    foot: {
      left: [result[31].x, result[31].y],
      left_visibility: result[31].visibility,
      right: [result[32].x, result[32].y],
      right_visibility: result[32].visibility,
    },
  };
};

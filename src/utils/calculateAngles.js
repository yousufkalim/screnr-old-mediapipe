/**
 * Calculate Pose Angles
 * @author Yousuf Kalim
 */

/**
 * With this function we will calculate the degrees of an angle
 * @param {Number} x1 first joint's x axis
 * @param {Number} y1 first joint's y axis
 * @param {Number} x2 second joint's x axis
 * @param {Number} y2 second joint's y axis
 * @param {Number} x3 third joint's x axis
 * @param {Number} y3 third joint's y axis
 * @param {Boolean} small boolean value to check if we have to return lower or upper angles
 * @param {Boolean} round boolean value to check if we have to return round
 * @return {Number} degree 0 to 360
 */
const calculateDegrees = (
  x1,
  y1,
  x2,
  y2,
  x3,
  y3,
  small = true,
  round = true
) => {
  // Converting normalized landmarks to pixels
  x1 = x1 * window.camWidth;
  y1 = y1 * window.camHeight;
  x2 = x2 * window.camWidth;
  y2 = y2 * window.camHeight;
  x3 = x3 * window.camWidth;
  y3 = y3 * window.camHeight;

  // Making the radians from joint angles
  const A = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const B = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
  const C = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));
  const joint_angle_radians = Math.acos((B * B + A * A - C * C) / (2 * B * A));

  // Making the degree from radians angle
  let joint_angle_degrees = Math.round(
    (joint_angle_radians * 180.0) / Math.PI,
    1
  );

  //   This will prevent negative values (it will convert -90 to 270)
  joint_angle_degrees = (joint_angle_degrees + 360) % 360;

  if (small) {
    //  we have to return lower angle
    joint_angle_degrees = Math.min(
      joint_angle_degrees,
      360 - joint_angle_degrees
    );
  } else {
    //   Otherwise we will send upper angle
    joint_angle_degrees = Math.max(
      joint_angle_degrees,
      360 - joint_angle_degrees
    );
  }

  if (round) {
    //   Making round from 0
    joint_angle_degrees = Math.round(joint_angle_degrees, 0);
  }

  // Finally return the calculated angle
  return joint_angle_degrees;
};

/**
 * These functions will calculate the angles that we needed
 */
class calculateAngles {
  /**
   * Calculating the knee angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  knee(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.hip.left[0],
        landmarks.hip.left[1],
        landmarks.knee.left[0],
        landmarks.knee.left[1],
        landmarks.ankle.left[0],
        landmarks.ankle.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.hip.right[0],
        landmarks.hip.right[1],
        landmarks.knee.right[0],
        landmarks.knee.right[1],
        landmarks.ankle.right[0],
        landmarks.ankle.right[1],
        small,
        round
      ),
    };
  }

  /**
   * Calculating the shoulder angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  shoulder(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.wrist.left[0],
        landmarks.wrist.left[1],
        landmarks.shoulder.left[0],
        landmarks.shoulder.left[1],
        landmarks.shoulder.left[0],
        landmarks.shoulder.left[1] + (50 / 100) * landmarks.shoulder.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.wrist.right[0],
        landmarks.wrist.right[1],
        landmarks.shoulder.right[0],
        landmarks.shoulder.right[1],
        landmarks.shoulder.right[0],
        landmarks.shoulder.right[1] + (50 / 100) * landmarks.shoulder.right[1],
        small,
        round
      ),
    };
  }

  /**
   * Calculating the elbow angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  elbow(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.shoulder.left[0],
        landmarks.shoulder.left[1],
        landmarks.elbow.left[0],
        landmarks.elbow.left[1],
        landmarks.wrist.left[0],
        landmarks.wrist.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.shoulder.right[0],
        landmarks.shoulder.right[1],
        landmarks.elbow.right[0],
        landmarks.elbow.right[1],
        landmarks.wrist.right[0],
        landmarks.wrist.right[1],
        small,
        round
      ),
    };
  }

  /**
   * Calculating the spine angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  spine(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.shoulder.left[0],
        landmarks.shoulder.left[1],
        landmarks.hip.left[0],
        landmarks.hip.left[1],
        landmarks.hip.left[0],
        landmarks.hip.left[1] + (50 / 100) * landmarks.hip.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.shoulder.right[0],
        landmarks.shoulder.right[1],
        landmarks.hip.right[0],
        landmarks.hip.right[1],
        landmarks.hip.right[0],
        landmarks.hip.right[1] + (50 / 100) * landmarks.hip.right[1],
        small,
        round
      ),
    };
  }

  /**
   * Calculating the shin angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  shin(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.knee.left[0],
        landmarks.knee.left[1],
        landmarks.ankle.left[0],
        landmarks.ankle.left[1],
        landmarks.ankle.left[0],
        landmarks.ankle.left[1] + (50 / 100) * landmarks.ankle.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.knee.right[0],
        landmarks.knee.right[1],
        landmarks.ankle.right[0],
        landmarks.ankle.right[1],
        landmarks.ankle.right[0],
        landmarks.ankle.right[1] + (50 / 100) * landmarks.ankle.right[1],
        small,
        round
      ),
    };
  }

  /**
   * Calculating the hip angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  hip(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.hip.left[0],
        landmarks.hip.left[1] + (50 / 100) * landmarks.hip.left[1],
        landmarks.hip.left[0],
        landmarks.hip.left[1],
        landmarks.knee.left[0],
        landmarks.knee.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.hip.right[0],
        landmarks.hip.right[1] + (50 / 100) * landmarks.hip.right[1],
        landmarks.hip.right[0],
        landmarks.hip.right[1],
        landmarks.knee.right[0],
        landmarks.knee.right[1],
        small,
        round
      ),
    };
  }

  /**
   * Calculating the OAH angle
   * @param {Object} landmarks
   * @param {Boolean} small
   * @param {Boolean} round
   * @return {object} With left and right angles
   */
  OAH(landmarks, small, round) {
    return {
      left: calculateDegrees(
        landmarks.ankle.left[0],
        landmarks.ankle.left[1] + (50 / 100) * landmarks.ankle.left[1],
        landmarks.ankle.left[0],
        landmarks.ankle.left[1],
        landmarks.hip.left[0],
        landmarks.hip.left[1],
        small,
        round
      ),
      right: calculateDegrees(
        landmarks.ankle.right[0],
        landmarks.ankle.right[1] + (50 / 100) * landmarks.ankle.right[1],
        landmarks.ankle.right[0],
        landmarks.ankle.right[1],
        landmarks.hip.right[0],
        landmarks.hip.right[1],
        small,
        round
      ),
    };
  }
}

// Exports
export default new calculateAngles();

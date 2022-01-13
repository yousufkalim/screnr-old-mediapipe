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
  // Making the radians from joint angles
  const joint_angle_radians =
    Math.abs(Math.atan2(y3 - y2, x3 - x2)) - Math.atan2(y1 - y2, x1 - x2);

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

/**
 * Check Rules
 * @author Yousuf Kalim
 */

/**
 * With this function we will check the rules of an overhead squat
 * @param {Number} phase phase can be 1 or 2
 * @param {Object} angles calculated angles from specific joints
 * @param {String} poseSide poseSide can be left, center or right
 * @return {String} error message
 */
const checkRules = (phase, angles, leftSide, rightSide, setMessage) => {
  // Destructuring angles
  let { shoulder, shin, OAH, hip, spine } = angles;

  //   If pose side is left then we have to check angles from left side
  let visibility = leftSide < rightSide ? "right" : "left";

  // Rule 1:  If phase=1 and shoulder_angle < 170, display: "keep arms over ears"
  if (phase === 1 && shoulder[visibility] < 170) {
    setMessage("Keep arms over ears");
  }
  // Rule 2:  If phase=1 and shin_angle<175 and OAH_angle<195 then display: "stay on heels"
  else if (phase === 1 && shin[visibility] < 175 && OAH[visibility] < 195) {
    setMessage("Stay on heels");
  }
  //  Rule 3:  If phase=1 and  shin_angle<150 and OAH_angle>=185 then display: "do not let knees pass the toes"
  else if (phase === 1 && shin[visibility] < 150 && OAH[visibility] >= 185) {
    setMessage("Do not let knees pass the toes");
  }
  // Rule 4:  If phase=2 and hip_angle < 85, display: "sit hips lower"
  else if (phase === 2 && hip[visibility] < 85) {
    setMessage("Sit hips lower");
  }
  // Rule 5:  If phase=2 and spine_angle < 125, display: "keep chest up"
  else if (phase === 2 && spine[visibility] < 125) {
    setMessage("Keep chest up");
  }
};

// Exports
export default checkRules;

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
const checkRules = (phase, angles, poseSide) => {
  // Destructuring angles
  let { shoulder, shin, OAH, hip, spine } = angles;

  //   If pose side is left then we have to check angles from left side
  if (poseSide === "left") {
    // Rule 1:  If phase=1 and shoulder_angle < 170, display: "keep arms over ears"
    if (phase === 1 && shoulder.left < 170) {
      return "Keep arms over ears";
    }
    // Rule 2:  If phase=1 and shin_angle<175 and OAH_angle<195 then display: "stay on heels"
    else if (phase === 1 && shin.left < 175 && OAH.left < 195) {
      return "Stay on heels";
    }
    //  Rule 3:  If phase=1 and  shin_angle<150 and OAH_angle>=185 then display: "do not let knees pass the toes"
    else if (phase === 1 && shin.left < 150 && OAH.left >= 185) {
      return "Do not let knees pass the toes";
    }
    // Rule 4:  If phase=2 and hip_angle < 85, display: "sit hips lower"
    else if (phase === 2 && hip.left < 85) {
      return "Sit hips lower";
    }
    // Rule 5:  If phase=2 and spine_angle < 125, display: "keep chest up"
    else if (phase === 2 && spine.left < 125) {
      return "Keep chest up";
    }
  }
  //   If pose side is right then we have to check angles from right side
  else if (poseSide === "right") {
    // Rule 1:  If phase=1 and shoulder_angle < 170, display: "keep arms over ears"
    if (phase === 1 && shoulder.right < 170) {
      return "Keep arms over ears";
    }
    // Rule 2:  If phase=1 and shin_angle<175 and OAH_angle<195 then display: "stay on heels"
    else if (phase === 1 && shin.right < 175 && OAH.right < 195) {
      return "Stay on heels";
    }
    //  Rule 3:  If phase=1 and  shin_angle<150 and OAH_angle>=185 then display: "do not let knees pass the toes"
    else if (phase === 1 && shin.right < 150 && OAH.right >= 185) {
      return "Do not let knees pass the toes";
    }
    // Rule 4:  If phase=2 and hip_angle < 85, display: "sit hips lower"
    else if (phase === 2 && hip.right < 85) {
      return "Sit hips lower";
    }
    // Rule 5:  If phase=2 and spine_angle < 125, display: "keep chest up"
    else if (phase === 2 && spine.right < 125) {
      return "Keep chest up";
    }
  }
  //   If it's front then we don't have to do anything because we are not checking from front side
  else {
    return "Change your pose side to left or right";
  }
};

// Exports
export default checkRules;

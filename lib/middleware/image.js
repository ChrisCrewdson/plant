

/**
 * Calculate the sizes to be used for resizing the image based on the current size
 * @param {integer} width - the width of the original image
 * @return {array} - an array of 4 elements representing the size in each group
 */
function calcSizes(width) {
  if(width < 1) {
    throw new Error(`Unexpected width less than 1: ${width}`);
  }

  return [
    width > 500 ? 500 : width,
    width > 1000 ? 1000 : width < 501 ? false : width,
    width > 1500 ? 1500 : width < 1001 ? false : width,
    width > 2000 ? 2000 : width < 1501 ? false : width,
  ];
}

module.exports = {
  calcSizes
};

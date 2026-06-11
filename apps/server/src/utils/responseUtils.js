
export const returnResponse = (res, statusCode, success, message, data = {}, error = null) => {
  return res.status(statusCode).json({
    success,
    message,
    ...data,
    ...(error && { error })
  });
};

/**
 * Helper to return a standardized service response
 * @param {boolean} success - Success status
 * @param {Object} [data={}] - Service payload data
 * @param {string} [error=null] - Error message
 */
export const returnServiceResponse = (success, data = {}, error = null) => {
  return {
    success,
    ...data,
    ...(error && { error })
  };
};

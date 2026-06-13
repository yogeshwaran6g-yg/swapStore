
export const rtnRes = (res, code, msg = null, data = null) => {
  try {
    if (!res || !code) {
      throw new Error("Missing arguments to return a response");
    }
    const responses = {
      200: { success: true, defaultMsg: "OK" },
      201: { success: true, defaultMsg: "Created" },
      202: { success: true, defaultMsg: "Accepted" },
      204: { success: true, defaultMsg: "No Content" },
      400: { success: false, defaultMsg: "Bad Request" },
      401: { success: false, defaultMsg: "Unauthorized" },
      403: { success: false, defaultMsg: "Forbidden" },
      404: { success: false, defaultMsg: "Not Found" },
      500: { success: false, defaultMsg: "Internal Server Error" },
    };
    const response = responses[code] || responses[500];
    if (code === 204) {
      return res.status(204).send();
    }
    return res.status(code).json({
      success: response.success,
      message: msg || response.defaultMsg,
      ...(data && { data }),
    });
  } catch (err) {
    console.error("Error from rtnRes:", err.message);
    return res.status(500).json({
      success: false,
      message: "Response handler failed",
    });
  }
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

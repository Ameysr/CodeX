/**
 * Async handler wrapper — catches errors from async route handlers
 * and passes them to Express error handler.
 * 
 * Usage:  router.get('/path', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

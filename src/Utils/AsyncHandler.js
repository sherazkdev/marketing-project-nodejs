const AsyncHandler = (fn) => (req,res,next) => {
    return Promise.resolve(fn(req,res,next)).catch( (e) => next(e));
}
export default AsyncHandler;
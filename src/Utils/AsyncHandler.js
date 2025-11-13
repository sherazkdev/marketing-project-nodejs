const AsyncHandler = (fn) => (req,res,next) => {
    return Promise.resolve(fn(req,res,next)).catch( (e) => new Error(e));
}
export default AsyncHandler;
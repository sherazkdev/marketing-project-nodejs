export default function ErroHandler(error,req,res,next) {
    
    res.status(error?.status || 500).json({
        statusCode : error?.statusCode || error?.status || 500,
        message : error?.message || "Error: some thing wrong",
        stack : error?.stack
    })
}
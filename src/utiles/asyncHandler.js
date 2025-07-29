const asyncHandler = (requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=>next(error))
    }
}

export {asyncHandler}




// const asyncHandler = (fn)=>async(res,req,next)=>{
//     try {
//         await fn(res,req,next)
//     } catch (error) {
//         res.send(error.code || 500).json({
//             success:false,
//             Message:error.Message
//         })
//     }
// }
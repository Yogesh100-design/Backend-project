// utils/asyncHandler.js

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export default asyncHandler; // ✅ export the function directly





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
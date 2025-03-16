export const catchAsyncErrors = (sukh) => {
    return (req, res, next)=> {
        Promise.resolve(sukh(req, res, next)).catch(next);
    }
}
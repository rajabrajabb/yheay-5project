const AppError = require('../utils/appError')

const handleCastErrorDB = err =>{
    const message = `invalid ${err.path} : ${err.value}`
    return new AppError(message,400)
}

const handleJWTError = () =>{
    return  new AppError('Invail Token',401)
}

const handleJWTEX = ()=>{
    return new AppError('token has expierd login again',401)
}

const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error:err,
        stack:err.stack
    });
} 

const sendErrorProd = (err,res)=>{
    //Operational trusted error:send message to client 
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    //programing or other unknown error dont leak detalis to the client
    }else{
        console.error('ERROR **',err)

        res.status(500).json({
            status:'error',
            message:'something went very wrong'
        });
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
 
    if(process.env.NODE_ENV === 'development'){
       sendErrorDev(err,res)
    }else if(process.env.NODE_ENV === 'production' ) {
        let error = { ...err } 
        if(error.name === 'CastError') error = handleCastErrorDB(error)
        if(error.name === 'JsonWebTokenError') error = handleJWTError()
        if(error.name === 'TokenExpiredError') error = handleJWTEX()
      
        sendErrorProd(error,res)
    }
}
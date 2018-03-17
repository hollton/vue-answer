import Code from './code';

const ErrorCodeFn = {
    ...Code
};

const ErrorHandle = (function(){
    return function(code,cb, vm){
        code = code.replace('FEP/', '');
        if(!cb){
            cb = {};
        }
        
        if(typeof ErrorCodeFn[code] === 'function'){
            const errFn = ErrorCodeFn[code];
            errFn(cb[code],vm);
        }
        
    }
})();

export default ErrorHandle
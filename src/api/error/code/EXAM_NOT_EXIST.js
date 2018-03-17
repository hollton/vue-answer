import {MessageBox} from '../../../UIComponents';

const EXAM_NOT_EXIST = function(cb,vm){
    let callback;
    if(typeof cb === 'function'){
        callback = cb;
    }else{
        callback = function(){};
    }

    MessageBox.warn('考试不存在', '错误',{noBtnShow: false, useMask: vm.useCover ? false : true})
    .then(() => {
        callback();
    }, () => {
        callback();
    })
}

export default EXAM_NOT_EXIST;
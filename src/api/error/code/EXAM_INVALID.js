import {MessageBox} from '../../../UIComponents';

const EXAM_INVALID = function(cb,vm){
    let callback;
    if(typeof cb === 'function'){
        callback = cb;
    }else{
        callback = function(){};
    }

    MessageBox.warn('考试已停止发布或被删除', '错误',{noBtnShow: false, useMask: vm.useCover ? false : true})
    .then(() => {
        callback();
    }, () => {
        callback();
    });
}

export default EXAM_INVALID;
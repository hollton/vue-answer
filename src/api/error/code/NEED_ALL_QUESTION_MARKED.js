import {MessageBox} from '../../../UIComponents';

const EXAM_NOT_EXIST = function(cb,vm){
    let callback;
    if(typeof cb === 'function'){
        callback = cb;
    }else{
        callback = function(){};
    }

    MessageBox.warn('无法执行该操作，必须所有的题目均完成批改', '错误',{noBtnShow: false})
    .then(() => {
        callback();
    }, () => {
        callback();
    })
}

export default EXAM_NOT_EXIST;
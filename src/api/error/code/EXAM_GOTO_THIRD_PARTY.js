import {MessageBox} from '../../../UIComponents';

const EXAM_GOTO_THIRD_PARTY = function(cb,vm){
    let callback;
    if(typeof cb === 'function'){
        callback = cb;
    }else{
        callback = function(){};
    }

    MessageBox.warn('由于您长时间未批阅，该答卷已转交第三方批阅', '提示',{yesBtn:'我知道了',noBtnShow: false, useMask: vm.useCover ? false : true})
    .then(() => {
        callback();
    }, () => {
        callback();
    });
}

export default EXAM_GOTO_THIRD_PARTY;
import Vue from 'vue';
import msgboxVue from './main.vue';

const defaults = {
    title: undefined,
    message: ''
}

let currentMsg, instance;
let msgQueue = [];

const defaultCallback = action =>{
    if(currentMsg){
        let callback = currentMsg.callback;

        if(typeof callback === 'function') {
            callback(action);
        }
    }

    if(currentMsg.resolve){
        if(action === 'confirm'){
            currentMsg.resolve(action)
        }else if(action === 'cancel' && currentMsg.reject){
            currentMsg.reject(action);
        }
    }
    document.body.removeChild(instance.$el);
}

const MessageBoxConstructor = Vue.extend(msgboxVue);

const initInstance = () => {
  instance = new MessageBoxConstructor({
    el: document.createElement('div')
  });
  instance.callback = defaultCallback;
};

const showNextMsg = () => {
    if(!instance){
        initInstance();
    }
    if(msgQueue.length>0){
        currentMsg = msgQueue.shift();
    }

    let options = currentMsg.options;

    for(let opt in options){
        instance[opt] = options[opt];
    }

    instance.doOpen();
    document.body.appendChild(instance.$el);
};

const MessageBox = function(message, title, options, callback) {
    return new Promise((resolve, reject) => {
        msgQueue.push({
            options: {message: message, 
                title: title, 
                yesBtn: options.yesBtn, 
                noBtn: options.noBtn,
                type: options.type,
                yesBtnShow: options.yesBtnShow,
                noBtnShow: options.noBtnShow,
                useMask: options.useMask
            },
            callback: callback,
            resolve: resolve,
            reject: reject
        });
        showNextMsg();
    })
    
};

MessageBox.confirm = (message, title, options={}) => {
    if(options.yesBtn === undefined){
        options.yesBtn = '确定';
    }

    if(options.noBtn === undefined){
        options.noBtn = '取消';
    }

    if(options.yesBtnShow === undefined){
        options.yesBtnShow = true;
    }

    if(options.noBtnShow === undefined){
        options.noBtnShow = true;
    }

    if(options.useMask === undefined){
        options.useMask = true;
    }

    options.type = options.type ? options.type : 'confirm';

    return MessageBox(message,title, options);
}

MessageBox.warn = (message, title, options={}) => {
    if(options.yesBtn === undefined){
        options.yesBtn = '确定';
    }

    if(options.noBtn === undefined){
        options.noBtn = '取消';
    }

    if(options.yesBtnShow === undefined){
        options.yesBtnShow = true;
    }

    if(options.noBtnShow === undefined){
        options.noBtnShow = true;
    }

    if(options.useMask === undefined){
        options.useMask = true;
    }

    options.type = options.type ? options.type : 'warn';

    return MessageBox(message,title, options);
}

export default MessageBox;
export { MessageBox };

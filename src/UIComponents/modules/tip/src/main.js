import Vue from 'vue';
import tip from './main.vue';
let TipConstructor = Vue.extend(tip);
let instance;
let Tip = options => {
    options = options || {};
    if (typeof options === 'string') {
        options = {
            message: options
        };
    }

    instance = new TipConstructor({
        data: options
    });
    instance.vm = instance.$mount();
    document.body.appendChild(instance.vm.$el);
    instance.vm.visible = true;
    instance.dom = instance.vm.$el;
    return instance.vm;
};
Tip.tip = (message) => {
    return Tip(message);
};

export default Tip;

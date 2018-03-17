import Vue from 'vue';
import axios from 'axios';
import Qs from 'qs';
import AnswerAPI from './answer';
import MarkAPI from './mark';
import Others from './others';
import Error from './error';

Vue.$apiService = {
    AnswerAPI,
    MarkAPI,
    Others
};

Vue.prototype.$apiService = {
    AnswerAPI,
    MarkAPI,
    Others
};

//let uc_login_url = __config.uc_login + '&callback_url=' + window.location.href;

/*api拦截器模块*/
//axios.defaults.baseURL = __config.base_url;

function APIInit(opt,vm){
    axios.defaults.baseURL = opt.baseURL ? opt.baseURL : 'http://fepapi.dev.web.nd';
    let loading = {
        show:false,
        requestNum:0,
        loadingTimer:null,
        timeout:500
    };
    let showLoading = (show)=>{
        if(loading.loadingTimer){
            clearTimeout(loading.loadingTimer);
        }
        loading.loadingTimer = setTimeout(()=>{
            loading.show = show;
            vm.$store.commit('customSetState', {
                key:'loadingShow',
                data:show
            });
        },loading.timeout);
    };

    axios.interceptors.request.use(config => {
        let url = config.url;
        //请求参数处理
        if (config.params) {
            url += '?';
            for (let key in config.params) {
                //数组处理
                if (config.params[key] && config.params[key] instanceof Array) {
                    for (let param in config.params[key]) {
                        url += key + '=' + encodeURIComponent(config.params[key][param]) + '&';
                    }
                } else { //字符串处理
                    if (config.params[key] != null) { //非空
                        url += key + '=' + encodeURIComponent(config.params[key]) + '&';
                    }
                }
            }
            url = url.substring(0, url.length - 1);
        }
        config.realURL = url;
        config.paramsSerializer = function(params) {
            return Qs.stringify(params, { arrayFormat: 'repeat' })
        };
        // 请求授权
        if (!config.unAuth) {

            if(typeof opt.authorization === 'function'){
                config.headers.common['Authorization'] = opt.authorization(config);
            }else{
                config.headers.common['Authorization'] = opt.authorization ? opt.authorization : 'debug userid=2079944857';//(对应账号：stu010120170101 | 123456abc)
            }
        }
        if(opt.roleType){
            config.headers.common['role-type'] = opt.roleType;
        }
        config.headers.common['Accept-Language'] = Vue.config.lang;
        config.headers.common['Content-Type'] = 'application/json';

        if(!config.notUseLoading){
            // loading
            if(loading.requestNum<0){
                loading.requestNum = 0;
            }
            loading.requestNum++;
            showLoading(true);
        }

        
        
        return config;
    },(error)=>{
        loading.requestNum--;
        showLoading(false);
        return Promise.reject(error);
    });

    // 请求错误处理
    axios.interceptors.response.use(response => {
        loading.requestNum--;
        if (loading.requestNum <= 0) {
            showLoading(false);
        }
        return response;
    }, error => {
        let code;
        if(error.response){
            code = error.response.data.code;
            Error(code, opt.errorHandle,vm);
        }
        loading.requestNum--;
        showLoading(false);
        vm.$store.commit('setShowMarkMask', false);
        return Promise.reject(error.response);
    });
}

export default APIInit;
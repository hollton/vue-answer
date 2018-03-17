// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import './assets/styles/common.css';
import './assets/styles/style-exam.css';
import APIInit from './api';
import components from './components';
import UIComponents from './UIComponents';
import './directive';
import store from './store';
import {mapState} from 'vuex';

const apiService = Vue.$apiService;

// 注册自己的store
import questionStore from './store/modules/question';
import markStore from './store/modules/mark';

// mixins
import InitMark from './init/mark';

Vue.use(Vuex);
Vue.use(UIComponents);
Vue.config.productionTip = false;
window.FaGolobalStore = {};
window.FaBaseConfig = {};

/* eslint-disable no-new */
export class Player {
    constructor(options) {
        const defaultStore = new Vuex.Store({
            ...store,
            modules: {
                question: questionStore,
                mark: markStore
            }
        });

        window.FaBaseConfig = options.baseConfig ? options.baseConfig : {};

        const root = new Vue({
            el: options.element,
            mixins: [InitMark],
            props: {
                ...mapState
            },
            data() {
               return {
                   ...options.data
               };
            },
            components: {...components},
            store: defaultStore,
            methods: {
                initPaperData(res,exam_id){
                    const resData = res.data;
                    let testType = resData.test_type;
                    let status = resData.status;
                    this.$store.commit('setPaperId', {paperId: resData.paper_id});
                    this.$store.commit('setPaperState', {paperState: status});
                    this.$store.commit('setTestType',{testType: testType});
                    if (testType === 'TERMTEST' && options.isStudent && status === 'UnjoinAndFinished') { // 学期总测在考试截止后学生不能查看试卷
                        this.$warn('学期总测在考试截止后不能查看试卷','提示', {noBtnShow: false}).then(()=>{
                            if(options.methods){
                                options.methods.handleReturnList();
                            }
                        });
                        return;
                    }
                    if(!resData.exam_session_id || testType==='UNITTEST' && status==='ReportCompleted'){
                        apiService.AnswerAPI.getSessionId({exam_id: exam_id})
                        .then(res => {
                            const resData = res.data;
                            this.$store.commit('setSessionId', {sessionId: resData.session_id});
                        });
                    }else{
                        this.$store.commit('setSessionId', {sessionId: resData.exam_session_id});
                    }
                },
                setResourceLimit(resourceLimit, res){
                    let doLimit;
                    if(resourceLimit){  //使用调用组件方的配置限制
                        doLimit = resourceLimit;
                    } else {  //根据学科类型限制
                        let resData = res.data;
                        doLimit = {
                            range:['audio'],
                            type:'times'
                        };
                        if(resData && resData.course && resData.course.toLowerCase() === 'en'){
                            doLimit.range = ['audio','video'];
                            doLimit.type = 'once';
                        }

                    }
                    this.$store.commit('setResourceLimit',doLimit);
                },
                ...options.methods
            },
            created(){
                this.$store.commit('setExamId',options.baseConfig);
                this.$store.commit('setUserId',options.baseConfig);
                this.$store.commit('setAssignedQids',options.baseConfig.qids);
                this.$store.commit('setSubmitType',options.baseConfig.isAllFinishedCanSubmit);
                APIInit(window.FaBaseConfig,this);
                const exam_id = options.baseConfig.examId;
                const student_id = options.baseConfig.studentId;
                const paper_id = options.baseConfig.paperId;
                const class_id = options.baseConfig.classId;
                const ref_path = options.baseConfig.refPath ? options.baseConfig.refPath : 'http://betacs.101.com/v0.1/static';
                const avatar_directory = options.baseConfig.avatarDirectory ? options.baseConfig.avatarDirectory : '/preproduction_content_cscommon';
                const type = options.baseConfig.type || 'answer';
                this.$store.commit('customSetState',{
                    key:'type',
                    data:type
                });
                this.$store.commit('customSetState',{
                    key:'roleType',
                    data:options.baseConfig.roleType
                });
                if(type==='view'){  // 预览试卷，无考试作答信息
                    apiService.AnswerAPI.getPapersById({paper_id: paper_id}).then( res => {
                        this.$store.commit('setPaperData', res.data);
                        this.$store.commit('customSetState',{
                            key:'loadPaper',
                            data:true
                        });
                    });
                }else if(type==='mark'){  // 批阅
                    this.$store.commit('customSetState',{
                        key:'customMarkStandard',
                        data:options.baseConfig.customMarkStandard
                    });
                    const avaPath = {
                        ref_path: ref_path,
                        avatar_directory: avatar_directory
                    };
                    let c_q;
                    if(options.baseConfig.currentQuestion){
                        c_q = JSON.parse(options.baseConfig.currentQuestion);
                    }
                    this.initMark(paper_id,class_id,exam_id,avaPath,c_q);
                } else {  //作答[默认]
                    if(options.isStudent){
                        apiService.AnswerAPI.getExamsInfoForStudent({exam_id: exam_id})
                            .then( res => {
                                this.initPaperData(res, exam_id);
                                this.setResourceLimit(options.baseConfig.resourceLimit, res);
                            });
                    }else{
                        this.$store.commit('setStudentId',{studentId: student_id});
                        apiService.AnswerAPI.getExamsInfo({exam_id: exam_id, user_id: student_id})
                            .then(res => {
                                this.initPaperData(res, exam_id);
                            });
                    }
                }

            }
        });
        this.root = root;
    }
}
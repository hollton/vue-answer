import Vue from 'vue';

const apiService = Vue.$apiService;

export default {
    // 相当于data
    state: {
        api: '',
        examId: '',
        sessionId: '',
        classId: '',
        userId: '',  //当前用户信息
        paperId: '',
        loadPaper:false, //取得试卷数据
        type: 'answer', //组件调用类型：'answer'[默认]、'view'、'mark'
        isSaving: false, // 正在保存答案...
        isSubmitting: false, // 正在提交答案...
        assignedQids:null, // 只显示指定qid题目
        isAllFinishedCanSubmit:true, // 是否全部答题完才可交卷
        showCustomMarkError:false, // 全部正确批阅才可交卷（自定义分数评分（输入分数方式）时用，用于输入的分数不符合要求时不让提交。）
        studentId: '',
        paperState: '', // 试卷状态: 1、Ready 考试可开始用户未参加；2、Submit 用户已交卷；3、Marked 用户已完成考试，成绩已出；4、UnjoinAndFinished：考试已结束，用户未参加；5、ReportCompleted 报告完成
        questionsTotal: 0, // 总题数
        questionsCount: 0, // 剩余题数
        totalPoint: 0,
        countDown: NaN, // 倒计时-分钟为单位
        isTimeOut: false, // 是否计时结束
        rootFontSize: 1, // 字体大小
        paperData: {},  //试卷信息
        resultData: {},  //作答/批阅信息
        configData:{  //题目展示配置
            onlyError:false, //只看错题
            editable:false,// 可编辑作答
            markable:false // 可批阅
        },
        testType: '', // 试卷类型：1、TERMTEST 总测 2、UNITTEST 微测
        questionsTypeActive: 0, // 题目类型的激活项
        questionActive: 0, // 题目激活
        showAnswersheet: false,
        headerQuestiontypeHeight: 0, // 题目类型的高度，用于做锚点的偏移值
        otherOptions: {},
        resourceLimit:{},  //音视频操作限制
        roleType:'',  // 登录角色类型
        loadingShow:false //loading提示
    },
    // 相当于计算属性
    getters: {
        asyncSessionId: state => {
            return state.sessionId;
        },
        initPaperStatu: state => {
            let isEditable = false,// 可编辑作答
                isShowAnswer = false, // 显示答案
                isShowResult = true, // 显示作答
                isShowQuestionScore = false, // 显示单题分数
                isShowAnswerScore = false, // 显示作答得分
                isShowQuestionStandard = false, // 显示评分标准
                showQuestionMarkStandard = false, // 显示批阅评分标准
                isShowQuestionCollect = false, // 显示题目收藏
                isShowQuestionMark = true, // 显示标记题目
                thumbnailUrl = require('../assets/images/help-big-bg.png');  //默认图片

            if(state.type==='view'){
                isShowAnswer = true;
                isShowQuestionScore = true;
                isShowQuestionStandard = true;
                isShowQuestionMark = false;
            } else if(state.type==='mark'){
                isShowAnswer = true;
                isShowQuestionMark = false;
                showQuestionMarkStandard = true;
                isShowQuestionScore = true;
                // 只针对教师角色显示作答收藏
                if(state.roleType==='TEACHER'){
                    isShowQuestionCollect = true;
                }
                state.configData.markable = true;
            } else {
                switch(state.testType){
                    case 'UNITTEST':
                        isEditable = state.paperState === 'Ready' || state.paperState === 'ReportCompleted';
                        isShowResult = state.paperState !== 'ReportCompleted';
                        break;
                    case 'TERMTEST':
                    case 'DAILYTEST':
                        isEditable = state.paperState === 'Ready';
                        isShowAnswer = state.paperState === 'ReportCompleted';
                        isShowResult = isEditable || state.paperState === 'Submit';
                        break;
                    default:
                        break;
                }
                if(state.studentId){  // 老师查看批阅学生时
                    isShowAnswer = true;
                    isShowQuestionScore = true;
                    isShowAnswerScore = true;
                    isShowQuestionStandard = true;
                    isShowQuestionCollect = true;
                }
            }
            state.configData.editable = isEditable;
            return {
                showAnswer: isShowAnswer, // 显示答案
                showResult: isShowResult, // 显示作答
                showQuestionScore: isShowQuestionScore, //显示单题分数
                showAnswerScore: isShowAnswerScore, //显示作答得分
                showQuestionStandard: isShowQuestionStandard, //显示评分标准
                showQuestionMarkStandard: showQuestionMarkStandard, //显示批阅评分标准
                showQuestionCollect: isShowQuestionCollect, //显示题目收藏
                isAllFinishedCanSubmit:state.isAllFinishedCanSubmit, // 是否全部答题完才可交卷
                isShowQuestionMark:isShowQuestionMark,
                thumbnailUrl:thumbnailUrl
            };
        }
    },
    // 相当于methods中的同步的方法
    mutations: {
        /**
         * [customSetState 通用设置state data]
         * @param  args:{
         *         key:'string', // 要设置的state名称
         *         data:any, // state数据
         *     }
         */
        customSetState(state, args){
            state[args.key] = args.data;
        },
        setTestType(state, payload){
            state.testType = payload.testType;
        },
        setExamId(state, payload){
            state.examId = payload.examId;
        },
        setUserId(state, payload){
            state.userId = payload.userId;
        },
        setSessionId(state, payload){
            state.sessionId = payload.sessionId;
        },
        setClassId(state, payload){
            state.classId = payload.classId;
        },
        setPaperId(state, payload){
            state.paperId = payload.paperId;
        },
        setStudentId(state, payload){
            state.studentId = payload.studentId;
        },
        setPaperState(state, payload){
            state.paperState = payload.paperState;
        },
        setTotalPoint(state, playload){
            state.totalPoint += playload.point;
        },
        anchorQuestionType(state, index) { // 切换题目类型
            state.questionsTypeActive = index;
        },
        setQuestionActive(state, index) { // 修改当前答题
            state.questionActive = index;
        },
        changeFontSize(state, size) { // 改变字体大小
            state.rootFontSize = size ? size : 1;
        },
        actionIsTimeOut(state, value) { // 设置是否超时
            state.isTimeOut = value;
        },
        setAssignedQids(state, qids){
            state.assignedQids = qids;
        },
        setSubmitType(state, isAllFinishedCanSubmit){
            if(isAllFinishedCanSubmit !== undefined){
                state.isAllFinishedCanSubmit = isAllFinishedCanSubmit;
            }
        },
        setSaveStatus(state, isSaving){
            state.isSaving = isSaving;
        },
        setSubmitStatus(state, isSubmitting){
            state.isSubmitting = isSubmitting;
        },
        setShowCustomMarkError(state, showCustomMarkError){
            state.showCustomMarkError = showCustomMarkError;
        },
        // 设置试卷信息
        setPaperData: (state, paperData) => {
            let questionCount = 0,  // 题目编号
                filterQuestionId,  // 题目id过滤掉'_0'
                filterParts = [];  // 根据指定的题目id(qids)过滤大题parts
            paperData.parts = paperData.parts || [];
            paperData.parts.forEach(part => {
                part.questionItem = [];
                part.question_identities.forEach(questionId => {
                    filterQuestionId = questionId.split('_')[0];
                    if(!(state.assignedQids && state.assignedQids.length) || state.assignedQids.indexOf(filterQuestionId)!==-1){
                        part.questionItem.push({
                            id: filterQuestionId,
                            index: questionCount
                        });
                    }
                    questionCount++;
                });
            });
            paperData.parts.forEach(part => {
                if(part.questionItem.length){
                    filterParts.push(part);
                }
            });
            paperData.parts = filterParts;
            state.paperData = paperData;
        },
        /**
         * [changeQuestionDoneStatus 更改题目作答状态]
         * @param  {[type]} state
         * @param  {[type]} args :{
         *                       id:'' 题目id
         *                       key:'' 修改项（'done':是否作答完成,'marked':标记,'right':对错）
         *                       isTruth:boolean  true/false
         *     }
         */
        changeQuestionDoneStatus(state,args){
            if(!state.resultData[args.id]){
                state.resultData[args.id] = {
                    id:args.id
                };
            }
            if(!state.resultData[args.id].result){
                state.resultData[args.id].result = {};
            }
            state.resultData[args.id].result[args.key] = args.isTruth;
            state.resultData = Object.assign({}, state.resultData);
        },
        // 作答信息[合并未批阅和已批阅的作答数据结构]
        setResultData: (state, resultData) => {
            if(!state.resultData){
                state.resultData = {};
            }
            resultData.forEach(function(item){
                item.id = item.id?item.id:item.question_id;
                if(!item.subs && item.ss){
                    item.subs = item.ss.map(subItem=>{
                        return {
                            answer:subItem
                        };
                    });
                }
                // 保留每道题result（包含是否完成、对错）
                if(state.resultData[item.id] && state.resultData[item.id].result){
                    item.result = state.resultData[item.id].result;
                }
                state.resultData[item.id] = Object.assign({},item);
            });
        },
        // 设置题目展示配置
        setConfig:(state, configData)=>{
            state.configData = configData;
        },
        // 修改题目展示配置
        // args:{key:'onlyError/editable...' , isTruth:boolean}
        changeConfig:(state, args)=>{
            state.configData[args.key] = args.isTruth;
        },
        handleShowAnswersheet(state){
            state.showAnswersheet = !state.showAnswersheet;
        },
        handleChangeHeaderQuestionTypeHeight(state, value){
            state.headerQuestiontypeHeight = value;
        },
        //计算总题数
        calcQuestionTotal(state,num){
            state.questionsTotal=num;
        },
        //计算已做题数
        calcQuestionCount(state,num){
            state.questionsCount+=num;
        },
        setOtherOptions(state, payload){
            state.otherOptions = Object.assign({}, state.otherOptions, payload);
        },
        // 资源播放限制
        setResourceLimit(state, resourceLimit){
            if(resourceLimit){
                state.resourceLimit = resourceLimit;
            }
        }
    },
    // 相当于methods中异步的方法
    actions: {
        // 根据exam_id，session_id获取试卷信息
        getUserExamBySessionId(context, paramData) {
            return apiService.AnswerAPI.getUserExamBySessionId(paramData).then((response) => {
                let paperData = response.data && response.data.user_data && response.data.user_data.paper || {};
                paperData.exam_id = paramData.exam_id;
                paperData.session_id = paramData.session_id;
                context.commit('setPaperData', paperData);
                return paperData;
            });
        },
        // 根据exam_id，session_id,question_id获取作答信息
        getQuestionsResultById(context, paramData) {
            return apiService.AnswerAPI[paramData.apiName](paramData).then((response) => {
                context.commit('setResultData', response.data);
                return response.data;
            });
        }
    },
    plugins: []
};
import Vue from 'vue';

const MarkAPI = Vue.$apiService.MarkAPI;
const AnswerAPI = Vue.$apiService.AnswerAPI;

export default {
    state: {
        currentStudent: {}, // 当前学生
        currentQuestion: {}, // 当前题目
        currentAnswer: {}, // 当前学生下的作答情况
        questionsData: {}, // 提取需要批阅的题目的id、index
        studentsList: [],
        questionsList: [],
        questionsAnswerData:[], //试题数据，含题干、答案、分值等
        showStudentCard: false,
        showQuestionsCard: false,
        questionShow:true,  //题干显示
        newSubmitOpt: {
            submit_count: 0,
            last_date: '',
            server_date: ''
        },
        submitLastDate: '',
        onlyMarkSubjective:true, // 默认只批阅主观题（包含简答题、填空题）
        isShowMarkMask: true,
        closeMarkMaskFn: null,
        disableKeyBoard:false,  // 禁用键盘切换操作，输入评分标准时，禁用
        guideIndex:0,  //新手引导当前步骤索引
        markWidth:0,  //评分区宽度
        markProgress:0  // 批阅进度0-100
    },
    getters: {
        currentReqMarkStatu: (state,getters,rootState) => {
            const session_id = state.currentStudent.session_id ? state.currentStudent.session_id : '';
            const exam_id = rootState.examId;
            const qid = state.currentQuestion.id ? state.currentQuestion.id : '';
            return {
                session_id: session_id,
                exam_id: exam_id,
                qid: qid
            }
        },
        studentInfoData: (state, getters,rootState) => {
            let studentInfo = { // 学生信息
                unmark: [], // 未批阅
                marked: [] // 已批阅
            };

            let isContainStudent = false;

            state.studentsList.map(student => {
                if(student.status === 'unmark' && state.currentQuestion.id){
                    student.answers.map(q => {
                        if(q.question_id === state.currentQuestion.id){
                            studentInfo['unmark'].push(student);
                        }
                    })
                }else{
                    studentInfo[student.status].push(student);
                }
            });

            studentInfo['unmark'].map(student => {
                if(state.currentStudent.user_id && state.currentStudent.user_id === student.user_id){
                    isContainStudent = true;
                }
            });

            if(!isContainStudent && studentInfo['unmark'].length > 0){
                state.currentStudent = studentInfo['unmark'][0];
            }

            return studentInfo;
        }
    },
    mutations: {
        setShowMarkMask(state, payload){
            state.isShowMarkMask = payload;
        },
        setCloseMarkMaskFn(state, payload){
            state.closeMarkMaskFn = payload;
        },
        setCardShow(state,payload){
            const haveValue = typeof payload.value !== 'undefined';
            switch(payload.type){
                case 'questions':
                    state.showQuestionsCard = haveValue ? payload.value : !state.showQuestionsCard;
                    break;
                case 'student':
                    state.showStudentCard = haveValue ? payload.value : !state.showStudentCard;
                    break;
                default:
                    return;
            }
        },
        setNewSubmitOpt(state, payload){
            for(let opt in payload){
                if(typeof state.newSubmitOpt[opt] !== 'undefined'){
                    state.newSubmitOpt[opt] = payload[opt];
                }
            }
        },
        setCurrentStudent(state,payload){
            state.currentStudent = payload.currentStudent;
        },
        setCurrentQuestion(state,payload){

            state.currentQuestion = payload.currentQuestion;
        },
        setCurrentAnswer(state,payload){
            state.currentAnswer = payload.currentAnswer;
        },
        setMarkStatu(state, payload){
            state.markStatu = payload.markStatu;
        },
        setQuestionsData(state, payload){
            if(payload.setStatus){
                state.questionsData.map((p,i) => {
                    let new_sub = [];
                    p.sub_item.map(si => {
                        var isMark = false;
                        var isUnMark = false;
                        state.studentsList.map(student => {
                            student.answers.map(item => {
                                    if(item.question_id === si.id && item.question_answer_status === 1){
                                        isUnMark = true;
                                    }else if(item.question_id === si.id && item.question_answer_status !== 1){
                                        isMark = true;
                                    }
                                })
                            })
                            if(isMark && !isUnMark){
                                si.status = 'marked';
                            }else if(isMark && isUnMark){
                                si.status = 'half';
                            }else if(!isMark && isUnMark){
                                si.status = 'unmarked';
                            }
                            new_sub.push(si);
                    });
                    p.sub_item = new_sub;
                });
            }else{
                state.questionsData = payload.questionsData;
            }
        },
        setStudentsList(state, payload){
            if(payload.all){
                state.studentsList = payload.all;
            }else if(payload.user_id){
                state.studentsList.map( student => {
                    if(student.user_id === payload.user_id){
                        for(let p in payload){
                            if(payload.question_id && payload.question_answer_status){
                                student.answers.map(item => {
                                    if(item.question_id === payload.question_id){
                                        item.question_answer_status = payload.question_answer_status;
                                    }
                                });
                            }
                        }
                    }
                });
            }
        },
        setQuestionsList(state, payload){
            state.questionsList = payload.questionsList;
        },
        setQuestionsAnswerData(state, questionsAnswerData){
            state.questionsAnswerData = questionsAnswerData;
        },
        setQuestionShow(state, isShow){
            state.questionShow = isShow;
        },
        setDisableKeyBoard(state, disableKeyBoard){
            state.disableKeyBoard = disableKeyBoard;
        },
        setGuideIndex(state, guideIndex){
            state.guideIndex = guideIndex;
        },
        setMarkWidth(state, markWidth){
            state.markWidth = markWidth;
        },
        setMarkProgress(state, markProgress){
            state.markProgress = markProgress;
        }
    },
    actions: {
        closeMarkMask({commit,state}){
            commit('setShowMarkMask', false);
            state.closeMarkMaskFn();
        },
        updateQuestionStatu({commit, state}, payload){
            commit('setStudentsList', payload);
            commit('setQuestionsData', {setStatus: true});
        },
        getCurrentAnswer({commit,state,getters}){ // 获取当前作答
            const opt = getters.currentReqMarkStatu;
            const exam_id = opt.exam_id;
            const session_id = opt.session_id;
            const qid = opt.qid;

            state.studentsList.map( student => {
                if(student.session_id === session_id){
                    student.answers.map( answer => {
                        if(answer.question_id === qid){
                            const currentAnswer = {
                                score: answer.score,
                                marking_user_id: answer.marking_user_id,
                                question_answer_status: answer.question_answer_status,
                                question_id: answer.question_id,
                                session_id: session_id,
                                subs: answer.subs,
                                user_id: student.user_id,
                                marking_remark: answer.marking_remark,
                                answer: answer.answer
                            };
                            commit('setCurrentAnswer', {currentAnswer: currentAnswer});
                        }
                    })
                }
            });
        }
    }
};
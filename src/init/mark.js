import { mapState,mapMutations,mapActions,mapGetters } from 'vuex';

export default {
    computed: {
        ...mapState(['paperData']),
        ...mapState({
            currentQuestion: state => state.mark.currentQuestion,
            questionsData: state => state.mark.questionsData
        }),
        ...mapGetters(['studentInfoData'])
    },
    methods: {
        ...mapMutations(['setPaperData', 
        'setCurrentQuestion',
        'setQuestionsList',
        'setQuestionsData',
        'setCurrentStudent',
        'setStudentsList',
        'setQuestionsAnswerData', 
        'setPaperId', 
        'setClassId',
        'setOtherOptions',
        'setShowMarkMask'
        ]),
        ...mapActions(['getCurrentAnswer','closeMarkMask']),
        MarkInitGetQuestions(opt){
            if(!opt || !opt.uri || !opt.paramsData){
                return;
            }
            
            this.$apiService.MarkAPI.getQuestions(opt.uri, opt.paramsData)
            .then(res => {
                const data = res.data;
                this.setQuestionsAnswerData(data);
                let isSetDefault = this.currentQuestion.id ? true : false;
                let qlist = [];

                this.markInitPartsData.map((p,i) => {
                    let new_sub = [];
                    p.sub_item.map(si => {
                        var isMark = false;
                        var isUnMark = false;
                        data.map(q => {
                            if(si.id === q.id){
                                this.markInitStudentInfo.map(student => {
                                    student.answers.map(item => {
                                        if(item.question_id === q.id && item.question_answer_status === 1){
                                            isUnMark = true;
                                        }else if(item.question_id === q.id && item.question_answer_status !== 1){
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
                                qlist.push(si);
                                if(!isSetDefault){
                                    this.setCurrentQuestion({currentQuestion:si});
                                    isSetDefault = true;
                                }
                            }
                        })
                        
                    });
                    p.sub_item = new_sub;
                });

                if(this.studentInfoData.unmark.length === 0){
                    this.setShowMarkMask(false);
                    this.$confirm('学生都已批阅完成', '提示', {noBtnShow: false, useMask: this.$root.useCover ? false : true})
                    .then(()=>{
                        this.closeMarkMask();
                    }, ()=>{
                        this.closeMarkMask();
                    });
                }else{
                    this.setQuestionsList({questionsList: qlist});
                    this.setQuestionsData({questionsData: this.markInitPartsData});
                    if(this.defaultQuestion.id){
                        this.setCurrentQuestion({currentQuestion: this.defaultQuestion});
                    }
                    this.setCurrentStudent({currentStudent: this.studentInfoData.unmark[0]});
                    this.getCurrentAnswer();
                }
            })
        },
        MarkInitGetUserRealName(opt){
            if(!opt || !opt.user_id || opt.user_id.length === 0){
                return;
            }

            this.$apiService.MarkAPI.getUserRealName({user_id: opt.user_id})
            .then(res => {
                const nameData = res.data;
                this.markInitStudentInfo.map(student => {
                    nameData.map(name => {
                        if(name.id === student.user_id){
                            student.user_name = name.real_name;
                        }
                    })
                });
                this.setStudentsList({all: this.markInitStudentInfo})
                if(this.markInitStudentInfo && this.markInitStudentInfo.length > 0){
                    let qIDs = [];
                    this.markInitStudentInfo.map(student => {
                        student.answers.map(item => {
                            if(qIDs.indexOf(item.question_id) === -1){
                                qIDs.push(item.question_id);
                            }
                        });
                    })

                    const getQUri = {
                        paper_id: opt.paper_id
                    };
                    const getQParams = {
                        qid: qIDs
                    };

                    this.MarkInitGetQuestions({uri: getQUri, paramsData: getQParams});
                }
            })
        },
        MarkInitGetMark(opt,path){
            if(!opt || !opt.exam_id || !opt.paper_id){
                return;
            }
            let params = {
                exam_id: opt.exam_id, 
                range:'all'
            };
            if(opt.class_id){
                params.class_id = opt.class_id;
            }
            this.$apiService.MarkAPI.getMark(params)
            .then(res => {
                const markData = res.data;
                let studentId = [];
                markData.map(item => {
                    const user_avatar =  path.ref_path + path.avatar_directory + '/avatar/' + item.user_id + '/' + item.user_id + '.jpg?size=80';
                    item.avatar = user_avatar;
                    this.markInitStudentInfo.push(item);
                    studentId.push(item.user_id);
                });
                this.MarkInitGetUserRealName({user_id: studentId,paper_id: opt.paper_id});
            })
        },
        MarkInitGetMarketPaper(paper_id,class_id,exam_id,path){
            const markOpt = {
                class_id: class_id,
                exam_id: exam_id,
                paper_id: paper_id
            };

            this.setPaperId({paperId: paper_id});
            this.setClassId({classId: class_id});
            this.setOtherOptions({path: path});

            if(this.paperData && this.paperData.id){
                this.MarkInitGetMark(markOpt,path);
                return;
            }
            
            this.$apiService.AnswerAPI.getPapersById({paper_id: paper_id})
            .then( res => {
                this.setPaperData(res.data);
                let qIndex = 0;
                res.data.parts.map((q,i) => {
                    let wrapData = {};

                    wrapData.title = q.title;
                    wrapData.sub_item = [];
                    wrapData.index = i;

                    q.question_identities.map(si => {
                        let sub_item = {};
                        sub_item.id = si;
                        sub_item.index = qIndex;
                        qIndex ++;
                        wrapData.sub_item.push(sub_item);
                    });

                    this.markInitPartsData.push(wrapData);
                });

                this.MarkInitGetMark(markOpt,path);
            });
        },
        initMark(paper_id,class_id,exam_id,path,c_q){
            if(!class_id){
                class_id = '';
            }
            this.markInitPartsData = [];
            this.markInitStudentInfo = [];
            this.defaultQuestion = c_q ? c_q : {};
            this.MarkInitGetMarketPaper(paper_id,class_id,exam_id,path);
        },
    },
    data(){
        return {
            markInitPartsData: [],
            markInitStudentInfo: [],
            defaultQuestion: {}
        }
    }
}
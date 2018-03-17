<template>
    <div class="slp-ui-popup slp-ui-popup--card" v-show="isShowMarkMask">
        <div class="slp-ui-popup__box">
            <div class="slp-ui-popup__head">
                <h2 class="slp-ui-popup__title" :title="paperData.title">{{paperData.title}}</h2>
                <a class="slp-ui-popup__close" @click="handleClose"></a>
            </div>
            <div class="slp-ui-popup__content">
                <a class="slp-elm-refresh slp-mod-refresh" v-show="newSubmitOpt.submit_count > 0" @click="handleNewSubmit">
                    <span class="slp-elm-refresh__nums">{{newSubmitOpt.submit_count}}个新交卷</span>
                </a>
                <div v-show="showTip">{{tip}}</div>
                <div class="slp-mod-cardpar" v-for="(question,$index) in questionsData" :key="$index" v-show="question.sub_item.length > 0">
                    <h3 class="slp-mod-cardtit" v-html="question.title"></h3>
                    <ul class="slp-mod-answercard clearfix">
                        <!-- 已全部批改完slp-done;slp-unfinished部分未批改；全部未批改slp-undo-->
                        <li v-for="item in question.sub_item" @click="handleClick(item)" :key="item.index" 
                            class="slp-ui-answersheet slp-mod-answersheet__item slp-undo"
                            :class="[
                                {
                                    'slp-unfinished': item.status === 'half',
                                    'slp-done': item.status === 'marked'
                                }
                            ]">
                            <a class="slp-ui-answersheet__cont">{{item.index+1}}</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="slp-ui-popup__bottom">
                <a class="slp-ui-btn slp-ui-btn--l slp-ui-btn--primary slp-ui-popup__btn" :class="{'slp-disabled':showTip}" @click="startMark()">开始批阅</a>
                <!-- slp-ui-btn 禁用添加样式 slp-disabled -->
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState,mapMutations,mapActions} from 'vuex';
    import MarkInit from '../../init/mark';
    import moment from 'moment';

    export default {
        name: 'markcover',
        mixins: [MarkInit],
        data(){
            return {
                date: moment().format(),
                new_submit_count: 0,
                tip: ''
            }
        },
        props: {
            closeBtn: {
                type: Function,
                default(){}
            },
            onClick: {
                type: Function,
                default(){}
            },
            isShow: {}
        },
        computed: {
            ...mapState({
                currentStudent: state => state.mark.currentStudent,
                questionsData: state => state.mark.questionsData,
                newSubmitOpt: state => state.mark.newSubmitOpt,
                questionsList: state => state.mark.questionsList,
                isShowMarkMask: state => state.mark.isShowMarkMask
            }),
            ...mapState([
                'examId',
                'paperId',
                'classId',
                'otherOptions',
                'paperData'
                ]),
            questions(){
                return this.paperData && this.paperData.parts ? this.paperData.parts : [];
            },
            showTip(){
                if(!this.questionsData || !this.questionsData.length){
                    this.setShowMarkMask(false);
                    return true;
                }else if(this.questionsData.length >0 && this.questionsList.length === 0){
                    if(this.isShow){
                        this.setShowMarkMask(true);
                    }
                    this.tip = '当前无待批阅测评！';
                    return true;
                }else {
                    if(this.isShow){
                        this.setShowMarkMask(true);
                    }
                    return false;
                }
            }
        },
        methods: {
            ...mapMutations([
                'setCurrentQuestion',
                'setCurrentAnswer',
                'setQuestionsData',
                'setStudentsList',
                'setCardShow',
                'setShowMarkMask',
                'setNewSubmitOpt',
                'setCloseMarkMaskFn'
                ]),
            ...mapActions(['getCurrentAnswer','updateQuestionStatu','closeMarkMask']),
            handleClose(){
                this.closeBtn();
                this.setShowMarkMask(false);
            },
            handleClick(question){
                this.setCurrentQuestion({currentQuestion: question});
                this.getCurrentAnswer();
                this.onClick(question);
                this.setShowMarkMask(false);
            },
            handleNewSubmit(){
                const opt = {
                    class_id: this.classId,
                    exam_id: this.examId,
                    paper_id: this.paperId
                };

                const path = this.otherOptions.path;
                
                this.setNewSubmitOpt({
                    submit_count: 0,
                    last_date: this.newSubmitOpt.server_date
                });
                this.initMark(this.paperId,this.classId,this.examId,path);
            },
            // 开始批阅第一个未完整批阅的题目，若全批阅完成，则批阅第一题
            startMark(){
                if(this.showTip){
                    return;
                }
                let unmarkedQuestion,fristQuestion;
                this.questionsData.forEach(question=>{
                    question.sub_item.forEach(item=>{
                        if(!fristQuestion){
                            fristQuestion = item;
                        }
                        if(!unmarkedQuestion && item.status!=='marked'){
                            unmarkedQuestion = item;
                        }
                    });
                });
                this.handleClick(unmarkedQuestion?unmarkedQuestion:fristQuestion);
            }
        },
        mounted(){
            this.setCloseMarkMaskFn(this.closeBtn);
            let params = {
                exam_id: this.examId, 
                range:'all'
            };

            if(this.classId){
                params.class_id = this.classId;
            }
            
            this.$apiService.MarkAPI.getMark(params)
            .then(res => {
                const markData = res.data;
                if(markData.length === 0){
                    this.setShowMarkMask(false);
                    this.$confirm('暂无待批阅试卷', '提示', {
                        noBtnShow: false,
                        useMask: false
                    })
                    .then(() => {
                        this.closeBtn();
                    },()=>{
                        this.closeBtn();
                    });
                }
            })
        }
    }
</script>

<style lang="scss" scoped>
    .slp-ui-popup.slp-ui-popup--card {
        background: none;
    }
</style>
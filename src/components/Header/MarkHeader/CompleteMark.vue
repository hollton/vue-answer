<template>
    <a class="slp-ui-btn slp-ui-btn--primary slp-ui-btn--l" :class="{'slp-disabled':isDisabled}" @click="commitMark">{{isPaperComplete?'提交批阅':'保存批阅'}}</a>
</template>
<script>
import {
    mapState,
    mapMutations,
    mapActions
} from 'vuex';
import {
    customFind
} from '../../../utils/common';
export default {
    name: 'completeMark',
    data() {
        return {
            unmarkQuestions: [],
            successTip: '提交批阅成功',
            failTip: '提交批阅失败，请稍候重试',
            showCompleteTip:true
        };
    },
    props:{
        closeBtn: {
            type: Function,
            default(){}
        },
        confirmBtn: {
            type: Function,
            default(){}
        },
        cancelBtn: {
            type: Function,
            default(){}
        }
    },
    computed: {
        ...mapState(['examId', 'configData','isSaving','showCustomMarkError']),
        ...mapState({
            studentsList: state => state.mark.studentsList,
            questionsList: state => state.mark.questionsList,
            markProgress: state => state.mark.markProgress,
            guideIsShow: state => state.mark.guideIndex>0
        }),
        isDisabled() {
            return !this.configData.markable;
        },
        isPaperComplete(){
            let isPaperComplete = this.markProgress===100;
            if(isPaperComplete && this.showCompleteTip && !this.guideIsShow){
                // 弹窗提示
                this.$confirm('您已全部批阅完成，确定要提交批阅信息吗？', '您正在提交批阅信息',{yesBtn:'提交批阅',noBtn:'我再看看'}).then(() => {
                    this.batchCompleteMark();
                },()=>{
                    this.showCompleteTip = false;
                });
            }
            return isPaperComplete;
        }
    },
    methods: {
        ...mapMutations(['setCurrentQuestion', 'setCurrentStudent', 'changeConfig']),
        ...mapActions(['getCurrentAnswer']),
        commitMark() {
            if (this.isDisabled || this.showCustomMarkError) {
                return;
            }
            let unmarkStudent = this.calcUnFinishedStudents();

            if (this.isSaving) {
                this.$tip('正在保存作答，请稍后......');
                return;
            }
            if (unmarkStudent) { // 未全部批改完成
                this.$confirm(`还有${unmarkStudent}个人未批改完成，确定要保存批阅信息吗?`, '您正在保存批阅信息',{yesBtn:'保存',noBtn:'继续批改'}).then(() => {
                    this.confirmBtn();
                    this.closeBtn();
                },()=>{
                    //this.calcUnmarkQuestions();
                    //this.gotoUnmarkQuestions();
                });
            } else {
                this.$confirm('恭喜您全部批阅完成，确定要提交批阅信息吗？', '您正在提交批阅信息',{yesBtn:'提交批阅',noBtn:'我再看看'}).then(() => {
                    this.batchCompleteMark();
                });
            }
        },
        // 批量提交批阅 - 只提交未批阅学生status:'unmark'，解决对异动后批阅产生影响
        batchCompleteMark() {
            let paramData = {
                exam_id: this.examId,
                session_ids: [],
            };
            this.studentsList && this.studentsList.forEach(student => {
                if (student.status === 'unmark') {
                    paramData.session_ids.push(student.session_id);
                }
            });
            this.$apiService.MarkAPI.batchCompleteMark(paramData).then(() => {
                this.changeConfig({
                    key: 'markable',
                    isTruth: false
                });
                this.confirmBtn();
                this.closeBtn();
            }, err => {
                this.closeBtn();
                this.cancelBtn();
            });
        },
        // 计算并设置当前未批阅题数
        calcUnmarkQuestions() {
            this.unmarkQuestions = [];
            this.questionsList && this.questionsList.forEach(item => {
                if (item.status !== 'marked') {
                    this.unmarkQuestions.push(item);
                }
            });
            return this.unmarkQuestions.length;
        },
        // 计算没有完全批改完的学生人数
        // 提交批阅成功改写question_answer_status，并未改写mark_count，因此不可使用mark_count判断未批阅人数
        calcUnFinishedStudents(){
            let unFinish = 0;
            this.studentsList.forEach(function(student){
                if(customFind(student.answers,{question_answer_status:1})){ // status 1 表未批阅
                    unFinish++;
                }
            });
            return unFinish;
        },
        // 回到未批阅的第1题第一个学生
        gotoUnmarkQuestions() {
            let currentQuestion = this.unmarkQuestions[0],
                matchQuestion,
                currentStudent,
                canContinue = true;
            this.setCurrentQuestion({
                currentQuestion: currentQuestion
            });
            this.studentsList && this.studentsList.forEach(student => {
                matchQuestion = customFind(student && student.answers, {
                    question_id: currentQuestion.id,
                    question_answer_status: 1
                });
                if (matchQuestion && canContinue) {
                    currentStudent = student;
                    canContinue = false;
                }
            });
            this.setCurrentStudent({
                currentStudent: currentStudent
            });
            this.getCurrentAnswer();
        }
    }
};
</script>

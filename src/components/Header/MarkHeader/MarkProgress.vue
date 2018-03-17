<template>
    <fa-progress :percentage="markProgress" :text="'试卷批阅进度：'"></fa-progress>
</template>
<script>
import { mapState } from 'vuex';
export default {
    name: 'markProgress',
    computed: {
        ...mapState({
            studentsList: state => state.mark.studentsList
        }),
        // 学生量*题目量为进度总量
        markProgress(){
            let questionTotalCount = 0,questionMarkedCount = 0,markProgress=0;
            this.studentsList.forEach(stuItem=>{
                stuItem.answers.forEach(answerItem=>{
                    questionTotalCount++;
                    if(answerItem.question_answer_status !== 1){ // 被批阅
                        questionMarkedCount++;
                    }
                });
            });
            markProgress = questionMarkedCount/questionTotalCount*100 || 0;
            this.$store.commit('setMarkProgress',markProgress);
            return markProgress;
        }
    }
};
</script>
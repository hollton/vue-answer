<template>
    <a v-show="configData.editable" :class="{'disabled':initPaperStatu.isAllFinishedCanSubmit && !isAllFinished}" class="btn-submit" @click="openConfirm">
        <span>交卷</span>
    </a>
</template>
<script>
import {
    mapState,
    mapGetters,
    mapMutations,
    mapActions
} from 'vuex';

export default {
    name: 'finished',
    props: {
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
        ...mapState(['paperData', 'questionsTotal', 'questionsCount', 'configData', 'isSaving']),
        ...mapGetters(['initPaperStatu']),
        leftQuestions() {
            return this.questionsTotal - this.questionsCount;
        },
        isAllFinished() {
            return this.leftQuestions === 0;
        }
    },
    methods: {
        ...mapMutations(['changeConfig', 'setSubmitStatus']),
        ...mapActions(['examSubmit']),
        openConfirm() {
            if (this.initPaperStatu.isAllFinishedCanSubmit && !this.isAllFinished) {
                //this.$confirm(`共${this.questionsTotal}道题，还有${this.leftQuestions}道题未完成，请完成全部题目后交卷。`);
                return;
            }
            if (this.isSaving) {
                this.$tip('正在保存作答，请稍后......');
                return;
            }
            const unfinish = `共${this.questionsTotal}道题，还有${this.leftQuestions}道题未完成，确定要交卷？`;
            const finish = '交卷前最好检查一下哦，确定要交卷？';
            const is_finish = this.isAllFinished ? finish : unfinish;

            this.$confirm(is_finish, '您正在结束作答')
                .then(() => {
                    let paramData = {
                        exam_id: this.paperData.exam_id,
                        session_id: this.paperData.session_id,
                    };
                    this.$store.commit('setSubmitStatus', true);
                    this.examSubmit(paramData).then(() => {
                        this.$store.commit('setSubmitStatus', false);
                        this.changeConfig({
                            key: 'editable',
                            isTruth: false
                        });
                        this.closeBtn();
                        this.confirmBtn();
                    }, () => {
                        this.$store.commit('setSubmitStatus', false);
                        this.closeBtn();
                        this.cancelBtn();
                    });
                }, err => {
                    this.closeBtn();
                    this.cancelBtn();
                });
        }
    }
};
</script>
<style lang="scss">
</style>

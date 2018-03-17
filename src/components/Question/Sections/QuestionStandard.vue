<!-- 题目评分标准
    <question-standard :standards="quesSubItem.items"></question-standard>
 -->
<template>
    <div v-if="showStandard">
        <dl v-for="(item,index) in standards" class="question-standard">
            <dt v-text="'评分标准'+(index+1)"></dt>
            <dd v-for="markItem in item.mark_items">
                <em v-text="markItem.score+'分'"></em>
                <span v-html="markItem.remark"></span>
            </dd>
        </dl>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
    name: 'QuestionStandard',
    props: ['standards'],
    computed: {
        ...mapGetters(['initPaperStatu']),
        showStandard(){
            return this.initPaperStatu.showQuestionStandard && this.standards && this.standards.length;
        }
    }
};
</script>
<style lang="scss" scoped>
    .question-standard{
        dt{
            background: #fafafa!important;
            height: 43px!important;
            line-height: 43px!important;
            padding-left: 25px!important;
            margin: 10px 0!important;
        }
        dd{
            padding: 0 0 10px 25px!important;
            text-align:left!important;
            em{
                margin-right: 12px!important;
            }
        }
    }
</style>
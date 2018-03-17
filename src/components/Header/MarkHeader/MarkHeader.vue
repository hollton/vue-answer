<template>
    <div :class="guideClass">
        <div class="examine-header slp-mod-examine-header">
            <div class="wrapper clearfix">
                <div class="examine-header-left fl">
                    <div class="examine-select-title fl">
                        <question-list></question-list>
                    </div>
                    
                    <div class="examine-data fr">
                        <mark-progress></mark-progress>
                        <student-list></student-list>
                    </div>
                </div>
                
                <div class="examine-header-right fr">
                    <slot name="submitMark"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import QuestionList from './QuestionList';
    import StudentList from './StudentList';
    import MarkProgress from './MarkProgress';

    export default {
        name: 'markHeader',
        props:{
            closeBtn: Function
        },
        computed: {
            ...mapState({
                guideClass: state => state.mark.guideIndex>0?'slp-mod-guidindex slp-mod-guidindex--step'+state.mark.guideIndex:''
            })
        },
        components: {
            QuestionList,
            StudentList,
            MarkProgress
        }
    };
</script>
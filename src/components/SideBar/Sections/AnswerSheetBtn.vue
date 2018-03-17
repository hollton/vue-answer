<template>
    <a v-show="show" class="btn-card" @click="openAnswerSheet">
        <span>答题卡</span>
    </a>
</template>
<script>
    import {mapMutations} from 'vuex';

    export default {
        name: 'answersheetbtn',
        props: {
            show: {
                type: Boolean,
                default: true
            }
        },
        methods: {
            ...mapMutations,
            openAnswerSheet(){
                this.$store.commit('handleShowAnswersheet');
            }
        }
    }
</script>
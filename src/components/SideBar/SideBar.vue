<template>
    <div class="side-toolbar" ref="sidebar">
        <slot></slot>
        <answer-sheet></answer-sheet>
    </div>
</template>
<script>
    import {mapState,mapGetters} from 'vuex';
    import sidebarComponents from './Sections';
    export default{
        name: 'sidebar',
        components: {
            ...sidebarComponents
        },
        computed: {
            ...mapState(['configData']),
            ...mapGetters(['initPaperStatu'])
        },
        // mounted(){
        //     const sideBarHeight = this.$refs.sidebar.clientHeight;
        //     const windowHeight = window.innerHeight;
        //     this.styleTop = windowHeight/2 - sideBarHeight/2 + 'px';
        // },
        // data(){
        //     return {
        //         styleTop: 0
        //     }
        // }
    }
</script>
<style lang="scss" scoped>
    @media screen and (min-width: 1920px){
        .side-toolbar{
            right: 50%;
            margin-right: -680px;
        }
    }
</style>
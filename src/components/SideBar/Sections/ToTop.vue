<template>
    <a v-show="show" class="btn-gotop" v-anchor="{id: 'toTop'}"><span>返回顶部</span></a>
</template>
<script>
    export default{
        name: 'totop',
        props: {
            show: {
                type: Boolean,
                default: true
            }
        },
    }
</script>
<style lang="scss">
    
</style>
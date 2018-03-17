<template>
    <div class="fa-raido-group" :class="[mode]">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'FaRadioGroup',
        componentName: 'FaRadioGroup',
        props: {
            mode:{
                type: String,
                default: 'horizontal'
            },
            value: {}
        },
        watch:{
            value(val){
                this.$emit('change', val);
            }
        }
    }
</script>
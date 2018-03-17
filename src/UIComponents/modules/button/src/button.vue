<template>
    <button
        class="fa-button"
        :disabled="disabled"
        :type="nativeType"
        @click="handleClick"
        :class="[
            type ? 'fa-button--' + type : '',
            size ? 'fa-button--' + size : '',
            {
                'is-disabled': disabled
            }
        ]"
        
    >
        <slot></slot>
    </button>
</template>

<script>
    export default{
        name: 'FaButton',

        props: {
            type: {
                type: String,
                default: 'default'
            },
            size: String,
            disabled: Boolean,
            nativeType: {
                type: String,
                default: 'button'
            }
        },
        methods: {
            handleClick(evt){
                this.$emit('click', evt);
            }
        }
    }
</script>
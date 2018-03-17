<template>
    <div class="fa-checkbox-group" :class="[mode]">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'FaCheckboxGroup',
        componentName: 'FaCheckboxGroup',
        props:{
            mode:{
                type: String,
                default: 'horizontal'
            },
            value: {}
        }
    }
</script>
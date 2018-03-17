/**
    文本域组件
    @v-model 绑定的值
    @input 输入事件
    @focus 聚焦事件
    @blur 失焦事件
    <fa-textarea v-model="inputValue"></fa-textarea>
 */

<template>
    <div class="fa-textarea">
        <textarea 
        class="fa-textarea__input" 
        v-bind:class="[
            {
                'unresize': !resize,
                'is-disabled': disabled
            }
        ]"
        :placeholder="placeholder"
        :readonly="readonly || disabled"
        :name="name"
        :cols="cols"
        :rows="rows"
        :value="currentValue"
        :autofocus="autofocus"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        :maxlength="maxlength"
        >
        </textarea>
        <span class="fa-textarea__count" v-show="showCount">
            <span 
            class="fa-textarea__count__number"
            v-bind:class="[
                {
                    'is-wrong': isOutOfMaxlength
                }
            ]"
            >{{textlength}}</span>/{{maxlength}}
        </span>
    </div>
</template>

<script>
    export default {
        name: 'FaTextarea',
        props:{
            name: [String,Number],
            cols: [String,Number],
            rows: {
                type: [String,Number],
                default: 8
            },
            placeholder: [String,Number],
            readonly: {},
            disabled: {},
            value: [String,Number],
            maxlength: [String,Number],
            autofocus: {String,Boolean},
            showCount: {
                type: Boolean,
                default: false
            },
            resize:{
                type: Boolean,
                default: false
            }
        },
        computed: {
            textlength(){
                return this.currentValue ? this.currentValue.length : 0;
            },
            isOutOfMaxlength(){
                return this.currentValue ? this.currentValue.length > this.maxlength : 0;
            }
        },
        watch:{
            'value'(val,oldval){
                this.setCurrentValue(val);
            }
        },
        methods:{
            handleInput(evt){
                const value = evt.target.value;
                this.setCurrentValue(value);
                this.$emit('input', value);
                this.$emit('change', value);
            },
            handleBlur(evt){
                this.$emit('blur', evt);
            },
            handleFocus(evt){
                this.$emit('foucs', evt);
            },
            setCurrentValue(value){
                if(value === this.currentValue){
                    return;
                }
                this.currentValue = value;
            }
        },
        data(){
            return {
                currentValue: this.value
            }
        }
    }
</script>
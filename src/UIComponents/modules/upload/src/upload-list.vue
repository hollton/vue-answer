<template>
    <ul class="img-list clearfix" v-show="fileList">
        <li
            v-bind:class="[
                {
                    'img-list-loading': file.status === 'progress',
                    'failed': file.status === 'error'
                }
            ]" 
            v-for="(file, $index) in fileList" :key="$index"
        >
            <img 
            :src="file.__url" 
            @click="onClick(file.__url, file, $index)" v-show="file.status !== 'progress' || file.status !== 'error'">
            <span v-show="file.status == 'progress'">上传{{file.percentage}}%</span>
            <a class="btn-deleteimg" @click="$emit('remove', file, $index)"></a>
        </li>
    </ul>
</template>

<script>
    const noFn = function(){};

    export default {
        name: 'FaUploadList',
        props: {
            fileList: {
                type: Array,
                default: []
            },
            onClick: {
                type: Function,
                default: noFn
            }
        },
        computed: {
            isClickAction(){
                return this.onClick.toString() !== noFn.toString();
            }
        },
        data(){
            return {
                isShow: false
            }
        }
    }
</script>

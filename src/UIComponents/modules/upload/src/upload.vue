/** 
    上传组件
    调用方式：
    <fa-upload :http-request="handleUpload" :on-success="handleSuccess" :max-file-count="3" :accept="'image/*'"></fa-upload>
    
    @fileList 文件列表
    @beforeUpload 上传之前的回调
    @onStart 开始上传
    @onProgress 上传中
    @onSuccess 上传成功
    @onError 上传失败
    @onRemove 删除图片
    @httpRequest 自定义上传方式
    @multiple 多选
    @accept 文件类型
    @maxSize 最大的文件大小
    @maxFileCount 最多的文件数量
    @disabled 禁用
    @onClickImg 点击图片的回调函数
*/

<template>
    <div class="fa-upload clearfix">
        <div class="fa-upload__container on">
            <p class="img-counter">
                上传图片
            </p>
            <div class="fa-upload__file" @click="handleClick" v-show="!isDisabled">
                <button class="addimg-nv-min" :disabled="isDisabled"></button>
                <input class="fa-upload__input" type="file" ref="input" @change="handleChange" :multiple="multiple" :accept="accept" :value="[]"/>
            </div>
            <fa-upload-list :file-list="fileList" v-on:remove="handleRemove" :save-edit="endEdit" :on-click="onClickImg"></fa-upload-list>
        </div>
    </div>
</template>

<script>
    import FaButton from '../../button';
    import FaUploadList from './upload-list';

    const noFn = function(){};

    export default {
        name: 'FaUpload',
        props: {
            fileList: {
                type: Array,
                default(){
                    return [];
                }
            },
            multiple: Boolean,
            accept: String,
            maxSize: Number,
            maxFileCount: Number,
            disabled: Boolean,
            beforeUpload: Function,
            endEdit: Function,
            onRemove: {
                type: Function,
                default: noFn
            },
            onStart: {
                type: Function,
                default: noFn
            },
            onProgress: {
                type: Function,
                default: noFn
            },
            onSuccess: {
                type: Function,
                default: noFn
            },
            onError: {
                type: Function,
                default: noFn
            },
            httpRequest: {
                type: Function,
                default: noFn
            },
            onClickImg: {
                type: Function,
                default: noFn
            }

        },
        computed: {
            tFileList:{
                get(){
                    return this.fileList;
                }
            }
        },
        methods: {
            handleClick(){
                if(!this.isDisabled){
                    this.$refs.input.click();
                }
            },
            // 选择文件
            handleChange(evt){
                const fileList = evt.target.files;
                this.handleStart(fileList);
            },
            // 上传操作
            upload(file, index){
                if(!this.beforeUpload){
                    this.post(file);
                    return;
                }

                const before = this.beforeUpload(file, this.tFileList);

                if(before && before.then){
                    before.then(()=>{
                        this.post(file);
                        return;
                    }, err => {
                        this.tFileList.splice(index, 1);
                        return;
                    })
                }else if(!before){
                    this.tFileList.splice(index, 1);
                    return;
                }else if(before){
                    this.post(file);
                }
            },
            // 正式提交上传
            post(file){
                const options = {
                    file: file,
                    fileList: this.tFileList,
                    onProgress: e => {
                        this.handleProgress(e, file);
                        this.onProgress(e, file);
                    },
                    onSuccess: res => {
                        this.handleSuccess(res, file);
                        this.onSuccess(res, file);
                    },
                    onError: err => {
                        this.handleError(err, file);
                        this.onError(err, file);
                    }
                };
                const request = this.httpRequest(options);
                if(request && request.then){
                    request.then(options.onSuccess, options.onError);
                }
            },
            // 开始上传
            handleStart(files){
                let _fileList = Array.prototype.slice.call(files);
                const _tmpFileLength = _fileList.length + this.tFileList.length;
                const leftCount = this.maxFileCount - _tmpFileLength;
                
                if(_tmpFileLength > this.maxFileCount){
                    if(leftCount < 0 && this.tFileList.length === 0){
                        _fileList = _fileList.slice(0, this.maxFileCount);
                    }else if( leftCount < 0 || leftCount > 0){
                        _fileList = _fileList.slice(0, leftCount);
                    }
                }
                
                if(!this.handleMaxFileCount()){
                    return;
                }

                _fileList.map((file, index) => {
                    if(!this.handleMaxFileSize(file)){
                        console.error(`文件${file.name}的大小大于 ${this.maxSize} 字节`)
                        return;
                    }

                    file.status = 'ready';
                    file.percentage = 0;
                    file.__uid = Date.now() + this.tempIndex++;
                    try {
                        file.__url = URL.createObjectURL(file);
                    } catch (error) {
                        console.error(error);
                        return;
                    }
                    
                    this.tFileList.push(Object.assign({},file));
                    this.upload(file,index);
                })

                this.handleMaxFileCount();
            },
            // 上传中
            handleProgress(e, file){
                this.changeFileData(file, {status: 'progress',percentage: e.percentage});
                if(e.percentage === 100 && file){
                    this.changeFileData(file, {status: 'success'});
                }
            },
            // 上传成功
            handleSuccess(res, file){
                let fileList = this.tFileList;
                let targetFileIndex = this.getFile(file).index;
                fileList[targetFileIndex].url = res ? res.url : fileList[targetFileIndex].url;
                this.changeFileData(file, {status: 'success'});
            },
            // 上传失败
            handleError(err, file){
                this.changeFileData(file, {status: 'error'});
            },
            // 移除文件
            handleRemove(file, index){
                let fileList = this.tFileList;
                fileList.splice(fileList.indexOf(file), 1);
                this.tempIndex--;
                this.handleMaxFileCount();
                this.onRemove(file, fileList);
            },
            changeFileData(file, obj){
                let fileList = this.tFileList;
                let targetFileIndex = this.getFile(file).index;
                for(let key in obj){
                    file[key] = obj[key];
                    fileList[targetFileIndex][key] = obj[key];
                }
            },
            // 文件大小
            handleMaxFileSize(file){
                let isValid = true;

                if(this.maxSize && (file.size > this.maxSize)){
                    isValid = false;
                }

                return isValid;
            },
            // 最大文件数量
            handleMaxFileCount(){
                let isValid = true;

                if(this.maxFileCount && !(this.tFileList.length < this.maxFileCount)){
                    this.isDisabled = true;
                    isValid = false;
                }else{
                    this.isDisabled = false;
                }
                
                return isValid;
            },
            getFile(file){
                let fileList = this.tFileList;
                let targetUID = file.__uid;
                let targetFile = {};

                fileList.map((item, index) => {
                    if(item.__uid === targetUID){
                        targetFile.index = index;
                        targetFile.file = item;
                    }
                });

                return targetFile
            }
        },
        data() {
            return {
                tempIndex: 0,
                isDisabled: this.disabled
            }
        },
        mounted(){
            if(this.fileList.length < this.maxFileCount){
                this.isDisabled = false;
            }else{
                this.isDisabled = true;
            }
        },
        components: {
            FaButton,
            FaUploadList
        }
    }
</script>
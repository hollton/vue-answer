<!-- 题目图片展示
    <question-image :questionResult="quesResult" :timeSaveAnswer="timeSaveAnswer" :disableUpload="disableUpload" :forComplex="forComplex"></question-image>
 -->
<template>
    <div class="img-upload-container on">
        <div class="imgshow" v-show="attachments.length > 0 && currentAttachment.url">
            <fa-image :class-name="'hover-pointer'" :img-src="currentAttachment.url" :use-loading="true" :on-click="toggleEdit" :on-success="onImageSuccess"></fa-image>
            <!--<img class="hover-pointer" :src="currentAttachment.url" @click="toggleEdit()" v-imageload="currentAttachment.url">-->
        </div>
        <ul class="img-list clearfix" v-show="attachments && attachments.length && isDisabled">
            <li :class="{'is-active': currentAttachment.id===file.id}" v-for="file in attachments">
                <!-- <fa-image :class-name="'hover-pointer'" :img-src="file.url" :use-loading="false" :on-click="handleCurrentPic.bind(this, file.url,file)"></fa-image> -->
                <img class="hover-pointer" :src="file.__url" @click="handleCurrentPic(file.url, file)" /> 
            </li>
        </ul>
        
        <!-- 图片上传组件 -->
        <fa-upload v-if="!isDisabled" :http-request="handleUpload" :file-list="attachments" :on-click-img="handleCurrentPic" :max-file-count="maxCount" :on-remove="handleRemovePic" :on-success="handleUploadSuccess" :accept="accept" :multiple='multiple'></fa-upload>
        <!-- /图片上传组件 -->
        <!-- 图片裁剪组件 -->
        <fa-cropper v-model="isShowEdit" :img-list="attachments" :img-url="currentAttachment.url" :save="handleEndCrop" :use-crop="!isDisabled" data-type="blob" :after-switch="handleCurrentPic"></fa-cropper>
        <!-- /图片裁剪组件 -->
        <div class="cropper__tip__text" v-show="isCroping">裁剪中...{{cropperProgress}}%</div>
    </div>
</template>
<script>
import {
    mapState,
    mapActions,
    mapMutations,
    mapGetters
} from 'vuex';
import '../../../assets/js/cs-object-sdk-js/js/jquery-2.2.0.min';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/lib/spark-md5';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/common/content';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/common/utils';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/common/httpclient';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/third-platform-sdk/ceph-s3-sdk';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/third-platform-adapter/ceph-s3-adapter';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/common/uploader';
import '../../../assets/js/cs-object-sdk-js/js/cssdk/api/cs-object';
window.CSSDK.Content.setEnv(__config.env === 'product' ? 'PRODUCTION' : 'PREPRODUCTION');
window.CSSDK.Content.setChunkSize(1); //cssdk最小1M

export default {
    name: 'QuestionImage',
    /**
     * questionResult:作答结果
     * timeSaveAnswer:作答保存
     * disableUpload:禁用图片上传，只显示图片展示
     * forComplex:在套题上调用，其子题取图片列表及保存时要区分
     * 普通题：
     * {
     *      "type": "cs_image",
     *      data:[{id:''}]
     * }
     * 套题子题：
     * {
     *      "type": "cs_sub_image",
     *      data:[{
     *          q:"子题编号1,2,3,4", // string类型
     *          sub_data:[{id:''}]
     *      }]
     * }
     * subQuestionIndex:套题子题的序号
     */
    props: ['questionResult','timeSaveAnswer','disableUpload','forComplex','subQuestionIndex','editable'],
    data() {
        return {
            maxCount: 4,
            multiple:true,
            accept: 'image/jpeg,image/jpg,image/png,image/bmp,image/gif',
            isShowEdit: false,
            attachments: this.getAttachments(this.questionResult.answer), // 图片附件列表
            currentAttachment: {},  //当前图片
            cropperProgress: 0,
            isCroping: false,
            isCurrImgLoading: false
        };
    },
    mounted() {
        if (this.attachments && this.attachments[0]) {
            this.currentAttachment = this.setCurrentPic(this.attachments[0]);
        }
    },
    watch:{
        isShowEdit(newVal){
            this.$store.commit('setDisableKeyBoard', newVal);
        }
    },
    computed: {
        ...mapState(['paperData', 'configData','resultData']),
        ...mapGetters(['initPaperStatu']),
        isDisabled() {
            return !this.configData.editable || this.disableUpload;
        }
    },
    methods: {
        ...mapMutations(['setResultData']),
        ...mapActions(['getUploadUrl']),
        /**
         * 私有方式上传的图片，elearning返回的下载地址中没有session!!!
         * 不过出于性能考虑，答案图片都是用公开方式的，所以这个问题不影响功能。
         * @param attachment
         * @param {number} size 图片高度，取值可以是： 80、120、240、480
         * @returns {any}
         */
        getImageAttachmentUrl: function(attachment, size) {
            if (attachment && attachment.id && !attachment.isUploadingFile) {
                var url = attachment.url;
                if (!url) {
                    url = attachment.server_url + '/download?dentryId=' + attachment.id;
                    if (attachment.session) {
                        url += '&session=' + attachment.session;
                    }
                }
                if (size) {
                    url = url.replace(/&size=\d+/g,'');
                    url += '&size=' + size;
                }
                return url;
            } else {
                return this.initPaperStatu.thumbnailUrl; //默认图片
            }
        },
        onImageSuccess(url){
            this.isCurrImgLoading = true;
            this.currentAttachment.url = url;
        },
        toggleEdit(){
            this.isShowEdit = !this.isShowEdit;
        },
        //获取题目图片列表
        getAttachments(questionAnswer) {
            let answerData;
            let attachments;
            let _this = this;
            try {
                answerData = JSON.parse(questionAnswer);
            } catch (e) {
                answerData = questionAnswer;
            }
            answerData = answerData?answerData:{};
            
            if(!this.forComplex && answerData.type==='cs_image'){
                attachments = answerData.data;
            } else if(this.forComplex && answerData.type==='cs_sub_image'){
                answerData.data && answerData.data.forEach(item=>{
                    if(item.q===this.subQuestionIndex.toString()){
                        attachments = item.sub_data;
                    }
                });
            }
            attachments = attachments?attachments:[];
            attachments.forEach(item => {
                item.__oriUrl = _this.getImageAttachmentUrl(item);
                item.__url = _this.getImageAttachmentUrl(item,120);
                item.__uid = item.id;
            });
            return attachments;
        },
        //设置当前图片
        setCurrentPic(newAttachment) {
            let currentAttachment = {};
            if (newAttachment) {
                currentAttachment = newAttachment;
                currentAttachment.url = this.getImageAttachmentUrl(currentAttachment);
            } else {
                currentAttachment = {
                    url: '',
                    name: ''
                };
            }
            return currentAttachment;
        },
         // 点击|图片切换回调：设置为当前图片
        handleCurrentPic(url, img) {
            // if(!this.isCurrImgLoading){
            //     return;
            // }
            this.currentAttachment = this.setCurrentPic(img);
        },
        // 删除图片
        handleRemovePic() {
            this.currentAttachment = this.setCurrentPic(this.attachments && this.attachments[0]);
            this.saveAnswer();
        },
        // 图片上传
        handleUpload(action) {
            let _this = this;
            this.$store.commit('setSaveStatus',true);
            this.getUploadUrl().then(rtnData => {
                const file = action.file;
                const serviceName = rtnData.dist_path.split('/')[1];
                const remotePath = [rtnData.dist_path, file.name].join('/');
                const session = rtnData.session_id;
                const scope = 1;
                window.CSSDK.CSClient.upload(serviceName, file, remotePath, scope, {
                    //成功回调
                    onNotifySuccess(dentry) {
                        dentry.url = __config.ref_path + dentry.path;
                        dentry.source_file_name = dentry.source_file_name || action.file.name;
                        dentry.size = dentry.size || action.file.size;
                        action.onSuccess(dentry, action.file, action.fileList);
                        _this.$store.commit('setSaveStatus',false);
                    },
                    //失败回调
                    onNotifyFail() {
                        action.onError();
                        _this.$store.commit('setSaveStatus',false);
                    },
                    //进度展示
                    onNotifyProgress(progress) {
                        progress.percentage = progress.loaded / progress.total * 100;
                        action.onProgress(progress);
                    }
                }, null, {
                    getSession(callback) {
                        callback(session);
                    }
                });
            });
        },
        // 上传成功
        handleUploadSuccess(res, file, isCroped) {
            res.id = res.id?res.id:res.dentry_id;
            res.__uid = res.__uid?res.__uid:file.__uid;

            if(!isCroped){
                this.attachments.forEach(attachment=>{
                    if(attachment.__uid===res.__uid){
                        attachment.id = res.id;
                        this.currentAttachment = this.setCurrentPic(res);
                    }
                });
                
            }
            this.saveAnswer();
        },
        // 结束裁剪
        handleEndCrop(file) {
            let action = {
                file: file,
                onSuccess: res => {
                    this.attachments.map(item => {
                        if (item.__uid === this.currentAttachment.__uid) {
                            item.url = res.url;
                            item.__url = res.url;
                            item.id = res.dentry_id;
                        }
                    });
                    this.isCroping = false;
                    this.cropperProgress = 0;
                    this.currentAttachment.url = res.url;
                    this.handleUploadSuccess(res,file, true);
                },
                onError:err=>{},
                onProgress:evt=>{
                    const percentage = evt.loaded / evt.total * 100;
                    this.cropperProgress = percentage;
                }
            };
            this.isCroping = true;
            this.handleUpload(action);
        },
        // 保存作答
        saveAnswer(){
            let answerData = {  //当前大题的图片作答数据
                type:this.forComplex?'cs_sub_image':'cs_image',
                data:[]
            };
            let imgData = [];  //当题图片id数组
            this.attachments.forEach(item=>{
                if(item.id){
                    imgData.push({
                        id:item.id
                    });
                }
            });

            if(!this.forComplex){
                answerData.data = imgData;
            } else {
                answerData.data.push({
                    q:this.subQuestionIndex.toString(),
                    sub_data:imgData
                });
            }

            // 针对套题从store中回填其它子题图片作答数据
            let storeAnswer = this.resultData[this.questionResult.id].answer;
            let storeParseAnswer;
            try{
                storeParseAnswer = JSON.parse(storeAnswer);
            } catch(e){
                storeParseAnswer = {};
            }
            if(answerData.type === 'cs_image'){
                storeParseAnswer = answerData;
            } else if (answerData.type === 'cs_sub_image'){
                storeParseAnswer.data && storeParseAnswer.data.forEach(item=>{
                    if(item.q!==this.subQuestionIndex.toString()){
                        answerData.data.push({
                            q:item.q,
                            sub_data:item.sub_data && item.sub_data.map(subItem=>{
                                return {
                                    id:subItem.id
                                };
                            })
                        });
                    }
                });
                storeParseAnswer = answerData;
            }
            storeAnswer = JSON.stringify(storeParseAnswer);
            this.resultData[this.questionResult.id].answer = storeAnswer;
            this.setResultData([this.resultData[this.questionResult.id]]);

            this.timeSaveAnswer({
                answer:storeAnswer
            });
        }
    }
};
</script>
<style lang="scss" scoped>
.imgshow img{
    max-width: 100%;
}
img.hover-pointer{
    cursor:pointer;
}
.cropper__tip__text{
    width: auto;
    max-width: 200px;
    min-width: 130px;
    padding: 14px;
    color: #fff;
    background: rgba(0, 0, 0, 0.8);
    text-align: center;
    border-radius: 5px;
    position: fixed;
    z-index: 9999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
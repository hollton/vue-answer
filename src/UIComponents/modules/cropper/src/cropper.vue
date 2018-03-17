/**
  图片裁剪组件
  调用方式：
  <fa-cropper v-model="isShow" :img-url="imgUrl" :close="handleSave"></fa-cropper>

  @v-model 控制组件的显示隐藏
  @img-url 需要裁剪图片的url
  @close 关闭裁剪组件
  @save 保存图片，返回图片新的url，为base64格式
  @useCrop 是否开启裁剪功能，默认为 true
  @dataType 裁剪后图片文件的类型。可选值为 "base64"、"blob"；默认值为 "base64"
 */
<template>
  <div class="fa-cropper" v-show="isShow">
    <div class="popup-wrap popup-img-zoom">
        <div class="popup-content">
            <a class="slp-ui-picview__prev" v-show="isShowPreBtn && !isCrop" @click="handleOptions('pre')"></a>
            <a class="slp-ui-picview__next" v-show="isShowNextBtn && !isCrop" @click="handleOptions('next')"></a>
            <a class="slp-ui-picview__close" @click="isShow=false"></a>
            <div class="popup-body">
                <div class="fa-cropper--image--wrapper">
                  <!-- <fa-image :img-src="baseUrl" ref="img" :use-loading="false" :styles="'width: 100%; margin: auto; opacity:0;'"></fa-image> -->
                  <img :src="baseUrl" ref="img" style="'width: 100%; margin: auto; opacity:0;'"/>
                </div>
                
                <div class="examine-img-controller" v-show="isShowOption">
                    <a class="icon-img-controller controller-zoom-in" @click="handleOptions('zoomIn')"></a>
                    <a class="icon-img-controller controller-zoom-out"  @click="handleOptions('zoomOut')"></a>
                    <a class="icon-img-controller controller-full-screen" @click="handleOptions('reset')"></a>
                    <a class="icon-img-controller controller-rotate-left" @click="handleOptions('rotateLeft')"></a>
                    <a class="icon-img-controller controller-rotate-right" @click="handleOptions('rotateRight')"></a>
                    <a class="icon-img-controller controller-download" @click="handleOptions('download')" ref="download"></a>
                    <a class="icon-img-controller controller-cut"  @click="handleOptions('crop')" v-show="useCrop && !isCrop && isSupportCrop"></a>
                </div>
                <div class="check-buttons" v-show="useCrop && isCrop">
                    <button class="cancel" @click="handleOptions('clear')">关闭</button><button class="confirm" @click="handleSave">确定</button>
                </div>
            </div>
        </div>
    </div>
    <div v-show="!isShowOption" class="fa-cropper-pop__text">加载中...</div>
    <div v-show="isDownloading" class="fa-cropper-pop__text">下载中...</div>
  </div>
</template>

<script>
  import FaDialog from '../../dialog/src/dialog';
  import FaButton from '../../button/src/button';
  import 'cropperjs/dist/cropper.css';
  import Cropper from 'cropperjs';

  export default {
    name: 'FaCropper',
    props: {
        value: {},
        imgUrl: {
            type: String,
            require: true
        },
        useCrop: {
          type: Boolean,
          default: true
        },
        close: Function,
        save: Function,
        dataType: {
          type: String,
          default: 'base64'
        },
        imgList: {
          type: Array,
          default: function(){
            return []
          }
        },
        afterSwitch: {
          type: Function,
          default: function(){}
        }
    },
    watch: {
      value(val){
        this.isShow = val;
      },
      isShow(val){
        if(val){
          this.baseUrl = this.imgUrl;
          this.imgList.map((img, index) => {
            if(img.url === this.baseUrl){
              this.currImgIndex = index;
            }
          });
          document.body.appendChild(this.$el);
          this.handleOpen(this.$refs.img);
        }else{
          this.$emit('input', false);
          this.handleClose();
          document.body.removeChild(this.$el);
        }
      },
      imgUrl(val,old){
        if(!this.isShow){
          return;
        }
        this.baseUrl = val;
        if(this.isShow){
          this.handleReplaceImg(val);
        }
      }
    },
    methods: {
      handleInit(){
        this.isCrop = false;
        this.isShowOption = false;
      },
      canvasBase64ToBlob(base64){
        let bytes=window.atob(base64.split(',')[1]);

        let ab = new ArrayBuffer(bytes.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob( [ab] , {type : 'image/jpg'});
      },
      handleOpen(img){
          this.baseUrl = this.imgUrl;
          if(this.imgList.length > 1){
              this.isShowPreNextBtn();
          }
          if(!this.cropper){
            this.cropper = new Cropper(img, this.cropperOptions);
          }
          this.handleReplaceImg(this.baseUrl);
      },
      handleClose(){
          if(this.close){
            this.close(this.baseUrl);
          }
          this.cropper.destroy();
          this.handleInit();
      },
      handlePreview(){
        this.previewUrl = this.cropper.getCroppedCanvas().toDataURL('image/jpg');
        this.isPreview = true;
      },
      handleSave(){
        let rtnData;
        rtnData = this.cropper.getCroppedCanvas().toDataURL('image/jpg');

        if(this.dataType === 'blob'){
          const blobData = this.canvasBase64ToBlob(rtnData);
          blobData.name = (new Date()).valueOf()+'.jpg';
          rtnData = blobData;
        }

        if(this.save){
          this.save(rtnData);
        }

        this.cropper.clear();
        this.isCrop = false;
        this.$refs.img.style.margin = 'auto';
        this.isShowOption = false;
      },
      optionsDownload(url){
        const download = this.$refs.download;
        if(typeof download.download !== 'undefined'){
          const a = document.createElement('a');
          a.href = url;
          a.download = 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }else if(typeof download.download === 'undefined' && typeof window.navigator.msSaveBlob === 'function'){
          const _this = this;
          this.isDownloading = true;
          const xhr = XMLHttpRequest();
          try{
            xhr.open('get', url, true);
            xhr.responseType = "blob";
            xhr.onload = function(res){
              if(this.status === 200){
                let blob = new Blob();
                blob = this.response;
                window.navigator.msSaveBlob(blob);
                _this.isDownloading = false;
              }
            }
            xhr.send(null);
          }catch(e){
            const blob = this.canvasBase64ToBlob(url);
            blob.name = (new Date()).valueOf()+'.png';
            window.navigator.msSaveBlob(blob);
            _this.isDownloading = false;
          }
          
        }else{
          this.isSupportDownload = false;
        }
      },
      handlePreImg(){
        const _index = this.currImgIndex;

        if(_index === 0){
          return;
        }else{
          this.currImgIndex --;
          this.isShowOption = false;
          this.handleReplaceImg(this.imgList[this.currImgIndex].url)
        }
        this.afterSwitch(this.baseUrl, this.imgList[this.currImgIndex]);
        this.isShowPreNextBtn();
        
      },
      handleNextImg(){
        const _index = this.currImgIndex;
        if(_index === this.imgList.length -1){
          return;
        }else{
          this.currImgIndex ++;
          this.isShowOption = false;
          this.handleReplaceImg(this.imgList[this.currImgIndex].url)
        }
        this.afterSwitch(this.baseUrl, this.imgList[this.currImgIndex]);
        this.isShowPreNextBtn();
      },
      isShowPreNextBtn(){
        this.isShowPreBtn = this.currImgIndex !== 0;
        this.isShowNextBtn = this.currImgIndex !== (this.imgList.length -1);
      },
      handleReplaceImg(url){
        this.baseUrl = url;
        this.cropper.replace(url);
        try{
          this.cropper.zoomTo(1);
        } catch(e){
          console.log(e)
        }
      },
      handleOptions(type){
          const cropperFn = this.cropper;
          const _self = this;
          const actionFn = {
              zoomIn(){
                cropperFn.zoom(0.1);
              },
              zoomOut(){
                cropperFn.zoom(-0.1);
              },
              rotateLeft(){
                cropperFn.rotate(-90);
              },
              rotateRight(){
                cropperFn.rotate(90);
              },
              clear(){
                cropperFn.clear();
                cropperFn.zoomTo(1);
                _self.isCrop = false;
              },
              download(){
                _self.optionsDownload(_self.imgList[_self.currImgIndex].__oriUrl);
              },
              crop(){
                cropperFn.crop();
                _self.isCrop = true;
                _self.$refs.img.style.margin = 0;
              },
              move(){
                crop.setDragMode('move');
              },
              reset(){
                cropperFn.zoomTo(1);
                cropperFn.rotateTo(0);
              },
              pre: this.handlePreImg,
              next: this.handleNextImg
          };

          if(actionFn[type] instanceof Function){
            actionFn[type]();
          }
          
      },
      imgLoadStatu(evt){
        this.isShowOption = true;
        if(this.cropper){
          this.cropper.zoomTo(1);
        }
      },
      handleZoom(evt){
        const ratio = evt.detail.ratio;
        if(!this.isCrop &&(ratio > this.maxZoomIn || ratio < this.maxZoomOut)){
          evt.preventDefault();
        }
        
      }
    },
    data(){
      return {
        cropper: null,
        isShow: false,
        isPreview: false,
        previewUrl: '',
        isCrop: false,
        isShowOption: false,
        isSupportCrop: false,
        isShowPreBtn: false,
        isShowNextBtn: false,
        maxZoomIn: 2,
        maxZoomOut: 0.6,
        baseUrl: '',
        cropperOptions: {
            minContainerWidth: 1100,
            minContainerHeight: 477,
            autoCrop: false,
            toggleDragModeOnDblclick: false,
            dragMode: 'move',
            ready: this.imgLoadStatu,
            zoom: this.handleZoom
        },
        isSupportDownload: true,
        isDownloading: false,
        currImgIndex: 0
      }
    },
    mounted(){
      if(typeof Blob === 'function'){
        this.isSupportCrop = true;
      }
    },
    components: {
      FaDialog
    }
  }
</script>

<style lang="scss">
  .fa-cropper .popup-img-zoom .popup-content .popup-body{
    text-align: initial;
  }
  .check-buttons{
    text-align: center;
  }
</style>
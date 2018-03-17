import Vue from 'vue';

const apiService = Vue.$apiService;

// 检查大题是否作答完成
export let checkDone = function(subItems, questionResult) {
    let isDone = true;
    let completionData;
    let picAnswerData;  //照片作答数据
    subItems = subItems || [];
    try {  // 主观题照片作答数据
        picAnswerData = JSON.parse(questionResult.answer);
    } catch (e) {
        //
    }
    picAnswerData = picAnswerData?picAnswerData:{ type:'', data:[] };
    if(picAnswerData.type==='cs_image' && picAnswerData.data.length){  //旧数据：照片答案对应于大题
        return isDone;
    }
    let subQuestionResult = questionResult && questionResult.subs;
    subItems.forEach((subItem, subIndex) => {
        // 当当前编号的小题无照片作答时，再判断文字作答数据
        let currentPicSubData;
        picAnswerData.data.forEach(item=>{
            if(Number(item.q)===subIndex+1){
                currentPicSubData = item.sub_data;
            }
        });
        if(!(currentPicSubData && currentPicSubData.length)){
            if (!(subQuestionResult && subQuestionResult[subIndex] && subQuestionResult[subIndex].answer)) {
                isDone = false;
                return isDone;
            } else {
                try {  // 针对填空题特殊的判断
                    completionData = JSON.parse(subQuestionResult[subIndex].answer);
                    completionData.forEach(comItem => {
                        if (!(comItem && comItem.value && comItem.value.length)) {
                            isDone = false;
                            return isDone;
                        } else {
                            comItem.value.forEach(comSubItem => {
                                if (!comSubItem) {
                                    isDone = false;
                                    return isDone;
                                }
                            });
                        }
                    });
                } catch (e) {
                    //
                }
            }
        }
    });
    return isDone;
};

/**
 * 根据视频id占位符在占位符位置初始化视频播放器（H5 Video）
 */
let $q = Promise;
let videoPlayer = {
    getVideoUrl: '', // 接口获取视频地址
    getPlayerHtml: '',
    convertAllVideoId: '',
};

videoPlayer.getVideoUrl = function(video_id) {
    return apiService.AnswerAPI.getGuidVideoUrl({
        video_id: video_id,
        quality: 2 /*2: 标清 480P, 如搜索不到当前清晰度，会降低清晰度自动适配视频*/ ,
        types: [2, 3] /*2:mp4; 3:mp3,如果有mp3说明源文件是音频*/
    }).then(function(resp) {
        var isAudio = true;
        var needUrls = [];
        resp.data.forEach(function(item) {
            if (item.type === 3) {
                needUrls.push(item);
            }
        });
        if (needUrls.length === 0) {
            isAudio = false;
            resp.data.forEach(function(item) {
                if (item.type === 2) {
                    needUrls.push(item);
                }
            });
        }
        needUrls = needUrls.sort(function(item1, item2) {
            return item1.quality - item2.quality;
        });

        needUrls.forEach(function(needUrlInfo) {
            needUrlInfo.isAudio = isAudio;
            needUrlInfo.mimeType = isAudio ? 'audio/mpeg' : 'video/mp4';
        });

        if (needUrls.length === 0) {
            console.log('没有可用的地址:' + video_id);
            return $q.reject('没有可用的地址');
        }

        return needUrls[0];
    });
};
videoPlayer.getVideoInfoFromString = function (tagString) {
    // 判断是音频还是视频
    var isAudio = tagString.indexOf('</audio>') !== -1;

    //解析出src、并把占位符替换成实际地址
    var srcMatched = tagString.match(/src\s*=\s*(['"])([^'"]+)\1/i);
    var src = srcMatched ? srcMatched[2] : '';
    /* refPath要求使用方提供，有可能没有${ref-path}占位符*/
    var refPath = window.FaBaseConfig.refPath || 'http://cs.101.com/v0.1/static';
    src = src.replace('${ref-path}', refPath);

    // 计息出视频id
    var videoIdMatched = src.match(/\/([\w-]+?)\.pkg/i);
    var videoId = videoIdMatched ? videoIdMatched[1] : '';
    // ndr那的视频格式不止mp4和mpeg，干脆不设置，让系统自动识别
    return $q.resolve({
        isAudio: isAudio,
        videoId: videoId,
        urls: [src]
    });
};
videoPlayer.getVideoInfoFromServer = function (videoId) {
    return videoPlayer.getVideoUrl(videoId).then(function (videoInfo) {
        return {
            isAudio: videoInfo.isAudio,
            videoId: videoId,
            urls: videoInfo.urls,
            mimeType: videoInfo.mimeType
        };
    }).catch(function () {
        return '{资源不可用：' + videoId + '}';
    });
};

// 加index只是为了让dom id唯一
var videoIndex = 0;
videoPlayer.getPlayerHtml = function (questionId, videoInfo) {
    videoIndex++;
    // 数字开头的id是非法的。questionId是guid，第一位可能是数字。加_是为了避免id以数字开头.
    var videoIdentity = '_' + questionId + '_video_' + videoInfo.videoId + '@' + videoIndex;

    var tag = videoInfo.isAudio ? 'audio' : 'video';
    var html = '<' + tag + ' id="' + videoIdentity + '" class="video-js vjs-custom-skin" controls name="media" style="display: block; width: 100%;background-color: #000; outline: none; margin-bottom:30px;"';
    // 根据video.js中canHandleSource的处理逻辑，source没提供type会自动生成type：video/fileExt.比如作为音频播放器播放mp3文件。此时会误判为“文件类型不支持”
    // 不用source标签，会走另外的逻辑可正常播放。（缺点是不能设置多个播放地址）
    // 所以如果无法获取到mimeType，只能不用source，改用video|audio的src属性，至少这样是可以播放的
    if(videoInfo.mimeType){
        html+='>';
        videoInfo.urls.forEach(function (url) {
            html += '<source src="' + url +'" type="' + videoInfo.mimeType + '">';
        });
    }else{
        html += ' src="' + videoInfo.urls[0] +'">';
    }
    html += '</' + tag + '>';

    return {
        html: html,
        videoIdentity: videoIdentity
    };
};

videoPlayer.convertAllVideoId = function (htmlStr, questionId) {
    // 准备数据
    htmlStr = htmlStr ? htmlStr : '';

    var videoFlags = htmlStr.match(/\{\s*video:\s*[\w-]{36}\s*\}/ig);
    var h5MediaTags = htmlStr.match(/<(video|audio).*?>.*?<\/\1>/ig);

    var resourceIds = [];
    var promises = [];
    /* 处理第一种 {video:52a7c264-3a1a-49ac-8b3f-35ea28332688}*/
    if (videoFlags) {
        videoFlags.forEach(function (videoFlag) {
            var guid = videoFlag.match(/\{\s*video:\s*([\w-]{36})\s*\}/i)[1];
            promises.push(videoPlayer.getVideoInfoFromServer(guid).then(function (videoInfo) {
                return videoPlayer.getPlayerHtml(questionId, videoInfo);
            }).then(function (mediaTagInfo) {
                htmlStr = htmlStr.replace(videoFlag, mediaTagInfo.html);
                resourceIds.push(mediaTagInfo.videoIdentity);
            }));
        });
    }
    /* 处理第二种 h5 audio/video标签 */
    if (h5MediaTags) {
        h5MediaTags.forEach(function (tagString) {
            promises.push(videoPlayer.getVideoInfoFromString(tagString).then(function (videoInfo) {
                return videoPlayer.getPlayerHtml(questionId, videoInfo);
            }).then(function (mediaTagInfo) {
                htmlStr = htmlStr.replace(tagString, mediaTagInfo.html);
                resourceIds.push(mediaTagInfo.videoIdentity);
            }));
        });
    }

    return $q.all(promises).then(function () {
        return {
            htmlStr: htmlStr,
            resourceIds: resourceIds
        };
    });
};
export let convertAllVideoId = videoPlayer.convertAllVideoId;

// 作答状态转换为是否答对[0: Undo 未做, 1: Done 有做题（未评分）, 5: Correct 完全正确, 7: Wrong 错误，非全部正确, 9: Invalid 无效的答案]
export let questionStatusToIsRight = status => {
    let isRight;
    switch (status) {
        case 5:
            isRight = true;
            break;
        case 0:
        case 7:
        case 9:
            isRight = false;
            break;
        default:
            break;
    }
    return isRight;
};

export let getCurrentDateTime = ()=>{
    let date = new Date();
    let seperator = ['-',':'];
    let fillZero = data=>{
        return data.toString().length===2?data:'0'+data;
    };
    let month = fillZero(date.getMonth() + 1);
    let day = fillZero(date.getDate());
    let hour = fillZero(date.getHours());
    let minute = fillZero(date.getMinutes());
    let second = fillZero(date.getSeconds());
    let currentDateTime = date.getFullYear() + seperator[0] + month + seperator[0] + day
            + 'T' + hour + seperator[1] + minute + seperator[1] + second;
    return currentDateTime;
};
export let isSubjective = (questionType)=>{
    return questionType===20 || questionType===25;
};

export default {
    checkDone,
    convertAllVideoId,
    questionStatusToIsRight,
    getCurrentDateTime,
    isSubjective
};
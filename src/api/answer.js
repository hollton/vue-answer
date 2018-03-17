/**
 * 作答 API Service
 */
import axios from 'axios';

export default {
    getExamsInfo(paramData){
        return axios.get('/v1/exams/actions/student_exams_info',{params:{exam_id: paramData.exam_id,user_id: paramData.user_id}});
    },
    getExamsInfoForStudent(paramData){
        return axios.get('/v1/exams/actions/my_exams_info', {params:{exam_id: paramData.exam_id}});
    },
    getSessionId(paramData){
        return axios.post(`/v1/m/exams/${paramData.exam_id}/sessions`);
    },
    getUserExamBySessionId(paramData) {
        return axios.get('/v1/m/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id);
    },
    getExamQuestionsById(paramData) {
        return axios.get('/v1/m/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id + '/questions', { params: paramData.qids });
    },
    //查看批阅时调用，显示答案及解析
    getExamPaperById(paramData) {
        return axios.get('/v1/papers/' + paramData.paper_id + '/questions', { params: paramData.qids });
    },
    // 获取作答信息
    getQuestionsAnswerById(paramData) {
        return axios.get('/v1.1/m/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id + '/answers', { params: paramData.qids });
    },
    // 获取批阅信息
    getQuestionsMarkById(paramData) {
        return axios.get('/v1.1/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id + '/mark', { params: paramData.qids });
    },
    // 保存作答
    saveAnswer(paramData) {
        return axios.put('/v1/m/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id + '/answers', paramData.data);
    },
    // 交卷
    submitPaper(paramData) {
        return axios.post('/v1/m/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id + '/submit');
    },
    //教师角色预览试卷
    getPapersById(paramData) {
        return axios.get(`/v1/papers/${paramData.paper_id}`);
    },
    /**
     * [GET] /resources/actions/get_guid_video_url 获取音视频详情
     * @param
     * video_id: 视频guid，必须
     * quality: 视频质量，非必须
     * audio_index: 音轨序号，非必须
     * types: 类型数组，非必须
     * @returns [{
     *      "type": "",
     *      "quality": "",
     *      "audio_index": "int",
     *      "urls":["string"]
     *  }]
     */
    getGuidVideoUrl: function(paramsData) {
        return axios.get('/v1/resources/actions/get_guid_video_url', {params:paramsData});
    },
    /*获取及增加播放次数*/
    getResourcePlayCount: function(paramsData) {
        return axios.get(`/v1/exams/${paramsData.exam_id}/actions/resource_play_counts`, {params:paramsData});
    },
    addResourcePlayCount: function(paramsData) {
        return axios.put(`v1/exams/${paramsData.exam_id}/actions/resource_play_count_inc`, null, {params:paramsData});
    },
    getUploadUrl() {
        return axios.get('/v1/commonapi/get_upload_url');
    },
    //交卷
    examSubmit(paramData) {
        return axios.post('/v1/m/exams/' + paramData.exam_id + '/sessions/' + paramData.session_id + '/submit');
    },
    /**
     * [addAnswerCollection 获取收藏信息]
     * paramData :exam_id
     * return {
     * items:{
     *     "owner":"2079944857",
     *     "question_id":"",
     *     "session_id":"",
     *     "type":"standard_answer"/"typical_fault"  //标准作答\典型错误
     * }
     * "exam_id":"",
     * "paper_id":"",
     * "name":""
     * }
     */
    getAnswerCollection(exam_id) {
        return axios.get('/v1/collections/actions/get_answer_collection?exam_id='+exam_id);
    },
    /**
     * [addAnswerCollection 收藏]
     * {"owner":"2079944857",
     * "exam_id":"",
     * "paper_id":"",
     * "name":"",
     * "question_id":"",
     * "session_id":"",
     * "type":"standard_answer"/"typical_fault"  //标准作答\典型错误
     * }
     */
    addAnswerCollection(paramData) {
        return axios.post('/v1/collections/actions/add_answer_collection',paramData);
    },
    /**
     * [cancelAnswerCollection 取消收藏]
     *  owner:2079944857
        exam_id:56b163aa-680e-4f51-a747-b9555704004f
        question_id:1b688a35-272c-48f5-acb7-be0c5c835194
        session_id:62f510b1-4e21-4ed2-b01a-f4b225710a8b
     */
    cancelAnswerCollection(paramData) {
        return axios.delete('/v1/collections/actions/cancel_answer_collection', {params:paramData});
    }
};

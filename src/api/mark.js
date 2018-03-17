/**
 * 批阅 API Service
 */
import axios from 'axios';

export default {
    getPaper(paperId){ // 获取试卷信息
        return axios.get(`/v1/papers/${paperId}`);
    },
    getMark(paramsData){ // 获取批改统计
        return axios.get('/v1.1/marks/actions/get_mark_stat',{params: paramsData});
    },
    getMyClasses(){ // 获取班级信息
        return axios.get('/v1/schools/:school_id/classes/actions/my_classes');
    },
    submitMark(data){ // 提交批阅
        return axios.post('/v1/marks/actions/batch_complete_mark', {data: data});
    },
    getAnserCollection(paramsData){ // 收藏的题目
        return axios.get('/v1/collections/actions/get_answer_collection',{params: paramsData})
    },
    getUserRealName(paramsData){ // 获取用户真实姓名
        return axios.get('/v1/users/actions/get_realnames', {params:paramsData});
    },
    getQuestions(uri,paramsData){
        return axios.get(`/v1/papers/${uri.paper_id}/questions`, {params: paramsData});
    },
    getUserMark(uri,paramsData){
        return axios.get(`/v1/exams/${uri.exam_id}/sessions/${uri.session_id}/mark`, {params: paramsData});
    },
    putUserMark(uri,paramsData){
        return axios.put(`/v1/exams/${uri.exam_id}/mark`, paramsData);
    },
    getNewSubmit(uri,paramsData){
        return axios.get(`/v1/exams/${uri.exam_id}/new_submit`, {params: paramsData});
    },
    batchCompleteMark(paramsData){
        return axios.post('/v1/marks/actions/batch_complete_mark', paramsData);
    },
    getImg(url){
        return axios.get(url, {
            responseType: 'blob'
        });
    }
}
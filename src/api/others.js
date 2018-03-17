/**
 * 作答 API Service
 */

import axios from 'axios';

export default {
    getImgToBlob(url, cancelAction){
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        if(cancelAction instanceof Function){
            cancelAction(source);
        }

        return axios.get(url, {
            responseType: 'blob',
            notUseLoading: true,
            cancelToken:source.token,
            transformRequest: [function(data, header){
                delete header.common['role-type'];
                return data
            }]
        }).catch(function(thrown){
            if(axios.isCancel(thrown)){
                console.log('Rquest canceled', thrown.message);
            }
        });
    }
}
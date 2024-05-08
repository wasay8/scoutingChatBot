import axios from "axios";
import {getToken} from './auth'
import {TOKEN} from'../constant'

export const baseUrl = 'http://192.168.1.213:5000'

// Create axios instance
const instance = axios.create({
    timeout: 30000, 
    baseURL: baseUrl 
})


instance.defaults.headers.post['Content-Type'] = 'application/json';

/** request controller **/
instance.interceptors.request.use(config => {
    var token = getToken(TOKEN)
    if (token) {
        config.headers['token'] = token//add token into request
    }
    return config
}, error => {
    return Promise.reject(error)
})

/** request controller  **/
instance.interceptors.response.use(response => {
        return Promise.resolve(response.data)
}, error => {
    if (error.response) {
        if (error.response.status === 401) {
            this.props.history.push('/login');
        }
        return Promise.reject(error)
    } else {
        return Promise.reject('time out, please try to refresh')
    }
})

/* get request */
export const get = (url, params, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'get',
            url,
            params,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/* post request  */
export const post = (url, data, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'post',
            url,
            data,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}
/* put request */
export const put = (url, data, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'put',
            url,
            data,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/* delete request  */
export const deleted = (url, data, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'delete',
            url,
            data,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}






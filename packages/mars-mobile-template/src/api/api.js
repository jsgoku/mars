import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';
import apiMap from './apiMap';

Vue.prototype.$axios = axios;
const prePath = '/mars';
const API = {};
const timeoutError = {
  code: 408,
  message: '网络异常，请检查网络',
};
const serverError = {
  code: 500,
  message: '服务异常，请重试',
};

const handleCode = (code, result) => Object.assign({
  code,
  result,
});

const handleRsp = (response) => {
  if (!response) { // response.code === 'ECONNABORTED'
    return handleCode(timeoutError.code, timeoutError);
  }
  if (response.status === 500 || response.status === 503) {
    return handleCode(serverError.code, serverError);
  }
  if (response.status === 200) {
    if (response.data && response.data.code === 0) {
      return handleCode(0, response.data.data);
    } else if (response.data && response.data.state === 301) {
      return handleCode(301, {
        path: `${prePath}/redirect/mobile/index.html`,
      });
    }
    return handleCode('60x', response.data);
  } else if (response.data) {
    return handleCode('60x', response.data);
  }
  return handleCode(timeoutError.code, timeoutError);
};

const instance = axios.create();
instance.defaults.timeout = 15 * 1000;

['get', 'post'].forEach((method) => {
  API[method] = (url, data, type) => new Promise((resolve, reject) => {
    let opt;
    if (method === 'get') {
      opt = { params: data };
    } else if (type === 'json') {
      opt = data;
    } else {
      opt = qs.stringify(data, { allowDots: true });
    }
    instance[method](prePath + apiMap[url], opt).then((response) => {
      const rsp = handleRsp(response);
      if (rsp.code === 0) {
        resolve(rsp.result);
      } else if (rsp.code === 301) {
        location.href = rsp.result.path;
      } else {
        reject(rsp.result);
      }
    }).catch((err) => {
      reject(handleRsp(err));
    });
  });
});

const cache = {};

API.cache = (url, data, type) => new Promise((resolve, reject) => {
  let key = Object.assign({}, data);
  key.url = url;
  key = JSON.stringify(key);
  if (cache[key]) {
    setTimeout(() => {
      if (typeof cache[key] === 'object') {
        resolve(JSON.parse(JSON.stringify(cache[key])));
      } else {
        resolve(cache[key]);
      }
    }, 100);
  } else {
    API.get(url, data, type).then((result) => {
      cache[key] = result;
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  }
});
export default API;

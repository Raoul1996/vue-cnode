import { API } from './config';

// yyyy/mm/dd
const timeFormat = function timeFormat(time) {
  const date = new Date(time);
  const Y = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const formatM = (month + 1 < 10 ? `0${month + 1}` : month + 1);
  const formatD = day < 10 ? `0${day}` : day;
  return `${Y}-${formatM}-${formatD}`;
};

// 中文类的时间转化
const timeFormatCN = function timeFormatCN(time) {
  const oldtime = new Date(time);
  const newtime = (new Date() - oldtime) / 1000;
  const month = Math.floor(newtime / 3600 / 24 / 30);
  const day = Math.floor(newtime / 3600 / 24);
  const hours = Math.floor(newtime / 3600);
  let str;

  if (hours === 0) {
    str = `${Math.floor(newtime / 60)} 分钟前`;
  } else if (day === 0) {
    str = `${hours} 小时前`;
  } else if (month === 0) {
    str = `${day} 天前`;
  } else {
    str = `${month} 月前`;
  }

  return str;
};

// 统一处理api返回的异常信息
const handleAjaxError = function handleAjaxError(reject, vm, callback) {
  if (!vm || !reject) return;

  const data = reject.data;

  vm.$message.error(data.success === false ? data.error_msg : '服务器异常');

  if (typeof callback === 'function') {
    callback();
  }
};

const CookieUtil = {
  get: (name) => {
    const cookie = document.cookie;
    const cookieName = `${encodeURIComponent(name)}=`;
    const cookieStart = cookie.indexOf(cookieName);
    let cookieVal = null;

    if (cookieStart > -1) {
      let cookieEnd = cookie.indexOf(';', cookieStart);

      if (cookieEnd === -1) {
        cookieEnd = cookie.length;
      }

      cookieVal = decodeURIComponent(cookie.substring(cookieStart + cookieName.length, cookieEnd));
    }

    return cookieVal;
  },

  set: (name, val, expires, path, domain, secure) => {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(val)}`;

    if (expires instanceof Date) {
      cookieText += `; expires=${expires.toGMTString()}`;
    }

    if (path) {
      cookieText += `; path=${path}`;
    }

    if (domain) {
      cookieText += `; domain=${domain}`;
    }

    if (secure) {
      cookieText += '; secure';
    }

    document.cookie = cookieText;
  },

  // 没有直接删除的方法
  // 直接覆盖同名过期的cookie
  unset: (name, path, domain, secure) => {
    this.set(name, '', path, domain, secure);
  }
};

const isLogin = function isLogin(accessToken) {
  return new Promise((resolve, reject) => {
    const token = accessToken || CookieUtil.get('token');

    if (!token) {
      reject();
      return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          if (data.success) {
            if (accessToken) {
              const now = new Date();
              now.setTime(now.getTime() + (1000 * 3600 * 24 * 7)); // 保留7天

              CookieUtil.set('token', accessToken, now);
            }

            resolve({ host: data, token });
          } else {
            reject();
          }
        } else {
          reject();
        }
      }
    };

    xhr.open('post', `${API.interface}accesstoken`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(`accesstoken=${token}`);
  });
};

export default { timeFormat, timeFormatCN, isLogin, handleAjaxError, CookieUtil };


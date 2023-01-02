import set from 'lodash/set';

const request = (url, data = {}) => {
    const newData = {...data}
    set(newData, 'headers.session-id', localStorage.getItem('sessionId'));
    set(newData, 'credentials', 'include');
    return fetch(`${process.env.REACT_APP_SERVER_ADDRESS}${url}`, newData);
}

export {
    request
}
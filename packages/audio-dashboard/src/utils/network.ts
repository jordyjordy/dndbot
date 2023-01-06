import set from 'lodash/set';

const request = async (url: string, data = {}): Promise<Response> => {
    if (process.env.REACT_APP_SERVER_ADDRESS === undefined) {
        throw new Error('Could not locate server address`');
    }
    const newData = { ...data };
    set(newData, 'headers.session-id', localStorage.getItem('sessionId'));
    set(newData, 'credentials', 'include');
    return await fetch(`${process.env.REACT_APP_SERVER_ADDRESS}${url}`, newData);
};

export {
    request,
};

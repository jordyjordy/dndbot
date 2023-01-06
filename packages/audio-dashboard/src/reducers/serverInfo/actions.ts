import { Action } from '../../utils/store';
import { ServerInfo } from './serverInfoReducer';

export const setServerInfo = (value: ServerInfo): Action => {
    return {
        type: 'serverInfo/set',
        value,
    };
};

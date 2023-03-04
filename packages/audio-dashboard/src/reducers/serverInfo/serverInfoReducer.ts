import { Action } from '../../utils/store';

const initialState = {
};

export interface ServerInfo {
    serverId?: string
    serverName?: string
    channelId?: string
    voiceChannelName?: string
}

const serverInfoReducer = (state = initialState, action: Action): ServerInfo => {
    switch (action.type) {
        case 'serverInfo/set':
            return { ...action.value };
        default:
            return state;
    }
};

export default serverInfoReducer;

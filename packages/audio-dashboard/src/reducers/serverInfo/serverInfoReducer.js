const initialState = {
    serverId: '',
    serverName: '',
    channelId: ''
};

export default function serverInfoReducer(state = initialState, action) {
    switch(action.type) {
        case 'serverInfo/set':
            return {...action.value };
        default:
            return state;
    }
}
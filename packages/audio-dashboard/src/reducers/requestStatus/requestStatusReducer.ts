import { Action } from '../../utils/store';

const initialState = {
    showLoading: false,
};

export interface RequestStatus {
    showLoading: boolean
};

const requestStatusReducer = (state = initialState, action: Action): RequestStatus => {
    switch (action.type) {
        case 'requestStatus/setLoading':
            return { ...state, showLoading: action.value };
        default:
            return state;
    }
};

export default requestStatusReducer;

import { Action } from '../../utils/store';

export const setLoadingStatus = (value: boolean): Action => {
    return {
        type: 'requestStatus/setLoading',
        value,
    };
};

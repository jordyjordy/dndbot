import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/store';
import { IonIcon } from '@ionic/react';
import { apertureOutline } from 'ionicons/icons';
import './LoaderSpinner.scss';

const LoaderSpinner = (): JSX.Element | null => {
    const { isLoading } = useSelector((state: RootState) => ({ isLoading: state.requestStatus.showLoading }));
    return isLoading
        ? (
            <div className='loader-spinner'>
                <IonIcon className='spin' color='white' icon={apertureOutline} />
            </div>
        )
        : null;
};

export default LoaderSpinner;

import { useAppSelector } from '../../hooks.ts';
import './AppLoader.css';

const AppLoader = () => {
    const isLoading = useAppSelector((state) => state.appLoader.isLoading);

    if (!isLoading) return null;

    return (
        <div className="app-loader-overlay">
            <div className="app-loader-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
        </div>
    );
};

export default AppLoader;


import React, { useEffect, useState } from 'react';
import './Station.css';
import { MdDownloadForOffline } from 'react-icons/md';
import { DeleteOutlined } from '@ant-design/icons'
import { client } from '../client';
import { notifySuccess } from '../utils/notifications';
import AnalyzerBox from './analyzerBox';
import { Link } from 'react-router-dom';
import mapIcon from './assets/map_icon.jpg'
import PopupModal from './popupModal';


export default function Station({ stationData, analyzers, description, image, stationName, postedBy, id, setAnalyzerInfo,
    setOpenAnalyzer, address, setStation, allStations, user, stationNetwork }) {

    const [iScomplited, setiScomplited] = useState(false);
    const [deleteSite, setDeleteSite] = useState(false);

    const openAnalyzerBox = (analyserId, analyzerParameter, model, isCompleted, underRepair, _key, stationId, sin) => {
        
        setAnalyzerInfo({
            parameter: analyzerParameter,
            id: analyserId,
            model,
            isCompleted: isCompleted,
            underRepair: underRepair,
            key: _key,
            stationId,
            sin: sin
        })

        var dataSave = 'true';

        client.getDocument(stationId).then((value) => {
            for(var i = 0; i < value.analyzers.length; i++) {
               if(value.analyzers[i].isCompleted != analyzers[i].isCompleted) {
                 dataSave = 'false';
               }
            }
            if(dataSave == 'true'){
                setOpenAnalyzer(true);
            } else {
                setOpenAnalyzer(false);
                notifySuccess('The data is saving...');
            }
        });
        
            

    }

    const deleteStation = (e, id) => {
        e.preventDefault();
        if (id) {
            client.delete(id).then(() => {
                const newStations = allStations.filter(station => station._id !== id);
                setStation(newStations);
                notifySuccess('Station was deleted! NOTE: It may take some time to erase it from the database');
            }, { purge: true })
                .catch((err) => {
                    console.log('Cannot delete station: ' + err.message);
                })
            setTimeout(() => {
                setDeleteSite(false)
            }, 4000)
        }
    }

    const isComplitedStation = (station) => {
        if (station && station?.analyzers?.length > 0) { //check if station has incompleted analyzers
            const check = station?.analyzers?.some(value => value.isCompleted === false);
            if (check === true) {
                setiScomplited(false);
            }
            else {
                setiScomplited(true);
            }
        }
    }

    useEffect(() => {
        isComplitedStation(stationData)
    }, []);


    return (
        <div className={iScomplited === false ? 'stationBox' : 'stationBox done'}>
            <Link to={`/stationDetails/${id}`} title='Open station'><h1>{stationName}</h1></Link>
            {iScomplited === true && <span className='complitedSite'>Complited</span>}
            {deleteSite === true &&
                <PopupModal
                    openModel={deleteSite}
                    closeModel={setDeleteSite}
                    btnText="Delete"
                    btnAction={(e) => deleteStation(e, id)}
                    body={(<p style={{ fontFamily: 'Oswald', fontSize: '16px', color: 'red' }}>Are you ready to delete the station?</p>)}
                />
            }
            <div className='stationDescription'>{description.slice(0, 125)}</div>
            <div className='imageBox'>
                <img src={image?.asset?.url} />
                <div className='imageOverlay'>
                    <Link to={`/stationDetails/${id}`}><h2>Open Station</h2></Link>
                </div>
                <a
                    href={`${image?.asset?.url}?dl=`}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="downloadIcon"
                    title='download'
                >
                    <MdDownloadForOffline />
                </a>
            </div>
            <div className='stationRemove'>
                {
                    user?.status === "admin" && (
                        <DeleteOutlined
                            onClick={() => setDeleteSite(true)}
                            className='deleteStation'
                            title='Delete'
                        />
                    )
                }
                <span className='siteNetwork'>{stationNetwork}</span>
            </div>
            <div className='addressIcon'>
                <a href={address} target='blank'><img src={mapIcon} /></a>
            </div>
            <div className='analyzerModel'>
                {
                    analyzers?.length > 0 ?
                        analyzers?.map((analyzer) =>
                            <AnalyzerBox
                                key={analyzer.id}
                                isComplited={analyzer.isCompleted}
                                underRepair={analyzer.underRepair}
                                analyzerParameter={analyzer.analyzerParameter}
                                onClick={() => openAnalyzerBox(analyzer.id, analyzer.analyzerParameter, analyzer.model, analyzer.isCompleted, analyzer.underRepair, analyzer._key, id, analyzer.sin)}
                            />
                        )
                        :
                        <div className='noAnalyzer'>
                            <span>Nothing to show</span>
                            <Link to={`/stationDetails/${id}`}>Add Analyzer</Link>
                        </div>
                }
            </div>
            <div className='postedbyBox'>
                <p className='postUserInfo' title={postedBy.userName}>Posted by: <span>{postedBy.userName.slice(0, 11)}..</span></p>
            </div>
        </div>
    )
}

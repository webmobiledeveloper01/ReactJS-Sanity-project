import React from 'react';
import SelectAnalyzer from './selectAnalyzer';
import AnalyzersTable from './analyzersTable';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { notifyError, notifySuccess } from '../utils/notifications';
import { client } from '../client';

function StationInfo({ stationData, addAnalyzer, setAddAnalyzer, stationId,
    analyzers, isEdit, setStationAnalyzers, stationAnalyzers, editDescription, setEditDescriptions,
    editAddress, setEditAddress, editTitle, setEditTitle, user
}) {

    const updateStation = () => {
        if (stationId?.stationId) {
            try {
                client.patch(stationId?.stationId)
                    .set({
                        title: editTitle,
                        description: editDescription,
                        address: editAddress
                    })
                    .commit()
                    .then(notifySuccess('Station info updated! Note: It may take time until changes become visible') && setTimeout(() => {
                        window.location.reload();
                    }, 4000))
            }
            catch {
                notifyError('Opps, something went wrong, try again or contact admin')
            }
        }
    }


    return (
        <div className={isEdit === false ? 'stationInfo' : 'stationInfo editing'}>
            <h1 hidden={isEdit === true}>Station Name: {stationData?.title}</h1>
            <ul>

                {
                    isEdit === true &&
                    <div>
                        <li className='updateTitel'>Update Info</li>
                        <li>
                            <input
                                placeholder={`Enter station's title`}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </li>
                    </div>

                }


                <li>
                    {isEdit === false ? (<div><span>Description: </span>{stationData?.description}</div>)
                        :
                        (
                            <textarea
                                placeholder='Enter Description'
                                value={editDescription}
                                onChange={(e) => setEditDescriptions(e.target.value)}
                            />
                        )}
                </li>
                <li>
                    {isEdit === false ? (<div><span>Address: </span> <a href={stationData?.address} target='blank' title={stationData?.address}> {stationData?.address.length > 40 ? stationData?.address.slice(0, 40) : stationData?.address}</a></div>)
                        :
                        (
                            <input
                                placeholder='Edit Address'
                                value={editAddress}
                                onChange={(e) => setEditAddress(e.target.value)}
                            />
                        )
                    }

                </li>
                <li>
                    {isEdit === false &&
                        <div>
                            <span>Network: {stationData?.networkType}</span>
                        </div>
                    }
                </li>
                <li>
                    {
                        isEdit === false && (<div><span>Posted By: </span>{stationData?.postedBy.userName}</div>)
                    }

                </li>
                <button
                    className={isEdit === false ? 'hide' : 'saveUpdates'}
                    onClick={updateStation}
                    title='Save' >
                    Save
                </button>
            </ul>
            <div hidden={isEdit === true}>
                {

                    addAnalyzer === true ? (
                        <SelectAnalyzer
                            setStationAnalyzers={setStationAnalyzers}
                            stationAnalyzers={stationAnalyzers}
                            analyzers={analyzers}
                            setAddAnalyzer={setAddAnalyzer}
                            stationId={stationId}
                            stationName={stationData?.title}
                        />
                    )
                        :
                        stationData?.analyzers?.length > 0 ? (
                            <AnalyzersTable
                                analyzers={stationData?.analyzers}
                                key={stationData?.analyzers.id}
                                setAddAnalyzer={setAddAnalyzer}
                                stationData={stationData}
                                user={user}
                            />
                        )
                            :
                            <div className='noAnalyzers'>
                                <p>This station doesn't have analyzers yet</p>
                                <PlusOutlined className='addIcon' onClick={() => setAddAnalyzer(true)} />
                            </div>
                }
            </div>
        </div>
    )
}

export default StationInfo
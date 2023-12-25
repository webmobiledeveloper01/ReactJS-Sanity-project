import React, { useEffect, useState } from 'react';
import './stationDetails.css';
import { useParams } from 'react-router-dom';
import { fethStationDetails } from '../utils/data';
import { client } from '../client';
import { notifyError, notifySuccess } from '../utils/notifications';
import { DeleteOutlined } from '@ant-design/icons';
import Spinner from './Spinner';
import UserImageIcon from './assets/userImage.png';
import StationInfo from './stationInfo';
import { ToastContainer } from 'react-toastify';
import SiteDocs from './siteDocs';
import { v4 as uuidv4 } from 'uuid';


function StationDetails({ userId, user, analyzers }) {
    const stationId = useParams();
    const [stationData, setStationData] = useState(null);
    const [stationComments, setStationComments] = useState([]);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState("");
    const [noteTitle, setNoteTitle] = useState("");
    const [addingNote, setAddingNote] = useState(false)
    const [addAnalyzer, setAddAnalyzer] = useState(false);
    let currentTime = new Date().toLocaleString();
    const [stationAnalyzers, setStationAnalyzers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [editDescription, setEditDescriptions] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [showFiles, setShowFiles] = useState(false);

    const fetchStationData = () => {
        let query = fethStationDetails(stationId?.stationId);
        if (query) {
            client.fetch(query)
                .then((data) => {
                    setStationData(data[0]);
                    setStationComments(data[0]?.comments);
                    setStationAnalyzers(data[0]?.analyzers); //saving all station's analyzers
                    setEditDescriptions(data[0]?.description)
                    setEditAddress(data[0]?.address)
                    setEditTitle(data[0]?.title)
                })
        }
        else {
            notifyError(`Cannot fetch station's data`);
        }
    }

    const addNote = (e) => {
        e.preventDefault();
        setAddingNote(true)
        if (stationId?.stationId) {
            if (notes) {
                client
                    .patch(stationId?.stationId)
                    .setIfMissing({ comments: [] })
                    .insert('after', 'comments[-1]', [{
                        comment: notes,
                        commentTitle: noteTitle,
                        _key: uuidv4(),
                        _createdAt: currentTime,
                        postedBy: {
                            _type: 'postedBy',
                            _ref: userId
                        }
                    }])
                    .commit()
                    .then(item => {
                        console.log(item.comments)
                        if (stationComments?.length > 0) {
                            setStationComments([...stationComments, item.comments.pop()]);
                        }
                        else {
                            setStationComments(item.comments);
                        }

                        setNotes("");
                        setNoteTitle("");
                        setAddingNote(false);
                        notifySuccess(`Your note is posted. Thank you!`);
                    })
            }
            else {
                notifyError('Make sure comment is not empty!')
            }
        }

    }
    const deleteNote = (id, e) => {
        e.preventDefault();
        const commentToRemove = ['comments[_key=="' + id + '"]']
        if (id) {
            const new_commentList = stationComments.filter(comment => comment._key !== id)

            client.patch(stationData?._id).unset(commentToRemove).commit()
                .then(() => {
                    setStationComments(new_commentList);
                    notifySuccess('Comment is deleted!');
                })
        }
        else {
            notifyError('Removing comment failed, try again..');
        }
    }
    useEffect(() => {
        fetchStationData();
    }, [stationId]);

    if (stationData === null || stationAnalyzers?.length < 0) {
        <Spinner message="Loading station's info" />
    }


    return (
        <div className='stationLayout'>
            <ToastContainer />
            <div className='stationMain'>
                <div className='stationPicture'>
                    <img src={stationData?.image.asset.url} />
                </div>
                <StationInfo
                    stationData={stationData}
                    addAnalyzer={addAnalyzer}
                    setAddAnalyzer={setAddAnalyzer}
                    stationId={stationId}
                    isEdit={isEdit}
                    setStationAnalyzers={setStationAnalyzers}
                    stationAnalyzers={stationAnalyzers}
                    analyzers={analyzers}
                    editDescription={editDescription}
                    setEditDescriptions={setEditDescriptions}
                    setEditAddress={setEditAddress}
                    editAddress={editAddress}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    user={user}
                />
            </div>
            <div className='stationAdditional'>
                <div>
                    <button className={showNotes === false ? 'stationNotesBtn' : 'stationNotesBtn close'} onClick={() => { setShowNotes(!showNotes); setShowFiles(false) }}>
                        {showNotes === false ? "Notes" : "Close"}
                    </button>
                    <button onClick={() => { setShowFiles(!showFiles); setShowNotes(false) }} className={showFiles === true ? 'stopEditing' : ''}>Documents</button>
                    <button onClick={(() => setIsEdit(!isEdit))} className={isEdit === true ? 'stopEditing' : ''}>{isEdit === true ? 'Close Editing' : 'Edit'}</button>

                </div>
                <div>

                </div>
                {
                    showNotes === true && (
                        <div className='allNotes'>
                            <div>
                                {

                                    stationComments ? (
                                        [...stationComments]?.reverse()?.map((note, index) => (
                                            <div className='displayNote' key={index}>
                                                <p title={note?.commentTitle}>{note?.commentTitle?.slice(0, 30)}</p>
                                                <textarea value={note?.comment} disabled />
                                                <span>{note?.postedBy?.userName ? note?.postedBy?.userName?.slice(0, 10) : ""}</span>
                                                <span className='dataPosted'>{note._createdAt}</span>
                                                {
                                                    note?.postedBy?._id === userId || user.status === "admin" ? (
                                                        <DeleteOutlined
                                                            className='deleteNote'
                                                            onClick={(e) => deleteNote(note._key, e)}
                                                        />
                                                    ) : ""
                                                }
                                            </div>
                                        ))
                                    )
                                        :
                                        (
                                            <p>Nothing to show..</p>
                                        )
                                }
                            </div>
                            <form onSubmit={addNote}>
                                <div>
                                    <img src={!user?.image.asset.url ? UserImageIcon : user?.image.asset.url} alt="user image" title="User image" />
                                </div>
                                <div className='noteBody'>
                                    <label>Title</label>
                                    <input
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        value={noteTitle}
                                        maxLength={32}
                                        required
                                        placeholder="Add note title"
                                    />
                                    <label>Description</label>
                                    <textarea
                                        required
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        maxLength={350}
                                        placeholder="Add station note (max 350 symbols)"
                                    />
                                </div>

                                <button disabled={addingNote === true} >
                                    {addingNote ? 'Adding Note' : 'Submit'}
                                </button>
                            </form>
                        </div>
                    )
                }
                {
                    showFiles === true && (
                        <SiteDocs
                            userId={user?._id}
                            userName={user?.userName}
                            station_id={stationData?._id}
                        />
                    )
                }
            </div>
        </div >
    )
}

export default StationDetails

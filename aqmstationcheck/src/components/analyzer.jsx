import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageModel from './imageModel';
import '../components/analyzer.css';
import { DeleteOutlined } from '@ant-design/icons';
import EditAnalyzer from './editAnalyzer';
import Spinner from './Spinner';
import { client } from '../client';
import { fethAnalyzerDetails } from '../utils/data';
import { ToastContainer } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { infoToast, notifyError, notifySuccess } from '../utils/notifications';


function Analyzer({ userId, user, setAnalyzers, analyzers }) {
    const { analyzerId } = useParams();
    const navigate = useNavigate();
    const [analyzer, setAnalyzer] = useState(null);
    const [analyzerComments, setAnalyzerComments] = useState([]);
    const [fullImage, setFullImg] = useState(false);
    const [editAnalyzer, setEditAnalyzer] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [addingComment, setAddingComment] = useState(false);
    const [showComment, setShowComments] = useState(false);
    let currentTime = new Date().toLocaleString();

    console.log(analyzers)
    const fetchAnalyzer = () => {
        let query = fethAnalyzerDetails(analyzerId);
        if (query) {
            client.fetch(query)
                .then((data) => {
                    setAnalyzer(data[0])
                    setAnalyzerComments(data[0]?.comments)
                })
        }
    }

    useEffect(() => {
        fetchAnalyzer();
    }, [analyzerId]);

    if (!analyzer) {
        <Spinner message="loading analyzers's info" />
    }

    const showModel = () => {
        if (userId === analyzer?.addedBy?._id || user?.status === "admin") {
            setEditAnalyzer(true)
        }
        else {
            infoToast(`You don't have permition to edit this item, contact admin.`);
        }

    }

    const showImage = () => {
        setFullImg(true)
    }

    const deleteAnalyzer = (e, id) => {
        e.preventDefault();
        const new_analyzers_list = analyzers.filter(value => value._id !== id)
        if (userId === analyzer?.addedBy?._id || user?.status === "admin") {
            if (id) {
                client.delete(id)
                    .then(() => {
                        setAnalyzers(new_analyzers_list)
                        notifySuccess('Analyzer is deleted. It may take some time until it disappears from the system');
                        setTimeout(() => {
                            navigate('/analyzers')
                        }, 6000)
                    })
            }
            else {
                notifyError("Something went wrong, cannot delete, contact admin!")
            }
        }
        else {
            infoToast(`You don't have permition to delete this analyzer, contact admin.`);
        }
    }

    const removeComment = (e, id) => {
        e.preventDefault();
        const commentRemove = ['comments[_key=="' + id + '"]'];
        if (id) {
            const new_notesList = analyzerComments.filter(note => note._key !== id)
            client.patch(analyzerId).unset(commentRemove).commit()
                .then(() => {
                    setAnalyzerComments(new_notesList)
                    notifySuccess('Comment is removed !')
                })
        }
    }


    const addComment = () => {
        setAddingComment(true);
        if (analyzerId) {
            if (newComment) {
                client
                    .patch(analyzerId)
                    .setIfMissing({ comments: [] })
                    .insert('after', 'comments[-1]', [{
                        comment: newComment,
                        _key: uuidv4(),
                        _createdAt: currentTime,
                        postedBy: {
                            _type: 'postedBy',
                            _ref: userId
                        }
                    }])
                    .commit()
                    .then(response => {
                        console.log(response)
                        if (analyzerComments?.length > 0) {
                            setAnalyzerComments([...analyzerComments, response.comments.pop()]);
                        }
                        else {
                            setAnalyzerComments(response.comments);
                        }

                        setNewComment("");
                        setAddingComment(false);
                        notifySuccess(`Your comment is posted. Thank you!`);
                    })
            }
            else {
                notifyError('Make sure comment is not empty!')
            }
        }

    }

    return (
        <div className='analyzerPage'>
            <div className='analyzerBox'>
                <ToastContainer />
                {
                    editAnalyzer === true && (
                        <EditAnalyzer
                            editAnalyzer={editAnalyzer}
                            setEditAnalyzer={setEditAnalyzer}
                            analyzer={analyzer}
                            analyzers={analyzers}
                            setAnalyzers={setAnalyzers}
                        />
                    )
                }
                {
                    fullImage === true && (<ImageModel img={analyzer?.image?.asset.url} setModelDispay={setFullImg} modelDisplay={fullImage} />)
                }
                <div className='analyzerImage'>
                    {
                        analyzer?.image ?
                            <img
                                src={analyzer?.image?.asset.url}
                                alt="analyzer_image"
                                onClick={showImage}
                            />
                            :
                            <Spinner message="Loading.." />
                    }
                    <div className='analyzerAuthor'>Posted By: {analyzer?.addedBy ? analyzer?.addedBy.userName : 'Unknown'}</div>
                </div>
                <div className='analyzerContent'>
                    <div>
                        {
                            <DeleteOutlined className='deletAnalyzer' onClick={(e) => deleteAnalyzer(e, analyzer?._id)} title="Delete analyzer" />
                        }

                        <h1>Parameter: {analyzer?.analyzerParameter}</h1>
                        <p>Make: {analyzer?.analyzerMake}</p>
                        <p>Model: {analyzer?.model}</p>
                        <p>Current station: {analyzer?.stationBelong ? analyzer?.stationBelong : "Has not selected yet"}</p>
                    </div>
                    <p>{analyzer?.description}</p>
                    {
                        analyzer?.manual && (
                            <a href={`${analyzer?.manual}`} target='blank' rel='author' className='manualLink'>Open Manual</a>
                        )
                    }
                    <p><span className='customParag'>SIN: </span>{analyzer?.sin}</p>

                </div>
            </div>
            <div className='btnAnalyzer'>
                <button onClick={() => { navigate('/') }}>Home</button>
                <button onClick={showModel}>Edit</button>
                <button
                    onClick={() => setShowComments(!showComment)}
                    className={showComment === true ? 'closeComment' : 'showComment'}
                >
                    {showComment === true ? 'Close' : 'Comments'}
                </button>
            </div>
            {
                showComment === true && (
                    <div className='commentSection'>
                        <div className='allComments'>

                            {
                                !analyzerComments ? (
                                    <div className='noComments'>
                                        <p>No comments to show</p>
                                    </div>
                                )
                                    :

                                    [...analyzerComments]?.reverse()?.map((com, i) => (
                                        <div className='commentBody' key={i}>
                                            <div className='commentAuthor'>
                                                {
                                                    userId === com?.postedBy._id || user?.status === "admin" ? (
                                                        <DeleteOutlined
                                                            className='comRemove'
                                                            onClick={(e) => removeComment(e, com._key)}
                                                        />
                                                    ) : ""
                                                }
                                                {
                                                    com?.postedBy.userName && <p>Author: {com?.postedBy.userName}</p>
                                                }
                                                <div className='createdDate'>
                                                    <p>{com?._createdAt}</p>
                                                </div>
                                            </div>
                                            <div className='commentText'>
                                                <p>{com.comment}</p>
                                            </div>
                                        </div>
                                    ))

                            }
                        </div>
                        <div className='createComments'>
                            <Link to={`/user-profile/${userId}`}>
                                <img src={user.image.asset.url} alt="user image" title="User info" />
                            </Link>
                            <textarea
                                placeholder='Add a comment (max 350 symbols)'
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                maxLength={350}
                            />
                            <button onClick={() => addComment()}>
                                {addingComment == true ? 'Adding the comment' : 'Add Comment'}
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
export default Analyzer;

import React, { useState } from 'react';
import './creatAnalyzerModel.css';
import getParameters from '../utils/parameters.json';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { imageUploader } from '../utils/helperFunctions';
import { MdDelete } from 'react-icons/md';
import Spinner from './Spinner';
import { ToastContainer } from 'react-toastify';
import { notifyError, notifySuccess } from '../utils/notifications';
import { client } from '../client';
import PopupModal from './popupModal';


function CreatAnalyzerModel({ analyzers, setAnalyzers, creatAnalyzer, setCreateAnalyzer, userId, }) {
    const [parameter, setParameter] = useState("");
    const [image, setImage] = useState(null);
    const [isLoading, setisLoading] = useState(false);
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [sin, setSin] = useState("");
    const [manual, setManual] = useState("");
    const [description, setDescription] = useState("");

    const createAnalyzer = () => {
        if (parameter && image && make && model && sin && description) {
            const doc = {
                _type: 'analyzers',
                analyzerParameter: parameter,
                analyzerMake: make,
                model,
                sin,
                description,
                manual,
                image: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: image?._id
                    }
                },
                addedBy: {
                    _type: 'postedBy',
                    _ref: userId
                },
            };

            client.create(doc).then((promise) => {
                console.log(promise);
                if (analyzers) {
                    setAnalyzers([...analyzers, promise])
                }
                else {
                    setAnalyzers(promise)
                }
                notifySuccess('Analyzer was created!')
                setTimeout(() => {
                    setCreateAnalyzer(false)
                }, 4000)

            })
        }
        else {
            notifyError("Make sure that form is filled up")
        }
    }

    const createAnalyzerBody = (
        <>
            <form className='createAnalyzer'>
                <div className='analyzerChild'>
                    <label> Parameter</label>
                    <select
                        onChange={(e) => setParameter(e.target.value)}
                        required
                        defaultValue={'select'}
                    >
                        <option value='select' disabled>Select</option>
                        {
                            getParameters.map((value) => {
                                return (
                                    <option
                                        key={value.id}
                                    >
                                        {value.parameter}
                                    </option>
                                )
                            })
                        }

                    </select>
                </div>
                <div className='analyzerChild'>
                    <label>Make</label>
                    <input
                        placeholder='Enter make'
                        onChange={(e) => setMake(e.target.value)}
                        maxLength={30}
                        required
                        value={make}
                    />
                </div>
                <div className='analyzerChild'>
                    <label>Model</label>
                    <input
                        placeholder='Enter model name'
                        onChange={(e) => setModel(e.target.value)}
                        maxLength={50}
                        required
                        value={model}
                    />
                </div>
                <div className='analyzerChild'>
                    <label>SIN</label>
                    <input
                        placeholder='Enter sin'
                        onChange={(e) => setSin(e.target.value)}
                        maxLength={50}
                        required
                        value={sin}
                    />
                </div>
                <div className='analyzerChild'>
                    <label>Description</label>
                    <textarea
                        placeholder='Enter description. Max 200 characters'
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        maxLength={200}
                    />
                </div>
                <div className='analyzerChild'>
                    <label className='manual'>Manual</label>
                    <input
                        placeholder='Past link'
                        onChange={(e) => setManual(e.target.value)}
                        required
                        value={manual}
                    />
                </div>
                {
                    isLoading && <Spinner />
                }
                <div className='analyzer_img'>

                    {
                        !image ? (
                            <>
                                <div>
                                    <p>Add Image</p>
                                    <AiOutlineCloudUpload className='UploadIcon' />
                                    <input
                                        type='file'
                                        name='upload_new_image'
                                        onChange={(e) => imageUploader(e, setImage, setisLoading)}
                                    />
                                </div>
                            </>


                        )
                            :
                            (
                                <>
                                    <MdDelete
                                        className='resetImage'
                                        onClick={() => setImage(null)}
                                        title="Reset Image"
                                    />
                                    <img src={image?.url} alt={`analyzer's image`} />
                                </>

                            )
                    }
                </div>
            </form>
            <ToastContainer />
        </>
    )

    return (
        <PopupModal
            closeModel={setCreateAnalyzer}
            title={'Create Analyzer'}
            btnText={'Submit'}
            body={createAnalyzerBody}
            btnAction={createAnalyzer}
        />
    )
}

export default CreatAnalyzerModel


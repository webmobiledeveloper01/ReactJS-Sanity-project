import './addsite.css';
import { useState } from 'react';
import {client} from '../client';
import Spinner from '../components/Spinner'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { notifyError, notifySuccess } from '../utils/notifications';
import validator from 'validator'
import CountUp from 'react-countup';
import { AnalyzerObject, uploadImageFunc } from '../utils/helperFunctions';
import { ToastContainer } from 'react-toastify';
import allNetworks from '../utils/networks.json'
import offices from '../utils/offices.json'


const AddSite = ({user, analyzers, setCreateAnalyzer}) => {
    const [wrongImageType, setWrongImageType] = useState(false);
    const [uploadImage, setUploadImage]= useState(null);
    const [loading, setLoading] = useState(false);
    const [stationName, setStationName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [allAnalyzers, setAllAnalyzers] = useState(analyzers);
    const [analyzerArray, setAnalyzerArray] = useState([]);
    const [showCounter, setShowCounter] = useState(false);
    const [office, setOffice] = useState("");
    const [checkBoxValue, setCheckBoxValue ] = useState(null);
    const [network, setNetwork] = useState("");
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(true)
    const [imgError, setImgError] = useState(false);

    const addSiteToAnalyzer = (analyzerArray, stationName) => {
        if(analyzerArray.length > 0 ){
            analyzerArray?.map((value) => {
                client.patch(value.id).set(({
                    stationBelong: stationName
                }))
                .commit()
                .catch((err) => {
                    console.log('Cannot add station name to analuzer: ' + err.message);
                })
            })
        }
    }

    const handleOnchange = (e) => {
        const analyzer_id = e.target.value;
        const selectedAnalyze = allAnalyzers?.filter((val) => {
            if(val._id === analyzer_id){
                return val;
            }
        })
        
        const newAnalyzerObject = AnalyzerObject(analyzer_id, selectedAnalyze);
        setAnalyzerArray(analyzerArray.concat(newAnalyzerObject))

        const newAnalyzerList = allAnalyzers?.filter(val => val._id !== analyzer_id); // delete option from select
        setAllAnalyzers([...newAnalyzerList]);
    }

    const removeAnalyzer = (id) => {
        console.log(id)
        const newArray = analyzerArray.filter(analyzer => analyzer.id !== id);
        setAnalyzerArray(newArray);
        const updateArrayList = analyzers.filter(val => {
            if(val._id === id) {
                return val
            }
        })
        setAllAnalyzers(allAnalyzers.concat(updateArrayList));
    }


    const saveStation = (e) => {
        e.preventDefault();
        console.log(isValid)
        if(!uploadImage){
            setImgError(true);
        }
        else {
            setImgError(false);
        }
        if(!isValid){
            notifyError('Address must be a link!')
        }
        else {
            if(stationName && description && uploadImage && address && office && network && analyzerArray) {
                const doc = {
                    _type: 'station',
                    title: stationName,
                    description,
                    address,
                    image: {
                        _type: 'image',
                        asset: {
                            _type: 'reference',
                            _ref: uploadImage?._id
                        }
                    },
                    isCompleted: false,
                    postedBy: {
                        _type: 'postedBy',
                        _ref: user?._id
                    },
                    analyzers: analyzerArray,
                    officeType: office,
                    networkType: network
                };
                client.create(doc).then(() => {
                    setShowCounter(true)
                    notifySuccess("Station was created!");
                    setTimeout(() => { //if form isn't filled up, the message will be displayed
                        navigate('/');
                    }, 6000)
                    
                })
                addSiteToAnalyzer(analyzerArray, stationName) //add station name to analyzers 
    
            }
            else {
                notifyError("Make sure form is filled up!");
            }
        }
       
        
    }

    const handleInputChange = (item) => {
        if(item === checkBoxValue) {
            setCheckBoxValue(null)
        }
        else {
            setCheckBoxValue(item)
        }
    }

    if(!allAnalyzers) {
        return (
            <Spinner />
        )
    }

    const validateAddress = (e) => {
        const url = e.target.value;
       if(validator.isURL(url)){
        setIsValid(true);
        setAddress(url);
       }
       else {
        setIsValid(false);
       }
    }

    

    return (  
        <div className="newItemBox">
             {
                showCounter === true? 
                    <div className='counterUp'>
                    <p>Redirect to main page in 5 sec</p>
                    <CountUp 
                        className='counter'
                        end={5}
                        duration={5}
                    />
                    </div> 
                    :
                    ( 
                        <form className='newitemForm'>
                             <label>Station Name</label>
                             <input 
                                 placeholder='Enter station name'
                                 onChange={(e)=> setStationName(e.target.value)}
                                 maxLength={20}
                                 required
                             />
                             <label>Description</label>
                             <input 
                                 placeholder='Enter station description (80 character max)'
                                 onChange={(e)=> setDescription(e.target.value)}
                                 required
                                 maxLength={80}
                             />
                               <label  className={`${!isValid && 'invalidAddress'}`}>Address</label>
                             <input 
                                className={`${!isValid && 'invalidAddress'} `}   
                                 type='url'
                                 placeholder='Station address link from Google/Apple map'
                                 onChange={(e)=> validateAddress(e)}
                                 required
                             />
                             <div className='analyzerList'>
                             <label>Select Analyzer</label>
                                 <select
                                     size={4}
                                     multiple={true}
                                     onChange={handleOnchange}
                                     required
                                 >
                                     {
                                         allAnalyzers?.map((analyzer) => {
                                            if(analyzer.stationBelong === null) { //checkig if analyzer doesn't belong to other station, if belongs, do not display
                                                return ( 
                                                    <option
                                                        value={analyzer._id}
                                                        key={analyzer._id} 
                                                    >
                                                       {analyzer.analyzerParameter}-{analyzer.sin.slice(0, 20).toUpperCase()} 
                                                    </option>
                                                )
                                            }
                                         })
                                     }
                                 </select>
                             </div>
                             <div className='offices'>
                             <label>Select Office</label>
                                {
                                    offices.map((office) => (
                                      <div key={office.id} className='checkBoxContainer'>
                                        <input 
                                            type="checkbox" 
                                            value={office.name} 
                                            onChange={() => handleInputChange(office.name)}
                                            onClick={(e) =>  setOffice(e.target.value)}
                                            checked={checkBoxValue===office.name}    
                                        />
                                        <label>{office.name}</label>
                                      </div>
                                    ))
                                }
                             </div>
                             <div className='networksSelection'>
                                <select
                                    onChange={(e) => setNetwork(e.target.value)}
                                    required
                                    defaultValue={'select'}
                                >   
                                <option value='select' disabled>Select Network</option>
                                {
                                        allNetworks.map((value) => {
                                            if(value.name !== "All") {
                                                return(
                                                    <option
                                                        key={value.id}
                                                    >
                                                        {value.name}
                                                    </option>
                                                )
                                            }
                                        })
                                }
                                </select>
                             </div>
                             <div style={{width: '100%', marginTop: '1rem'}}>
                                 {analyzerArray && (
                                     <div className='selectedAnalyzers'> 
                                         {
                                             analyzerArray.map((val) => (
                                                 <div key={val._key} className="eachAnalyzer">
                                                 <p 
                                                     title='click to remove'
                                                     onClick={() => removeAnalyzer(val.id)}>
                                                     {val.analyzerParameter}-{val.model.slice(0, 5)} 
                                                 </p>
                                                 </div>
                                             ))
                                         }
                                     </div>
                                 )}
             
                             </div>
                            <div>
                            </div>
                            {
                                 loading && <Spinner />
                            }
                            {
                                 wrongImageType && <p>Wrong image type</p>
                            }
                            {
                                 !uploadImage?
                                 (
                                     <label className='uploadSection'>
                                     <div className={imgError === false? 'uploadImage' : 'uploadImage imgError'}>
                                         <div className='uploadBtn'>
                                             <AiOutlineCloudUpload className='uploadIcon'/>
                                             <p className={{fontWeight: 'bold'}}>
                                             Click to upload
                                             </p>
                                         </div>
                                         <input 
                                            required
                                             type='file'
                                             onChange={(e) => uploadImageFunc(e, setWrongImageType, setLoading, setUploadImage)}
                                             name='upload_image'
                                             className='imageInput'
                                         />
                                     </div>
                                 </label>
                                 )
                                 :
                                 (
                                     <div className='displayImage'>
                                         <img 
                                             src={uploadImage?.url}
                                             alt="uploaded_image"
                                             className='uploadedImage'
                                         />
                                         <button
                                             type='button'
                                             className='deleteImgBtn'
                                             onClick={() => setUploadImage(null)}
                                         >
                                            <MdDelete /> 
                                         </button>
                                     </div>
                                 )
                            }
                            <button onClick={saveStation} className='createStationBtn'>Add Station</button>
                           
                        </form>
                    )
               } 
         <ToastContainer  /> 
         <button className={showCounter === true? 'hide' : 'analyzerBtn'} onClick={() => setCreateAnalyzer(true)}><span>Creat Analyzer ?</span></button>
        </div>
    );
}

export default AddSite;
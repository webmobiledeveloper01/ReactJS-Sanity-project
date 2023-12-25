
import { client } from "../client";
import { notifyError, notifySuccess } from "./notifications";
import { v4 as uuidv4 } from 'uuid';
import { fetchStation, fethAnalyzers } from "./data";

 export const imageUploader = (e, setState, setLoading) => {
    const selectedFile = e.target.files[0];
    if (selectedFile.type === 'image/png' || selectedFile.type === 'image/svg' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/gif' || selectedFile.type === 'image/tiff') {
        setLoading(true);
        client.assets.upload('image', selectedFile, { contentType: selectedFile.type, filename: selectedFile.name }
        ).then((value) => {
            setLoading(false);
            setState(value);
        }
        ).catch((error) => {
            notifyError('Opps, you got image upload error.. Try again');
            console.log(error);
        })

    }
    else {
        notifyError('Wrong image format! Try differernt image');
    }
}

export const AnalyzerObject = (analyzer_id, selectedAnalyze) => {
    const analyzerObject = {
        _key: uuidv4(),
        _type: 'analyzer',
        id: analyzer_id,
        model: selectedAnalyze[0]?.model,
        analyzerParameter: selectedAnalyze[0]?.analyzerParameter,
        sin:selectedAnalyze[0]?.sin,
        isCompleted: false,
        underRepair: false,
    }
    return analyzerObject;
}

export const uploadImageFunc = (e, setWrongImageType, setLoading, setUploadImage) => {
    const selectedFile = e.target.files[0];
    if (selectedFile.type === 'image/png' || selectedFile.type === 'image/svg' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/gif' || selectedFile.type === 'image/tiff') {
        setWrongImageType(false);
        setLoading(true);
        client.assets.upload('image', selectedFile, {contentType: selectedFile.type, filename: selectedFile.name}
        ).then((doc) => {
            setUploadImage(doc);
            setLoading(false);
        })
        .catch((error) => {
            console.log('Image upload error', error);
        })
    }
}

export const getAnalyzers = (setAnalyzers, setLoading) => {
    client.fetch(fethAnalyzers).then((data) => {
        setAnalyzers(data);
        setLoading(false);
      })
}

export const getStations = (setStation, setLoading) => {
    client.fetch(fetchStation).then((data) => {
        setStation(data);
        setLoading(false);
      });
}

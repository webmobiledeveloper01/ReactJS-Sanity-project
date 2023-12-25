export default {
    name: 'analyzers',
    title: 'Analyzers',
    type: 'document',
    fields: [
        {
            name: 'analyzerParameter',
            title: 'AnalyzerParameter',
            type: 'string'
        },
        {
            name: 'analyzerMake',
            title: 'AnalyzerMake',
            type: 'string'
        },
        {
            name: 'model',
            title: 'Model',
            type: 'string'
        },
        {
            name: 'sin',
            title: 'Sin',
            type: 'string'
        },
        {
            name: 'description',
            title: 'Description',
            type: 'string'
        },
        {
            name: 'manual',
            title: 'Manual',
            type: 'string'
        },
        {
            name: 'stationBelong',
            title: 'StationBelong',
            type: 'string'
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true //it allows rosponsively adapt the images to different aspect ratios at display time
            },
            
        },
        {
            name: 'addedBy',
            title: 'AddedBy',
            type: 'postedBy'
        },
        {
            name: 'comments',
            title: 'Comments',
            type: 'array',
            of: [{type: 'comment'}]
        }
    ]
}
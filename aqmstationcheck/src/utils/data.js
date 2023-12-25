export const fetchStation = `*[_type == "station"] | order(_createdAt desc) {
    image{
      asset->{
        url
      }
    },
        _id,
        title,
        description,
        isCompleted,
        analyzers,
        address,
        postedBy->{
          _id,
          userName,
          image
        },
        officeType,
        networkType
      } `;
  
  export const fethAnalyzers = `
  *[!(_id in path('drafts.**')) && _type == "analyzers"] 
  | order(_createdAt desc)
  {
    image{
      asset->{
        url
      }
    },
    analyzerMake,
    analyzerParameter,
    description,
    model,
    manual,
    stationBelong,
    comments,
    _id,
    addedBy->{
      _id,
      userName, 
    },
    sin
  }`;

  export const fethStationDetails = (stationDetails) => {
    const query = `*[!(_id in path('drafts.**')) && _type == "station" && _id == '${stationDetails}']{
      image{
        asset->{
          url
        }
      },
          _id,
          title,
          description,
          analyzers,
          address,
          postedBy->{
            _id,
            userName,
            image
          },
          officeType,
          networkType,
          comments[]{
            commentTitle,
            comment,
            _key,
            postedBy->{
              _id,
              userName,
              image
            },
            _createdAt
          }
    }`
    return query;
  }

  export const fethAnalyzerDetails = (analyzerId) => {
    const query = `*[!(_id in path('drafts.**')) && _type == "analyzers" && _id == '${analyzerId}']{
      image{
          asset->{
            url
          }
        },
        analyzerMake,
        analyzerParameter,
        description,
        manual,
        stationBelong,
        model,
        _id,
        addedBy->{
          _id,
          userName, 
        },
        sin,
        comments[]{
          comment,
          _key,
          postedBy->{
            _id,
            userName,
            image
          },
          _createdAt
        }
    }`
    return query;
  }
  

 

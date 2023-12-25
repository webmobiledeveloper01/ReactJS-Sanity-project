import { useEffect, useState } from 'react';
import Home from './components/home';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from './components/userAuth/Login';
import { userQuery } from './utils/queries';
import { client } from './client';

function App() {
  const userId = localStorage.getItem('UserId');
  const officeName = localStorage.getItem('Office');
  const networkName = localStorage.getItem('Network');
  const [user, setUser] = useState(null);
  const [officeSelect, setOfficeSelect] = useState(officeName);
  const [networkSelect, setNetworkSelect] = useState(networkName);
 
  useEffect(() => {
    const query = userQuery(userId);
        client.fetch(query)
            .then((data) => {
                setUser(data[0])
            })       
  }, [])

  
  return (
    
      <BrowserRouter>
        <Routes>
          <Route exact path='/*' element={<Home user={user} userId={userId} setOfficeSelect={setOfficeSelect} officeSelect={officeSelect} setNetworkSelect={setNetworkSelect} networkSelect={networkSelect}/>}/>
          <Route exact path='/login' element = { <Login setUser={setUser}/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;

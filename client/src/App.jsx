import { useState, useEffect } from 'react'
import './App.css'
import axios from "axios";

function App() {
  const [count, setCount] = useState(0)
  const [array, setArray] = useState([]);

  const fetchAPI = async () =>{
    const response  = await axios("http://localhost:8080/api");
    setArray(response.data.fruits);
    console.log(response.data.fruits);
  };

  useEffect(() => {
    fetchAPI();
  },[]);
  return (
    <>

      <h1>Vite + React</h1>
      <div className="card">
        {array.map((fruits, index) =>(
           <div key={index}>
            <p>{fruits}</p>
          </div>
          ))}
      </div>
    </>
  )
}

export default App

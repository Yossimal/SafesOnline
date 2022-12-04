import { useState,useContext,useEffect } from 'react';
import { AuthContext } from '../../../context/auth-context/auth-context';
import io from 'socket.io-client';
import Table from 'react-bootstrap/Table';
import { serverUrl } from '../../../common/config';


function ScoreItem({place,safeName,safeCracked,lostTimes,score}){
    return(
        <tr>
            <td>{place}</td>
            <td>{safeName}</td>
            <td>{safeCracked}</td>
            <td>{lostTimes}</td>
            <td>{score}</td>
        </tr>
    )
}

export default function ScoreBoard({compId}) {

  const [socket,setSocket] = useState()
  const authContext = useContext(AuthContext)
  const [scores,setScores] = useState([])

  useEffect(()=>{
    if(!compId){
      return;
    }
    const newSocket = io(`${serverUrl}`,{query:{compId:compId,...authContext.authData()}}).connect()
    setSocket(newSocket)
    return () => newSocket.close()
  },[compId,authContext])

  useEffect(()=>{
    if(!socket) return;
    socket.on('scores',(scores)=>{
      const sorted = scores.sort((a,b)=>b.score-a.score)
      setScores(
        sorted.map((s,i)=>{
          return <ScoreItem 
            lostTimes={s.badKeys}
            safeCracked={s.goodKeys}
            safeName={s.safeName}
            place={i+1}
            score={s.score}
            key={i}
          />
        })
      )
    })
    return ()=>socket.off('scores')
  },[socket])


  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Place</th>
          <th>Safe Name</th>
          <th>Safes Cracked</th>
          <th>Lost Times</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {scores}
      </tbody>
    </Table>
  );
}
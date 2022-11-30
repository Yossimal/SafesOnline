import { useState } from 'react';
import Table from 'react-bootstrap/Table';


function ScoreItem({place,safeName,safeCracked,lostTimes,score}){
    return(
        <>
            <td>{place}</td>
            <td>{safeName}</td>
            <td>{safeCracked}</td>
            <td>{lostTimes}</td>
            <td>{score}</td>
        </>
    )
}

export default function ScoreBoard() {

    const [items,setItems] = useState([])

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
        {items}
      </tbody>
    </Table>
  );
}
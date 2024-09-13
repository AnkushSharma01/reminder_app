import './App.css';
import React, {useState, useEffect} from "react"
import axios from "axios"
import DateTimePicker from "react-datetime-picker"
import 'react-datetime-picker/dist/DateTimePicker.css';


function App() {

  const [reminderMsg, setReminderMsg] = useState("");
  const [remindAt, setRemindAt] = useState()
  const [reminderList, setReminderList] = useState([]);
                 


  // original code
  
  useEffect(() => {
    axios.get("http://localhost:5000/getAllReminder").then(res => setReminderList(res.data))
  },[]) // if this [] is empty means, It will load defined component when it is load first time bydefault.

  const addReminder = async () => {
    try {
      // post request contain mssg and tym
      await axios.post("http://localhost:5000/addReminder", { reminderMsg, remindAt });
  
      const updated = await axios.get("http://localhost:5000/getAllReminder");
      setReminderList(updated.data);
  

      // after adding reminder make the field empty
      setReminderMsg("");
      setRemindAt();
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  }
  
  
    const deleteReminder = (id) =>{
    axios.post("http://localhost:5000/deleteReminder", {id})
    .then(res => 

      // updata the list again
      setReminderList(res.data));
      

  }
  return (
    <><div className="homepage" style={{ position: 'sticky', top: 0, zIndex: 100 }}></div><div className="homepage">
      <div className='homepage'>
        <div className='homepage_header'>
          <h1>Remind Me 🙋‍♂️</h1>
          <input type='text' placeholder='Reminder Note Here...' value={reminderMsg} onChange={e => setReminderMsg(e.target.value)}></input>
          <DateTimePicker
            value={remindAt}
            onChange={setRemindAt}
            minDate={new Date()}
            minutePlaceholder='mm'
            hourPlaceholder='hh'
            dayPlaceholder='DD'
            monthPlaceholder='MM'
            yearPlaceholder='YYYY' />
          <div className='button' onClick={addReminder}>Add Reminder</div>
        </div>

        <div className='homepage_body'>
          {reminderList.map(reminder => (
            
            // Here mongodb provide id by default to each card
            <div className='reminder_card' key={reminder._id}>
              <h2>{reminder.reminderMsg}</h2>
              <h3>Remind Me at: </h3>
              {reminder.remindAt && (
                <p>{new Date(reminder.remindAt).toLocaleString()}</p>
              )}

              {/* Here we use id to delete the element */}
              <div className='button' onClick={() => deleteReminder(reminder._id)}>Delete</div>
            </div>
          ))}

        </div>
      </div>
    </div></>
  );
}

export default App;

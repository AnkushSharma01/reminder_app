require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")


// APP config
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())


// DB config

const mongoURI = 'mongodb+srv://ankushsharma:oXHXm4TxRnIy5CeG@cluster0.bspvk.mongodb.net/';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,  // means use the new URL String
    useUnifiedTopology: true, // It improves the connection management and is recommended for newer versions of MongoDB.
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

//   Schemas
const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: Date,
    isReminded: Boolean
})

// Model

const Reminder = new mongoose.model("reminder", reminderSchema)


// It will check after each 1 sec, if something has to be reminded or not
setInterval(async () => {
  try {

    // if it is false
    const reminderList = await Reminder.find({ isReminded: false });
    if (reminderList) {
      reminderList.forEach(async (reminder) => {

        // take a reminder of current time
        const now = new Date();

        // check the difference between current time or  last updated time, if it is negative it means it has to be reminde now
        if (new Date(reminder.remindAt) - now < 0) {

          // make isreminded true, means send the mssg
          await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });
          const accountSid = process.env.ACCOUNT_SID;
          const authToken = process.env.AUTH_TOKEN;
          const client = require('twilio')(accountSid, authToken);
          
          try {
            const message = await client.messages.create({
              body: reminder.reminderMsg,
              from: 'whatsapp:+14155238886',
              to: 'whatsapp:+919068390912'
            });
            console.log(message.sid);
          } catch (error) {
            console.error('Error occurred:', error);
          }
          
          console.log('Message sending process completed');
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}, 1000);


// API Routes
app.post("/addReminder", async (req, res) => {
  try {
    // I will send mssg & time from frontend to  req.body
    const { reminderMsg, remindAt } =  req.body;

    // Create a new Reminder object
    const reminder = new Reminder({
      reminderMsg,
      remindAt,
      isReminded: false
    });

    // Save the reminder to the database using async/await
    await reminder.save();

    // Fetch the updated list of reminders and send it back as response
    res.send(reminder);
  } catch (error) {
    console.error(error);
    res.status(5000).send('Internal Server Error');
  }
});

app.get("/getAllReminder", async (req, res) => {
  try {
    // Fetch list of reminders from the database using async/await
    const reminderList = await Reminder.find({});

    // Send the list of reminders as response
    res.send(reminderList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/deleteReminder", async (req, res) => {
  try {
    // Delete the reminder using async/await
    await Reminder.deleteOne({ _id: req.body.id });

    // Fetch the updated list of reminders and send it back as response
    const reminderList = await Reminder.find({});
    res.send(reminderList);
  } catch (error) {
    console.error(error);
    res.status(5000).send('Internal Server Error');
  }
});




app.listen(5000, console.log("started"))
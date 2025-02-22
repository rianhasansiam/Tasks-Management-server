require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idf9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Collections
    const taskfile = client.db("tasksManagement");
    const allTasksCollection = taskfile.collection("allTasks");










    // Routes

    
    // POST /tasks - Add a new task
    app.post('/tasks', async (req, res) => {
      const taskData = req.body;
      //  console.log(taskData)


    //   const newTask = { taskData, date: new Date() };
      const result = await allTasksCollection.insertOne(taskData);

      res.status(201).send({ message: "Task added successfully!", taskId: result.insertedId });
    });
















    // GET /tasks - Retrieve all tasks for the logged-in user
    app.get('/tasksPerson', async (req, res) => {
        const { email } = req.query;
    //   console.log(email)
        // Check if email query param exists
        if (!email) {
          return res.status(400).send({ message: "Email is required." });
        }
      
        try {
          // Fetch tasks related to the provided email from the collection
          const tasks = await allTasksCollection.find({ email: email }).toArray();
      
          // Send back the fetched tasks
          res.status(200).send(tasks);
        } catch (error) {
          // Handle potential errors
          res.status(500).send({ message: "Failed to fetch tasks", error });
        }
      });
      




    app.get('/allTasks', async (req, res) => {
     
      const tasks = await allTasksCollection.find().toArray();

      res.status(200).send(tasks);
    });









    // PUT /tasks/:id - Update task details
    app.put('/tasks/:id', async (req, res) => {
      const { id } = req.params;
      const { title, description, category } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid task ID." });
      }

      const updatedTask = {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
      };

      const result = await allTasksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTask }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: "Task not found or no changes made." });
      }

      res.status(200).send({ message: "Task updated successfully!" });
    });







    // DELETE /tasks/:id - Delete a task
    app.delete('/tasks/:id', async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid task ID." });
      }

      const result = await allTasksCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Task not found." });
      }

      res.status(200).send({ message: "Task deleted successfully!" });
    });












    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

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
    // const toDoCollection = taskfile.collection("toDo");
    // const inProgressCollection = taskfile.collection("inProgress");
    // const doneCollection = taskfile.collection("done");










    // Routes

    
    // POST /tasks - Add a new task
    app.post('/tasks', async (req, res) => {
      const taskData = req.body;
      //  console.log(taskData)


    //   const newTask = { taskData, date: new Date() };
      const result = await allTasksCollection.insertOne(taskData);

      res.status(201).send({ message: "Task added successfully!", taskId: result.insertedId });
    });



    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await allTasksCollection.find().toArray(); // Fetch all tasks
        res.status(200).send(tasks); // Send the array of tasks back to the client
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks', error });
      }
    });



    


    // app.post('/tasks/inProgress', async (req, res) => {
    //   const taskData = req.body;
    //   //  console.log(taskData)


    // //   const newTask = { taskData, date: new Date() };
    //   const result = await inProgressCollection.insertOne(taskData);

    //   res.status(201).send({ message: "Task added successfully!", taskId: result.insertedId });
    // });
    const { ObjectId } = require('mongodb'); // Ensure ObjectId is imported

    app.put('/tasks/update-category/:id', async (req, res) => {
      const { id } = req.params;
      const { category } = req.body; // Destructure the category from request body

      // console.log(id, category)
    
      try {
        const filter = { _id: id };
        // console.log(filter)
        const updateDoc = {
          $set: {
            category:category  // Dynamically set category from request body
          },
        };
    
        const result = await allTasksCollection.updateOne(filter, updateDoc);
    
        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "Task not found or not modified" });
        }
    
        res.send({ message: "Task category updated successfully" });
      } catch (error) {
        console.error("Error updating task category:", error);
        res.status(500).json({ message: "Failed to update task category", error });
      }
    });
    








    // app.post('/tasks/done', async (req, res) => {
    //   const taskData = req.body;
    //   //  console.log(taskData)


    // //   const newTask = { taskData, date: new Date() };
    //   const result = await doneCollection.insertOne(taskData);

    //   res.status(201).send({ message: "Task added successfully!", taskId: result.insertedId });
    // });

























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






// Update task order
app.put('/allTasks/reorder', async (req, res) => {
  const tasks = req.body; // Array of task objects

  let email = '';
  if (tasks && tasks.length > 0) {
    email = tasks[0]?.email; // Assuming email is the same for all tasks
  }

  if (!Array.isArray(tasks)) {
    console.log('Tasks data not received');
    return res.status(400).json({ message: 'Invalid request, tasks should be an array' });
  }

  try {
    // Step 1: Delete all tasks that match the email and category
    await allTasksCollection.deleteMany({ email: email });

    // Step 2: Insert the new tasks into the collection
    const result = await allTasksCollection.insertMany(tasks);

    // Send success response
    res.status(200).json({ message: 'All tasks replaced successfully', result });
  } catch (error) {
    console.error('Error replacing tasks:', error);
    res.status(500).json({ message: 'Error replacing tasks', error: error.message });
  }
});







app.put('/inProgress/reorder', async (req, res) => {
  const tasks = req.body; // Array of tasks from the client
  let email = ''; // Declare email variable outside the block
 

  if (tasks && tasks.length > 0) {
    email = tasks[0]?.email; // Extract the email from the first task

    // console.log(email);
  }

  // Validate that tasks is an array
  if (!Array.isArray(tasks)) {
    console.log('Tasks data not received');
    return res.status(400).json({ message: 'Invalid request, tasks should be an array' });
  }

  try {
    // Step 1: Delete all tasks in the collection for the specified email
    if (email) {
      await inProgressCollection.deleteMany({ email: email});
      // Step 2: Insert the new array of tasks into the collection
      const result = await inProgressCollection.insertMany(tasks);
      // Step 3: Return a success message along with the result of the insertion
      res.status(200).json({ message: 'All tasks replaced successfully', result });
    }


  } catch (error) {
    console.error('Error replacing tasks:', error);
    res.status(500).json({ message: 'Error replacing tasks', error: error.message });
  }
});






app.put('/todo/reorder', async (req, res) => {
  const tasks = req.body; // Array of tasks from the client
  let email = ''; // Declare email variable outside the block
 

  if (tasks && tasks.length > 0) {
    email = tasks[0]?.email; // Extract the email from the first task

    // console.log(email);
  }

  // Validate that tasks is an array
  if (!Array.isArray(tasks)) {
    console.log('Tasks data not received');
    return res.status(400).json({ message: 'Invalid request, tasks should be an array' });
  }

  try {
    // Step 1: Delete all tasks in the collection for the specified email
    if (email) {
      await toDoCollection.deleteMany({ email: email});
      // Step 2: Insert the new array of tasks into the collection
      const result = await toDoCollection.insertMany(tasks);
      // Step 3: Return a success message along with the result of the insertion
      res.status(200).json({ message: 'All tasks replaced successfully', result });
    }


  } catch (error) {
    console.error('Error replacing tasks:', error);
    res.status(500).json({ message: 'Error replacing tasks', error: error.message });
  }
});







app.put('/done/reorder', async (req, res) => {
  const tasks = req.body; // Array of tasks from the client
  let email = ''; // Declare email variable outside the block
 

  if (tasks && tasks.length > 0) {
    email = tasks[0]?.email; // Extract the email from the first task

    // console.log(email);
  }

  // Validate that tasks is an array
  if (!Array.isArray(tasks)) {
    console.log('Tasks data not received');
    return res.status(400).json({ message: 'Invalid request, tasks should be an array' });
  }

  try {
    // Step 1: Delete all tasks in the collection for the specified email
    if (email) {
      await doneCollection.deleteMany({ email: email});
      // Step 2: Insert the new array of tasks into the collection
      const result = await doneCollection.insertMany(tasks);
      // Step 3: Return a success message along with the result of the insertion
      res.status(200).json({ message: 'All tasks replaced successfully', result });
    }


  } catch (error) {
    console.error('Error replacing tasks:', error);
    res.status(500).json({ message: 'Error replacing tasks', error: error.message });
  }
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

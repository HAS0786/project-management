import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
const mongoURI = process.env.MONGODB_PATH;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process on MongoDB connection failure
  });

// CORS setup
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // enable set cookie
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define mongoose schema and model for tasks
const taskSchema = new mongoose.Schema({
  projectId: String,
  title: String,
  description: String,
});

const Task = mongoose.model('Task', taskSchema);

// Define mongoose schema and model for projects
const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const Project = mongoose.model('Project', projectSchema);

// API endpoints for tasks

// Fetch all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find(); // Fetch all tasks
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Fetch project by ID
app.get('/project/:id', async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project data:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a task for a specific project
app.post('/project/:projectId/task', async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;

  try {
    const task = new Task({ projectId, title, description });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task for a specific project
app.put('/project/:projectId/task/:taskId', async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      { title, description },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Fetch all projects
app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find(); // Fetch all projects
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project
app.post('/projects', async (req, res) => {
  const { title, description } = req.body;

  try {
    const newProject = new Project({ title, description });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

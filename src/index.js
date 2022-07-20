const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username }  = request.headers
  
  const result        = users.find(element => element.username === username)

  if (!result)
    return response.status(400).json({error: "User does not exist"})

  request.user = result

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  
  const result           = users.some(element => element.username === username)
  
  if (result)
    return response.status(400).json({error: "User already exists"})

  users.push(
    {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  );

  const user = users.find(element => element.username === username)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user }            = request
  const { title, deadline } = request.body  

  const todoList = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoList)

  return response.status(201).json(todoList)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user }            = request
  const { title, deadline } = request.body
  const { id }              = request.params
  
  const todo                = user.todos.find(element => element.id === id)
  
  if (!todo) {
    return response.status(404).json({error: "Todo does not exist!"})
  }

  todo.title    = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user }    = request  
  const { id }      = request.params
  
  const todo        = user.todos.find(element => element.id === id)
  
  if (!todo) {
    return response.status(404).json({error: "Todo does not exist!"})
  }

  todo.done = true
  
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user }  = request  
  const { id }    = request.params
  
  const todo      = user.todos.find(element => element.id === id)
  
  if (!todo) {
    return response.status(404).json({error: "Todo does not exist!"})
  }

  user.todos.splice(todo, 1)
  
  return response.status(204).send()
});

module.exports = app;
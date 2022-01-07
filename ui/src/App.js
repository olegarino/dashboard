import {useEffect, useState} from 'react';
import axios from "axios";
import {format, set} from "date-fns";
import './App.css';

const baseUrl = "http://localhost:5000"

function App() {

  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const [todosList, setTodosList] = useState([]);
  const [todoId, setTodoId] = useState(null);

  const fetchTodos = async () => {
    const data = await axios.get(`${baseUrl}/todos`);
    const { todos } = data.data;
    setTodosList(todos);
  }

  const handleChange = e => {
     e.target.id=='description' ? setDescription(e.target.value) : setTitle(e.target.value)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/todos/${id}`)
      const updatedList = todosList.filter(todo => todo.id != id)
      setTodosList(updatedList);
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleEditChange = e => {
    e.target.id=='editDescription' ? setEditDescription(e.target.value) : setEditTitle(e.target.value)
 }

  const toggleEdit = (todo) => {
    setTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try {
      if (editDescription) {
        console.log("WHAT IS THE MOTHERFKN TITLE: ", editTitle);
        const data = await axios.put(`${baseUrl}/todos/${todoId}`, {
          title: editTitle,
          description: editDescription
        });
        console.log("SUBMIT ON EDIT DATA: ", data, editTitle, editDescription);
        const updatedTodo = data.data.todo;
        console.log("UPDATED TODO: ", updatedTodo, "WITH THIS BADBOY: ", data.data.todo);
        const updatedList = todosList.map(todo => {
          if(todo.id === todoId){
            console.log("TODO ID VALIDATION SUCCESS: ", todo, "WITH THIS: ", todoId)
            return todo = updatedTodo
          }
          return todo;
        })
        setTodosList(updatedList)
      } else {
      const data = await axios.post(`${baseUrl}/todos`, {
        title: title,
        description: description
      });
      setTodosList([...todosList, data.data]);
    }
    setDescription('');
    setTitle('');
    setEditDescription('');
    setEditTitle('');
    setTodoId(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []) 

  return (
    <div className="App">
      <section>
        <form onSubmit={handleSubmit}>
          <label htmlFor="title"></label>
          <input 
            type="text" 
            name="title" 
            id="title"
            placeholder="Title" 
            value={title} 
            onChange={handleChange}>
          </input>
          <label htmlFor="description"></label>
          <input 
            type="text" 
            name="description" 
            id="description" 
            placeholder="Description"
            value={description} 
            onChange={handleChange}>
          </input>
          <button type="submit">Submit</button>
        </form>
      </section>
      <section>
        <ul>
          {todosList.map(todo =>{
            if(todoId == todo.id) {
              return (
                <form onSubmit={handleSubmit} key={todo.id}>
                  <input 
                    type="text" 
                    name="editTitle" 
                    id="editTitle" 
                    value={editTitle} 
                    onChange={(e) => handleEditChange(e)}>
                  </input>

                  <input 
                    type="text" 
                    name="editDescription" 
                    id="editDescription" 
                    value={editDescription} 
                    onChange={(e) => handleEditChange(e)}>
                  </input>
                  <button type="submit">Submit</button>
                </form>
              )
            } else {
              return (
                <li key={todo.id}>
                  {format(new Date(todo.created_at), "MM/dd, p")}
                  {todo.title} - {todo.description}
                  <button onClick={() => toggleEdit(todo)}>Edit</button>
                  <button onClick={() => handleDelete(todo.id)}>X</button>
                </li>
              )
            }
          })}
        </ul>
      </section>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyB3OL6etFmWYchUJxRZAdFJ8h1T6MyOqUo",
  authDomain: "react-todo-1e2f1.firebaseapp.com",
  projectId: "react-todo-1e2f1",
  storageBucket: "react-todo-1e2f1.firebasestorage.app",
  messagingSenderId: "804541172279",
  appId: "1:804541172279:web:92520baab205c0c79e4db2"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  const todosCollection = collection(db, "todos");

  const fetchTodos = async () => {
    try {
      const q = query(todosCollection, orderBy("timestamp", "asc"));
      const snapshot = await getDocs(q);
      const todoList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodos(todoList);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() === "") {
      alert("Please enter a todo!");
      return;
    }
    try {
      const docRef = await addDoc(todosCollection, {
        text: newTodo.trim(),
        timestamp: serverTimestamp(),
      });
      console.log("Todo added with ID:", docRef.id);
      setNewTodo("");
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const editTodo = async (id, currentText) => {
    const updatedText = prompt("Edit your todo:", currentText);
    if (updatedText && updatedText.trim() !== "") {
      try {
        await updateDoc(doc(db, "todos", id), {
          text: updatedText.trim(),
          timestamp: serverTimestamp(),
        });
        fetchTodos();
      } catch (error) {
        console.error("Error updating todo:", error);
      }
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id));
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const deleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all todos?")) return;

    try {
      const snapshot = await getDocs(todosCollection);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      fetchTodos();
    } catch (error) {
      console.error("Error deleting all todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo App (React + Firestore)</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter todo"
          className="border px-3 py-2 flex-1 rounded"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
        <button
          onClick={deleteAll}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete All
        </button>
      </div>

      <ul className="space-y-2">
        {todos.length === 0 ? (
          <li className="text-gray-500">No todos yet</li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span>{todo.text}</span>
              <div className="space-x-2">
                <button
                  onClick={() => editTodo(todo.id, todo.text)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

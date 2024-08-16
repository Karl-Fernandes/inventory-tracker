'use client'; // This enables client-side rendering
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { db } from '../api/chat/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', amount: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Add or update item in database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.amount !== '') {
      const q = query(collection(db, 'items'));
      const querySnapshot = await getDocs(q);
      let itemExists = false;

      querySnapshot.forEach((document) => {
        if (document.data().name.toLowerCase() === newItem.name.toLowerCase()) {
          itemExists = true;
          const updatedAmount = parseInt(document.data().amount) + parseInt(newItem.amount);
          updateDoc(doc(db, 'items', document.id), { amount: updatedAmount });
        }
      });

      if (!itemExists) {
        await addDoc(collection(db, 'items'), {
          name: newItem.name.trim(),
          amount: parseInt(newItem.amount),
        });
      }

      setNewItem({ name: '', amount: '' });
    }
  };

  // Read items from database
  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];

      querySnapshot.forEach((document) => {
        itemsArr.push({ ...document.data(), id: document.id });
      });
      setItems(itemsArr);
    });

    return () => unsubscribe();
  }, []);

  // Delete item from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate Recipes
  const generateRecipes = async () => {
    if (items.length === 0) return;

    setRecipes([]); // Clear previous recipes
    setIsLoading(true); // Set loading state

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader(); // Stream the response
      const decoder = new TextDecoder();
      let done = false;
      let generatedRecipes = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        generatedRecipes += decoder.decode(value);
      }

      const recipesArray = generatedRecipes.split('\n').filter(recipe => recipe.trim() !== '');
      setRecipes(recipesArray || ["No recipes found."]); // Handle the API response format

    } catch (error) {
      console.error('Error:', error);
      setRecipes(["I'm sorry, but I encountered an error. Please try again later."]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <main className="flex min-h-screen flex-row items-start justify-center p-4">
      <div className="w-1/2 p-4">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl p-4 text-center">Food Tracker</h1>
          <div className="bg-slate-800 p-4 rounded-lg">
            <form className="grid grid-cols-6 gap-3 items-center text-black mb-4" onSubmit={addItem}>
              <input 
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="col-span-3 p-3 border rounded" 
                type="text" 
                placeholder="Enter Item" 
              />
              <input 
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="col-span-2 p-3 border rounded" 
                type="number" 
                placeholder="Enter Quantity" 
              />
              <button 
                className="text-white bg-slate-950 hover:bg-blue-700 p-3 text-xl rounded transition duration-300 ease-in-out transform hover:scale-105"
                type="submit"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <input 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="col-span-6 p-3 border rounded" 
                type="text" 
                placeholder="Search..." 
              />
            </form>
            <ul>
              {filteredItems.map((item) => (
                <li 
                  key={item.id}  // Use the item's ID as the key
                  className='my-4 w-full flex justify-between items-center bg-slate-950 rounded'
                >
                  <div className='p-4 w-full flex justify-between items-center'>
                    <span className='capitalize flex-grow'>{item.name}</span>
                    <span className='amount ml-3'>x{item.amount}</span>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16 rounded-r'
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="w-1/2 p-4">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl p-4 text-center">AI Recipe Generator</h1>
          <div className="bg-slate-800 p-4 rounded-lg">
            <button 
              className="text-white bg-blue-700 p-3 text-xl rounded w-full transition duration-300 ease-in-out transform hover:scale-105"
              type="button"  // Changed to 'button' to prevent form submission
              onClick={generateRecipes} // Add the onClick handler
            >
              {isLoading ? "Generating..." : "Generate Recipes!"} {/* Show loading state */}
            </button>
            <ul className="mt-4">
              {recipes.map((recipe, index) => (
                <li key={index} className="bg-slate-900 p-3 rounded my-2">
                  {recipe}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

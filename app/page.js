'use client'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { db } from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', amount: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Add or update item in database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.amount !== '') {
      const q = query(collection(db, 'items'));
      const querySnapshot = await getDocs(q);
      let itemExists = false;

      querySnapshot.forEach((doc) => {
        if (doc.data().name.toLowerCase() === newItem.name.toLowerCase()) {
          itemExists = true;
          const updatedAmount = parseInt(doc.data().amount) + parseInt(newItem.amount);
          updateDoc(doc.ref, { amount: updatedAmount });
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

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center">Inventory Manager</h1>
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
              className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl rounded" 
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
            {filteredItems.map((item, id) => (
              <li 
                key={id} 
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
    </main>
  );
}

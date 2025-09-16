
import React, { useState, useEffect } from 'react';
import type { Book } from '../types';
import { fetchBookDetailsByISBN } from '../services/geminiService';
import { SparklesIcon } from './icons/Icons';

interface BookFormProps {
  book: Book | null;
  onSave: (book: Omit<Book, 'id' | 'borrowedBy'> | Book) => void;
  onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    quantity: 1,
    coverImage: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        description: book.description,
        quantity: book.quantity,
        coverImage: book.coverImage
      });
    } else {
        setFormData({
            title: '', author: '', isbn: '', genre: '', description: '', quantity: 1, coverImage: ''
        });
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) : value }));
  };

  const handleFetchFromGemini = async () => {
    if (!formData.isbn) {
        setError('Vui lòng nhập ISBN để tìm kiếm.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const details = await fetchBookDetailsByISBN(formData.isbn);
        setFormData(prev => ({
            ...prev,
            title: details.title || '',
            author: details.author || '',
            description: details.description || '',
            genre: details.genre || '',
            coverImage: `https://picsum.photos/seed/${formData.isbn}/400/600`
        }));
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (book) {
      onSave({ ...book, ...formData });
    } else {
      const newBook = { ...formData, coverImage: formData.coverImage || `https://picsum.photos/seed/${formData.isbn || Date.now()}/400/600`};
      onSave(newBook);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-end space-x-2">
        <div className="flex-grow">
          <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ISBN</label>
          <input type="text" name="isbn" id="isbn" value={formData.isbn} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
        </div>
        <button type="button" onClick={handleFetchFromGemini} disabled={isLoading} className="flex items-center bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-gray-400">
           {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <SparklesIcon className="w-5 h-5 mr-2" />
            )}
            Lấy từ AI
        </button>
      </div>
       {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tiêu đề</label>
        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
      </div>
       <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tác giả</label>
        <input type="text" name="author" id="author" value={formData.author} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
      </div>
       <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thể loại</label>
        <input type="text" name="genre" id="genre" value={formData.genre} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
      </div>
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng</label>
        <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} min="0" required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
      </div>
    </form>
  );
};

export default BookForm;

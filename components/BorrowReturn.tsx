import React, { useState, useMemo } from 'react';
import type { Book, Student, BorrowingRecord } from '../types';

interface BorrowReturnProps {
  books: Book[];
  students: Student[];
  borrowingRecords: BorrowingRecord[];
  onBorrow: (bookId: string, studentId: string, durationInDays: number) => void;
  onReturn: (recordId: string) => void;
}

const BorrowReturn: React.FC<BorrowReturnProps> = ({ books, students, borrowingRecords, onBorrow, onReturn }) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [borrowDurationOption, setBorrowDurationOption] = useState('14');
  const [customDuration, setCustomDuration] = useState('1');
  
  const calculatedDueDate = useMemo(() => {
    const duration = borrowDurationOption === 'custom' ? parseInt(customDuration, 10) : parseInt(borrowDurationOption, 10);
    if (!isNaN(duration) && duration >= 1 && duration <= 730) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + duration);
        return dueDate.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    return null;
  }, [borrowDurationOption, customDuration]);


  const handleBorrow = () => {
    if (selectedBook && selectedStudent) {
      const duration = borrowDurationOption === 'custom' ? parseInt(customDuration, 10) : parseInt(borrowDurationOption, 10);
       if (isNaN(duration) || duration < 1 || duration > 730) {
          alert('Thời gian mượn phải từ 1 đến 730 ngày.');
          return;
      }
      onBorrow(selectedBook, selectedStudent, duration);
      setSelectedBook('');
      setSelectedStudent('');
      setBorrowDurationOption('14');
      setCustomDuration('1');
    } else {
      alert('Vui lòng chọn sách và học sinh.');
    }
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setCustomDuration('');
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue <= 730 && numValue >= 0) {
      if (value.length > 1 && value.startsWith('0')) {
          setCustomDuration(numValue.toString());
      } else {
          setCustomDuration(value);
      }
    }
  };
  
  const handleCustomDurationBlur = () => {
    const duration = parseInt(customDuration, 10);
    if (isNaN(duration) || duration < 1) {
      setCustomDuration('1');
    } else if (duration > 730) {
      setCustomDuration('730');
    }
  };
  
  const availableBooks = books.filter(book => book.quantity > 0);
  const borrowedBooksDetails = borrowingRecords.map(record => {
    const book = books.find(b => b.id === record.bookId);
    const student = students.find(m => m.id === record.studentId);
    return { ...record, bookTitle: book?.title, studentName: student?.name };
  }).filter(details => details.bookTitle && details.studentName);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mượn / Trả sách</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Borrow Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Mượn sách</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="book" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chọn sách</label>
              <select 
                id="book" 
                value={selectedBook} 
                onChange={e => setSelectedBook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Sách có sẵn --</option>
                {availableBooks.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chọn học sinh</label>
              <select 
                id="student" 
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Học sinh --</option>
                {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thời gian mượn</label>
               <div className="flex items-start space-x-2">
                <select
                  id="duration"
                  value={borrowDurationOption}
                  onChange={e => setBorrowDurationOption(e.target.value)}
                  className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">7 ngày</option>
                  <option value="14">14 ngày</option>
                  <option value="21">21 ngày</option>
                  <option value="30">30 ngày</option>
                  <option value="custom">Tùy chỉnh...</option>
                </select>
                {borrowDurationOption === 'custom' && (
                   <div className="flex-shrink-0">
                     <div className="relative">
                       <input
                        type="number"
                        value={customDuration}
                        onChange={handleCustomDurationChange}
                        onBlur={handleCustomDurationBlur}
                        min="1"
                        max="730"
                        className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Số ngày"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">ngày</span>
                     </div>
                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">Tối đa 730 ngày</p>
                   </div>
                )}
              </div>
               {calculatedDueDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Dự kiến ngày trả: <span className="font-semibold text-blue-600 dark:text-blue-400">{calculatedDueDate}</span>
                    </p>
                )}
            </div>
            <button 
              onClick={handleBorrow}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedBook || !selectedStudent}
            >
              Xác nhận mượn
            </button>
          </div>
        </div>

        {/* Return Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Trả sách</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {borrowedBooksDetails.length > 0 ? borrowedBooksDetails.map(record => {
              const isOverdue = new Date(record.dueDate) < new Date();
              return (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{record.bookTitle}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {record.studentName} - Hạn trả: {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                    {isOverdue && <p className="text-xs font-bold text-red-500">QUÁ HẠN</p>}
                  </div>
                  <button 
                    onClick={() => onReturn(record.id)}
                    className="bg-green-500 text-white font-semibold px-3 py-1 text-sm rounded-md hover:bg-green-600 transition-colors"
                  >
                    Trả sách
                  </button>
                </div>
              );
            }) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">Không có sách nào đang được mượn.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowReturn;
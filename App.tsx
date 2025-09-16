
import React, { useState, useCallback, useMemo } from 'react';
import { Book, Student, BorrowingRecord, View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import StudentList from './components/MemberList';
import BorrowReturn from './components/BorrowReturn';
import AIAssistant from './components/AIAssistant';
import { initialBooks, initialStudents, initialBorrowingRecords } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecord[]>(initialBorrowingRecords);

  const addBook = useCallback((book: Omit<Book, 'id' | 'borrowedBy'>) => {
    setBooks(prev => [...prev, { ...book, id: Date.now().toString(), borrowedBy: [] }]);
  }, []);
  
  const handleImportBooks = useCallback((importedBooks: Omit<Book, 'id' | 'borrowedBy' | 'coverImage'>[]) => {
    const newBooks: Book[] = importedBooks.map((b, index) => ({
      ...b,
      id: `${Date.now()}-${index}`,
      borrowedBy: [],
      coverImage: `https://picsum.photos/seed/${b.isbn || Date.now() + index}/400/600`,
    }));
    setBooks(prev => [...prev, ...newBooks]);
  }, []);

  const updateBook = useCallback((updatedBook: Book) => {
    setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
  }, []);
  
  const checkCanDeleteBook = useCallback((bookId: string) => {
    return !borrowingRecords.some(record => record.bookId === bookId);
  }, [borrowingRecords]);

  const deleteBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId));
  }, []);

  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...student, id: Date.now().toString() }]);
  }, []);

  const updateStudent = useCallback((updatedStudent: Student) => {
    setStudents(prev => prev.map(student => student.id === updatedStudent.id ? updatedStudent : student));
  }, []);

  const checkCanDeleteStudent = useCallback((studentId: string) => {
    return !borrowingRecords.some(record => record.studentId === studentId);
  }, [borrowingRecords]);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
  }, []);
  
  const handleImportStudents = useCallback((importedStudents: Omit<Student, 'id' | 'joinDate' | 'email' | 'phone'>[]) => {
    const newStudents: Student[] = importedStudents.map((s, index) => ({
      ...s,
      id: `${Date.now()}-${index}`,
      joinDate: new Date(),
      email: '',
      phone: '',
    }));
    setStudents(prev => [...prev, ...newStudents]);
  }, []);


  const borrowBook = useCallback((bookId: string, studentId: string, durationInDays: number) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationInDays);

    const newRecord: BorrowingRecord = {
      id: Date.now().toString(),
      bookId,
      studentId,
      borrowDate: new Date(),
      dueDate,
    };

    setBorrowingRecords(prev => [...prev, newRecord]);
    setBooks(prev => prev.map(book =>
      book.id === bookId
        ? { ...book, quantity: book.quantity - 1, borrowedBy: [...book.borrowedBy, studentId] }
        : book
    ));
  }, []);

  const returnBook = useCallback((recordId: string) => {
    const record = borrowingRecords.find(r => r.id === recordId);
    if (!record) return;

    setBorrowingRecords(prev => prev.filter(r => r.id !== recordId));
    setBooks(prev => prev.map(book =>
      book.id === record.bookId
        ? { ...book, quantity: book.quantity + 1, borrowedBy: book.borrowedBy.filter(id => id !== record.studentId) }
        : book
    ));
  }, [borrowingRecords]);

  const renderContent = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return <Dashboard books={books} students={students} borrowingRecords={borrowingRecords} />;
      case View.BOOKS:
        return <BookList books={books} onAddBook={addBook} onUpdateBook={updateBook} onDeleteBook={deleteBook} onCheckCanDelete={checkCanDeleteBook} students={students} onImportBooks={handleImportBooks} />;
      case View.STUDENTS:
        return <StudentList students={students} onAddStudent={addStudent} onUpdateStudent={updateStudent} onDeleteStudent={deleteStudent} onCheckCanDelete={checkCanDeleteStudent} onImportStudents={handleImportStudents} />;
      case View.BORROW:
        return <BorrowReturn 
                  books={books} 
                  students={students} 
                  borrowingRecords={borrowingRecords}
                  onBorrow={borrowBook}
                  onReturn={returnBook}
                />;
      case View.AI_ASSISTANT:
        return <AIAssistant students={students} books={books} borrowingRecords={borrowingRecords} />
      default:
        return <Dashboard books={books} students={students} borrowingRecords={borrowingRecords} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
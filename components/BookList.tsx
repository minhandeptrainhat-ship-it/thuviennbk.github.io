
import React, { useState, useMemo, useRef } from 'react';
import type { Book, Student } from '../types';
import Modal from './Modal';
import BookForm from './BookForm';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, AlertTriangleIcon, FileSpreadsheetIcon } from './icons/Icons';
import { extractBooksFromExcel } from '../services/geminiService';
import { read, utils } from 'xlsx';

interface BookListProps {
  books: Book[];
  students: Student[];
  onAddBook: (book: Omit<Book, 'id' | 'borrowedBy'>) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onCheckCanDelete: (bookId: string) => boolean;
  onImportBooks: (books: Omit<Book, 'id' | 'borrowedBy' | 'coverImage'>[]) => void;
}

const BookCard: React.FC<{ book: Book; onEdit: () => void; onDelete: () => void; students: Student[] }> = ({ book, onEdit, onDelete, students }) => {
    const available = book.quantity > 0;
    const borrowers = book.borrowedBy.map(studentId => students.find(m => m.id === studentId)?.name).filter(Boolean);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
            <img src={book.coverImage} alt={book.title} className="w-full h-56 object-cover" />
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{book.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                <p className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full self-start mb-4">{book.genre}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow mb-4 line-clamp-3">{book.description}</p>
                
                <div className="text-sm space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">ISBN:</span>
                        <span className="text-gray-600 dark:text-gray-400">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Số lượng có sẵn:</span>
                        <span className={`font-bold ${available ? 'text-green-500' : 'text-red-500'}`}>{book.quantity}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Đang được mượn:</span>
                        <span className="text-gray-600 dark:text-gray-400">{book.borrowedBy.length}</span>
                    </div>
                    {borrowers.length > 0 && (
                         <div className="pt-2">
                             <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Người mượn: </span>
                             <span className="text-xs text-gray-500 dark:text-gray-400">{borrowers.join(', ')}</span>
                         </div>
                    )}
                </div>

            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end space-x-2">
                <button onClick={onEdit} className="p-2 rounded-full text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/50 transition-colors">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={onDelete} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


const BookList: React.FC<BookListProps> = ({ books, students, onAddBook, onUpdateBook, onDeleteBook, onCheckCanDelete, onImportBooks }) => {
  const [modalState, setModalState] = useState<{type: 'add' | 'edit' | 'delete' | 'error' | null, data: Book | null}>({ type: null, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => setModalState({ type: 'add', data: null });
  const openEditModal = (book: Book) => setModalState({ type: 'edit', data: book });
  const closeModal = () => setModalState({ type: null, data: null });

  const handleDeleteRequest = (book: Book) => {
    if (onCheckCanDelete(book.id)) {
      setModalState({ type: 'delete', data: book });
    } else {
      setModalState({ type: 'error', data: book });
    }
  };

  const confirmDelete = () => {
    if (modalState.data && modalState.type === 'delete') {
      onDeleteBook(modalState.data.id);
    }
    closeModal();
  };
  
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImportError('');

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
        try {
            const workbook = read(reader.result, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csvData = utils.sheet_to_csv(worksheet);
            
            const bookData = await extractBooksFromExcel(csvData);
            onImportBooks(bookData);
        } catch (error) {
            setImportError((error as Error).message);
        } finally {
            setIsLoading(false);
            if(excelFileInputRef.current) {
                excelFileInputRef.current.value = "";
            }
        }
    };
    reader.onerror = () => {
        setIsLoading(false);
        setImportError("Không thể đọc tệp excel.");
         if(excelFileInputRef.current) {
            excelFileInputRef.current.value = "";
        }
    };
  };

  const handleSave = (bookData: Omit<Book, 'id' | 'borrowedBy'> | Book) => {
    if ('id' in bookData) {
      onUpdateBook(bookData as Book);
    } else {
      onAddBook(bookData as Omit<Book, 'id' | 'borrowedBy'>);
    }
    closeModal();
  };

  const filteredBooks = useMemo(() => 
    books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    ), [books, searchTerm]);

  const renderModal = () => {
    if (!modalState.type) return null;

    if (modalState.type === 'add' || modalState.type === 'edit') {
      return (
        <Modal isOpen={true} onClose={closeModal} title={modalState.type === 'edit' ? 'Chỉnh sửa sách' : 'Thêm sách mới'}>
          <BookForm book={modalState.data} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      );
    }
    
    if (modalState.type === 'delete') {
      return (
        <Modal isOpen={true} onClose={closeModal} title="Xác nhận xóa sách">
          <div className="text-center">
            <AlertTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn xóa sách <span className="font-bold">"{modalState.data?.title}"</span> không? Hành động này không thể được hoàn tác.</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button onClick={closeModal} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
              <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa</button>
            </div>
          </div>
        </Modal>
      );
    }

     if (modalState.type === 'error') {
      return (
        <Modal isOpen={true} onClose={closeModal} title="Không thể xóa sách">
           <div className="text-center">
            <AlertTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
            <p className="mt-4 text-gray-700 dark:text-gray-300">Không thể xóa sách <span className="font-bold">"{modalState.data?.title}"</span> vì sách đang được thành viên mượn.</p>
            <div className="mt-6 flex justify-center">
              <button onClick={closeModal} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Đã hiểu</button>
            </div>
          </div>
        </Modal>
      );
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý Sách</h1>
         <div className="flex items-center space-x-3">
          <input type="file" accept=".xlsx, .xls, .csv" ref={excelFileInputRef} onChange={handleExcelImport} className="hidden" id="excel-book-upload" />
          <button onClick={() => excelFileInputRef.current?.click()} disabled={isLoading} className="flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FileSpreadsheetIcon className="w-5 h-5 mr-2" />}
            Nhập từ Excel
          </button>
          <button onClick={openAddModal} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm sách mới
          </button>
        </div>
      </div>
      
      {importError && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{importError}</p>}

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </span>
        <input 
          type="text" 
          placeholder="Tìm kiếm sách theo tên, tác giả, ISBN..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <BookCard key={book.id} book={book} students={students} onEdit={() => openEditModal(book)} onDelete={() => handleDeleteRequest(book)} />
        ))}
      </div>
      {filteredBooks.length === 0 && (
        <div className="text-center py-10 col-span-full">
          <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sách nào.</p>
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default BookList;
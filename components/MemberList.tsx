
import React, { useState, useMemo, useRef } from 'react';
import type { Student } from '../types';
import Modal from './Modal';
import StudentForm from './MemberForm';
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon, AlertTriangleIcon, UploadIcon, SearchIcon, FileSpreadsheetIcon } from './icons/Icons';
import { extractStudentsFromImage, extractStudentsFromExcel } from '../services/geminiService';
import { read, utils } from 'xlsx';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onCheckCanDelete: (studentId: string) => boolean;
  onImportStudents: (students: Omit<Student, 'id' | 'joinDate' | 'email' | 'phone'>[]) => void;
}

const StudentCard: React.FC<{ student: Student; onEdit: () => void; onDelete: () => void; }> = ({ student, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lớp: {student.className} - Khối: {student.grade}</p>
            </div>
          </div>
           <div className="flex space-x-1">
            <button onClick={onEdit} className="p-2 rounded-full text-gray-400 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/50 transition-colors">
                  <EditIcon className="w-4 h-4" />
              </button>
              <button onClick={onDelete} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 transition-colors">
                  <TrashIcon className="w-4 h-4" />
              </button>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p><span className="font-semibold">Ngày sinh:</span> {student.birthDate}</p>
          <p><span className="font-semibold">Giới tính:</span> {student.gender}</p>
          <p><span className="font-semibold">Địa chỉ:</span> {student.address}</p>
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <CalendarIcon className="w-3 h-3 mr-1.5" />
        <span>Tham gia ngày: {new Date(student.joinDate).toLocaleDateString('vi-VN')}</span>
      </div>
    </div>
  );
};


const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent, onUpdateStudent, onDeleteStudent, onCheckCanDelete, onImportStudents }) => {
  const [modalState, setModalState] = useState<{type: 'add' | 'edit' | 'delete' | 'error' | null, data: Student | null}>({ type: null, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => setModalState({ type: 'add', data: null });
  const openEditModal = (student: Student) => setModalState({ type: 'edit', data: student });
  const closeModal = () => setModalState({ type: null, data: null });

  const handleDeleteRequest = (student: Student) => {
    if (onCheckCanDelete(student.id)) {
      setModalState({ type: 'delete', data: student });
    } else {
      setModalState({ type: 'error', data: student });
    }
  };
  
  const handleImageImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImportError('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            const base64String = (reader.result as string).split(',')[1];
            const studentData = await extractStudentsFromImage(base64String, file.type);
            onImportStudents(studentData);
        } catch (error) {
            setImportError((error as Error).message);
        } finally {
            setIsLoading(false);
            if(imageFileInputRef.current) {
                imageFileInputRef.current.value = "";
            }
        }
    };
    reader.onerror = () => {
        setIsLoading(false);
        setImportError("Không thể đọc tệp hình ảnh.");
         if(imageFileInputRef.current) {
            imageFileInputRef.current.value = "";
        }
    };
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
            
            const studentData = await extractStudentsFromExcel(csvData);
            onImportStudents(studentData);
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


  const confirmDelete = () => {
    if (modalState.data && modalState.type === 'delete') {
      onDeleteStudent(modalState.data.id);
    }
    closeModal();
  };

  const handleSave = (studentData: Omit<Student, 'id'> | Student) => {
    if ('id' in studentData) {
      onUpdateStudent(studentData as Student);
    } else {
      onAddStudent(studentData as Omit<Student, 'id'>);
    }
    closeModal();
  };
  
  const classNames = useMemo(() => ['all', ...Array.from(new Set(students.map(s => s.className)))], [students]);

  const filteredStudents = useMemo(() => 
    students.filter(student => 
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedClass === 'all' || student.className === selectedClass)
    ), [students, searchTerm, selectedClass]);
  
  const renderModal = () => {
    if (!modalState.type) return null;

    if (modalState.type === 'add' || modalState.type === 'edit') {
      return (
        <Modal isOpen={true} onClose={closeModal} title={modalState.type === 'edit' ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}>
          <StudentForm student={modalState.data} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      );
    }
    
    if (modalState.type === 'delete') {
      return (
        <Modal isOpen={true} onClose={closeModal} title="Xác nhận xóa học sinh">
          <div className="text-center">
            <AlertTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn xóa học sinh <span className="font-bold">"{modalState.data?.name}"</span> không? Hành động này không thể được hoàn tác.</p>
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
        <Modal isOpen={true} onClose={closeModal} title="Không thể xóa học sinh">
           <div className="text-center">
            <AlertTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
            <p className="mt-4 text-gray-700 dark:text-gray-300">Không thể xóa học sinh <span className="font-bold">"{modalState.data?.name}"</span> vì học sinh này đang mượn sách.</p>
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý Học sinh</h1>
        <div className="flex items-center space-x-3">
          <input type="file" accept="image/*" ref={imageFileInputRef} onChange={handleImageImport} className="hidden" id="image-upload" />
          <button onClick={() => imageFileInputRef.current?.click()} disabled={isLoading} className="flex items-center bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-gray-400">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <UploadIcon className="w-5 h-5 mr-2" />}
            Nhập từ ảnh
          </button>
          <input type="file" accept=".xlsx, .xls, .csv" ref={excelFileInputRef} onChange={handleExcelImport} className="hidden" id="excel-student-upload" />
          <button onClick={() => excelFileInputRef.current?.click()} disabled={isLoading} className="flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FileSpreadsheetIcon className="w-5 h-5 mr-2" />}
            Nhập từ Excel
          </button>
          <button onClick={openAddModal} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm học sinh
          </button>
        </div>
      </div>
      
      {importError && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{importError}</p>}

       <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input 
              type="text" 
              placeholder="Tìm kiếm học sinh theo tên, địa chỉ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classNames.map(name => 
                    <option key={name} value={name}>{name === 'all' ? 'Tất cả các lớp' : `Lớp ${name}`}</option>
                )}
            </select>
          </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <StudentCard key={student.id} student={student} onEdit={() => openEditModal(student)} onDelete={() => handleDeleteRequest(student)} />
        ))}
      </div>
       {filteredStudents.length === 0 && (
        <div className="text-center py-10 col-span-full">
          <p className="text-gray-500 dark:text-gray-400">Không có học sinh nào phù hợp.</p>
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default StudentList;
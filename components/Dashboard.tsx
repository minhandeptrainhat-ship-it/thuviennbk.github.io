
import React from 'react';
import type { Book, Student, BorrowingRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpenIcon, UsersIcon, AlertTriangleIcon, ArrowRightLeftIcon } from './icons/Icons';

interface DashboardProps {
  books: Book[];
  students: Student[];
  borrowingRecords: BorrowingRecord[];
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 transition-transform duration-300 hover:scale-105">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ books, students, borrowingRecords }) => {
  const totalBooks = books.reduce((sum, book) => sum + book.quantity + book.borrowedBy.length, 0);
  const borrowedBooksCount = borrowingRecords.length;
  const overdueBooksCount = borrowingRecords.filter(r => new Date(r.dueDate) < new Date()).length;
  const totalStudents = students.length;

  const genreData = books.reduce((acc, book) => {
    const genre = book.genre;
    const existingGenre = acc.find(item => item.name === genre);
    if (existingGenre) {
      existingGenre.count += (book.quantity + book.borrowedBy.length);
    } else {
      acc.push({ name: genre, count: (book.quantity + book.borrowedBy.length) });
    }
    return acc;
  }, [] as { name: string; count: number }[]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Bảng điều khiển</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng số sách" value={totalBooks} icon={<BookOpenIcon className="w-6 h-6 text-white"/>} color="bg-blue-500" />
        <StatCard title="Sách đang mượn" value={borrowedBooksCount} icon={<ArrowRightLeftIcon className="w-6 h-6 text-white"/>} color="bg-green-500" />
        <StatCard title="Sách quá hạn" value={overdueBooksCount} icon={<AlertTriangleIcon className="w-6 h-6 text-white"/>} color="bg-red-500" />
        <StatCard title="Tổng học sinh" value={totalStudents} icon={<UsersIcon className="w-6 h-6 text-white"/>} color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Thống kê sách theo thể loại</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                  borderColor: '#4b5563',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Sách mượn gần đây</h2>
          <div className="space-y-4">
            {borrowingRecords.slice(-5).reverse().map(record => {
               const book = books.find(b => b.id === record.bookId);
               const student = students.find(m => m.id === record.studentId);
               return (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{book?.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">bởi {student?.name}</p>
                    </div>
                    <span className="text-sm text-gray-400 dark:text-gray-500">{new Date(record.borrowDate).toLocaleDateString('vi-VN')}</span>
                </div>
               );
            })}
             {borrowingRecords.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">Chưa có sách nào được mượn.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

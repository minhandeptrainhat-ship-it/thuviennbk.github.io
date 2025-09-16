
import React, { useState } from 'react';
import { getAIRecommendations } from '../services/geminiService';
import type { Student, Book, BorrowingRecord } from '../types';
import { SparklesIcon, BotIcon } from './icons/Icons';

interface AIAssistantProps {
    students: Student[];
    books: Book[];
    borrowingRecords: BorrowingRecord[];
}

type Recommendation = {
    title: string;
    author: string;
    reason: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ students, books, borrowingRecords }) => {
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [customQuery, setCustomQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<Recommendation[]>([]);
    const [error, setError] = useState<string>('');

    const handleGetRecommendations = async () => {
        let prompt = '';

        if (selectedStudent) {
            const student = students.find(m => m.id === selectedStudent);
            if (!student) return;

            const studentRecords = borrowingRecords.filter(r => r.studentId === selectedStudent);
            const borrowedBookTitles = studentRecords
                .map(r => books.find(b => b.id === r.bookId)?.title)
                .filter((title): title is string => !!title);
            
            if (borrowedBookTitles.length > 0) {
                prompt = `Học sinh ${student.name} đã từng mượn các cuốn sách sau: ${borrowedBookTitles.join(', ')}. Dựa vào đó, hãy đề xuất những cuốn sách tương tự hoặc cùng thể loại mà họ có thể thích.`;
            } else {
                prompt = `Học sinh ${student.name} là học sinh mới và chưa mượn cuốn sách nào. Hãy đề xuất một vài cuốn sách hay, dễ đọc thuộc nhiều thể loại khác nhau để bắt đầu.`;
            }

        } else if (customQuery) {
            prompt = customQuery;
        } else {
            setError('Vui lòng chọn học sinh hoặc nhập một yêu cầu.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResults([]);

        try {
            const response = await getAIRecommendations(prompt);
            setResults(response.recommendations);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <BotIcon className="w-16 h-16 mx-auto text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Trợ lý AI Thư viện</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Nhận đề xuất sách thông minh được cá nhân hóa cho bạn.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                <div>
                    <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Đề xuất cho học sinh
                    </label>
                    <select
                        id="student-select"
                        value={selectedStudent}
                        onChange={(e) => {
                            setSelectedStudent(e.target.value);
                            setCustomQuery('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Chọn học sinh --</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center text-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">HOẶC</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <div>
                     <label htmlFor="custom-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nhập yêu cầu của bạn
                    </label>
                    <textarea
                        id="custom-query"
                        rows={3}
                        value={customQuery}
                        onChange={(e) => {
                            setCustomQuery(e.target.value);
                            setSelectedStudent('');
                        }}
                        placeholder="Ví dụ: 'Tìm cho tôi sách về du hành không gian' hoặc 'sách trinh thám có yếu tố bất ngờ'..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={handleGetRecommendations}
                    disabled={isLoading || (!selectedStudent && !customQuery)}
                    className="w-full flex justify-center items-center bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Nhận đề xuất
                        </>
                    )}
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>

            {results.length > 0 && (
                <div className="space-y-4">
                     <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Kết quả đề xuất:</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((rec, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col transition-transform duration-300 hover:scale-105">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{rec.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">bởi {rec.author}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
                                   <span className="font-semibold">Lý do:</span> {rec.reason}
                                </p>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;

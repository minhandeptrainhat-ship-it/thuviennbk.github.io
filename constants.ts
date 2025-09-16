import type { Book, Student, BorrowingRecord } from './types';

// --- STUDENT DATA ---
const student1Id = 'student-1';
const student2Id = 'student-2';
const student3Id = 'student-3';
const student4Id = 'student-4';
const student5Id = 'student-5';

export const initialStudents: Student[] = [
  {
    id: student1Id,
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    joinDate: new Date('2023-09-01'),
    birthDate: '15/05/2010',
    gender: 'Nam',
    grade: '8',
    className: '8A1',
    ethnicity: 'Kinh',
    address: '123 Đường ABC, Quận 1, TP. HCM'
  },
  {
    id: student2Id,
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0912345678',
    joinDate: new Date('2023-09-01'),
    birthDate: '20/08/2011',
    gender: 'Nữ',
    grade: '7',
    className: '7A2',
    ethnicity: 'Kinh',
    address: '456 Đường XYZ, Quận 3, TP. HCM'
  },
    {
    id: student3Id,
    name: 'Lê Hoàng Cường',
    email: 'cuong.le@example.com',
    phone: '0987654321',
    joinDate: new Date('2024-01-10'),
    birthDate: '10/11/2009',
    gender: 'Nam',
    grade: '9',
    className: '9B1',
    ethnicity: 'Kinh',
    address: '789 Đường DEF, Quận Gò Vấp, TP. HCM'
  },
  {
    id: student4Id,
    name: 'Phạm Thúy Duyên',
    email: 'duyen.pham@example.com',
    phone: '0978123456',
    joinDate: new Date('2024-02-20'),
    birthDate: '25/02/2010',
    gender: 'Nữ',
    grade: '8',
    className: '8A3',
    ethnicity: 'Kinh',
    address: '101 Đường GHI, Quận Bình Thạnh, TP. HCM'
  },
   {
    id: student5Id,
    name: 'Hoàng Minh Hải',
    email: 'hai.hoang@example.com',
    phone: '0965432109',
    joinDate: new Date('2024-03-15'),
    birthDate: '30/07/2011',
    gender: 'Nam',
    grade: '7',
    className: '7A2',
    ethnicity: 'Kinh',
    address: '212 Đường KLM, Quận 10, TP. HCM'
  }
];


// --- BOOK DATA ---
const book1Id = 'book-1';
const book2Id = 'book-2';
const book3Id = 'book-3';
const book4Id = 'book-4';
const book5Id = 'book-5';
const book6Id = 'book-6';
const book7Id = 'book-7';
const book8Id = 'book-8';

export const initialBooks: Book[] = [
  {
    id: book1Id,
    title: 'Dế Mèn Phiêu Lưu Ký',
    author: 'Tô Hoài',
    isbn: '978-604-2-05996-8',
    genre: 'Thiếu nhi',
    description: 'Cuộc phiêu lưu của chú Dế Mèn qua thế giới loài vật và những bài học đường đời sâu sắc.',
    quantity: 4, // Initial 5, 1 borrowed
    coverImage: 'https://picsum.photos/seed/9786042059968/400/600',
    borrowedBy: [student1Id],
  },
  {
    id: book2Id,
    title: 'Harry Potter và Hòn Đá Phù Thủy',
    author: 'J.K. Rowling',
    isbn: '978-604-1-19766-9',
    genre: 'Giả tưởng',
    description: 'Tập đầu tiên trong series truyện về cậu bé phù thủy Harry Potter và những cuộc phiêu lưu tại trường Hogwarts.',
    quantity: 2, // Initial 3, 1 borrowed
    coverImage: 'https://picsum.photos/seed/9786041197669/400/600',
    borrowedBy: [student2Id],
  },
  {
    id: book3Id,
    title: 'Số Đỏ',
    author: 'Vũ Trọng Phụng',
    isbn: '978-604-9-69830-7',
    genre: 'Văn học Việt Nam',
    description: 'Một tác phẩm châm biếm sâu cay về xã hội Việt Nam thời Pháp thuộc qua nhân vật Xuân Tóc Đỏ.',
    quantity: 5,
    coverImage: 'https://picsum.photos/seed/9786049698307/400/600',
    borrowedBy: [],
  },
  {
    id: book4Id,
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    isbn: '978-604-3-46387-9',
    genre: 'Tiểu thuyết',
    description: 'Hành trình đi tìm kho báu của cậu bé chăn cừu Santiago, một câu chuyện đầy triết lý về việc theo đuổi ước mơ.',
    quantity: 6,
    coverImage: 'https://picsum.photos/seed/9786043463879/400/600',
    borrowedBy: [],
  },
  {
    id: book5Id,
    title: 'Lược Sử Loài Người',
    author: 'Yuval Noah Harari',
    isbn: '978-604-3-45579-9',
    genre: 'Khoa học',
    description: 'Cuốn sách kể về toàn bộ lịch sử của loài người, từ thời kỳ đồ đá cho đến cuộc cách mạng công nghệ.',
    quantity: 3,
    coverImage: 'https://picsum.photos/seed/9786043455799/400/600',
    borrowedBy: [],
  },
   {
    id: book6Id,
    title: 'Conan - Tập 1',
    author: 'Aoyama Gosho',
    isbn: '978-604-2-21111-3',
    genre: 'Trinh thám',
    description: 'Cậu thám tử trung học Kudo Shinichi bị teo nhỏ và phá các vụ án dưới thân phận Edogawa Conan.',
    quantity: 9, // Initial 10, 1 borrowed
    coverImage: 'https://picsum.photos/seed/9786042211113/400/600',
    borrowedBy: [student1Id],
  },
  {
    id: book7Id,
    title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
    author: 'Nguyễn Nhật Ánh',
    isbn: '978-604-2-16223-1',
    genre: 'Thiếu nhi',
    description: 'Câu chuyện tuổi thơ trong sáng, hồn nhiên ở một làng quê nghèo Việt Nam những năm cuối 1980.',
    quantity: 7,
    coverImage: 'https://picsum.photos/seed/9786042162231/400/600',
    borrowedBy: [],
  },
  {
    id: book8Id,
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    isbn: '978-604-5-88697-3',
    genre: 'Kỹ năng sống',
    description: 'Cuốn sách self-help kinh điển về nghệ thuật giao tiếp, ứng xử và thu phục lòng người.',
    quantity: 10,
    coverImage: 'https://picsum.photos/seed/9786045886973/400/600',
    borrowedBy: [],
  }
];


// --- BORROWING DATA ---
export const initialBorrowingRecords: BorrowingRecord[] = [
  {
    id: 'record-1',
    bookId: book1Id, // Dế Mèn
    studentId: student1Id, // Nguyễn Văn An
    borrowDate: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)), // Due in 4 days
  },
  {
    id: 'record-2',
    bookId: book2Id, // Harry Potter
    studentId: student2Id, // Trần Thị Bình
    borrowDate: new Date(new Date().setDate(new Date().getDate() - 20)), // 20 days ago
    dueDate: new Date(new Date().setDate(new Date().getDate() - 6)), // Overdue by 6 days
  },
   {
    id: 'record-3',
    bookId: book6Id, // Conan
    studentId: student1Id, // Nguyễn Văn An
    borrowDate: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
    dueDate: new Date(new Date().setDate(new Date().getDate() + 12)), // Due in 12 days
  }
];

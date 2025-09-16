
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  quantity: number;
  coverImage: string;
  borrowedBy: string[]; // contains student IDs
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  birthDate: string;
  gender: string;
  grade: string;
  className: string;
  ethnicity: string;
  address: string;
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  studentId: string;
  borrowDate: Date;
  dueDate: Date;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  BOOKS = 'BOOKS',
  STUDENTS = 'STUDENTS',
  BORROW = 'BORROW',
  AI_ASSISTANT = 'AI_ASSISTANT',
}

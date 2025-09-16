
import { GoogleGenAI, Type } from "@google/genai";
import type { Student, Book } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const bookSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Tiêu đề của sách" },
    author: { type: Type.STRING, description: "Tác giả của sách" },
    description: { type: Type.STRING, description: "Mô tả ngắn gọn về nội dung sách" },
    genre: { type: Type.STRING, description: "Thể loại chính của sách (ví dụ: Tiểu thuyết, Khoa học viễn tưởng)" },
  },
  required: ["title", "author", "description", "genre"],
};

const booksSchema = {
    type: Type.ARRAY,
    description: "Danh sách các sách.",
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Tiêu đề của sách" },
            author: { type: Type.STRING, description: "Tác giả của sách" },
            isbn: { type: Type.STRING, description: "Mã ISBN của sách" },
            genre: { type: Type.STRING, description: "Thể loại chính của sách" },
            description: { type: Type.STRING, description: "Mô tả ngắn gọn về nội dung sách" },
            quantity: { type: Type.INTEGER, description: "Số lượng sách có trong thư viện" },
        },
        required: ["title", "author", "isbn", "genre", "description", "quantity"],
    }
};

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            description: "Danh sách các sách được đề xuất.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'Tên cuốn sách được đề xuất.' },
                    author: { type: Type.STRING, description: 'Tác giả của cuốn sách.' },
                    reason: { type: Type.STRING, description: 'Lý do ngắn gọn tại sao cuốn sách này được đề xuất, dựa trên truy vấn.' },
                },
                required: ['title', 'author', 'reason'],
            },
        }
    },
    required: ["recommendations"],
};

const studentSchema = {
    type: Type.ARRAY,
    description: "Danh sách học sinh.",
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Họ và tên đầy đủ của học sinh" },
            birthDate: { type: Type.STRING, description: "Ngày sinh của học sinh, định dạng DD/MM/YYYY" },
            gender: { type: Type.STRING, description: "Giới tính của học sinh (Nam hoặc Nữ)" },
            grade: { type: Type.STRING, description: "Khối học của học sinh (ví dụ: 6)" },
            className: { type: Type.STRING, description: "Tên lớp của học sinh (ví dụ: 6A)" },
            ethnicity: { type: Type.STRING, description: "Dân tộc của học sinh" },
            address: { type: Type.STRING, description: "Địa chỉ thường trú của học sinh" },
        },
        required: ["name", "birthDate", "gender", "grade", "className", "ethnicity", "address"],
    }
};

export const fetchBookDetailsByISBN = async (isbn: string) => {
  try {
    const prompt = `Bạn là một trợ lý thư viện hữu ích. Dựa vào mã ISBN này: "${isbn}", hãy cung cấp thông tin chi tiết về cuốn sách.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: bookSchema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Lỗi khi lấy thông tin sách từ Gemini:", error);
    throw new Error("Không thể lấy thông tin sách. Vui lòng thử lại.");
  }
};

export const getAIRecommendations = async (prompt: string): Promise<{recommendations: {title: string, author: string, reason: string}[]}> => {
    try {
        const fullPrompt = `Bạn là một trợ lý thư viện thông thái. Dựa vào yêu cầu sau, hãy đề xuất 3 cuốn sách phù hợp. Yêu cầu: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Lỗi khi lấy đề xuất từ Gemini:", error);
        throw new Error("Không thể nhận được đề xuất. Vui lòng thử lại.");
    }
}

export const extractStudentsFromImage = async (base64ImageData: string, mimeType: string): Promise<Omit<Student, 'id' | 'joinDate' | 'email' | 'phone'>[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType,
                data: base64ImageData,
            },
        };
        const textPart = {
            text: "Trích xuất tất cả thông tin học sinh từ bảng trong hình ảnh này. Chỉ trả về một mảng JSON tuân theo schema đã cung cấp. Bỏ qua tiêu đề và các dòng không phải là dữ liệu học sinh. Các cột là: STT, Họ và tên, Ngày sinh, Giới tính, Khối, Tên lớp, Dân tộc, Địa chỉ thường trú."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: studentSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Lỗi khi trích xuất dữ liệu học sinh từ Gemini:", error);
        throw new Error("Không thể trích xuất dữ liệu từ hình ảnh. Vui lòng thử lại với hình ảnh rõ ràng hơn.");
    }
}

export const extractStudentsFromExcel = async (csvData: string): Promise<Omit<Student, 'id' | 'joinDate' | 'email' | 'phone'>[]> => {
    try {
        const prompt = `Đây là dữ liệu CSV từ một tệp Excel chứa danh sách học sinh. Trích xuất tất cả thông tin học sinh. Chỉ trả về một mảng JSON tuân theo schema đã cung cấp. Bỏ qua dòng tiêu đề nếu có. Dữ liệu CSV:\n\n${csvData}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: studentSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Lỗi khi trích xuất dữ liệu học sinh từ Excel:", error);
        throw new Error("Không thể trích xuất dữ liệu từ tệp Excel. Vui lòng kiểm tra định dạng tệp.");
    }
};

export const extractBooksFromExcel = async (csvData: string): Promise<Omit<Book, 'id' | 'borrowedBy' | 'coverImage'>[]> => {
    try {
        const prompt = `Đây là dữ liệu CSV từ một tệp Excel chứa danh sách sách. Trích xuất tất cả thông tin sách. Chỉ trả về một mảng JSON tuân theo schema đã cung cấp. Bỏ qua dòng tiêu đề nếu có. Các cột có thể bao gồm: title, author, isbn, genre, description, quantity. Dữ liệu CSV:\n\n${csvData}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: booksSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Lỗi khi trích xuất dữ liệu sách từ Excel:", error);
        throw new Error("Không thể trích xuất dữ liệu từ tệp Excel. Vui lòng kiểm tra định dạng tệp.");
    }
};
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/ai/parse-attendance', async (req, res) => {
  try {
    const { text, fallbackClass } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Nội dung giọng nói không được để trống' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Hãy phân tích nội dung điểm danh trường học tiếng Việt sau đây thành JSON có cấu trúc chuẩn xác:
"${text}"
${fallbackClass ? `(Ghi chú: Nếu người dùng không nhắc đến tên lớp, hãy dùng lớp mặc định là "${fallbackClass}")` : ''}`,
      config: {
        systemInstruction: `Bạn là trợ lý AI thông minh chuyên phân tích cú pháp điểm danh học sinh từ giọng nói hoặc văn bản tiếng Việt.
Nhiệm vụ:
1. Nhận diện lớp học (e.g. 8A4, 6A1, 9A7, 7A3, v.v.).
2. Nhận diện trường hợp lớp đi ĐỦ sĩ số (isFull: true nếu có từ "đủ", "đi đủ", "đủ sĩ số", "tất cả có mặt").
3. Nhận diện danh sách học sinh vắng, tách đúng từng họ tên (viết hoa chữ cái đầu) và trạng thái tương ứng:
   - "Có phép" nếu có các từ: p, cp, có phép, phép, c/p...
   - "Không phép" nếu có các từ: 0p, kp, k, ko, không phép, 0, op...
Luôn trả về định dạng JSON đúng theo schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lop: {
              type: Type.STRING,
              description: 'Tên lớp viết hoa (ví dụ 8A4, 6A1)',
            },
            isFull: {
              type: Type.BOOLEAN,
              description: 'True nếu lớp báo đi đủ sĩ số',
            },
            students: {
              type: Type.ARRAY,
              description: 'Danh sách các học sinh vắng',
              items: {
                type: Type.OBJECT,
                properties: {
                  ten: {
                    type: Type.STRING,
                    description: 'Họ và tên học sinh',
                  },
                  trangthai: {
                    type: Type.STRING,
                    description: 'Có phép hoặc Không phép',
                  },
                },
                required: ['ten', 'trangthai'],
              },
            },
          },
          required: ['isFull', 'students'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsedJson);
  } catch (err: any) {
    console.error('Gemini parse error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi xử lý AI' });
  }
});

// Mount Vite in dev or static files in prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

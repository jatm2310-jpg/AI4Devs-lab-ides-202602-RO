import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;
const maxCvFileSize = 5 * 1024 * 1024;
const recruiterAccessKey = process.env.RECRUITER_ACCESS_KEY || 'dev-recruiter-key';
const allowedCvMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxCvFileSize },
  fileFilter: (_req, file, cb) => {
    if (!allowedCvMimeTypes.has(file.mimetype)) {
      cb(new Error('Solo se permiten archivos PDF o DOCX para el CV.'));
      return;
    }
    cb(null, true);
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('ATS backend running');
});

type CandidateFormData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  education?: string;
  experience?: string;
};

const isEmailValid = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

const validateCandidatePayload = (payload: CandidateFormData): string[] => {
  const errors: string[] = [];
  const requiredFields: Array<keyof CandidateFormData> = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'address',
    'education',
    'experience'
  ];

  requiredFields.forEach((field) => {
    if (!payload[field] || payload[field]?.trim() === '') {
      errors.push(`El campo ${field} es obligatorio.`);
    }
  });

  if (payload.email && !isEmailValid(payload.email.trim())) {
    errors.push('El correo electronico no tiene un formato valido.');
  }

  return errors;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const canAccessProtectedCandidateData = (req: Request): boolean => {
  const providedKey = req.header('x-recruiter-key');
  return providedKey === recruiterAccessKey;
};

app.get('/api/candidates/suggestions', async (_req, res, next) => {
  try {
    const records = await prisma.candidate.findMany({
      select: {
        education: true,
        experience: true
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const education = Array.from(new Set(records.map((record) => record.education.trim()).filter(Boolean)));
    const experience = Array.from(new Set(records.map((record) => record.experience.trim()).filter(Boolean)));

    res.json({ education, experience });
  } catch (error) {
    next(error);
  }
});

app.get('/api/candidates', async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const requestedLimit = parsePositiveInt(req.query.limit, 10);
    const limit = Math.min(requestedLimit, 50);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.candidate.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          education: true,
          experience: true,
          cvFileName: true,
          createdAt: true
        }
      }),
      prisma.candidate.count()
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const items = records.map((record) => ({
      ...record,
      hasCv: Boolean(record.cvFileName)
    }));

    res.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/candidates/:id/cv', async (req, res, next) => {
  if (!canAccessProtectedCandidateData(req)) {
    res.status(401).json({ message: 'No autorizado para descargar CV.' });
    return;
  }

  const candidateId = Number(req.params.id);
  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    res.status(400).json({ message: 'ID de candidato invalido.' });
    return;
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        cvStoragePath: true,
        cvFileName: true,
        cvMimeType: true
      }
    });

    if (!candidate || !candidate.cvStoragePath || !candidate.cvFileName) {
      res.status(404).json({ message: 'No se encontro CV para este candidato.' });
      return;
    }

    const absolutePath = path.resolve(candidate.cvStoragePath);
    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ message: 'El archivo CV no esta disponible.' });
      return;
    }

    res.setHeader('Content-Type', candidate.cvMimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${candidate.cvFileName}"`);
    res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
});

app.post('/api/candidates', upload.single('cv'), async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CandidateFormData;
  const errors = validateCandidatePayload(payload);

  if (errors.length > 0) {
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  try {
    const createdCandidate = await prisma.candidate.create({
      data: {
        firstName: payload.firstName!.trim(),
        lastName: payload.lastName!.trim(),
        email: payload.email!.trim().toLowerCase(),
        phone: payload.phone!.trim(),
        address: payload.address!.trim(),
        education: payload.education!.trim(),
        experience: payload.experience!.trim(),
        cvFileName: req.file?.originalname,
        cvMimeType: req.file?.mimetype,
        cvStoragePath: req.file?.path
      }
    });

    res.status(201).json({
      message: 'Candidato anadido exitosamente.',
      candidate: createdCandidate
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ message: 'El correo electronico ya existe.' });
      return;
    }

    next(error);
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'El CV supera el tamano maximo de 5MB.' });
    return;
  }

  if (err?.message === 'Solo se permiten archivos PDF o DOCX para el CV.') {
    res.status(400).json({ message: err.message });
    return;
  }

  console.error(err.stack);
  res.status(500).json({ message: 'Ocurrio un error inesperado.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

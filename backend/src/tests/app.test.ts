import request from 'supertest';
import { app } from '../index';
import prisma from '../index';

const candidateDelegate = prisma.candidate as {
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
    count: () => Promise<number>;
    findUnique: (args: unknown) => Promise<unknown>;
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe('GET /', () => {
    it('responds with backend status message', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('ATS backend running');
    });
});

describe('POST /api/candidates', () => {
    it('returns 400 when required fields are missing', async () => {
        const response = await request(app).post('/api/candidates').field('firstName', 'Ana');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Validation failed');
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('returns 400 when CV format is invalid', async () => {
        const response = await request(app)
            .post('/api/candidates')
            .field('firstName', 'Ana')
            .field('lastName', 'Lopez')
            .field('email', 'ana@example.com')
            .field('phone', '+34111111111')
            .field('address', 'Calle 123')
            .field('education', 'Ingenieria')
            .field('experience', '3 anos en seleccion')
            .attach('cv', Buffer.from('plain-text'), 'cv.txt');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Solo se permiten archivos PDF o DOCX para el CV.');
    });

    it('creates candidate successfully with valid payload and PDF', async () => {
        const createdCandidate = {
            id: 42,
            firstName: 'Ana',
            lastName: 'Lopez',
            email: 'ana@example.com',
            phone: '+34111111111',
            address: 'Calle 123',
            education: 'Ingenieria',
            experience: '3 anos en seleccion',
            cvFileName: 'cv.pdf',
            createdAt: new Date('2026-01-01T00:00:00.000Z')
        };

        jest.spyOn(candidateDelegate, 'create').mockResolvedValue(createdCandidate);

        const response = await request(app)
            .post('/api/candidates')
            .field('firstName', 'Ana')
            .field('lastName', 'Lopez')
            .field('email', 'ana@example.com')
            .field('phone', '+34111111111')
            .field('address', 'Calle 123')
            .field('education', 'Ingenieria')
            .field('experience', '3 anos en seleccion')
            .attach('cv', Buffer.from('%PDF-1.4 mock'), {
                filename: 'cv.pdf',
                contentType: 'application/pdf'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Candidato anadido exitosamente.');
        expect(response.body.candidate.email).toBe('ana@example.com');
    });
});

describe('GET /api/candidates', () => {
    it('returns paginated candidates', async () => {
        jest.spyOn(candidateDelegate, 'findMany').mockResolvedValue([
            {
                id: 1,
                firstName: 'Ana',
                lastName: 'Lopez',
                email: 'ana@example.com',
                phone: '+34111111111',
                address: 'Calle 123',
                education: 'Ingenieria',
                experience: '3 anos en seleccion',
                cvFileName: 'cv.pdf',
                createdAt: new Date('2026-01-01T00:00:00.000Z')
            }
        ] as unknown[]);
        jest.spyOn(candidateDelegate, 'count').mockResolvedValue(1);

        const response = await request(app).get('/api/candidates?page=1&limit=8');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.items)).toBe(true);
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].hasCv).toBe(true);
        expect(response.body.pagination.total).toBe(1);
        expect(response.body.pagination.totalPages).toBe(1);
    });
});

describe('GET /api/candidates/:id/cv', () => {
    it('returns 401 without recruiter key', async () => {
        const response = await request(app).get('/api/candidates/1/cv');

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('No autorizado para descargar CV.');
    });

    it('returns 404 when candidate has no CV', async () => {
        jest.spyOn(candidateDelegate, 'findUnique').mockResolvedValue(null);

        const response = await request(app)
            .get('/api/candidates/1/cv')
            .set('x-recruiter-key', 'dev-recruiter-key');

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('No se encontro CV para este candidato.');
    });
});

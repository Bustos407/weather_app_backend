import { login } from '../controllers/authController';
import { Request, Response } from 'express';
import connection from '../services/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock de módulos
jest.mock('../services/db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  compareSync: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-token')
}));

describe('Auth Controller - Login', () => {
  const JWT_SECRET = 'Abrete_Sesamo'; // Mismo secret que el controlador
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock de Request
  const mockRequest = (body: { username: string; password: string }): Request => ({
    body
  } as Request);

  // Mock de Response con tipado completo
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res as Response);
    res.json = jest.fn().mockReturnValue(res as Response);
    return res as Response;
  };

  test('Login exitoso con credenciales válidas', async () => {
    // Configurar mocks
    (connection.query as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, [{ 
        id: 1, 
        username: 'testuser', 
        password: 'hashedpassword' 
      }]);
    });

    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('fake-token');

    const req = mockRequest({
      username: 'testuser',
      password: 'password123'
    });
    
    const res = mockResponse();

    await login(req, res);

    // Verificaciones
    expect(connection.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE username = ?",
      ['testuser'],
      expect.any(Function)
    );
    
    expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
    
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, username: 'testuser' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Inicio de sesión exitoso',
      token: 'fake-token',
      userId: 1
    });
  });

  test('Debería fallar con usuario inexistente', async () => {
    (connection.query as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, []);
    });

    const req = mockRequest({
      username: 'noexiste',
      password: 'password123'
    });
    
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Usuario o contraseña incorrectos'
    });
  });
});
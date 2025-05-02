import { register } from '../controllers/authController';
import { Request, Response } from 'express';
import connection from '../services/db';
import bcrypt from 'bcrypt';


jest.mock('../services/db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  hashSync: jest.fn().mockReturnValue('hashedpassword')
}));

describe('Auth Controller - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body: { username: string; password: string }): Request => ({
    body
  } as Request);

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res as Response);
    res.json = jest.fn().mockReturnValue(res as Response);
    return res as Response;
  };

  test('Registro exitoso de nuevo usuario', async () => {
 
    (connection.query as jest.Mock)
      .mockImplementationOnce((_, __, callback) => callback(null, [])) // Primera llamada (verificación)
      .mockImplementationOnce((_, __, callback) => callback(null));    // Segunda llamada (inserción)

    const req = mockRequest({
      username: 'nuevousuario',
      password: 'password123'
    });
    
    const res = mockResponse();

    await register(req, res);

    expect(connection.query).toHaveBeenNthCalledWith(
      1,
      "SELECT * FROM users WHERE username = ?",
      ['nuevousuario'],
      expect.any(Function)
    );
    
    expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
    
    expect(connection.query).toHaveBeenNthCalledWith(
      2,
      "INSERT INTO users (username, password) VALUES (?, ?)",
      ['nuevousuario', 'hashedpassword'],
      expect.any(Function)
    );
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario registrado exitosamente'
    });
  });

  test('Debería fallar si el usuario ya existe', async () => {
    (connection.query as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, [{ id: 1, username: 'usuarioexistente' }]);
    });

    const req = mockRequest({
      username: 'usuarioexistente',
      password: 'password123'
    });
    
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'El usuario ya existe'
    });
  });

  test('Debería manejar errores de base de datos', async () => {
    (connection.query as jest.Mock).mockImplementation((_, __, callback) => {
      callback(new Error('Error de conexión'), null);
    });

    const req = mockRequest({
      username: 'testuser',
      password: 'password123'
    });
    
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error en la base de datos'
    });
  });
});

import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string; // Asegúrate de que JWT_SECRET esté definido en tu archivo .env

export const authenticateToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return; 
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => { 
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    const payload = decoded as jwt.JwtPayload & { id: number; username: string };
  
    req.user = {
      id: payload.id,
      username: decoded.username
    };
    
    next();
  });
};

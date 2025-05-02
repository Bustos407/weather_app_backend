import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connection from "../services/db";

const JWT_SECRET = process.env.JWT_SECRET as string; 

export const register = (req: Request, res: Response) => {
  const { username, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results: any[]) => {
      if (err) {
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "El usuario ya existe" });
      }

      
      const hashedPassword = bcrypt.hashSync(password, 10);

      connection.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error al registrar el usuario" });
          }

          res.status(201).json({ message: "Usuario registrado exitosamente" });
        }
      );
    }
  );
};

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results: any[]) => {
      if (err || results.length === 0) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      const user = results[0];
      const passwordMatch = bcrypt.compareSync(password, user.password);

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

    
      res.status(200).json({ 
        message: "Inicio de sesión exitoso", 
        token,
        userId: user.id 
      });
    }
  );
};
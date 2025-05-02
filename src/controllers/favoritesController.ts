import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import connection from "../services/db";

export const getFavorites = (req: Request, res: Response): void => {
  const userId = req.user?.id; 
  
  connection.query(
    "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC", 
    [userId],
    (err, results: RowDataPacket[]) => {
      if (err) {
        console.error("Error en GET Favoritos:", err);
        return res.status(500).json({ error: "Error al obtener favoritos" });
      }
      res.json(results);
    }
  );
};

export const addFavorite = (
  req: Request<{}, {}, { city: string }>,
  res: Response
): void => {
  const { city } = req.body;
  const userId = (req as any).user.id;

  if (!city?.trim()) {
    res.status(400).json({ error: "La ciudad es requerida" });
    return;
  }

  const normalizedCity = city.trim().toLowerCase();

  connection.query(
    "INSERT INTO favorites (user_id, city) VALUES (?, ?)",
    [userId, normalizedCity],
    (err, results: ResultSetHeader) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Ciudad ya en favoritos" });
        }
        console.error("Error en INSERT:", err);
        return res.status(500).json({ error: "Error de base de datos" });
      }
      res.status(201).json({
        id: results.insertId,
        city: normalizedCity,
        message: "Ciudad agregada a favoritos"
      });
    }
  );
};


export const checkFavorite = async (req: Request, res: Response): Promise<void> => {
  const { city } = req.query;
  const userId = (req as any).user.id;

 
  if (typeof city !== 'string') {
    res.status(400).json({ error: "Se esperaba un nombre de ciudad válido." });
    return; 
  }

  const normalizedCity = city.trim().toLowerCase();

  try {
   
    const [results] = await connection.promise().query<RowDataPacket[]>(
      "SELECT id FROM favorites WHERE user_id = ? AND city = ?",
      [userId, normalizedCity]
    );

   
    res.json({ isFavorite: results.length > 0 });
  } catch (err) {
    console.error("Error al verificar el favorito:", err);
    res.status(500).json({ error: "Error al verificar favorito" });
  }
};


export const deleteFavorite = (req: Request, res: Response): void => {
  const { city } = req.params;
  const userId = (req as any).user.id;

  connection.query(
    "DELETE FROM favorites WHERE id = ? AND user_id = ?",
    [city.toLowerCase(), userId],
    (err, results: ResultSetHeader) => {
      if (err) {
        console.error("Error en DELETE:", err);
        return res.status(500).json({ error: "Error al eliminar favorito" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Ciudad no encontrada" });
      }

      res.json({ message: "Favorito eliminado", city });
    }
  );
};
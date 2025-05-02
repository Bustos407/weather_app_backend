import axios from "axios";

const BASE_URL = "http://api.weatherapi.com/v1";
const API_KEY = process.env.WEATHER_API_KEY;
console.log("API_KEY:", API_KEY);


export const getWeatherByCity = async (city: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: city,
        lang: "es",
      },
    });

    console.log("Datos del clima:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error en getWeatherByCity:",
      error.response?.data || error.message
    );
    throw new Error("Error al consultar la API de clima");
  }
};

export const getCitySuggestions = async (query: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        key: API_KEY,
        q: query,
      },
    });
    console.log("Sugerencias de ciudades:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener sugerencias de ciudades:",
      error.response?.data || error.message
    );
    throw new Error("Error al obtener sugerencias de ciudades");
  }
};

import { probarModelo } from "./test-modelo";
import { probarJSON } from "./test-json";

export function ejecutarPruebas(): void {
  console.log("=== VGNarrative: pruebas del modelo ===");

  try {
    probarModelo();
    probarJSON();
    console.log("RESULTADO: todas las pruebas han pasado.");
  } catch (error) {
    console.error("RESULTADO: ha fallado una prueba.", error);
    throw error;
  }
}

ejecutarPruebas();
import { Historia } from "../models/historia";
import { Parrafo } from "../models/parrafo";
import { Siguiente } from "../models/siguiente";

function comprobar(
  condicion: boolean,
  mensaje: string
): void {
  if (!condicion) {
    throw new Error(mensaje);
  }
}

export function probarModelo(): void {
  // 1. Crear una historia vacía.
  const historia = new Historia("Mi historia");

  comprobar(historia.titulo === "Mi historia", "Título de la historia");
  comprobar(historia.parrafos.length === 0, "La historia debe comenzar vacía");

  // 2. Crear párrafos y comprobar la numeración.
  const p1 = historia.crearParrafo();
  const p2 = historia.crearParrafo();
  const p3 = historia.crearParrafo();

  comprobar(p1.num_parrafo === 1, "El primer párrafo debe ser el 1");
  comprobar(p2.num_parrafo === 2, "El segundo párrafo debe ser el 2");
  comprobar(p3.num_parrafo === 3, "El tercer párrafo debe ser el 3");

  comprobar(historia.parrafos.length === 3, "Deben existir tres párrafos");

  // 3. Buscar párrafos.
  comprobar(historia.buscarParrafo(2) === p2, "Debe encontrar el párrafo 2");
  comprobar(historia.buscarParrafo(99) === undefined, "No debe encontrar el párrafo 99");

  // 4. Crear una bifurcación.
  const bifurcacion = new Siguiente(2, "Entrar en la casa");
  p1.agregarSiguiente(bifurcacion);

  comprobar(p1.siguientes.length === 1, "Debe existir una bifurcación");
  comprobar(p1.siguientes[0].num_parrafo === 2, "El destino debe ser el párrafo 2");
  comprobar(p1.siguientes[0].texto === "Entrar en la casa", "El texto de la bifurcación debe conservarse");

  // 5. Permitir ciclos entre párrafos.
  p2.agregarSiguiente(new Siguiente(1, "Volver al inicio"));

  comprobar(
    p2.siguientes[0].num_parrafo === 1,
    "Debe permitir una bifurcación hacia el párrafo 1"
  );

  // 6. Eliminar un párrafo y sus referencias.
  comprobar(historia.eliminarParrafo(2), "Debe eliminar el párrafo 2");
  comprobar(historia.buscarParrafo(2) === undefined, "El párrafo eliminado no debe existir");
  comprobar(p1.siguientes.length === 0, "Debe eliminar referencias al párrafo borrado");

  // 7. No reutilizar números eliminados.
  const p4 = historia.crearParrafo();

  comprobar(p4.num_parrafo === 4, "El siguiente número debe ser 4, no reutilizar el 2");

  // 8. Eliminar un párrafo inexistente.
  comprobar(
    historia.eliminarParrafo(99) === false,
    "Eliminar un párrafo inexistente debe devolver false"
  );

  // 9. Comprobar el modelo Parrafo directamente.
  const parrafo = new Parrafo(10, "Prueba", "Texto de prueba");

  comprobar(parrafo.titulo === "Prueba", "Debe conservar el título del párrafo");
  comprobar(parrafo.texto === "Texto de prueba", "Debe conservar el texto del párrafo");


  // 10. Comprobamos la numeracion de los parrafos
  const historiaNumeracion = new Historia('Prueba de numeración');

  historiaNumeracion.crearParrafo(); // Párrafo 1
  historiaNumeracion.crearParrafo(); // Párrafo 2
  historiaNumeracion.crearParrafo(); // Párrafo 3
  historiaNumeracion.crearParrafo(); // Párrafo 4
  historiaNumeracion.crearParrafo(); // Párrafo 5

  historiaNumeracion.eliminarParrafo(3);

  const numerosLibres = historiaNumeracion.numerosLibresParrafo();

  console.assert(
      JSON.stringify(numerosLibres) === JSON.stringify([3, 6]),
      'Los números libres deberían ser 3 y 6.'
  );

// 11. Probando los parrafos vacios
// Prueba: historia vacía.
const historiaVacia = new Historia('Historia vacía');

console.assert(
    JSON.stringify(historiaVacia.numerosLibresParrafo())
        === JSON.stringify([1]),
    'Una historia vacía debe ofrecer el número 1.'
);

// Prueba: números intermedios libres y siguiente al máximo.
const historiaNumeros = new Historia('Prueba de numeración');

for (let i = 0; i < 5; i++) {
    historiaNumeros.crearParrafo();
}

historiaNumeros.eliminarParrafo(3);

console.assert(
    JSON.stringify(historiaNumeros.numerosLibresParrafo())
        === JSON.stringify([3, 6]),
    'Con los párrafos 1, 2, 4 y 5 deben ofrecerse 3 y 6.'
);

// Prueba: al ocupar un número libre, deja de aparecer.
historiaNumeros.parrafos.push(new Parrafo(3));

console.assert(
    JSON.stringify(historiaNumeros.numerosLibresParrafo())
        === JSON.stringify([6]),
    'Al crear el párrafo 3, solo debe quedar libre el 6.'
);

// Prueba: eliminar el número máximo.
historiaNumeros.eliminarParrafo(5);

console.assert(
    JSON.stringify(historiaNumeros.numerosLibresParrafo())
        === JSON.stringify([5]),
    'Al eliminar el párrafo máximo 5, debe ofrecerse el número 5.'
);

//  12. Prueba con 100 parrafos
// Prueba de volumen: crear 100 párrafos.
const historiaVolumen = new Historia('Prueba de volumen');

for (let i = 0; i < 100; i++) {
    historiaVolumen.crearParrafo();
}

// Comprobar que existen exactamente 100 párrafos.
console.assert(
    historiaVolumen.parrafos.length === 100,
    'La historia debe contener 100 párrafos.'
);

// Comprobar que todos tienen números únicos.
const numeros = historiaVolumen.parrafos.map(
    (parrafo) => parrafo.num_parrafo
);

console.assert(
    new Set(numeros).size === 100,
    'Los 100 párrafos deben tener números únicos.'
);

// Comprobar que el párrafo 100 se puede recuperar.
console.assert(
    historiaVolumen.buscarParrafo(100) !== undefined,
    'Debe poder recuperarse el párrafo 100.'
);

// Comprobar que el siguiente número disponible es 101.
console.assert(
    historiaVolumen.siguienteNumeroParrafo() === 101,
    'El siguiente número debe ser 101.'
);

// Comprobar que no quedan huecos entre 1 y 100.
console.assert(
    JSON.stringify(historiaVolumen.numerosLibresParrafo())
        === JSON.stringify([101]),
    'Con los párrafos 1 a 100, solo debe quedar libre el 101.'
);




  console.log("Modelo: todas las pruebas han pasado.");
}
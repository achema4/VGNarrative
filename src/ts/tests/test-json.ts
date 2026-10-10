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

export function probarJSON(): void {
  // Crear una historia de prueba.
  const historia = new Historia("Aventura");

  const p1 = historia.crearParrafo();
  p1.titulo = "El comienzo";
  p1.texto = "Un viajero llega a un pueblo.";

  const p2 = historia.crearParrafo();
  p2.titulo = "La decisión";
  p2.texto = "El viajero encuentra dos caminos.";

  // Crear un ciclo: 1 -> 2 -> 1.
  p1.agregarSiguiente(new Siguiente(2, "Seguir adelante"));
  p2.agregarSiguiente(new Siguiente(1, "Volver al comienzo"));

  // Serializar a JSON y reconstruir.
  const json = JSON.stringify(historia.aObjeto());
  const datos: unknown = JSON.parse(json);

  comprobar(
    typeof datos === "object" && datos !== null,
    "El JSON debe representar un objeto"
  );

  // Por ahora, el modelo todavía no tiene un método aObjeto().
  // Comprobaremos la reconstrucción cuando lo implementemos.
  const restaurada = Historia.desdeObjeto(
    datos as {
      titulo: string;
      parrafos: {
        num_parrafo: number;
        titulo: string;
        texto: string;
        siguientes: { num_parrafo: number; texto: string }[];
      }[];
    }
  );

  comprobar(restaurada.titulo === "Aventura", "Debe conservar el título de la historia");
  comprobar(restaurada.parrafos.length === 2, "Debe conservar los dos párrafos");

  const restaurado1 = restaurada.buscarParrafo(1);
  const restaurado2 = restaurada.buscarParrafo(2);

  comprobar(restaurado1 !== undefined, "Debe reconstruir el párrafo 1");
  comprobar(restaurado2 !== undefined, "Debe reconstruir el párrafo 2");

  comprobar(restaurado1!.titulo === "El comienzo", "Debe conservar el título del párrafo 1");
  comprobar(restaurado1!.texto === "Un viajero llega a un pueblo.", "Debe conservar el texto del párrafo 1");

  comprobar(restaurado1!.siguientes[0].num_parrafo === 2, "Debe conservar el destino 1 -> 2");
  comprobar(restaurado2!.siguientes[0].num_parrafo === 1, "Debe conservar el ciclo 2 -> 1");

  // Comprobar que los destinos siguen siendo objetos Siguiente.
  comprobar(
    restaurado1!.siguientes[0] instanceof Siguiente,
    "Las bifurcaciones deben reconstruirse como objetos Siguiente"
  );

  // Comprobar que los párrafos siguen siendo objetos Parrafo.
  comprobar(
    restaurado1 instanceof Parrafo,
    "Los párrafos deben reconstruirse como objetos Parrafo"
  );



  // 10. Historia vacía.
  const historiaVacia = new Historia();

  comprobar(
    historiaVacia.parrafos.length === 0,
    "Una historia nueva debe estar vacía"
  );

  comprobar(
    historiaVacia.siguienteNumeroParrafo() === 1,
    "La primera numeración debe ser 1"
  );

  // 11. Párrafo sin bifurcaciones.
  const parrafoSinDestinos = historiaVacia.crearParrafo();

  comprobar(
    parrafoSinDestinos.siguientes.length === 0,
    "Un párrafo nuevo no debe tener bifurcaciones"
  );

  // 12. Varias bifurcaciones hacia el mismo párrafo.
  const historiaReferencias = new Historia("Referencias");
  const origen1 = historiaReferencias.crearParrafo();
  const origen2 = historiaReferencias.crearParrafo();
  const destino = historiaReferencias.crearParrafo();

  origen1.agregarSiguiente(
    new Siguiente(destino.num_parrafo, "Opción A")
  );
  origen1.agregarSiguiente(
    new Siguiente(destino.num_parrafo, "Opción B")
  );
  origen2.agregarSiguiente(
    new Siguiente(destino.num_parrafo, "Opción C")
  );

  comprobar(
    historiaReferencias.eliminarParrafo(destino.num_parrafo),
    "Debe eliminar el destino compartido"
  );

  comprobar(
    origen1.siguientes.length === 0 && origen2.siguientes.length === 0,
    "Debe eliminar todas las referencias al destino borrado"
  );

  // 13. Las bifurcaciones pueden apuntar a destinos inexistentes.
  // El modelo las admite actualmente; la validación será responsabilidad
  // de la lógica que gestione las historias.
  const bifurcacionInvalida = new Siguiente(999, "Destino inexistente");

  comprobar(
    bifurcacionInvalida.num_parrafo === 999,
    "Siguiente conserva el número de destino indicado"
  );

    let errorDetectado = false;

    try {
        Historia.desdeJSON("{esto no es JSON}");
    } catch {
        errorDetectado = true;
    }

    comprobar(
        errorDetectado,
        "Debe rechazar un texto que no sea JSON válido"
    );


    const casosInvalidos = [
        '{"nombre":"Aventura"}',
        '{"titulo":"Aventura","parrafos":{}}',
        '{"titulo":"Aventura","parrafos":[null]}',
        '{"titulo":"Aventura","parrafos":[{"num_parrafo":0,"titulo":"Inicio","texto":"Hola","siguientes":[]}]}',
    ];

    for (const jsonInvalido of casosInvalidos) {
        let errorDetectado = false;

        try {
            Historia.desdeJSON(jsonInvalido);
        } catch {
            errorDetectado = true;
        }

        comprobar(
            errorDetectado,
            `Debe rechazar JSON con estructura inválida: ${jsonInvalido}`
        );
    }


    const jsonConDuplicados = JSON.stringify({
        titulo: "Aventura",
        parrafos: [
            {
                num_parrafo: 1,
                titulo: "Inicio",
                texto: "Comienza la aventura.",
                siguientes: [],
            },
            {
                num_parrafo: 1,
                titulo: "Segundo inicio",
                texto: "Este número está duplicado.",
                siguientes: [],
            },
        ],
    });

    let duplicadoDetectado = false;

    try {
        Historia.desdeJSON(jsonConDuplicados);
    } catch {
        duplicadoDetectado = true;
    }

    comprobar(
        duplicadoDetectado,
        "Debe rechazar párrafos con números duplicados"
    );



    const historiaPendiente = new Historia("Aventura pendiente");

    const parrafoInicial = historiaPendiente.crearParrafo();

    parrafoInicial.titulo = "Elegir camino";
    parrafoInicial.texto = "¿Qué camino quieres seguir?";

    parrafoInicial.agregarSiguiente(
        new Siguiente(2, "Entrar en la cueva")
    );

    parrafoInicial.agregarSiguiente(
        new Siguiente(3, "Cruzar el bosque")
    );

    const jsonPendiente = JSON.stringify(
        historiaPendiente.aObjeto()
    );

    const historiaRecuperada = Historia.desdeJSON(jsonPendiente);

    const parrafoRecuperado =
        historiaRecuperada.buscarParrafo(1);

    comprobar(
        parrafoRecuperado !== undefined,
        "Debe recuperar el párrafo inicial"
    );

    comprobar(
        parrafoRecuperado!.siguientes.length === 2,
        "Debe conservar las dos bifurcaciones pendientes"
    );

    comprobar(
        parrafoRecuperado!.siguientes[0].num_parrafo === 2,
        "Debe conservar el destino pendiente 2"
    );

    comprobar(
        parrafoRecuperado!.siguientes[1].num_parrafo === 3,
        "Debe conservar el destino pendiente 3"
    );



// Prueba de volumen: serializar y recuperar 100 párrafos.
const historiaVolumen = new Historia("Historia de 100 párrafos");

for (let i = 1; i <= 100; i++) {
    const parrafo = historiaVolumen.crearParrafo();

    parrafo.titulo = `Título del párrafo ${i}`;
    parrafo.texto = `Este es el texto de prueba del párrafo ${i}.`;
}

// Añadir bifurcaciones entre párrafos.
historiaVolumen.buscarParrafo(1)!.agregarSiguiente(
    new Siguiente(50, "Ir al párrafo 50")
);

historiaVolumen.buscarParrafo(50)!.agregarSiguiente(
    new Siguiente(100, "Ir al párrafo 100")
);

// Convertir la historia a JSON y recuperarla.
const jsonVolumen = JSON.stringify(
    historiaVolumen.aObjeto()
);

const historiaVolumenRecuperada = Historia.desdeJSON(jsonVolumen);

// Comprobar el número total de párrafos.
comprobar(
    historiaVolumenRecuperada.parrafos.length === 100,
    "Debe recuperar los 100 párrafos"
);

// Comprobar el título del primer párrafo.
comprobar(
    historiaVolumenRecuperada.buscarParrafo(1)?.titulo
        === "Título del párrafo 1",
    "Debe conservar el título del párrafo 1"
);

// Comprobar el texto del último párrafo.
comprobar(
    historiaVolumenRecuperada.buscarParrafo(100)?.texto
        === "Este es el texto de prueba del párrafo 100.",
    "Debe conservar el texto del párrafo 100"
);

// Comprobar la bifurcación del párrafo 1.
comprobar(
    historiaVolumenRecuperada.buscarParrafo(1)
        ?.siguientes[0]?.num_parrafo === 50,
    "Debe conservar la bifurcación del párrafo 1 al 50"
);

// Comprobar la bifurcación del párrafo 50.
comprobar(
    historiaVolumenRecuperada.buscarParrafo(50)
        ?.siguientes[0]?.num_parrafo === 100,
    "Debe conservar la bifurcación del párrafo 50 al 100"
);


// Generar una historia de prueba de 30.000 palabras.
const historiaGrande = new Historia('Prueba de 30000 palabras');

const palabrasBase = [
    'aventura', 'personaje', 'misterio', 'camino', 'bosque',
    'historia', 'viaje', 'secreto', 'castillo', 'destino'
];

for (let i = 1; i <= 100; i++) {
    const parrafo = historiaGrande.crearParrafo();

    parrafo.titulo = `Capítulo ${i}`;

    const palabras: string[] = [];

    for (let j = 0; j < 300; j++) {
        palabras.push(palabrasBase[(i + j) % palabrasBase.length]);
    }

    parrafo.texto = palabras.join(' ');
}

// Añadir algunas bifurcaciones.
historiaGrande.buscarParrafo(1)!.agregarSiguiente(
    new Siguiente(50, 'Continuar en el capítulo 50')
);

historiaGrande.buscarParrafo(50)!.agregarSiguiente(
    new Siguiente(100, 'Continuar en el capítulo 100')
);

// Comprobar que hay exactamente 30.000 palabras.
const totalPalabras = historiaGrande.parrafos.reduce(
    (total, parrafo) =>
        total + parrafo.texto.trim().split(/\s+/).length,
    0
);

comprobar(
    totalPalabras === 30000,
    'La historia de prueba debe contener 30.000 palabras'
);

// Generar el JSON de prueba.
const jsonHistoriaGrande = JSON.stringify(
    historiaGrande.aObjeto(),
    null,
    2
);

console.log(
    'Historia de prueba generada:',
    historiaGrande.parrafos.length,
    'párrafos,',
    totalPalabras,
    'palabras,',
    jsonHistoriaGrande.length,
    'caracteres JSON.'
);


const blobHistoriaGrande = new Blob(
    [jsonHistoriaGrande],
    { type: 'application/json;charset=utf-8' }
);

const urlHistoriaGrande = URL.createObjectURL(blobHistoriaGrande);
const enlaceHistoriaGrande = document.createElement('a');

enlaceHistoriaGrande.href = urlHistoriaGrande;
enlaceHistoriaGrande.download = 'prueba_30000_palabras.json';

enlaceHistoriaGrande.textContent = 'Descargar historia de prueba (30.000 palabras)';

document.body.appendChild(enlaceHistoriaGrande);




  console.log("JSON: todas las pruebas han pasado.");
}

import { Parrafo } from "./parrafo";

export class Historia {
  titulo: string;
  parrafos: Parrafo[];

  constructor(titulo: string = "") {
    this.titulo = titulo;
    this.parrafos = [];
  }

  siguienteNumeroParrafo(): number {
    if (this.parrafos.length === 0) {
      return 1;
    }

    const maximo = Math.max(
      ...this.parrafos.map((parrafo) => parrafo.num_parrafo)
    );

    return maximo + 1;
  }

  numerosLibresParrafo(): number[] {
    const ocupados = new Set(
      this.parrafos.map((parrafo) => parrafo.num_parrafo)
    );

    const maximo = this.parrafos.length === 0
      ? 0
      : Math.max(
          ...this.parrafos.map((parrafo) => parrafo.num_parrafo)
        );

    const libres: number[] = [];

    for (let numero = 1; numero <= maximo + 1; numero++) {
      if (!ocupados.has(numero)) {
        libres.push(numero);
      }
    }

    return libres;
  }


  crearParrafo(): Parrafo {
    const parrafo = new Parrafo(this.siguienteNumeroParrafo());
    this.parrafos.push(parrafo);
    return parrafo;
  }

  buscarParrafo(num_parrafo: number): Parrafo | undefined {
    return this.parrafos.find(
      (parrafo) => parrafo.num_parrafo === num_parrafo
    );
  }

  eliminarParrafo(num_parrafo: number): boolean {
    const indice = this.parrafos.findIndex(
      (parrafo) => parrafo.num_parrafo === num_parrafo
    );

    if (indice === -1) {
      return false;
    }

    this.parrafos.splice(indice, 1);

    for (const parrafo of this.parrafos) {
      parrafo.siguientes = parrafo.siguientes.filter(
        (siguiente) => siguiente.num_parrafo !== num_parrafo
      );
    }

    return true;
  }

  aObjeto() {
    return {
      titulo: this.titulo,
      parrafos: this.parrafos.map(
        (parrafo) => parrafo.aObjeto()
      )
    };
  }

  static desdeObjeto(datos: {
    titulo: string;
    parrafos: {
      num_parrafo: number;
      titulo: string;
      texto: string;
      siguientes: { num_parrafo: number; texto: string }[];
    }[];
  }): Historia {
    const historia = new Historia(datos.titulo);

    historia.parrafos = (datos.parrafos ?? []).map(
      (parrafo) => Parrafo.desdeObjeto(parrafo)
    );

    return historia;
  }


  static desdeJSON(json: string): Historia {
      let datos: unknown;

      try {
          datos = JSON.parse(json);
      } catch {
          throw new Error("El texto proporcionado no es un JSON válido.");
      }

      if (
          typeof datos !== "object" ||
          datos === null ||
          Array.isArray(datos)
      ) {
          throw new Error("El JSON debe contener un objeto de historia.");
      }

      const objeto = datos as Record<string, unknown>;

      if (typeof objeto.titulo !== "string") {
          throw new Error("La historia debe tener un título de texto.");
      }

      if (!Array.isArray(objeto.parrafos)) {
          throw new Error(
              "La historia debe contener una colección de párrafos."
          );
      }

      const numerosParrafo = new Set<number>();

      for (const parrafo of objeto.parrafos) {
          if (
              typeof parrafo !== "object" ||
              parrafo === null ||
              Array.isArray(parrafo)
          ) {
              throw new Error("Cada párrafo debe ser un objeto.");
          }

          const p = parrafo as Record<string, unknown>;

          if (
              typeof p.num_parrafo !== "number" ||
              !Number.isInteger(p.num_parrafo) ||
              p.num_parrafo < 1
          ) {
              throw new Error(
                  "El número de párrafo debe ser un entero positivo."
              );
          }

          if (numerosParrafo.has(p.num_parrafo)) {
              throw new Error(
                  `Número de párrafo duplicado: ${p.num_parrafo}`
              );
          }

          numerosParrafo.add(p.num_parrafo);

          if (typeof p.titulo !== "string") {
              throw new Error(
                  "Cada párrafo debe tener un título de texto."
              );
          }

          if (typeof p.texto !== "string") {
              throw new Error(
                  "El contenido de cada párrafo debe ser texto."
              );
          }

          if (!Array.isArray(p.siguientes)) {
              throw new Error(
                  "Cada párrafo debe contener una lista de bifurcaciones."
              );
          }

          for (const siguiente of p.siguientes) {
              if (
                  typeof siguiente !== "object" ||
                  siguiente === null ||
                  Array.isArray(siguiente)
              ) {
                  throw new Error(
                      "Cada bifurcación debe ser un objeto."
                  );
              }

              const s = siguiente as Record<string, unknown>;

              if (
                  typeof s.num_parrafo !== "number" ||
                  !Number.isInteger(s.num_parrafo) ||
                  s.num_parrafo < 1
              ) {
                  throw new Error(
                      "El destino de una bifurcación debe ser un entero positivo."
                  );
              }

              if (typeof s.texto !== "string") {
                  throw new Error(
                      "El texto de una bifurcación debe ser una cadena."
                  );
              }
          }
      }

      return Historia.desdeObjeto(
          datos as {
              titulo: string;
              parrafos: {
                  num_parrafo: number;
                  titulo: string;
                  texto: string;
                  siguientes: {
                      num_parrafo: number;
                      texto: string;
                  }[];
              }[];
          }
      );
  }



}
import { Siguiente } from "./siguiente";

export class Parrafo {
  num_parrafo: number;
  titulo: string;
  texto: string;
  siguientes: Siguiente[];

  constructor(
    num_parrafo: number = 0,
    titulo: string = "",
    texto: string = ""
  ) {
    this.num_parrafo = num_parrafo;
    this.titulo = titulo;
    this.texto = texto;
    this.siguientes = [];
  }

  agregarSiguiente(siguiente: Siguiente): void {
    this.siguientes.push(siguiente);
  }

  aObjeto() {
    return {
      num_parrafo: this.num_parrafo,
      titulo: this.titulo,
      texto: this.texto,
      siguientes: this.siguientes.map(
        (siguiente) => siguiente.aObjeto()
      )
    };
  }

  static desdeObjeto(datos: {
    num_parrafo: number;
    titulo: string;
    texto: string;
    siguientes: { num_parrafo: number; texto: string }[];
  }): Parrafo {
    const parrafo = new Parrafo(
      datos.num_parrafo,
      datos.titulo,
      datos.texto
    );

    parrafo.siguientes = (datos.siguientes ?? []).map(
      (siguiente) => Siguiente.desdeObjeto(siguiente)
    );

    return parrafo;
  }
}
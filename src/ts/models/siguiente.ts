export class Siguiente {
  num_parrafo: number;
  texto: string;

  constructor(num_parrafo: number = 0, texto: string = "") {
    this.num_parrafo = num_parrafo;
    this.texto = texto;
  }

  aObjeto(): { num_parrafo: number; texto: string } {
    return {
      num_parrafo: this.num_parrafo,
      texto: this.texto
    };
  }

  static desdeObjeto(datos: {
    num_parrafo: number;
    texto: string;
  }): Siguiente {
    return new Siguiente(datos.num_parrafo, datos.texto);
  }
}
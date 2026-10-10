
import '../scss/style.scss';
import { Historia } from './models/historia';
import { Siguiente } from './models/siguiente';
import { Parrafo } from './models/parrafo';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

let historia = new Historia('Mi historia');
let parrafoActual = historia.crearParrafo();

const tituloHistoria =
    document.querySelector<HTMLInputElement>('#titulo-historia');

const numeroParrafo =
    document.querySelector<HTMLElement>('#numero-parrafo');

const tituloParrafo =
    document.querySelector<HTMLInputElement>('#titulo-parrafo');

const textoParrafo =
    document.querySelector<HTMLTextAreaElement>('#texto-parrafo');

const resultado =
    document.querySelector<HTMLElement>('#resultado');

const botonAnterior =
    document.querySelector<HTMLButtonElement>('#anterior-btn');

const botonSiguiente =
    document.querySelector<HTMLButtonElement>('#siguiente-btn');

const botonNuevo =
    document.querySelector<HTMLButtonElement>('#nuevo-btn');

const botonGuardar =
    document.querySelector<HTMLButtonElement>('#guardar-btn');

const botonCargar =
    document.querySelector<HTMLButtonElement>('#cargar-btn');

const contadorPalabras =
    document.querySelector<HTMLElement>('#contador-palabras');

const listaBifurcaciones =
    document.querySelector<HTMLElement>('#lista-bifurcaciones');

const mensajeSinBifurcaciones =
    document.querySelector<HTMLElement>('#sin-bifurcaciones');

const botonAnadirBifurcacion =
    document.querySelector<HTMLButtonElement>(
        '#anadir-bifurcacion-btn'
    );

function informar(mensaje: string): void {
    if (resultado) {
        resultado.textContent = mensaje;
    }
}

function actualizarBotones(): void {
    const indice = historia.parrafos.findIndex(
        (p) => p.num_parrafo === parrafoActual.num_parrafo
    );

    if (botonAnterior) {
        botonAnterior.disabled = indice <= 0;
    }

    if (botonSiguiente) {
        botonSiguiente.disabled =
            indice < 0 || indice >= historia.parrafos.length - 1;
    }
}

function mostrarParrafo(numParrafo: number): void {
    const parrafo = historia.buscarParrafo(numParrafo);

    if (!parrafo) {
        return;
    }

    parrafoActual = parrafo;

    if (numeroParrafo) {
        numeroParrafo.textContent = `Párrafo ${parrafo.num_parrafo}`;
    }

    if (tituloParrafo) {
        tituloParrafo.value = parrafo.titulo;
    }

    if (textoParrafo) {
        textoParrafo.value = parrafo.texto;
    }

    actualizarBotones();
    actualizarContadorPalabras();
    mostrarBifurcaciones();
}



function mostrarBifurcaciones(): void {
    if (!listaBifurcaciones || !mensajeSinBifurcaciones) {
        return;
    }

    listaBifurcaciones.replaceChildren();

    const siguientes = parrafoActual.siguientes;

    mensajeSinBifurcaciones.hidden = siguientes.length > 0;

    for (const siguiente of siguientes) {
        const elemento = document.createElement('div');

        const botonDestino = document.createElement('button');
        botonDestino.type = 'button';
        botonDestino.textContent =
            `Párrafo ${siguiente.num_parrafo}: ${siguiente.texto}`;

        botonDestino.addEventListener('click', () => {
            sincronizarCampos();

            let destino = historia.buscarParrafo(
                siguiente.num_parrafo
            );

            if (!destino) {
                destino = new Parrafo(siguiente.num_parrafo);
                destino.titulo = siguiente.texto;

                historia.parrafos.push(destino);
            }

            parrafoActual = destino;
            mostrarParrafo(destino.num_parrafo);

            informar(`Párrafo ${destino.num_parrafo} abierto.`);
        });

        const botonEliminar = document.createElement('button');
        botonEliminar.type = 'button';
        botonEliminar.textContent = 'Eliminar';

        botonEliminar.addEventListener('click', () => {
            const indice = parrafoActual.siguientes.indexOf(siguiente);

            if (indice !== -1) {
                parrafoActual.siguientes.splice(indice, 1);
                mostrarBifurcaciones();
                informar('Bifurcación eliminada correctamente.');
            }
        });

        elemento.append(botonDestino, botonEliminar);
        listaBifurcaciones.appendChild(elemento);
    }
}




function sincronizarCampos(): void {
    if (tituloHistoria) {
        historia.titulo = tituloHistoria.value;
    }

    if (tituloParrafo) {
        parrafoActual.titulo = tituloParrafo.value;
    }

    if (textoParrafo) {
        parrafoActual.texto = textoParrafo.value;
    }
}

tituloHistoria?.addEventListener('input', () => {
    historia.titulo = tituloHistoria.value;
});

tituloParrafo?.addEventListener('input', () => {
    parrafoActual.titulo = tituloParrafo.value;
});

textoParrafo?.addEventListener('input', () => {
    parrafoActual.texto = textoParrafo.value;
});

textoParrafo?.addEventListener('input', () => {
    const textoAnterior = parrafoActual.texto;
    const textoNuevo = textoParrafo.value;

    const palabras = textoNuevo.trim() === ''
        ? 0
        : textoNuevo.trim().split(/\s+/).length;

    if (palabras > 1000) {
        textoParrafo.value = textoAnterior;

        informar('Límite de 1000 palabras alcanzado.');
        actualizarContadorPalabras();
        return;
    }

    parrafoActual.texto = textoNuevo;

    actualizarContadorPalabras();
    informar('');
});


botonAnterior?.addEventListener('click', () => {
    sincronizarCampos();

    const indice = historia.parrafos.findIndex(
        (p) => p.num_parrafo === parrafoActual.num_parrafo
    );

    if (indice > 0) {
        mostrarParrafo(historia.parrafos[indice - 1].num_parrafo);
    }
});

botonSiguiente?.addEventListener('click', () => {
    sincronizarCampos();

    const indice = historia.parrafos.findIndex(
        (p) => p.num_parrafo === parrafoActual.num_parrafo
    );

    if (indice >= 0 && indice < historia.parrafos.length - 1) {
        mostrarParrafo(historia.parrafos[indice + 1].num_parrafo);
    }
});

botonNuevo?.addEventListener('click', () => {
    historia = new Historia('Mi historia');
    parrafoActual = historia.crearParrafo();

    if (tituloHistoria) {
        tituloHistoria.value = historia.titulo;
    }

    mostrarParrafo(parrafoActual.num_parrafo);
    informar('Nueva historia creada.');
});


botonGuardar?.addEventListener('click', async () => {
    sincronizarCampos();

    const json = JSON.stringify(historia.aObjeto(), null, 2);

    const nombreArchivo = historia.titulo
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    const nombreFinal = `${nombreArchivo || 'mi_historia'}.json`;

    console.log(
        'Plataforma:', Capacitor.getPlatform(),
        'Nativa:', Capacitor.isNativePlatform()
    );

    try {
        if (Capacitor.isNativePlatform()) {
            await Filesystem.writeFile({
                path: nombreFinal,
                data: json,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
                recursive: true
            });

            informar(`Historia guardada correctamente: ${nombreFinal}`);
        } else {
            const archivo = new Blob([json], {
                type: 'application/json;charset=utf-8'
            });

            const url = URL.createObjectURL(archivo);
            const enlace = document.createElement('a');

            enlace.href = url;
            enlace.download = nombreFinal;
            enlace.click();

            URL.revokeObjectURL(url);

            informar('Historia preparada para guardar como JSON.');
        }
    } catch (error) {
        console.error('Error al guardar la historia:', error);

        informar('No se pudo guardar la historia.');
    }
});




const botonCrearParrafo =
    document.querySelector<HTMLButtonElement>('#crear-parrafo-btn');



botonCrearParrafo?.addEventListener('click', () => {
    // Guardar los cambios del párrafo actual.
    sincronizarCampos();

    // Obtener los números disponibles.
    const numerosLibres = historia.numerosLibresParrafo();

    // Crear el selector de números.
    const selector = document.createElement('select');

    for (const numero of numerosLibres) {
        const opcion = document.createElement('option');

        opcion.value = String(numero);
        opcion.textContent = `Párrafo ${numero}`;

        selector.appendChild(opcion);
    }

    // Mostrar un cuadro de diálogo para elegir el número.
    const dialogo = document.createElement('dialog');
    const titulo = document.createElement('p');
    titulo.textContent = 'Elige el número del nuevo párrafo';

    const botonAceptar = document.createElement('button');
    botonAceptar.type = 'button';
    botonAceptar.textContent = 'Crear';

    const botonCancelar = document.createElement('button');
    botonCancelar.type = 'button';
    botonCancelar.textContent = 'Cancelar';

    dialogo.append(titulo, selector, botonAceptar, botonCancelar);
    document.body.appendChild(dialogo);

    botonCancelar.addEventListener('click', () => {
        dialogo.close();
        dialogo.remove();
    });

    botonAceptar.addEventListener('click', () => {
        const numero = Number(selector.value);

        // Evitar crear un número que ya esté ocupado.
        if (historia.buscarParrafo(numero)) {
            informar(`El párrafo ${numero} ya existe.`);
            return;
        }

        // Crear el párrafo con el número elegido.
        const nuevoParrafo = new Parrafo(numero);

        historia.parrafos.push(nuevoParrafo);
        parrafoActual = nuevoParrafo;

        mostrarParrafo(parrafoActual.num_parrafo);

        informar(`Párrafo ${parrafoActual.num_parrafo} creado.`);

        dialogo.close();
        dialogo.remove();
    });

    dialogo.addEventListener('close', () => {
        dialogo.remove();
    }, { once: true });

    dialogo.showModal();
});



botonCargar?.addEventListener('click', async () => {

    console.log(
        'Cargar: plataforma =',
        Capacitor.getPlatform(),
        'nativa =',
        Capacitor.isNativePlatform()
    );



    // Función común para cargar una historia en la interfaz.
    const aplicarHistoria = (json: string) => {
        const historiaCargada = Historia.desdeJSON(json);

        historia = historiaCargada;

        if (historia.parrafos.length === 0) {
            parrafoActual = historia.crearParrafo();
        } else {
            parrafoActual = historia.parrafos[0];
        }

        if (tituloHistoria) {
            tituloHistoria.value = historia.titulo;
        }

        mostrarParrafo(parrafoActual.num_parrafo);
        informar('Historia cargada correctamente.');
    };

    // En Android, buscamos las historias del almacenamiento privado.
    if (Capacitor.isNativePlatform()) {

        console.log('Cargar: entrando en la rama Android');


        try {
            const resultado = await Filesystem.readdir({
                path: '',
                directory: Directory.Data
            });

            const archivos = resultado.files.filter(
                archivo => archivo.name.toLowerCase().endsWith('.json')
            );

            if (archivos.length === 0) {
                informar('No hay historias guardadas en la aplicación.');
                return;
            }

            const dialogo = document.createElement('dialog');
            const formulario = document.createElement('form');
            formulario.method = 'dialog';

            const titulo = document.createElement('h3');
            titulo.textContent = 'Cargar historia';

            const etiqueta = document.createElement('label');
            etiqueta.textContent = 'Selecciona una historia:';

            const selector = document.createElement('select');
            selector.required = true;

            for (const archivo of archivos) {
                const opcion = document.createElement('option');
                opcion.value = archivo.name;
                opcion.textContent = archivo.name;
                selector.appendChild(opcion);
            }

            etiqueta.appendChild(selector);

            const botonera = document.createElement('div');

            const botonCancelar = document.createElement('button');
            botonCancelar.type = 'button';
            botonCancelar.textContent = 'Cancelar';

            const botonAceptar = document.createElement('button');
            botonAceptar.type = 'submit';
            botonAceptar.textContent = 'Cargar';

            botonera.append(botonCancelar, botonAceptar);
            formulario.append(titulo, etiqueta, botonera);
            dialogo.appendChild(formulario);
            document.body.appendChild(dialogo);

            botonCancelar.addEventListener('click', () => {
                dialogo.close();
            });

            formulario.addEventListener('submit', async (evento) => {
                evento.preventDefault();

                const nombre = selector.value;
                dialogo.close();

                try {
                    const contenido = await Filesystem.readFile({
                        path: nombre,
                        directory: Directory.Data,
                        encoding: Encoding.UTF8
                    });

                    const json = typeof contenido.data === 'string'
                        ? contenido.data
                        : await contenido.data.text();

                    aplicarHistoria(json);
                } catch (error) {
                    console.error('Error al leer la historia:', error);

                    informar('No se pudo leer la historia guardada.');
                } finally {
                    dialogo.remove();
                }
            });

            dialogo.addEventListener('close', () => {
                dialogo.remove();
            }, { once: true });

            dialogo.showModal();
        } catch (error) {
            console.error('Error al buscar historias:', error);

            informar('No se pudieron buscar las historias guardadas.');
        }

        return;
    }

    // En el navegador, mantenemos el selector de archivos existente.
    const selector = document.createElement('input');

    selector.type = 'file';
    selector.accept = '.json,application/json';

    selector.addEventListener('change', async () => {
        const archivo = selector.files?.[0];

        if (!archivo) {
            return;
        }

        try {
            const json = await archivo.text();
            aplicarHistoria(json);
        } catch (error) {
            const mensaje = error instanceof Error
                ? error.message
                : 'Error desconocido al cargar la historia.';

            informar(`No se pudo cargar la historia: ${mensaje}`);
        }
    });

    selector.click();
});




botonAnadirBifurcacion?.addEventListener('click', () => {
    sincronizarCampos();

    const dialogo = document.createElement('dialog');
    const formulario = document.createElement('form');
    formulario.noValidate = true;

    const titulo = document.createElement('h2');
    titulo.textContent = 'Añadir bifurcación';

    const etiquetaDestino = document.createElement('label');
    etiquetaDestino.textContent = 'Número del párrafo de destino';

    const campoDestino = document.createElement('input');
    campoDestino.type = 'number';
    campoDestino.min = '1';
    campoDestino.step = '1';
    campoDestino.required = true;
    campoDestino.inputMode = 'numeric';

    etiquetaDestino.appendChild(campoDestino);

    const etiquetaTexto = document.createElement('label');
    etiquetaTexto.textContent = 'Texto de la bifurcación';

    const campoTexto = document.createElement('input');
    campoTexto.type = 'text';
    campoTexto.required = true;
    campoTexto.placeholder = 'Ej.: Entrar en la cueva';

    etiquetaTexto.appendChild(campoTexto);

    const botonAceptar = document.createElement('button');
    botonAceptar.type = 'submit';
    botonAceptar.textContent = 'Añadir';

    const botonCancelar = document.createElement('button');
    botonCancelar.type = 'button';
    botonCancelar.textContent = 'Cancelar';

    formulario.append(
        titulo,
        etiquetaDestino,
        etiquetaTexto,
        botonAceptar,
        botonCancelar
    );

    dialogo.appendChild(formulario);
    document.body.appendChild(dialogo);

    botonCancelar.addEventListener('click', () => {
        dialogo.close();
    });

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const destino = Number(campoDestino.value);
        const texto = campoTexto.value.trim();

        if (!Number.isInteger(destino) || destino < 1) {
            informar('El destino debe ser un entero positivo.');
            campoDestino.focus();
            return;
        }

        if (texto === '') {
            informar('Escribe el texto de la bifurcación.');
            campoTexto.focus();
            return;
        }

        parrafoActual.agregarSiguiente(
            new Siguiente(destino, texto)
        );

        mostrarBifurcaciones();
        informar('Bifurcación añadida correctamente.');

        dialogo.close();
    });

    dialogo.addEventListener('close', () => {
        dialogo.remove();
    }, { once: true });

    dialogo.showModal();
    campoDestino.focus();
});




if (tituloHistoria) {
    tituloHistoria.value = historia.titulo;
}


function actualizarContadorPalabras(): void {
    const texto = parrafoActual.texto.trim();

    const palabras = texto === ''
        ? 0
        : texto.split(/\s+/).length;

    if (contadorPalabras) {
        contadorPalabras.textContent =
            `Contador de palabras: ${palabras} / 1000`;
    }
}

mostrarParrafo(parrafoActual.num_parrafo);
informar('Historia inicializada correctamente.');


/* =========================================================
   CONTROLE DE PAGAMENTOS
   JavaScript principal
========================================================= */

const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

const DIAS_SEMANA = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
];

const STORAGE_KEY = "controlePagamentos";
const TEMA_KEY = "controlePagamentosTema";


/* =========================================================
   ELEMENTOS
========================================================= */

const nomeInput = document.getElementById("nome");
const anoInput = document.getElementById("ano");
const mesInput = document.getElementById("mes");
const tipoPagamentoInput = document.getElementById("tipoPagamento");

const diariaPadraoInput = document.getElementById("diariaPadrao");
const horaExtraPadraoInput = document.getElementById("horaExtraPadrao");

const tabelaDias = document.getElementById("tabelaDias");
const diasMobile = document.getElementById("diasMobile");

const tituloCalendario = document.getElementById("tituloCalendario");
const mesNavegacao = document.getElementById("mesNavegacao");

const semanasContainer = document.getElementById("semanasContainer");

const dataInicioInput = document.getElementById("dataInicio");
const dataFimInput = document.getElementById("dataFim");

const totalDiasElement = document.getElementById("totalDias");
const totalHorasElement = document.getElementById("totalHoras");
const totalHorasExtrasElement = document.getElementById("totalHorasExtras");
const totalDiariasElement = document.getElementById("totalDiarias");
const totalExtrasElement = document.getElementById("totalExtras");
const totalGeralElement = document.getElementById("totalGeral");

const notificacao = document.getElementById("notificacao");
const notificacaoTexto = document.getElementById("notificacaoTexto");

const btnTema = document.getElementById("btnTema");


/* =========================================================
   DADOS ATUAIS
========================================================= */

let dadosDias = {};


/* =========================================================
   UTILIDADES
========================================================= */

function numero(valor) {
    const resultado = Number(valor);

    return Number.isNaN(resultado)
        ? 0
        : resultado;
}


function dinheiro(valor) {
    return numero(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function chaveMes() {
    return `${Number(anoInput.value)}-${Number(mesInput.value)}`;
}


function chaveMesData(ano, mes) {
    return `${Number(ano)}-${Number(mes)}`;
}


function criarChaveDia(ano, mes, dia) {
    return `${ano}-${String(Number(mes) + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}


function diasNoMes(ano, mes) {
    return new Date(
        Number(ano),
        Number(mes) + 1,
        0
    ).getDate();
}


function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}


function dataParaInput(data) {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${ano}-${mes}-${dia}`;
}


function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   HORAS
========================================================= */

/*
   Converte minutos para HH:MM

   Exemplo:
   480 -> 08:00
   510 -> 08:30
*/
function minutosParaHora(minutos) {
    minutos = Math.max(
        0,
        Math.round(numero(minutos))
    );

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}


/*
   Converte:

   08:00 -> 480
   08:30 -> 510
   8 -> 480

   Também mantém compatibilidade com
   valores decimais antigos.
*/
function horaParaMinutos(valor) {

    if (valor === undefined || valor === null || valor === "") {
        return 0;
    }

    const texto = String(valor).trim();

    if (texto.includes(":")) {

        const partes = texto.split(":");

        const horas = numero(partes[0]);
        const minutos = numero(partes[1]);

        return Math.max(
            0,
            Math.round(horas * 60 + minutos)
        );
    }

    return Math.max(
        0,
        Math.round(numero(texto) * 60)
    );
}


function formatarHoras(minutos) {

    minutos = Math.max(
        0,
        Math.round(numero(minutos))
    );

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (mins === 0) {
        return `${horas}h`;
    }

    return `${horas}h ${mins}min`;
}


/* =========================================================
   NOTIFICAÇÃO
========================================================= */

let notificacaoTimeout = null;

function mostrarNotificacao(mensagem, tipo = "sucesso") {

    if (!notificacao || !notificacaoTexto) {
        return;
    }

    notificacaoTexto.textContent = mensagem;

    notificacao.classList.remove(
        "mostrar",
        "sucesso",
        "erro"
    );

    notificacao.classList.add(
        tipo,
        "mostrar"
    );

    clearTimeout(notificacaoTimeout);

    notificacaoTimeout = setTimeout(() => {

        notificacao.classList.remove("mostrar");

    }, 3000);
}


/* =========================================================
   DADOS DOS DIAS
========================================================= */

function dadosDiaPadrao() {

    return {
        trabalhou: false,

        minutos: 0,

        minutosExtras: 0,

        valorHoraExtra:
            numero(horaExtraPadraoInput.value),

        diaria:
            numero(diariaPadraoInput.value)
    };
}


function obterDadosDia(chave) {

    if (!dadosDias[chave]) {
        dadosDias[chave] = dadosDiaPadrao();
    }

    const dados = dadosDias[chave];


    /*
       Compatibilidade com a versão antiga
       que usava "horas" e "horasExtras".
    */

    if (
        dados.minutos === undefined &&
        dados.horas !== undefined
    ) {

        dados.minutos =
            Math.round(numero(dados.horas) * 60);
    }


    if (
        dados.minutosExtras === undefined &&
        dados.horasExtras !== undefined
    ) {

        dados.minutosExtras =
            Math.round(numero(dados.horasExtras) * 60);
    }


    if (dados.minutos === undefined) {
        dados.minutos = 0;
    }


    if (dados.minutosExtras === undefined) {
        dados.minutosExtras = 0;
    }


    if (dados.trabalhou === undefined) {
        dados.trabalhou = false;
    }


    if (dados.valorHoraExtra === undefined) {

        dados.valorHoraExtra =
            numero(horaExtraPadraoInput.value);
    }


    if (dados.diaria === undefined) {

        dados.diaria =
            numero(diariaPadraoInput.value);
    }


    return dados;
}


/* =========================================================
   CÁLCULO DO DIA
========================================================= */

function calcularValorDia(dados) {

    if (!dados.trabalhou) {
        return 0;
    }

    const diaria =
        numero(dados.diaria);

    const horasExtras =
        numero(dados.minutosExtras) / 60;

    const valorHoraExtra =
        numero(dados.valorHoraExtra);

    return diaria +
        horasExtras * valorHoraExtra;
}


function calcularTotalDia(dados) {

    return dinheiro(
        calcularValorDia(dados)
    );
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function obterBanco() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

    } catch (erro) {

        console.error(
            "Erro ao ler dados:",
            erro
        );

        return {};
    }
}


function salvarDados(silencioso = false) {

    const banco = obterBanco();

    banco[chaveMes()] = {

        nome:
            nomeInput.value,

        tipoPagamento:
            tipoPagamentoInput.value,

        diariaPadrao:
            numero(diariaPadraoInput.value),

        horaExtraPadrao:
            numero(horaExtraPadraoInput.value),

        dias:
            dadosDias
    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(banco)
    );


    if (!silencioso) {

        mostrarNotificacao(
            "Dados salvos com sucesso!",
            "sucesso"
        );
    }
}


function carregarDados() {

    const banco = obterBanco();

    const dados =
        banco[chaveMes()];


    /*
       Se o mês ainda não possui dados,
       começamos um mês limpo.
    */

    if (!dados) {

        dadosDias = {};

        nomeInput.value = "";

        tipoPagamentoInput.value =
            "mensal";

        diariaPadraoInput.value = 0;

        horaExtraPadraoInput.value = 0;

        return;
    }


    nomeInput.value =
        dados.nome || "";


    tipoPagamentoInput.value =
        dados.tipoPagamento || "mensal";


    diariaPadraoInput.value =
        dados.diariaPadrao ?? 0;


    horaExtraPadraoInput.value =
        dados.horaExtraPadrao ?? 0;


    dadosDias =
        dados.dias || {};
}


/* =========================================================
   DATAS DO PERÍODO
========================================================= */

function definirDatasPeriodo() {

    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const inicio =
        new Date(
            ano,
            mes,
            1
        );


    const fim =
        new Date(
            ano,
            mes + 1,
            0
        );


    dataInicioInput.value =
        dataParaInput(inicio);

    dataFimInput.value =
        dataParaInput(fim);
}


/* =========================================================
   CALENDÁRIO
========================================================= */

function gerarCalendario() {

    tabelaDias.innerHTML = "";

    diasMobile.innerHTML = "";


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    tituloCalendario.textContent =
        `${MESES[mes]} de ${ano}`;


    mesNavegacao.textContent =
        `${MESES[mes]} ${ano}`;


    for (
        let dia = 1;
        dia <= quantidade;
        dia++
    ) {

        const data =
            new Date(
                ano,
                mes,
                dia
            );


        const chave =
            criarChaveDia(
                ano,
                mes,
                dia
            );


        const dados =
            obterDadosDia(chave);


        criarLinhaDesktop(
            data,
            chave,
            dados
        );


        criarCardMobile(
            data,
            chave,
            dados
        );
    }
}


/* =========================================================
   LINHA DESKTOP
========================================================= */

function criarLinhaDesktop(
    data,
    chave,
    dados
) {

    const tr =
        document.createElement("tr");


    tr.dataset.chave =
        chave;


    if (dados.trabalhou) {

        tr.classList.add(
            "linha-trabalhou"
        );

    } else {

        tr.classList.add(
            "linha-nao-trabalhou"
        );
    }


    const classeDia =
        data.getDay() === 0
            ? "dia-domingo"
            : data.getDay() === 6
                ? "dia-sabado"
                : "";


    tr.innerHTML = `

        <td>
            ${formatarData(data)}
        </td>

        <td class="${classeDia}">
            ${DIAS_SEMANA[data.getDay()]}
        </td>

        <td>

            <input
                type="checkbox"
                class="checkbox"
                data-campo="trabalhou"
                ${dados.trabalhou ? "checked" : ""}
            >

        </td>

        <td>

            <input
                type="text"
                inputmode="text"
                autocomplete="off"
                placeholder="08:00"
                value="${minutosParaHora(dados.minutos)}"
                data-campo="minutos"
            >

        </td>

        <td>

            <input
                type="text"
                inputmode="text"
                autocomplete="off"
                placeholder="00:00"
                value="${minutosParaHora(dados.minutosExtras)}"
                data-campo="minutosExtras"
            >

        </td>

        <td>

            <div class="input-dinheiro">

                <span>R$</span>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="${dados.valorHoraExtra}"
                    data-campo="valorHoraExtra"
                >

            </div>

        </td>

        <td>

            <div class="input-dinheiro">

                <span>R$</span>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="${dados.diaria}"
                    data-campo="diaria"
                >

            </div>

        </td>

        <td class="total-dia">

            ${calcularTotalDia(dados)}

        </td>
    `;


    adicionarEventosDia(
        tr,
        chave
    );


    tabelaDias.appendChild(tr);
}


/* =========================================================
   CARD MOBILE
========================================================= */

function criarCardMobile(
    data,
    chave,
    dados
) {

    const card =
        document.createElement("div");


    card.className =
        "dia-mobile";


    card.dataset.chave =
        chave;


    if (dados.trabalhou) {

        card.classList.add(
            "trabalhado"
        );

    } else {

        card.classList.add(
            "nao-trabalhado"
        );
    }


    let classeSemana = "";

    if (data.getDay() === 0) {
        classeSemana = "dia-domingo";
    }

    if (data.getDay() === 6) {
        classeSemana = "dia-sabado";
    }


    card.innerHTML = `

        <div class="dia-mobile-header">

            <div class="dia-mobile-data">

                <strong class="dia-mobile-numero">

                    ${String(data.getDate()).padStart(2, "0")}
                    de ${MESES[data.getMonth()]}

                </strong>

                <span class="dia-mobile-semana ${classeSemana}">

                    ${DIAS_SEMANA[data.getDay()]}

                    • ${formatarData(data)}

                </span>

            </div>


            <label class="trabalhou-mobile">

                <input
                    type="checkbox"
                    data-campo="trabalhou"
                    ${dados.trabalhou ? "checked" : ""}
                >

                Trabalhou

            </label>

        </div>


        <div class="dia-mobile-campos">

            <div class="dia-mobile-campo">

                <label>
                    Horas trabalhadas
                </label>

                <input
                    type="text"
                    inputmode="text"
                    autocomplete="off"
                    placeholder="08:00"
                    value="${minutosParaHora(dados.minutos)}"
                    data-campo="minutos"
                >

            </div>


            <div class="dia-mobile-campo">

                <label>
                    Horas extras
                </label>

                <input
                    type="text"
                    inputmode="text"
                    autocomplete="off"
                    placeholder="00:00"
                    value="${minutosParaHora(dados.minutosExtras)}"
                    data-campo="minutosExtras"
                >

            </div>


            <div class="dia-mobile-campo">

                <label>
                    Valor/h extra
                </label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="${dados.valorHoraExtra}"
                    data-campo="valorHoraExtra"
                >

            </div>


            <div class="dia-mobile-campo">

                <label>
                    Diária
                </label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="${dados.diaria}"
                    data-campo="diaria"
                >

            </div>

        </div>


        <div class="dia-mobile-total">

            <span>
                Total do dia
            </span>

            <strong class="total-dia">
                ${calcularTotalDia(dados)}
            </strong>

        </div>

    `;


    adicionarEventosDia(
        card,
        chave
    );


    diasMobile.appendChild(card);
}


/* =========================================================
   EVENTOS DOS DIAS
========================================================= */

function adicionarEventosDia(
    elemento,
    chave
) {

    const inputs =
        elemento.querySelectorAll(
            "[data-campo]"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "change",
            () => {

                alterarDia(
                    elemento,
                    chave,
                    input
                );

            }
        );


        input.addEventListener(
            "input",
            () => {

                if (
                    input.dataset.campo !==
                    "trabalhou"
                ) {

                    alterarDia(
                        elemento,
                        chave,
                        input
                    );
                }

            }
        );

    });
}


/* =========================================================
   ALTERAR DIA
========================================================= */

function alterarDia(
    elemento,
    chave,
    input
) {

    const dados =
        obterDadosDia(chave);


    const campo =
        input.dataset.campo;


    if (campo === "trabalhou") {

        dados.trabalhou =
            input.checked;

    }


    else if (
        campo === "minutos" ||
        campo === "minutosExtras"
    ) {

        dados[campo] =
            horaParaMinutos(
                input.value
            );

    }


    else {

        dados[campo] =
            numero(
                input.value
            );
    }


    atualizarElementosDia(
        chave
    );


    atualizarResumo();

    gerarResumoSemanal();

    salvarDados(true);
}


/* =========================================================
   ATUALIZAR DIA NA TELA
========================================================= */

function atualizarElementosDia(chave) {

    const dados =
        obterDadosDia(chave);


    const elementos =
        document.querySelectorAll(
            `[data-chave="${chave}"]`
        );


    elementos.forEach(elemento => {

        const checkbox =
            elemento.querySelector(
                '[data-campo="trabalhou"]'
            );


        if (checkbox) {

            checkbox.checked =
                dados.trabalhou;
        }


        const minutos =
            elemento.querySelector(
                '[data-campo="minutos"]'
            );


        if (
            minutos &&
            document.activeElement !== minutos
        ) {

            minutos.value =
                minutosParaHora(
                    dados.minutos
                );
        }


        const extras =
            elemento.querySelector(
                '[data-campo="minutosExtras"]'
            );


        if (
            extras &&
            document.activeElement !== extras
        ) {

            extras.value =
                minutosParaHora(
                    dados.minutosExtras
                );
        }


        const valorExtra =
            elemento.querySelector(
                '[data-campo="valorHoraExtra"]'
            );


        if (
            valorExtra &&
            document.activeElement !== valorExtra
        ) {

            valorExtra.value =
                dados.valorHoraExtra;
        }


        const diaria =
            elemento.querySelector(
                '[data-campo="diaria"]'
            );


        if (
            diaria &&
            document.activeElement !== diaria
        ) {

            diaria.value =
                dados.diaria;
        }


        const total =
            elemento.querySelector(
                ".total-dia"
            );


        if (total) {

            total.textContent =
                calcularTotalDia(
                    dados
                );
        }


        /*
           Desktop
        */

        if (
            dados.trabalhou &&
            elemento.tagName === "TR"
        ) {

            elemento.classList.add(
                "linha-trabalhou"
            );

            elemento.classList.remove(
                "linha-nao-trabalhou"
            );

        }


        else if (
            !dados.trabalhou &&
            elemento.tagName === "TR"
        ) {

            elemento.classList.remove(
                "linha-trabalhou"
            );

            elemento.classList.add(
                "linha-nao-trabalhou"
            );
        }


        /*
           Mobile
        */

        if (
            dados.trabalhou &&
            elemento.classList.contains(
                "dia-mobile"
            )
        ) {

            elemento.classList.add(
                "trabalhado"
            );

            elemento.classList.remove(
                "nao-trabalhado"
            );

        }


        else if (
            !dados.trabalhou &&
            elemento.classList.contains(
                "dia-mobile"
            )
        ) {

            elemento.classList.remove(
                "trabalhado"
            );

            elemento.classList.add(
                "nao-trabalhado"
            );
        }

    });
}


/* =========================================================
   RESUMO MENSAL
========================================================= */

function atualizarResumo() {

    let dias = 0;

    let minutos = 0;

    let minutosExtras = 0;

    let totalDiarias = 0;

    let totalExtras = 0;


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    for (
        let dia = 1;
        dia <= quantidade;
        dia++
    ) {

        const chave =
            criarChaveDia(
                ano,
                mes,
                dia
            );


        const dados =
            obterDadosDia(chave);


        if (!dados.trabalhou) {
            continue;
        }


        dias++;


        minutos +=
            numero(dados.minutos);


        minutosExtras +=
            numero(dados.minutosExtras);


        totalDiarias +=
            numero(dados.diaria);


        totalExtras +=
            (
                numero(dados.minutosExtras) / 60
            ) *
            numero(dados.valorHoraExtra);
    }


    totalDiasElement.textContent =
        dias;


    totalHorasElement.textContent =
        formatarHoras(minutos);


    totalHorasExtrasElement.textContent =
        formatarHoras(minutosExtras);


    totalDiariasElement.textContent =
        dinheiro(totalDiarias);


    totalExtrasElement.textContent =
        dinheiro(totalExtras);


    totalGeralElement.textContent =
        dinheiro(
            totalDiarias +
            totalExtras
        );
}


/* =========================================================
   RESUMO SEMANAL
========================================================= */

function gerarResumoSemanal() {

    semanasContainer.innerHTML = "";


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    let semanaAtual = [];


    for (
        let dia = 1;
        dia <= quantidade;
        dia++
    ) {

        const data =
            new Date(
                ano,
                mes,
                dia
            );


        const diaSemana =
            data.getDay();


        /*
           Segunda-feira começa uma nova semana.
        */

        if (
            diaSemana === 1 &&
            semanaAtual.length > 0
        ) {

            criarCardSemana(
                semanaAtual
            );

            semanaAtual = [];
        }


        semanaAtual.push(data);
    }


    if (semanaAtual.length > 0) {

        criarCardSemana(
            semanaAtual
        );
    }
}


function criarCardSemana(dias) {

    if (!dias.length) {
        return;
    }


    let trabalhados = 0;

    let minutos = 0;

    let minutosExtras = 0;

    let total = 0;


    dias.forEach(data => {

        const chave =
            criarChaveDia(
                data.getFullYear(),
                data.getMonth(),
                data.getDate()
            );


        const dados =
            obterDadosDia(chave);


        if (!dados.trabalhou) {
            return;
        }


        trabalhados++;


        minutos +=
            numero(dados.minutos);


        minutosExtras +=
            numero(dados.minutosExtras);


        total +=
            calcularValorDia(
                dados
            );
    });


    const inicio =
        formatarData(
            dias[0]
        );


    const fim =
        formatarData(
            dias[dias.length - 1]
        );


    const card =
        document.createElement("div");


    card.className =
        "semana-card";


    card.innerHTML = `

        <h3>
            Semana
        </h3>

        <p class="datas">
            ${inicio} → ${fim}
        </p>

        <div class="semana-info">

            <span>
                Dias trabalhados
            </span>

            <strong>
                ${trabalhados}
            </strong>

        </div>


        <div class="semana-info">

            <span>
                Horas
            </span>

            <strong>
                ${formatarHoras(minutos)}
            </strong>

        </div>


        <div class="semana-info">

            <span>
                Horas extras
            </span>

            <strong>
                ${formatarHoras(minutosExtras)}
            </strong>

        </div>


        <div class="semana-total">

            ${dinheiro(total)}

        </div>

    `;


    semanasContainer.appendChild(
        card
    );
}


/* =========================================================
   NAVEGAÇÃO DE MESES
========================================================= */

function atualizarTelaMes() {

    carregarDados();

    definirDatasPeriodo();

    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();
}


function mudarMes(quantidade) {

    salvarDados(true);


    let ano =
        Number(anoInput.value);

    let mes =
        Number(mesInput.value);


    mes += quantidade;


    while (mes < 0) {

        mes += 12;
        ano--;
    }


    while (mes > 11) {

        mes -= 12;
        ano++;
    }


    anoInput.value =
        ano;

    mesInput.value =
        mes;


    atualizarTelaMes();
}


function irParaMesAtual() {

    salvarDados(true);


    const agora =
        new Date();


    anoInput.value =
        agora.getFullYear();


    mesInput.value =
        agora.getMonth();


    atualizarTelaMes();
}


/* =========================================================
   APLICAR DIÁRIA A TODOS
========================================================= */

function aplicarDiariaTodos() {

    const valor =
        numero(
            diariaPadraoInput.value
        );


    if (valor <= 0) {

        mostrarNotificacao(
            "Informe uma diária válida.",
            "erro"
        );

        return;
    }


    const confirmar =
        confirm(
            `Aplicar a diária de ${dinheiro(valor)} em todos os dias do mês?`
        );


    if (!confirmar) {
        return;
    }


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    for (
        let dia = 1;
        dia <= quantidade;
        dia++
    ) {

        const chave =
            criarChaveDia(
                ano,
                mes,
                dia
            );


        const dados =
            obterDadosDia(chave);


        dados.diaria =
            valor;
    }


    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();

    salvarDados(true);


    mostrarNotificacao(
        "Diária aplicada a todos os dias.",
        "sucesso"
    );
}


/* =========================================================
   APLICAR HORA EXTRA A TODOS
========================================================= */

function aplicarHoraExtraTodos() {

    const valor =
        numero(
            horaExtraPadraoInput.value
        );


    if (valor <= 0) {

        mostrarNotificacao(
            "Informe um valor de hora extra válido.",
            "erro"
        );

        return;
    }


    const confirmar =
        confirm(
            `Aplicar ${dinheiro(valor)} por hora extra em todos os dias?`
        );


    if (!confirmar) {
        return;
    }


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    for (
        let dia = 1;
        dia <= quantidade;
        dia++
    ) {

        const chave =
            criarChaveDia(
                ano,
                mes,
                dia
            );


        const dados =
            obterDadosDia(chave);


        dados.valorHoraExtra =
            valor;
    }


    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();

    salvarDados(true);


    mostrarNotificacao(
        "Valor da hora extra aplicado a todos os dias.",
        "sucesso"
    );
}


/* =========================================================
   LIMPAR MÊS
========================================================= */

function limparMes() {

    const mes =
        MESES[
            Number(mesInput.value)
        ];


    const ano =
        Number(anoInput.value);


    const confirmar =
        confirm(
            `Tem certeza que deseja apagar todos os dados de ${mes} de ${ano}?`
        );


    if (!confirmar) {
        return;
    }


    const banco =
        obterBanco();


    delete banco[
        chaveMes()
    ];


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(banco)
    );


    dadosDias = {};

    nomeInput.value = "";

    tipoPagamentoInput.value =
        "mensal";

    diariaPadraoInput.value = 0;

    horaExtraPadraoInput.value = 0;


    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();


    mostrarNotificacao(
        "Mês limpo com sucesso.",
        "sucesso"
    );
}


/* =========================================================
   BACKUP - EXPORTAR
========================================================= */

function exportarBackup() {

    salvarDados(true);


    const banco =
        obterBanco();


    const backup = {

        aplicativo:
            "Controle de Pagamentos",

        versao:
            "2.1",

        dataExportacao:
            new Date().toISOString(),

        dados:
            banco
    };


    const conteudo =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [conteudo],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        `backup-controle-pagamentos-${dataParaInput(new Date())}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    mostrarNotificacao(
        "Backup exportado com sucesso!",
        "sucesso"
    );
}


/* =========================================================
   BACKUP - IMPORTAR
========================================================= */

function importarBackupArquivo(arquivo) {

    if (!arquivo) {
        return;
    }


    const leitor =
        new FileReader();


    leitor.onload =
        function(evento) {

            try {

                const backup =
                    JSON.parse(
                        evento.target.result
                    );


                const dados =
                    backup.dados ||
                    backup;


                if (
                    typeof dados !== "object" ||
                    dados === null ||
                    Array.isArray(dados)
                ) {

                    throw new Error(
                        "Formato inválido."
                    );
                }


                const confirmar =
                    confirm(
                        "Importar este backup substituirá todos os dados atualmente salvos no navegador. Deseja continuar?"
                    );


                if (!confirmar) {
                    return;
                }


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(dados)
                );


                atualizarTelaMes();


                mostrarNotificacao(
                    "Backup importado com sucesso!",
                    "sucesso"
                );

            }

            catch (erro) {

                console.error(
                    erro
                );


                mostrarNotificacao(
                    "Não foi possível importar o backup.",
                    "erro"
                );
            }

        };


    leitor.readAsText(
        arquivo
    );
}


/* =========================================================
   MODO ESCURO
========================================================= */

function atualizarBotaoTema() {

    if (!btnTema) {
        return;
    }


    const escuro =
        document.body.classList.contains(
            "modo-escuro"
        );


    btnTema.textContent =
        escuro
            ? "☀️ Modo claro"
            : "🌙 Modo escuro";
}


function carregarTema() {

    const tema =
        localStorage.getItem(
            TEMA_KEY
        );


    if (tema === "escuro") {

        document.body.classList.add(
            "modo-escuro"
        );
    }


    atualizarBotaoTema();
}


function alternarTema() {

    const escuro =
        document.body.classList.toggle(
            "modo-escuro"
        );


    localStorage.setItem(
        TEMA_KEY,
        escuro
            ? "escuro"
            : "claro"
    );


    atualizarBotaoTema();
}


/* =========================================================
   PDF
========================================================= */

function verificarJsPDF() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        mostrarNotificacao(
            "A biblioteca de PDF não foi carregada. Verifique sua internet.",
            "erro"
        );

        return false;
    }


    return true;
}


/* =========================================================
   CABEÇALHO DO PDF
========================================================= */

function criarCabecalhoPDF(
    doc,
    titulo,
    nome,
    periodo
) {

    doc.setFontSize(20);

    doc.setFont(undefined, "bold");

    doc.text(
        "Controle de Pagamentos",
        14,
        18
    );


    doc.setFontSize(13);

    doc.setFont(undefined, "normal");

    doc.text(
        titulo,
        14,
        27
    );


    if (nome) {

        doc.text(
            `Nome: ${nome}`,
            14,
            36
        );
    }


    doc.text(
        `Período: ${periodo}`,
        14,
        nome ? 44 : 36
    );
}


/* =========================================================
   PREPARAR DADOS PARA PDF
========================================================= */

function dadosParaPDFDoMes() {

    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    const dados = [];


    for (
        let dia = 1;
        dia <= quantidade;
        dia++
    ) {

        const data =
            new Date(
                ano,
                mes,
                dia
            );


        const chave =
            criarChaveDia(
                ano,
                mes,
                dia
            );


        const dadosDia =
            obterDadosDia(chave);


        if (!dadosDia.trabalhou) {
            continue;
        }


        dados.push({

            data:
                formatarData(data),

            dia:
                DIAS_SEMANA[data.getDay()],

            horas:
                minutosParaHora(
                    dadosDia.minutos
                ),

            extras:
                minutosParaHora(
                    dadosDia.minutosExtras
                ),

            valorHoraExtra:
                numero(
                    dadosDia.valorHoraExtra
                ),

            diaria:
                numero(
                    dadosDia.diaria
                ),

            total:
                calcularValorDia(
                    dadosDia
                )
        });
    }


    return dados;
}


/* =========================================================
   PDF GENÉRICO
========================================================= */

function gerarPDFDados(
    titulo,
    periodo,
    dados,
    nomeArquivo
) {

    if (!verificarJsPDF()) {
        return;
    }


    if (
        typeof window.jspdf.jsPDF !==
        "function"
    ) {

        mostrarNotificacao(
            "Não foi possível iniciar o PDF.",
            "erro"
        );

        return;
    }


    const jsPDF =
        window.jspdf.jsPDF;


    const doc =
        new jsPDF({
            orientation:
                "landscape"
        });


    criarCabecalhoPDF(
        doc,
        titulo,
        nomeInput.value,
        periodo
    );


    const linhas =
        dados.map(item => [

            item.data,

            item.dia,

            item.horas,

            item.extras,

            dinheiro(
                item.valorHoraExtra
            ),

            dinheiro(
                item.diaria
            ),

            dinheiro(
                item.total
            )

        ]);


    const total =
        dados.reduce(
            (soma, item) =>
                soma +
                numero(item.total),
            0
        );


    /*
       O AutoTable precisa estar carregado.
    */

    if (
        typeof doc.autoTable !==
        "function"
    ) {

        mostrarNotificacao(
            "O recurso de tabela do PDF não foi carregado.",
            "erro"
        );

        return;
    }


    doc.autoTable({

        startY: 52,

        head: [[

            "Data",

            "Dia",

            "Horas",

            "Extras",

            "Valor/h Extra",

            "Diária",

            "Total"

        ]],

        body: linhas,

        theme: "grid",

        styles: {

            fontSize: 9,

            cellPadding: 4,

            halign: "center"

        },

        headStyles: {

            fontStyle:
                "bold"
        },

        foot: [[

            "",
            "",
            "",
            "",
            "",
            "TOTAL",
            dinheiro(total)

        ]],

        footStyles: {

            fontStyle:
                "bold"
        }
    });


    let y =
        doc.lastAutoTable.finalY + 12;


    /*
       Se o resumo passar da página,
       cria uma nova página.
    */

    if (y > 190) {

        doc.addPage();

        y = 20;
    }


    doc.setFontSize(15);

    doc.setFont(undefined, "bold");

    doc.text(
        `TOTAL A RECEBER: ${dinheiro(total)}`,
        14,
        y
    );


    y += 9;


    const totalMinutos =
        dados.reduce(
            (soma, item) =>
                soma +
                horaParaMinutos(
                    item.horas
                ),
            0
        );


    const totalExtrasMinutos =
        dados.reduce(
            (soma, item) =>
                soma +
                horaParaMinutos(
                    item.extras
                ),
            0
        );


    doc.setFontSize(10);

    doc.setFont(undefined, "normal");


    doc.text(
        `Dias trabalhados: ${dados.length}`,
        14,
        y
    );


    doc.text(
        `Horas trabalhadas: ${formatarHoras(totalMinutos)}`,
        90,
        y
    );


    doc.text(
        `Horas extras: ${formatarHoras(totalExtrasMinutos)}`,
        180,
        y
    );


    doc.save(
        nomeArquivo
    );


    mostrarNotificacao(
        "PDF gerado com sucesso!",
        "sucesso"
    );
}


/* =========================================================
   PDF DO MÊS
========================================================= */

function gerarPdfMes() {

    salvarDados(true);


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const dados =
        dadosParaPDFDoMes();


    gerarPDFDados(

        `Relatório mensal - ${MESES[mes]} de ${ano}`,

        `${MESES[mes]} de ${ano}`,

        dados,

        `controle-pagamentos-${ano}-${String(mes + 1).padStart(2, "0")}.pdf`
    );
}


/* =========================================================
   PEGAR DADOS DE QUALQUER MÊS
========================================================= */

function obterDadosSalvosDoDia(data) {

    const banco =
        obterBanco();


    const ano =
        data.getFullYear();

    const mes =
        data.getMonth();


    const chaveMesAtual =
        chaveMesData(
            ano,
            mes
        );


    const dadosMes =
        banco[chaveMesAtual]?.dias || {};


    const chaveDia =
        criarChaveDia(
            ano,
            mes,
            data.getDate()
        );


    return dadosMes[chaveDia] || null;
}


/* =========================================================
   PDF SEMANAL
========================================================= */

function gerarPdfSemana() {

    const diaEscolhido =
        prompt(
            "Digite o número de um dia pertencente à semana que deseja gerar.\n\nExemplo: 15"
        );


    if (!diaEscolhido) {
        return;
    }


    const dia =
        Number(diaEscolhido);


    const ano =
        Number(anoInput.value);

    const mes =
        Number(mesInput.value);


    const quantidade =
        diasNoMes(
            ano,
            mes
        );


    if (
        !Number.isInteger(dia) ||
        dia < 1 ||
        dia > quantidade
    ) {

        mostrarNotificacao(
            "Dia inválido.",
            "erro"
        );

        return;
    }


    const data =
        new Date(
            ano,
            mes,
            dia
        );


    const diaSemana =
        data.getDay();


    /*
       Segunda-feira = início da semana.
       Domingo = fim da semana.
    */

    const deslocamento =
        diaSemana === 0
            ? 6
            : diaSemana - 1;


    const segunda =
        new Date(data);


    segunda.setDate(
        data.getDate() -
        deslocamento
    );


    const domingo =
        new Date(segunda);


    domingo.setDate(
        segunda.getDate() + 6
    );


    const dadosSemana = [];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const atual =
            new Date(segunda);


        atual.setDate(
            segunda.getDate() + i
        );


        const dados =
            obterDadosSalvosDoDia(
                atual
            );


        if (
            dados &&
            dados.trabalhou
        ) {

            dadosSemana.push({

                data:
                    formatarData(
                        atual
                    ),

                dia:
                    DIAS_SEMANA[
                        atual.getDay()
                    ],

                horas:
                    minutosParaHora(
                        dados.minutos
                    ),

                extras:
                    minutosParaHora(
                        dados.minutosExtras
                    ),

                diaria:
                    numero(
                        dados.diaria
                    ),

                valorHoraExtra:
                    numero(
                        dados.valorHoraExtra
                    ),

                total:
                    calcularValorDia(
                        dados
                    )
            });
        }
    }


    gerarPDFDados(

        "Relatório semanal",

        `${formatarData(segunda)} até ${formatarData(domingo)}`,

        dadosSemana,

        `controle-pagamentos-semana-${dataParaInput(segunda)}.pdf`
    );
}


/* =========================================================
   PDF POR PERÍODO
========================================================= */

function gerarPdfPeriodo() {

    const inicio =
        dataInicioInput.value;

    const fim =
        dataFimInput.value;


    if (!inicio || !fim) {

        mostrarNotificacao(
            "Informe a data inicial e final.",
            "erro"
        );

        return;
    }


    const dataInicial =
        new Date(
            inicio + "T00:00:00"
        );


    const dataFinal =
        new Date(
            fim + "T00:00:00"
        );


    if (
        dataInicial >
        dataFinal
    ) {

        mostrarNotificacao(
            "A data inicial não pode ser maior que a data final.",
            "erro"
        );

        return;
    }


    const dadosPeriodo = [];


    const cursor =
        new Date(
            dataInicial
        );


    while (
        cursor <= dataFinal
    ) {

        const dados =
            obterDadosSalvosDoDia(
                cursor
            );


        if (
            dados &&
            dados.trabalhou
        ) {

            dadosPeriodo.push({

                data:
                    formatarData(
                        cursor
                    ),

                dia:
                    DIAS_SEMANA[
                        cursor.getDay()
                    ],

                horas:
                    minutosParaHora(
                        dados.minutos
                    ),

                extras:
                    minutosParaHora(
                        dados.minutosExtras
                    ),

                diaria:
                    numero(
                        dados.diaria
                    ),

                valorHoraExtra:
                    numero(
                        dados.valorHoraExtra
                    ),

                total:
                    calcularValorDia(
                        dados
                    )
            });
        }


        cursor.setDate(
            cursor.getDate() + 1
        );
    }


    gerarPDFDados(

        "Relatório por período",

        `${formatarData(dataInicial)} até ${formatarData(dataFinal)}`,

        dadosPeriodo,

        `controle-pagamentos-periodo-${inicio}-${fim}.pdf`
    );
}


/* =========================================================
   EVENTOS
========================================================= */


/*
   Mês atual
*/

document
    .getElementById("btnHoje")
    .addEventListener(
        "click",
        irParaMesAtual
    );


/*
   Mês anterior
*/

document
    .getElementById("btnMesAnterior")
    .addEventListener(
        "click",
        () => mudarMes(-1)
    );


/*
   Próximo mês
*/

document
    .getElementById("btnProximoMes")
    .addEventListener(
        "click",
        () => mudarMes(1)
    );


/*
   Salvar
*/

document
    .getElementById("btnSalvar")
    .addEventListener(
        "click",
        () => salvarDados(false)
    );


/*
   Limpar
*/

document
    .getElementById("btnLimpar")
    .addEventListener(
        "click",
        limparMes
    );


/*
   Aplicar diária
*/

document
    .getElementById("btnAplicarDiaria")
    .addEventListener(
        "click",
        aplicarDiariaTodos
    );


/*
   Aplicar hora extra
*/

document
    .getElementById("btnAplicarExtra")
    .addEventListener(
        "click",
        aplicarHoraExtraTodos
    );


/*
   Exportar backup
*/

document
    .getElementById("btnExportar")
    .addEventListener(
        "click",
        exportarBackup
    );


/*
   Abrir importação
*/

document
    .getElementById("btnImportar")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("arquivoBackup")
                .click();

        }
    );


/*
   Arquivo de backup
*/

document
    .getElementById("arquivoBackup")
    .addEventListener(
        "change",
        evento => {

            importarBackupArquivo(
                evento.target.files[0]
            );


            evento.target.value = "";

        }
    );


/*
   Tema
*/

if (btnTema) {

    btnTema.addEventListener(
        "click",
        alternarTema
    );
}


/*
   PDF mensal
*/

document
    .getElementById("btnPdfMes")
    .addEventListener(
        "click",
        gerarPdfMes
    );


/*
   PDF semanal
*/

document
    .getElementById("btnPdfSemana")
    .addEventListener(
        "click",
        gerarPdfSemana
    );


/*
   PDF por período
*/

document
    .getElementById("btnPdfPeriodo")
    .addEventListener(
        "click",
        gerarPdfPeriodo
    );


/* =========================================================
   MUDANÇA DE MÊS / ANO
========================================================= */

mesInput.addEventListener(
    "change",
    () => {

        salvarDados(true);

        atualizarTelaMes();

    }
);


anoInput.addEventListener(
    "change",
    () => {

        salvarDados(true);

        atualizarTelaMes();

    }
);


/* =========================================================
   DADOS GERAIS
========================================================= */

nomeInput.addEventListener(
    "input",
    () => salvarDados(true)
);


tipoPagamentoInput.addEventListener(
    "change",
    () => salvarDados(true)
);


/* =========================================================
   VALORES PADRÃO
========================================================= */

diariaPadraoInput.addEventListener(
    "change",
    () => salvarDados(true)
);


horaExtraPadraoInput.addEventListener(
    "change",
    () => salvarDados(true)
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function inicializar() {

    const agora =
        new Date();


    anoInput.value =
        agora.getFullYear();


    mesInput.value =
        agora.getMonth();


    carregarDados();

    carregarTema();

    definirDatasPeriodo();

    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();
}


inicializar();
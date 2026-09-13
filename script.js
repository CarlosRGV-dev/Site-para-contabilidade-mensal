/* =========================================================
   CONTROLE DE PAGAMENTOS
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
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


/* =========================================================
   ELEMENTOS
========================================================= */

const nomeInput = document.getElementById("nome");
const anoInput = document.getElementById("ano");
const mesInput = document.getElementById("mes");

const tipoPagamentoInput =
    document.getElementById("tipoPagamento");

const diariaPadraoInput =
    document.getElementById("diariaPadrao");

const horaExtraPadraoInput =
    document.getElementById("horaExtraPadrao");

const tabelaDias =
    document.getElementById("tabelaDias");

const diasMobile =
    document.getElementById("diasMobile");

const tituloCalendario =
    document.getElementById("tituloCalendario");

const semanasContainer =
    document.getElementById("semanasContainer");

const dataInicioInput =
    document.getElementById("dataInicio");

const dataFimInput =
    document.getElementById("dataFim");


/* =========================================================
   RESUMO
========================================================= */

const totalDiasElement =
    document.getElementById("totalDias");

const totalHorasElement =
    document.getElementById("totalHoras");

const totalHorasExtrasElement =
    document.getElementById("totalHorasExtras");

const totalDiariasElement =
    document.getElementById("totalDiarias");

const totalExtrasElement =
    document.getElementById("totalExtras");

const totalGeralElement =
    document.getElementById("totalGeral");


/* =========================================================
   ESTADO
========================================================= */

let dadosDias = {};


/* =========================================================
   UTILITÁRIOS
========================================================= */

function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function numero(valor) {

    const resultado = Number(valor);

    return isNaN(resultado) ? 0 : resultado;

}


function chaveMes() {

    return `${anoInput.value}-${mesInput.value}`;

}


function criarChaveDia(ano, mes, dia) {

    return `${ano}-${String(Number(mes) + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

}


function diasNoMes(ano, mes) {

    return new Date(
        ano,
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
   INICIALIZAÇÃO
========================================================= */

function inicializar() {

    const agora = new Date();

    anoInput.value = agora.getFullYear();
    mesInput.value = agora.getMonth();

    carregarDados();

    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();

}


/* =========================================================
   GERAR CALENDÁRIO
========================================================= */

function gerarCalendario() {

    const ano = numero(anoInput.value);
    const mes = numero(mesInput.value);

    if (!ano) {
        return;
    }

    tituloCalendario.textContent =
        `${MESES[mes]} de ${ano}`;

    tabelaDias.innerHTML = "";
    diasMobile.innerHTML = "";

    const quantidadeDias =
        diasNoMes(ano, mes);

    for (let dia = 1; dia <= quantidadeDias; dia++) {

        const data = new Date(
            ano,
            mes,
            dia
        );

        const diaSemana = data.getDay();

        const chave =
            criarChaveDia(ano, mes, dia);

        if (!dadosDias[chave]) {

            dadosDias[chave] = {
                trabalhou: false,
                horas: 0,
                horasExtras: 0,
                valorHoraExtra:
                    numero(horaExtraPadraoInput.value),
                diaria:
                    numero(diariaPadraoInput.value)
            };

        }

        const dados = dadosDias[chave];


        /* =================================================
           TABELA DESKTOP
        ================================================= */

        const tr = document.createElement("tr");

        if (!dados.trabalhou) {
            tr.classList.add("linha-nao-trabalhou");
        }

        let classeDia = "";

        if (diaSemana === 0) {
            classeDia = "dia-domingo";
        }

        if (diaSemana === 6) {
            classeDia = "dia-sabado";
        }

        tr.innerHTML = `

            <td>
                ${String(dia).padStart(2, "0")}/${String(mes + 1).padStart(2, "0")}/${ano}
            </td>

            <td class="${classeDia}">
                <strong>
                    ${DIAS_SEMANA[diaSemana]}
                </strong>
            </td>

            <td>
                <input
                    type="checkbox"
                    class="checkbox"
                    data-chave="${chave}"
                    data-campo="trabalhou"
                    ${dados.trabalhou ? "checked" : ""}
                >
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    step="0.5"
                    class="input-pequeno"
                    data-chave="${chave}"
                    data-campo="horas"
                    value="${dados.horas}"
                >
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    step="0.5"
                    class="input-pequeno"
                    data-chave="${chave}"
                    data-campo="horasExtras"
                    value="${dados.horasExtras}"
                >
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="input-dinheiro-dia"
                    data-chave="${chave}"
                    data-campo="valorHoraExtra"
                    value="${dados.valorHoraExtra}"
                >
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="input-dinheiro-dia"
                    data-chave="${chave}"
                    data-campo="diaria"
                    value="${dados.diaria}"
                >
            </td>

            <td class="total-dia">
                ${calcularTotalDia(dados)}
            </td>

        `;

        tabelaDias.appendChild(tr);


        /* =================================================
           CARD MOBILE
        ================================================= */

        const cardMobile =
            document.createElement("div");

        cardMobile.className =
            `dia-mobile ${
                dados.trabalhou
                    ? "trabalhado"
                    : "nao-trabalhado"
            }`;

        cardMobile.dataset.chave = chave;

        cardMobile.innerHTML = `

            <div class="dia-mobile-header">

                <div class="dia-mobile-data">

                    <span class="dia-mobile-numero">
                        ${String(dia).padStart(2, "0")}/${String(mes + 1).padStart(2, "0")}
                    </span>

                    <span class="dia-mobile-semana ${classeDia}">
                        ${DIAS_SEMANA[diaSemana]}
                    </span>

                </div>

                <label class="trabalhou-mobile">

                    <input
                        type="checkbox"
                        data-chave="${chave}"
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
                        type="number"
                        min="0"
                        step="0.5"
                        data-chave="${chave}"
                        data-campo="horas"
                        value="${dados.horas}"
                    >

                </div>


                <div class="dia-mobile-campo">

                    <label>
                        Horas extras
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        data-chave="${chave}"
                        data-campo="horasExtras"
                        value="${dados.horasExtras}"
                    >

                </div>


                <div class="dia-mobile-campo largo">

                    <label>
                        Valor por hora extra
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        data-chave="${chave}"
                        data-campo="valorHoraExtra"
                        value="${dados.valorHoraExtra}"
                    >

                </div>


                <div class="dia-mobile-campo largo">

                    <label>
                        Diária
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        data-chave="${chave}"
                        data-campo="diaria"
                        value="${dados.diaria}"
                    >

                </div>

            </div>


            <div class="dia-mobile-total">

                <span>
                    Total do dia
                </span>

                <strong class="total-mobile">
                    ${calcularTotalDia(dados)}
                </strong>

            </div>

        `;

        diasMobile.appendChild(cardMobile);

    }


    adicionarEventosTabela();

    adicionarEventosMobile();

}


/* =========================================================
   EVENTOS DA TABELA DESKTOP
========================================================= */

function adicionarEventosTabela() {

    const inputs =
        tabelaDias.querySelectorAll("input");

    inputs.forEach(input => {

        input.addEventListener(
            "input",
            alterarDia
        );

        input.addEventListener(
            "change",
            alterarDia
        );

    });

}


/* =========================================================
   EVENTOS DOS CARDS MOBILE
========================================================= */

function adicionarEventosMobile() {

    const inputs =
        diasMobile.querySelectorAll("input");

    inputs.forEach(input => {

        input.addEventListener(
            "input",
            alterarDiaMobile
        );

        input.addEventListener(
            "change",
            alterarDiaMobile
        );

    });

}


/* =========================================================
   ALTERAR DIA - DESKTOP
========================================================= */

function alterarDia(evento) {

    const input = evento.target;

    const chave = input.dataset.chave;
    const campo = input.dataset.campo;

    if (!dadosDias[chave]) {
        dadosDias[chave] = {};
    }

    if (campo === "trabalhou") {

        dadosDias[chave][campo] =
            input.checked;

    } else {

        dadosDias[chave][campo] =
            numero(input.value);

    }

    atualizarLinha(input);

    atualizarCardMobile(chave);

    atualizarResumo();

    gerarResumoSemanal();

    salvarDados(false);

}


/* =========================================================
   ALTERAR DIA - MOBILE
========================================================= */

function alterarDiaMobile(evento) {

    const input = evento.target;

    const chave = input.dataset.chave;
    const campo = input.dataset.campo;

    if (!dadosDias[chave]) {
        dadosDias[chave] = {};
    }

    if (campo === "trabalhou") {

        dadosDias[chave][campo] =
            input.checked;

    } else {

        dadosDias[chave][campo] =
            numero(input.value);

    }

    atualizarCardMobile(chave);

    atualizarLinhaDesktop(chave);

    atualizarResumo();

    gerarResumoSemanal();

    salvarDados(false);

}


/* =========================================================
   ATUALIZAR LINHA DESKTOP
========================================================= */

function atualizarLinha(input) {

    const linha =
        input.closest("tr");

    const chave =
        input.dataset.chave;

    atualizarLinhaDesktop(chave, linha);

}


function atualizarLinhaDesktop(chave, linhaInformada = null) {

    const dados =
        dadosDias[chave];

    if (!dados) {
        return;
    }

    const linha =
        linhaInformada ||
        tabelaDias.querySelector(
            `tr input[data-chave="${chave}"]`
        )?.closest("tr");

    if (!linha) {
        return;
    }

    const total =
        linha.querySelector(".total-dia");

    if (total) {

        total.textContent =
            calcularTotalDia(dados);

    }

    if (dados.trabalhou) {

        linha.classList.remove(
            "linha-nao-trabalhou"
        );

    } else {

        linha.classList.add(
            "linha-nao-trabalhou"
        );

    }

}


/* =========================================================
   ATUALIZAR CARD MOBILE
========================================================= */

function atualizarCardMobile(chave) {

    const card =
        diasMobile.querySelector(
            `.dia-mobile[data-chave="${chave}"]`
        );

    if (!card) {
        return;
    }

    const dados =
        dadosDias[chave];

    const total =
        card.querySelector(".total-mobile");

    if (total) {

        total.textContent =
            calcularTotalDia(dados);

    }

    if (dados.trabalhou) {

        card.classList.add("trabalhado");

        card.classList.remove(
            "nao-trabalhado"
        );

    } else {

        card.classList.remove(
            "trabalhado"
        );

        card.classList.add(
            "nao-trabalhado"
        );

    }

}


/* =========================================================
   CÁLCULO DO DIA
========================================================= */

function calcularTotalDia(dados) {

    if (!dados.trabalhou) {
        return dinheiro(0);
    }

    const diaria =
        numero(dados.diaria);

    const horasExtras =
        numero(dados.horasExtras);

    const valorHoraExtra =
        numero(dados.valorHoraExtra);

    const totalExtras =
        horasExtras * valorHoraExtra;

    return dinheiro(
        diaria + totalExtras
    );

}


/* =========================================================
   ATUALIZAR RESUMO
========================================================= */

function atualizarResumo() {

    const ano = numero(anoInput.value);
    const mes = numero(mesInput.value);

    const quantidadeDias =
        diasNoMes(ano, mes);

    let diasTrabalhados = 0;
    let horasTrabalhadas = 0;
    let horasExtras = 0;
    let totalDiarias = 0;
    let totalExtras = 0;

    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const chave =
            criarChaveDia(ano, mes, dia);

        const dados =
            dadosDias[chave];

        if (!dados) {
            continue;
        }

        if (dados.trabalhou) {

            diasTrabalhados++;

            horasTrabalhadas +=
                numero(dados.horas);

            horasExtras +=
                numero(dados.horasExtras);

            totalDiarias +=
                numero(dados.diaria);

            totalExtras +=
                numero(dados.horasExtras) *
                numero(dados.valorHoraExtra);

        }

    }

    const totalGeral =
        totalDiarias + totalExtras;

    totalDiasElement.textContent =
        diasTrabalhados;

    totalHorasElement.textContent =
        `${horasTrabalhadas}h`;

    totalHorasExtrasElement.textContent =
        `${horasExtras}h`;

    totalDiariasElement.textContent =
        dinheiro(totalDiarias);

    totalExtrasElement.textContent =
        dinheiro(totalExtras);

    totalGeralElement.textContent =
        dinheiro(totalGeral);

}


/* =========================================================
   SALVAR DADOS
========================================================= */

function salvarDados(mostrarMensagem = true) {

    const banco =
        JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

    const chave =
        chaveMes();

    banco[chave] = {

        nome: nomeInput.value,

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

    if (mostrarMensagem) {

        alert(
            "Dados salvos com sucesso!"
        );

    }

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

function carregarDados() {

    const banco =
        JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

    const chave =
        chaveMes();

    if (!banco[chave]) {

        dadosDias = {};

        return;

    }

    const dados =
        banco[chave];

    nomeInput.value =
        dados.nome || "";

    tipoPagamentoInput.value =
        dados.tipoPagamento || "mensal";

    diariaPadraoInput.value =
        dados.diariaPadrao || 0;

    horaExtraPadraoInput.value =
        dados.horaExtraPadrao || 0;

    dadosDias =
        dados.dias || {};

}


/* =========================================================
   MUDAR MÊS
========================================================= */

function mudarMes() {

    salvarDados(false);

    carregarDados();

    gerarCalendario();

    atualizarResumo();

    gerarResumoSemanal();

}


/* =========================================================
   APLICAR VALORES PADRÃO
========================================================= */

diariaPadraoInput.addEventListener(
    "change",
    function() {

        const valor =
            numero(this.value);

        const confirmar =
            confirm(
                "Deseja aplicar este valor de diária a todos os dias do mês?"
            );

        if (!confirmar) {
            return;
        }

        Object.keys(dadosDias).forEach(chave => {

            dadosDias[chave].diaria =
                valor;

        });

        gerarCalendario();

        atualizarResumo();

        gerarResumoSemanal();

        salvarDados(false);

    }
);


horaExtraPadraoInput.addEventListener(
    "change",
    function() {

        const valor =
            numero(this.value);

        const confirmar =
            confirm(
                "Deseja aplicar este valor de hora extra a todos os dias do mês?"
            );

        if (!confirmar) {
            return;
        }

        Object.keys(dadosDias).forEach(chave => {

            dadosDias[chave].valorHoraExtra =
                valor;

        });

        gerarCalendario();

        atualizarResumo();

        gerarResumoSemanal();

        salvarDados(false);

    }
);


/* =========================================================
   RESUMO SEMANAL
========================================================= */

function gerarResumoSemanal() {

    const ano =
        numero(anoInput.value);

    const mes =
        numero(mesInput.value);

    semanasContainer.innerHTML = "";

    const quantidadeDias =
        diasNoMes(ano, mes);

    const semanas = {};

    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const data =
            new Date(
                ano,
                mes,
                dia
            );

        const indiceSemana =
            (data.getDay() + 6) % 7;

        const segunda =
            new Date(data);

        segunda.setDate(
            data.getDate() -
            indiceSemana
        );

        const chave =
            dataParaInput(segunda);

        if (!semanas[chave]) {

            semanas[chave] = {
                inicio: segunda,
                dias: []
            };

        }

        semanas[chave].dias.push(data);

    }


    Object.values(semanas).forEach(
        (semana, index) => {

            let diasTrabalhados = 0;
            let horas = 0;
            let extras = 0;
            let total = 0;

            semana.dias.forEach(data => {

                const chave =
                    criarChaveDia(
                        data.getFullYear(),
                        data.getMonth(),
                        data.getDate()
                    );

                const dados =
                    dadosDias[chave];

                if (!dados || !dados.trabalhou) {
                    return;
                }

                diasTrabalhados++;

                horas +=
                    numero(dados.horas);

                extras +=
                    numero(dados.horasExtras);

                total +=
                    numero(dados.diaria) +
                    (
                        numero(dados.horasExtras) *
                        numero(dados.valorHoraExtra)
                    );

            });


            const fim =
                new Date(semana.inicio);

            fim.setDate(
                semana.inicio.getDate() + 6
            );


            const card =
                document.createElement("div");

            card.className =
                "semana-card";

            card.innerHTML = `

                <h3>
                    Semana ${index + 1}
                </h3>

                <div class="datas">
                    ${formatarData(semana.inicio)}
                    →
                    ${formatarData(fim)}
                </div>

                <div class="semana-info">
                    <span>Dias trabalhados</span>
                    <strong>${diasTrabalhados}</strong>
                </div>

                <div class="semana-info">
                    <span>Horas</span>
                    <strong>${horas}h</strong>
                </div>

                <div class="semana-info">
                    <span>Horas extras</span>
                    <strong>${extras}h</strong>
                </div>

                <div class="semana-total">
                    ${dinheiro(total)}
                </div>

            `;

            semanasContainer.appendChild(card);

        }
    );

}


/* =========================================================
   GERAR PDF
========================================================= */

function obterDadosPeriodo(dataInicio, dataFim) {

    const registros = [];

    let dataAtual =
        new Date(dataInicio);

    const fim =
        new Date(dataFim);

    while (dataAtual <= fim) {

        const ano =
            dataAtual.getFullYear();

        const mes =
            dataAtual.getMonth();

        const dia =
            dataAtual.getDate();

        const chave =
            criarChaveDia(
                ano,
                mes,
                dia
            );

        const dados =
            dadosDias[chave];

        if (dados) {

            registros.push({

                data:
                    new Date(dataAtual),

                dados

            });

        }

        dataAtual.setDate(
            dataAtual.getDate() + 1
        );

    }

    return registros;

}


/* =========================================================
   PDF DO MÊS
========================================================= */

function gerarPdfMes() {

    const ano =
        numero(anoInput.value);

    const mes =
        numero(mesInput.value);

    const primeiroDia =
        new Date(
            ano,
            mes,
            1
        );

    const ultimoDia =
        new Date(
            ano,
            mes,
            diasNoMes(ano, mes)
        );

    gerarPdf(
        primeiroDia,
        ultimoDia,
        `Mês de ${MESES[mes]} de ${ano}`
    );

}


/* =========================================================
   PDF SEMANAL
========================================================= */

function gerarPdfSemanal() {

    const dataSelecionada =
        prompt(
            "Digite o número do dia da semana que deseja consultar.\n\n" +
            "Exemplo: 10 para a semana que contém o dia 10."
        );

    if (!dataSelecionada) {
        return;
    }

    const dia =
        numero(dataSelecionada);

    const ano =
        numero(anoInput.value);

    const mes =
        numero(mesInput.value);

    const data =
        new Date(
            ano,
            mes,
            dia
        );

    if (
        data.getMonth() !== mes ||
        data.getFullYear() !== ano
    ) {

        alert(
            "Digite um dia válido deste mês."
        );

        return;

    }

    const indice =
        (data.getDay() + 6) % 7;

    const inicio =
        new Date(data);

    inicio.setDate(
        data.getDate() - indice
    );

    const fim =
        new Date(inicio);

    fim.setDate(
        inicio.getDate() + 6
    );

    gerarPdf(
        inicio,
        fim,
        `Semana de ${formatarData(inicio)} a ${formatarData(fim)}`
    );

}


/* =========================================================
   PDF POR PERÍODO
========================================================= */

function gerarPdfPeriodo() {

    if (
        !dataInicioInput.value ||
        !dataFimInput.value
    ) {

        alert(
            "Informe a data inicial e a data final."
        );

        return;

    }

    const inicio =
        new Date(
            `${dataInicioInput.value}T00:00:00`
        );

    const fim =
        new Date(
            `${dataFimInput.value}T00:00:00`
        );

    if (inicio > fim) {

        alert(
            "A data inicial não pode ser maior que a data final."
        );

        return;

    }

    gerarPdfPeriodoCompleto(
        inicio,
        fim
    );

}


/* =========================================================
   PDF PRINCIPAL
========================================================= */

function gerarPdf(
    inicio,
    fim,
    tituloPeriodo
) {

    const registros =
        obterDadosPeriodo(
            inicio,
            fim
        );

    criarPDF(
        registros,
        tituloPeriodo
    );

}


/* =========================================================
   PDF PERÍODO ATRAVESSANDO MESES
========================================================= */

function gerarPdfPeriodoCompleto(
    inicio,
    fim
) {

    const registros = [];

    let data =
        new Date(inicio);

    while (data <= fim) {

        const ano =
            data.getFullYear();

        const mes =
            data.getMonth();

        const chaveMesAtual =
            `${ano}-${mes}`;

        const banco =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

        const dadosMes =
            banco[chaveMesAtual];

        if (dadosMes) {

            const chave =
                criarChaveDia(
                    ano,
                    mes,
                    data.getDate()
                );

            const dados =
                dadosMes.dias?.[chave];

            if (dados) {

                registros.push({

                    data:
                        new Date(data),

                    dados

                });

            }

        }

        data.setDate(
            data.getDate() + 1
        );

    }

    criarPDF(
        registros,
        `Período de ${formatarData(inicio)} a ${formatarData(fim)}`
    );

}


/* =========================================================
   CRIAR PDF
========================================================= */

function criarPDF(
    registros,
    tituloPeriodo
) {

    if (!window.jspdf) {

        alert(
            "A biblioteca de PDF não foi carregada. Verifique sua conexão com a internet."
        );

        return;

    }

    const {
        jsPDF
    } = window.jspdf;

    const pdf =
        new jsPDF(
            "landscape"
        );


    const nome =
        nomeInput.value.trim() ||
        "Não informado";


    pdf.setFontSize(18);

    pdf.text(
        "Controle de Pagamentos",
        14,
        18
    );


    pdf.setFontSize(11);

    pdf.text(
        `Nome: ${nome}`,
        14,
        27
    );

    pdf.text(
        tituloPeriodo,
        14,
        34
    );


    const linhas = [];

    let totalDias = 0;
    let totalHoras = 0;
    let totalHorasExtras = 0;
    let totalDiarias = 0;
    let totalExtras = 0;


    registros.forEach(registro => {

        const dados =
            registro.dados;

        if (!dados.trabalhou) {
            return;
        }

        const diaria =
            numero(dados.diaria);

        const horas =
            numero(dados.horas);

        const horasExtras =
            numero(dados.horasExtras);

        const valorHoraExtra =
            numero(dados.valorHoraExtra);

        const valorExtras =
            horasExtras *
            valorHoraExtra;

        const total =
            diaria +
            valorExtras;


        totalDias++;

        totalHoras += horas;

        totalHorasExtras +=
            horasExtras;

        totalDiarias +=
            diaria;

        totalExtras +=
            valorExtras;


        linhas.push([

            formatarData(registro.data),

            DIAS_SEMANA[
                registro.data.getDay()
            ],

            `${horas}h`,

            `${horasExtras}h`,

            dinheiro(valorHoraExtra),

            dinheiro(diaria),

            dinheiro(valorExtras),

            dinheiro(total)

        ]);

    });


    pdf.autoTable({

        startY: 42,

        head: [[

            "Data",
            "Dia",
            "Horas",
            "Horas extras",
            "Valor/h extra",
            "Diária",
            "Total extras",
            "Total do dia"

        ]],

        body: linhas,

        theme: "grid",

        styles: {
            fontSize: 8,
            cellPadding: 4
        },

        headStyles: {
            fontStyle: "bold"
        }

    });


    let y =
        pdf.lastAutoTable.finalY + 12;


    pdf.setFontSize(11);

    pdf.text(
        `Dias trabalhados: ${totalDias}`,
        14,
        y
    );

    y += 7;

    pdf.text(
        `Horas trabalhadas: ${totalHoras}h`,
        14,
        y
    );

    y += 7;

    pdf.text(
        `Horas extras: ${totalHorasExtras}h`,
        14,
        y
    );

    y += 7;

    pdf.text(
        `Total das diárias: ${dinheiro(totalDiarias)}`,
        14,
        y
    );

    y += 7;

    pdf.text(
        `Total de horas extras: ${dinheiro(totalExtras)}`,
        14,
        y
    );

    y += 10;


    pdf.setFontSize(14);

    pdf.text(
        `TOTAL A RECEBER: ${dinheiro(
            totalDiarias + totalExtras
        )}`,
        14,
        y
    );


    const dataArquivo =
        new Date()
            .toISOString()
            .split("T")[0];


    pdf.save(
        `controle-pagamentos-${dataArquivo}.pdf`
    );

}


/* =========================================================
   BOTÃO HOJE
========================================================= */

document
    .getElementById("btnHoje")
    .addEventListener(
        "click",
        function() {

            const agora =
                new Date();

            anoInput.value =
                agora.getFullYear();

            mesInput.value =
                agora.getMonth();

            carregarDados();

            gerarCalendario();

            atualizarResumo();

            gerarResumoSemanal();

        }
    );


/* =========================================================
   BOTÃO SALVAR
========================================================= */

document
    .getElementById("btnSalvar")
    .addEventListener(
        "click",
        function() {

            salvarDados(true);

        }
    );


/* =========================================================
   BOTÃO LIMPAR
========================================================= */

document
    .getElementById("btnLimpar")
    .addEventListener(
        "click",
        function() {

            const confirmar =
                confirm(
                    "Tem certeza que deseja apagar todos os registros deste mês?"
                );

            if (!confirmar) {
                return;
            }

            const ano =
                numero(anoInput.value);

            const mes =
                numero(mesInput.value);

            const quantidadeDias =
                diasNoMes(ano, mes);

            for (
                let dia = 1;
                dia <= quantidadeDias;
                dia++
            ) {

                const chave =
                    criarChaveDia(
                        ano,
                        mes,
                        dia
                    );

                delete dadosDias[chave];

            }

            salvarDados(false);

            gerarCalendario();

            atualizarResumo();

            gerarResumoSemanal();

        }
    );


/* =========================================================
   BOTÕES PDF
========================================================= */

document
    .getElementById("btnPdfMes")
    .addEventListener(
        "click",
        gerarPdfMes
    );


document
    .getElementById("btnPdfSemana")
    .addEventListener(
        "click",
        gerarPdfSemanal
    );


document
    .getElementById("btnPdfPeriodo")
    .addEventListener(
        "click",
        gerarPdfPeriodo
    );


/* =========================================================
   MUDANÇAS DE ANO / MÊS
========================================================= */

anoInput.addEventListener(
    "change",
    mudarMes
);

mesInput.addEventListener(
    "change",
    mudarMes
);


/* =========================================================
   INFORMAÇÕES GERAIS
========================================================= */

nomeInput.addEventListener(
    "input",
    function() {

        salvarDados(false);

    }
);


tipoPagamentoInput.addEventListener(
    "change",
    function() {

        salvarDados(false);

    }
);


/* =========================================================
   INICIAR SISTEMA
========================================================= */

inicializar();
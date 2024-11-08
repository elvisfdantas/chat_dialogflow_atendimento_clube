import AgendamentoDAO from "../DB/AgendamentoDAO.js";

export default class Agendamento{
    #id;
    #dataatendimento;
    #dataagendamento;
    #nome;
    #telefone;
    #endereco;
    #locais;

    constructor(id=0, dataatendimento, dataagendamento, nome, telefone, endereco, locais) {
        this.#id = id;
        this.#dataatendimento = dataatendimento;
        this.#dataagendamento = dataagendamento;
        this.#nome = nome;
        this.#telefone = telefone;
        this.#endereco = endereco;
        this.#locais = locais;
    }

    // Getters
    get id() {
        return this.#id;
    }

    get dataatendimento() {
        return this.#dataatendimento;
    }

    get dataagendamento() {
        return this.#dataagendamento;
    }

    get nome() {
        return this.#nome;
    }

    get telefone() {
        return this.#telefone;
    }

    get endereco() {
        return this.#endereco;
    }

    get locais() {
        return this.#locais;
    }

    // Setters
    set id(id) {
        this.#id = id;
    }

    set dataatendimento(dataatendimento) {
        this.#dataatendimento = dataatendimento;
    }

    set dataagendamento(dataagendamento) {
        this.#dataagendamento = dataagendamento;
    }

    set nome(nome) {
        this.#nome = nome;
    }

    set telefone(telefone) {
        this.#telefone = telefone;
    }

    set endereco(endereco) {
        this.#endereco = endereco;
    }

    set locais(locais) {
        this.#locais = locais;
    }

    // Método toJSON
    toJSON() {
        return {
            id: this.#id,
            dataatendimento: this.#dataatendimento,
            dataagendamento: this.#dataagendamento,
            nome: this.#nome,
            telefone: this.#telefone,
            endereco: this.#endereco,
            locais: this.#locais
        };
    }

    async gravar(){
        const agendamentoDAO = new AgendamentoDAO();
        await agendamentoDAO.gravar(this);
    }
}
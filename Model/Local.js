import AgendamentoDAO from "../DB/AgendamentoDAO.js";
import LocalDAO from "../DB/LocalDAO.js"

export default class Local{
    #id
    #nome
  

    constructor(id=0,nome){
        this.#id=id;
        this.#nome=nome;

    }

    get id(){
        return this.#id;
    }
    
    set id(novoId){
        this.#id = novoId;
    }

    get nome(){
        return this.#nome
    }

    set nome(novoNome){
        this.#nome = novoNome
    }


    //override 
    toJSON(){
        return {
            id:this.#id,
            nome:this.#nome,
            
        }

    }

    async gravar(){
        const localDAO = new LocalDAO();
        await localDAO.gravar(this);
    }
    async alterar(){
        const localDAO = new LocalDAO();
        await localDAO.alterar(this);
    }

    async excluir(){
        const localDAO = new LocalDAO();
        await localDAO.excluir(this);
    }

    async consultar(termoBusca){
        const localDAO = new LocalDAO();
        return await localDAO.consultar(termoBusca);
    }

    async reservado(data){
        const agendamentoDAO = new AgendamentoDAO()
        const localDAO = new LocalDAO();
        return await localDAO.reservado(data, this.#id);
    }

}

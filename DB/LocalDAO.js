import Local from '../Model/Local.js';
import conectar from './Conexao.js';

export default class LocalDAO {

    constructor(){
        this.init();
    }

    async init() {
        try {
            //criar a tabela serviço caso ela não exista
            const sql = ` CREATE TABLE IF NOT EXISTS local(
            id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            nome VARCHAR(100) NOT NULL
        )
        `
            const conexao = await conectar();
            await conexao.execute(sql);
            console.log("Tabela Locais iniciada com sucesso!");
        }catch(erro){
            console.log("Não foi possível iniciar a tabela locais: " + erro.message);
        }

    }

    async gravar(local) {
        if (local instanceof Local) {
            const sql = `INSERT INTO local(nome)
                        VALUES (?)`;
            const parametros = [local.nome]
            const conexao = await conectar();
            const resultado = await conexao.execute(sql, parametros);
            local.id = resultado[0].insertId;
        }
    }

    async alterar(local) {
        if (local instanceof Local) {
            const sql = `UPDATE local SET  nome = ? 
                        WHERE id = ?`;
            const parametros = [local.nome,
            local.id];
            const conexao = await conectar();
            await conexao.execute(sql, parametros);
        }
    }

    async excluir(local) {
        if (local instanceof Local) {
            const sql = `DELETE FROM local  WHERE id = ?`;
            const parametros = [local.id];
            const conexao = await conectar();
            await conexao.execute(sql, parametros);
        }
    }

    async consultar(termoBusca) {
        if (!termoBusca){
            termoBusca='';
        }
        const sql = "SELECT * FROM local WHERE nome LIKE ? order by nome";
        const parametros = ["%" + termoBusca + "%"]
        const conexao = await conectar();
        const [registros, campos] = await conexao.query(sql,parametros);
        let listaLocal=[];
        for (const registro of registros){
            const local = new Local(registro['id'],
                                        registro['nome']
                                        );
                
            listaLocal.push(local);
        }
        return listaLocal;
    }
    async reservado(data, localid) {
        const sql = "SELECT 1 FROM agendamento_local al"+
                    " join agendamento a ON a.id = al.agendamentoid"+
                    " WHERE al.localid = ? AND a.dataagendamento = ? limit 1";
        const parametros = [data, localid]
        const conexao = await conectar();
        const [registros, campos] = await conexao.query(sql,parametros);
        if (registros.length>0){
            return true
        }
        return false

        }
}
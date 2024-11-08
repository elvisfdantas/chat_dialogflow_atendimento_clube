import Agendamento from "../Model/Agendamento.js";
import Local from "../Model/Local.js";
import conectar from "./Conexao.js";

export default class AgendamentoDAO {
    async init() {
        try {
            const conexao = await conectar();
            const sql = `
                CREATE TABLE IF NOT EXISTS agendamento(
                    id int not null primary key auto_increment,
                    dataatendimento date not null,
                    dataagendamento date not null,
                    nome varchar(200),
                    telefone varchar(50),
                    endereco varchar(200)
                );
                CREATE TABLE IF NOT EXISTS agendamento_local(
                    agendamentoid int not null,
                    localid int not null, 
                    foreign key (localid) references local(id),
                    foreign key (agendamentoid) references agendamento(id)
                )
            `;
            await conexao.execute(sql);
            conexao.release();
            console.log("Tabela Agendamento criado")

        }
        catch (erro) {
            console.log("Erro ao criar a Tabela Agendamento")

        }
    }
    async gravar(agendamento) {
        if (agendamento instanceof Agendamento) {
            try {
                const conexao = await conectar();
                conexao.beginTransaction();
                //inserir o agendamento na tabela
                const sqlAgendamento = "INSERT INTO agendamento(dataatendimento, dataagendamento, nome, telefone, endereco) VALUES(?,?,?,?,?)";
                const dataatendimento = new Date();
                let parametros = [dataatendimento.toLocaleDateString(), agendamento.dataagendamento, agendamento.nome, agendamento.telefone, agendamento.endereco];
                const resultado = await conexao.execute(sqlAgendamento, parametros);
                agendamento.id = resultado[0].insertId;
                for (const local of agendamento.locais) {
                    const sqlLocal = "INSERT INTO agendamento_local(agendamentoid, localid) VALUES(?,?)"
                    parametros = [agendamento.id, local.id];
                    conexao.execute(sqlLocal, parametros);
                }
                conexao.commit();
                conexao.release();
            }
            catch (erro) {
                if (conexao){
                    conexao.rollback();
                }
            }
            
        }

    }
    async consultar(id) {
        
            try {
                const conexao = await conectar();
                //inserir o agendamento na tabela
                const sqlAgendamento = "SELECT * FROM Agendamento WHERE id = ?";
                let parametros = [id];
                const [resultado, c] = await conexao.query(sqlAgendamento, parametros);
                let agendamento = null
                if(resultado.length > 0){
                    agendamento = new Agendamento(id, resultado[0].dataatendimento, resultado[0].dataagendamento, resultado[0].nome, resultado[0].telefone, resultado[0].endereco, [])
                    const sqlLocais = "SELECT l.* FROM Local l JOIN agendamento_local al ON al.localid = l.id WHERE al.agendamentoid = ?"
                    const [locais, campos] = await conexao.query(sqlLocais, parametros)
                    for (let local of locais){
                        const localM = new Local(local.id, local.nome)
                        agendamento.locais.push(localM)

                    }
                }
                conexao.release();
                return agendamento
            }
            catch (erro) {
                console.error(erro)
                if (conexao){
                    conexao.rollback();
                }
            }
            

    }
}
import Local from "../Model/Local.js";

export default class LocalCtrl {
    //traduzir comandos http em ações negociais
    //Conceito REST 
    //Considerar o protocolo HTTP 

    gravar(requisicao, resposta) {
        if (requisicao.method == "POST" &&
            requisicao.is("application/json")) {
            const dados = requisicao.body;
            //pseudo validação
            if (dados.nome) {
                const local = new Local(0,dados.nome);

                local.gravar().then(() => {
                    resposta.status(201).json({
                        "status": true,
                        "mensagem": "Local gravada com sucesso!",
                        "id": local.id
                    });
                }).catch((erro) => {
                    resposta.status(500).json({
                        "status": false,
                        "mensagem": "Erro ao registrar o local: " + erro.message,
                    });
                })
            }
            else {
                resposta.status(400).json({
                    "status": false,
                    "mensagem": "Informe todos os dados necessários conforme documentação!"
                });
            }

        }
        else {
            resposta.status(405).json({
                "status": false,
                "mensagem": "Formato não permitido!"
            });
        }
    }


    alterar(requisicao, resposta) {
        if ((requisicao.method == "PUT" || requisicao.method == "PATCH")
            && requisicao.is("application/json")) {
            const dados = requisicao.body;
            //pseudo validação
            if (dados.id > 0 && dados.nome) {
                const local = new Local(dados.id, dados.nome);

                local.alterar().then(() => {
                    resposta.status(200).json({
                        "status": true,
                        "mensagem": "Local alterado com sucesso!",
                    });
                }).catch((erro) => {
                    resposta.status(500).json({
                        "status": false,
                        "mensagem": "Erro ao alterar o local: " + erro.message,
                    });
                })
            }
            else {
                resposta.status(400).json({
                    "status": false,
                    "mensagem": "Informe todos os dados necessários conforme documentação!"
                });
            }
        }
        else {
            resposta.status(405).json({
                "status": false,
                "mensagem": "Formato não permitido!"
            });
        }
    }

    excluir(requisicao, resposta) {
        if (requisicao.method == "DELETE" && requisicao.is("application/json")) {
            const id = requisicao.params.id; //o id deve ser informado na url
            //pseudo validação
            if (id > 0) {
                const local = new Local(id);

                local.excluir().then(() => {
                    resposta.status(200).json({
                        "status": true,
                        "mensagem": "Local excluído com sucesso!",
                    });
                }).catch((erro) => {
                    resposta.status(500).json({
                        "status": false,
                        "mensagem": "Erro ao excluir o local: " + erro.message,
                    });
                })
            }
            else {
                resposta.status(400).json({
                    "status": false,
                    "mensagem": "Informe o id na url!"
                });
            }
        }
        else {
            resposta.status(405).json({
                "status": false,
                "mensagem": "Formato não permitido!"
            });
        }
    }

    consultar(requisicao, resposta) {
        const termoBusca = requisicao.params.local;
        if (requisicao.method == "GET") {
            const local = new Local(0);
            local.consultar(termoBusca).then((listaLocal) => {
                resposta.status(200).json({
                    "status": true,
                    "listaLocal": listaLocal
                });
            }).catch((erro) => {
                console.error(erro)
                resposta.status(500).json({
                    "status": false,
                    "mensagem": "Não foi possível recuperar os locais: " + erro.message,
                });
            })
        }
        else {
            resposta.status(405).json({
                "status": false,
                "mensagem": "Método não permitido!"
            });
        }
    }
}
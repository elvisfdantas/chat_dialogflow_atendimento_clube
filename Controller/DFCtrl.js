import AgendamentoDAO from "../DB/AgendamentoDAO.js";
import { obterCardsServicos } from "../DialogFlow/funcoes.js";
import Agendamento from "../Model/Agendamento.js";
import Chamado from "../Model/Agendamento.js";
import Local from "../Model/Local.js";

export default class DFController {

    async processarIntencoes(req, resp) {
        if (req.method == "POST" && req.is("application/json")) {
            const dados = req.body;
            const intencao = dados.queryResult.intent.displayName;
            //identificar a origem da requisição (custom ou messenger)
            //verificar a existência do atributo source
            const origem = dados?.originalDetectIntentRequest?.source;
            let resposta;
            switch (intencao) {
                case 'Default Welcome Intent':
                    resposta = await exibirMenu(origem);
                    break;

                case 'SelecaoLocal':
                    resposta = await processarEscolha(dados, origem);
                    break;
                
                case 'dataAgendamento':
                    resposta = await salvarDataAgendamento(dados, origem);
                    break;
                
                case 'ColetaDadosSocios':
                    resposta = await registrarLocal(dados, origem);
                    break;
                case 'acompanhamentoReserva':
                    resposta = await consultarReserva(dados, origem)    

            }
            resp.json(resposta);
        }

    } //fim processar intenções

}

async function exibirMenu(tipo = '') {
    let resposta = {
        "fulfillmentMessages": []
    };

    if (tipo) {
        tipo = 'custom';
    }

    try {
        let cards = await obterCardsServicos(tipo);

        if (tipo == 'custom') {
            resposta['fulfillmentMessages'].push({
                "text": {
                    "text": ["Seja bem-vindo ao Atendimento do Clube.\n",
                        "Nosso horário de atendimento é de segunda a sexta-feira  das 08h00 as 22h00.\n",
                        "Sábado das 08hs as 22h00 e domingo das 14h00 as 20h00.\n",
                        "Estamos preparados para te ajudar com os seguintes atendimentos:\n"
                    ]
                }
            });
            resposta['fulfillmentMessages'].push(...cards);
            resposta['fulfillmentMessages'].push({
                "text": {
                    "text": ["Por favor nos informe o que você deseja."]
                }
            });
            return resposta;
        }
        else {
            //formato de resposta para o ambiente messenger

            resposta.fulfillmentMessages.push({
                "payload": {
                    "richContent": [[{
                        "type": "description",
                        "title": "Seja bem-vindo ao Atendimento do Clube.\n",
                        "text": [
                            "Nosso horário de atendimento é de segunda a sexta-feira  das 08h00 as 22h00.\n",
                            "Sábado das 08hs as 22h00 e domingo das 14h00 as 20h00.\n",
                            "Estamos preparados para te ajudar com os seguintes atendimentos:\n"
                        ]
                    }]]
                }
            });
            //adicionando os cards de serviços
            resposta['fulfillmentMessages'][0]['payload']['richContent'][0].push(...cards);

            resposta['fulfillmentMessages'][0]['payload']['richContent'][0].push({
                "type": "description",
                "title": "Por favor nos informe o que você deseja.",
                "text": []
            });
            return resposta;
        }
    }
    catch (erro) {
        console.error(erro)
        if (tipo == 'custom') {
            resposta['fulfillmentMessages'].push({
                "text": {
                    "text": ["Não foi possível recuperar a lista dos serviços disponíveis.",
                        "Descupe-nos pelo transtorno!",
                        "Entre em contato conosco por telefone ☎ (18) 3265-0000."
                    ]
                }
            });
        }
        else { //formato de mensagem para messenger
            resposta.fulfillmentMessages.push({
                "payload": {
                    "richContent": [[{
                        "type": "description",
                        "title": "Não foi possível recuperar a lista dos serviços disponíveis. \n",
                        "text": [
                            "Descupe-nos pelo transtorno!\n",
                            "Entre em contato conosco por telefone ☎ (18) 3265-1010.\n"
                        ]
                    }]]
                }
            });
        }//fim else
        return resposta;
    }

}

async function processarEscolha(dados, origem) {

    let resposta = {
        "fulfillmentMessages": []
    };

    const sessao = dados.session.split('/').pop();
    
    if (!global.dados[sessao].locais) {
        global.dados[sessao].locais = []
    }
    
    let locaisSelecionados = dados.queryResult.parameters.Local
    

    let listaMensagens = [];
    for (const localSelecionado of locaisSelecionados) {
        const local = new Local();
        const resultado = await local.consultar(localSelecionado);
        if (resultado.length > 0) {
            let data = global.dados[sessao].data
            local.id=resultado[0].id
            local.nome=resultado[0].nome
            const reservado = await local.reservado(data)
            if (reservado){
                listaMensagens.push(`❌ ${local} Esse local já esta reservado! \n`);
            }
            else{
                global.dados[sessao]['locais'].push(local);
                listaMensagens.push(`✅ ${local} registrado com sucesso! \n`);
            }
                    
        }
        else {
            listaMensagens.push(`❌ O ${local} não existe!\n`);
        }
    }

    listaMensagens.push('Quer reservar outro local?\n')

    if (origem) {
        resposta['fulfillmentMessages'].push({
            "text": {
                "text": [...listaMensagens]
            }
        })
    }
    else {
        resposta.fulfillmentMessages.push({
            "payload": {
                "richContent": [[{
                    "type": "description",
                    "title": "",
                    "text": [...listaMensagens]
                }]]
            }
        });
    }

    return resposta;
}

async function registrarLocal(dados, origem) {
    const sessao = dados.session.split('/').pop();
    //Fique atento, será necessário recuperar o usuário identificado na sessão
    //simulando a existência de um usuário cadastrado....
    const usuario = {
        "cpf": "1231.456.789-10"
    }
    let listaDeLocal = [];
    const locaisSelecionados = global.dados[sessao]['locais'];
    let data = global.dados[sessao].data
    const localM = new Local();
    for (const local of locaisSelecionados) {
        const busca = await localM.consultar(local.nome);
        if (busca.length > 0) {
            listaDeLocal.push(busca[0]); //primeiro serviço da lista 
        }
    }
    let nome = dados.queryResult.parameters.Nome
    let telefone = dados.queryResult.parameters.Telefone
    let endereco = dados.queryResult.parameters.Endereco
    const agendamento = new Agendamento(0, Date.now(), data, nome.name, telefone, endereco, listaDeLocal);
    await agendamento.gravar();
    global.dados[sessao]['locais'] = [];
    let resposta = {
        "fulfillmentMessages": []
    };

    if (origem) {
        resposta['fulfillmentMessages'].push({
            "text": {
                "text": [`Agendamento nº ${agendamento.id} registrado com sucesso. \n`,
                    "Anote o número para consulta ou acompanhamento posterior.\n"
                ]
            }
        })
    }
    else {
        resposta.fulfillmentMessages.push({
            "payload": {
                "richContent": [[{
                    "type": "description",
                    "title": "",
                    "text": [`Agendamento nº ${agendamento.id} registrado com sucesso. \n`,
                        "Anote o número para consulta ou acompanhamento posterior.\n"
                    ]
                }]]
            }
        });
    }
    return resposta;

}
async function salvarDataAgendamento(dados, origem) {
    
        let listaMensagens = []
        let resposta = {
            "fulfillmentMessages": []
        };
    
        const sessao = dados.session.split('/').pop();
        if (!global.dados) {
            global.dados = {};
        }
        if (!global.dados[sessao]) {
            global.dados[sessao] = {
                'data':null
            };
        }
        let dataAgendamento = dados.queryResult.parameters.data
        global.dados[sessao]['data'] = dataAgendamento;
        listaMensagens.push('Blz! Agora informa o Local\n')

        if (origem) {
            resposta['fulfillmentMessages'].push({
                "text": {
                    "text": [...listaMensagens]
                }
            })
        }
        else {
            resposta.fulfillmentMessages.push({
                "payload": {
                    "richContent": [[{
                        "type": "description",
                        "title": "",
                        "text": [...listaMensagens]
                    }]]
                }
            });
        }
    
        return resposta;
}
async function consultarReserva(dados, origem) {
    
    let listaMensagens = []
    let resposta = {
        "fulfillmentMessages": []
    };
    let numero = dados.queryResult.parameters.numero
    const agendamentoDAO = new AgendamentoDAO()
    const agendamento = await agendamentoDAO.consultar(numero)
    if (agendamento){
        listaMensagens.push("Segue os detalhes sobre sua reserva:")
        listaMensagens.push("Número reserva: " + numero)
        listaMensagens.push("Data reserva: " + agendamento.dataagendamento.toLocaleDateString('pt-br'))
        listaMensagens.push("Locais reservados: " + agendamento.locais.reduce((a, c)=> a + c.nome + ' - ', [] ))

    }
    else{
        listaMensagens.push("Não existe um agendamento com esse número")
    }
    if (origem) {
        resposta['fulfillmentMessages'].push({
            "text": {
                "text": [...listaMensagens]
            }
        })
    }
    else {
        resposta.fulfillmentMessages.push({
            "payload": {
                "richContent": [[{
                    "type": "description",
                    "title": "",
                    "text": [...listaMensagens]
                }]]
            }
        });
    }

    return resposta;
}
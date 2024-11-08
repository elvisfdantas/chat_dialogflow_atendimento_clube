import Servico from "../Model/Local.js";

export function criarMessengerCard(){
    return {
        type:"info",
        title:"",
        subtitle:"",
        image: {
            src : {
                rawUrl:""
            }
        },
        actionLink:""
    }
} //fim da função criarMessengerCard

export function criarCustomCard(){
    //exibir nos ambientes padrões, tais como: ambiente de teste do DialogFlow, slack, etc
    return {
        card: {
            title:"",
            subtitle:"",
            imageUri:"",
            buttons: [
                {
                    text:"botão",
                    postback:""
                }
            ]
        }
    }
    
} // fim da função criarCustomCard

export async function obterCardsServicos(tipoCard="custom"){

    const listaCardsServicos = [];
    const servico = new Servico();
    const servicos = await servico.consultar();

    for (const servico of servicos){

        let card;
        if (tipoCard=="custom"){
            card = criarCustomCard();
            card.card.title = servico.nome;
            card.card.subtitle = `Descrição: ${servico.descricao} \n
                                  Valor: ${servico.valor} \n
                                  Prazo para iniciar atendimento: ${servico.tempoInicioAtendimento} \n
                                  Prazo para solução: ${servico.tempoSolucao}
                                 `;
            card.card.imageUri = servico.urlImagem;
            card.card.buttons[0].postback = "https://www.clube.com.br/";
        }
        else{
            card = criarMessengerCard();
            card.title = servico.nome;
            card.subtitle = `Descrição: ${servico.descricao} \n
                             Valor: ${servico.valor} \n
                             Prazo para iniciar atendimento: ${servico.tempoInicioAtendimento} \n
                             Prazo para solução: ${servico.tempoSolucao}
                            `;
            card.image.src.rawUrl = servico.urlImagem;
            card.actionLink = "https://www.clube.com.br/";
        }

        listaCardsServicos.push(card);
    }

    return listaCardsServicos;

}
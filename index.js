import express from 'express';
import dotenv from 'dotenv';
import rotaDF from './Routes/rotaDF.js';
import rotaLocal from './Routes/rotaLocal.js';

//carrega as variáveis de ambiente
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/local",rotaLocal);
app.use("/webhook", rotaDF)
app.use(express.static('./publico'));

const host = "0.0.0.0";
const porta = "3000";

app.listen(porta, host, ()=>{
    console.log(`Servidor escutando em http://${host}:${porta}`);
});
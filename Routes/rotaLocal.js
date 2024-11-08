import { Router } from "express";
import LocalCtrl from "../Controller/LocalCtrl.js";
const localCtrl = new LocalCtrl();
const rotaLocal = new Router();

rotaLocal
.get("/", localCtrl.consultar)
.get("/:local", localCtrl.consultar)
.post("/", localCtrl.gravar)
.put("/",localCtrl.alterar)
.patch("/",localCtrl.alterar)
.delete("/:id",localCtrl.excluir);


export default rotaLocal;
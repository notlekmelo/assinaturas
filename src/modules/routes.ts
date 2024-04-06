import express, { Request, Response } from "express";
import * as usuarioService from './usuarios/usuario.service';
import * as usuarioController from './usuarios/usuario.controller';
import swaggerUi from 'swagger-ui-express';
import { ConfigSwagger } from '../infra/swagger/configSwagger'; // Para utilização dos testes automatizados esta linha deve estar comentada
import { Usuario } from "./usuarios/usuario";

const routes = express.Router();

routes.post('/usuarios/gravar-assinatura', (req: Request, res: Response) => {
    const usuario = req.body;
    usuarioController.validatorGravarAssinatura(usuario, (paramsValidos: boolean, erro: Error, mensagem: string) => {
        if (!paramsValidos){
            if (erro) {
                res.status(500).json({
                    "statusCode": 500,
                    "message": mensagem
                });
            }
            else {
                res.status(422).json({
                    "statusCode": 422,
                    "message": mensagem
                });
            }
        }
        else {
            usuarioService.gravarAssinatura(usuario, (err: Error, caminhoArquivo: string) => {
                if (err) {
                    res.status(500).json({
                        "statusCode": 500,
                        "message": err.message
                    });
                }
                else {
                    res.status(200).json({
                        "statusCode": 200,
                        "CodigoUsuario": usuario.CodigoUsuario,
                        "CaminhoAssinatura": caminhoArquivo 
                    });
                }
            })
        }
    })
})

routes.get('/usuarios', (req: Request, res: Response) => {
    const filtros = req.query;
    usuarioController.validadorBuscarDadosUsuarios(filtros, (paramsValidos: boolean, mensagem: string) => {
        if (!paramsValidos){
            res.status(422).json({
                "statusCode": 422,
                "message": mensagem
            });
        }
        else {
            usuarioService.buscarDadosUsuarios(filtros, (err: Error, usuarios: Usuario[], metaData: any) => {
                if (err) {
                    res.status(500).json({
                        "statusCode": 500,
                        "message": err.message
                    });
                }
                else {
                    res.status(200).json({
                        "statusCode": 200,
                        data: usuarios,
                        metaData
                    });
                }
            })
        }
    })
})

// Para utilização dos testes automatizados este bloco deve estar comentado
const configSwagger = new ConfigSwagger();
routes.use('/api/docs', swaggerUi.serve,
    swaggerUi.setup(configSwagger.swaggerDocument));
// Fim do bloco que deve estar comentado para uso dos testes automatizados
routes.get('/', function (req, res) {
    res.send('Api de assinaturas on-line');
});

export default routes;
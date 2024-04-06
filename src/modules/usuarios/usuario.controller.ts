import { RowDataPacket } from "mysql2";
import dbconnection from "../../infra/server/dbconnection";
import { Usuario } from "./usuario";

export const validatorGravarAssinatura = (usuario: Usuario, callback: Function) => {
    if (!usuario.CodigoUsuario) {
        callback(false, null,'O código do usuário é obrigatório.');
    }
    else if (!usuario.Assinatura) {
        callback(false, null,'A assinatura do usuário é obrigatória.');
    }
    else {
        const query = "SELECT Nome FROM Usuarios WHERE CodigoUsuario = ?"
        dbconnection.query(
            query,
            [usuario.CodigoUsuario],
            (err, result) => {
                if (err) {
                    callback(false, err, 'Erro ao recuperar usuário no banco de dados.')
                };
               
                const rows = <RowDataPacket[]>result;
                if (rows.length == 0) {
                    callback(false, null, 'O usuário especificado não foi encontrado');
                }
                else                   
                    callback(true, null, rows[0].Nome);
            }
        );
    }
}

export const validadorBuscarDadosUsuarios = (filtros: any, callback: Function) => {
    if ((filtros.limit && !filtros.page) || (!filtros.limit && filtros.page)) {
        callback(false, 'Os parâmetros limit e page devem ser enviados juntos.');
    }
    else if (filtros.limit && Number.isNaN(Number(filtros.limit))) {
        callback(false, 'O parâmetro limit deve ser um número.');
    }
    else if (filtros.page && Number.isNaN(Number(filtros.page))) {
        callback(false, 'O parâmetro page deve ser um número.');
    }
    else callback(true, null)
}
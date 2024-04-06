import dotenv from "dotenv";
import fs from "fs";
import { RowDataPacket } from "mysql2";
import path from "path";
import dbconnection from "../../infra/server/dbconnection";
import { Usuario } from "./usuario";

export const gravarAssinatura = (usuario: Usuario, callback: Function) => {
    dotenv.config();

    const caminhoPrincipal = String(process.env.DIRETORIOANEXOS);
    //Verifica se o diretório existe e se não existir cria
    if(!fs.existsSync(caminhoPrincipal)) {
        fs.mkdirSync(caminhoPrincipal);
    }
    // Trata o base64 para ser salvo
    const assinatura : any = usuario.Assinatura;
    const buffer = Buffer.from(assinatura, 'base64');

    if(!fs.existsSync(path.join(caminhoPrincipal, String(usuario.CodigoUsuario)))) {
        fs.mkdirSync(path.join(caminhoPrincipal, String(usuario.CodigoUsuario)));
    }

    fs.writeFileSync(path.join(caminhoPrincipal, String(usuario.CodigoUsuario), `assinatura${String(usuario.CodigoUsuario)}.jpg`), buffer)
    usuario.CaminhoAssinatura = path.join(caminhoPrincipal, String(usuario.CodigoUsuario), `assinatura${String(usuario.CodigoUsuario)}.jpg`)
    
    const query = "UPDATE Usuarios SET CaminhoAssinatura = ? WHERE CodigoUsuario = ? "

    dbconnection.query(
        query,
        [usuario.CaminhoAssinatura, usuario.CodigoUsuario],
        (err, result) => {
            if (err) {
                callback(err)
            };
           
            callback(null, usuario.CaminhoAssinatura);        
        }
    );
}

export const buscarDadosUsuarios = (filtros: any, callback: Function) => {

    const query = "SELECT *, COUNT(*) OVER() AS RecordsCount FROM Usuarios "
    let where = '';
    let pagination = '';
    if (filtros.Nome) {
        where = `WHERE Nome LIKE ('%${filtros.Nome}%') `
    }
    if (filtros.NomeCracha) {
        if (!where) {
            where = `WHERE NomeCracha LIKE ('%${filtros.NomeCracha}%') `
        }
        else {
            where += `AND NomeCracha LIKE ('%${filtros.NomeCracha}%') `
        }
    }
    if (filtros.CodigoUsuario) {
        if (!where) {
            where = `WHERE CodigoUsuario = ${filtros.CodigoUsuario} `
        }
        else {
            where += `AND CodigoUsuario = ${filtros.CodigoUsuario} `
        }
    }

    if (filtros.page && filtros.limit) {

        pagination = `ORDER BY Nome LIMIT ${filtros.limit} OFFSET ${(filtros.page - 1) * filtros.limit}`
    }

    dbconnection.query(
        query + where + pagination,
        [],
        (err, result) => {
            if (err) {
                callback(err)
            };
           
            const rows = <RowDataPacket[]>result;
            dotenv.config();
            const caminhoPrincipal = String(process.env.DIRETORIOANEXOS);
            const resultUsuarios: Usuario[] = [];
            const totalItens = rows.length > 0 ? rows[0].RecordsCount : 0;
            const totalPages = rows.length > 0 ? Math.ceil(rows[0].RecordsCount/filtros.limit) : 0;
                
            rows.forEach(row => {

                const usuario: Usuario = {
                    Nome: row.Nome,
                    NomeCracha: row.NomeCracha,
                    CaminhoAssinatura: row.CaminhoAssinatura,
                    CodigoUsuario: row.CodigoUsuario
                };

                if (row.CaminhoAssinatura) {
                    usuario.Assinatura = fs.readFileSync(path.join(caminhoPrincipal, String(usuario.CodigoUsuario), `assinatura${String(usuario.CodigoUsuario)}.jpg`)).toString('base64');
                }

                resultUsuarios.push(usuario)
            });
                
            callback(null, resultUsuarios, {totalItens, totalPages});
        }
    );

}
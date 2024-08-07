import { execSync } from 'node:child_process';
import * as fs from 'fs';
import path from 'path';
import { getStaticPath } from '../utils/pathUtils';

const getArchiveDate = () => {
    const [month, day, year] = new Date().toLocaleDateString('en-US').split('/');
    const resMonth = month.length === 1 ? `0${month}` : month;
    const resDay = day.length === 1 ? `0${day}` : day;
    const shortYear = year.slice(-2);

    return [resMonth, resDay, shortYear].join('-');
}

export const exportBackup = () => {
    getArchiveDate();
    const createBackupCommand = 'cd /home/rengin-erp/ && yarn run mongo:dump:prod';
    execSync(createBackupCommand);

    return `/backup/${getArchiveDate()}/archive.gz`;
}

export const getBackupFolderNames = (): string[] => {
    const staticPath = getStaticPath();
    const backupDir = path.join(staticPath, 'backup');

    return fs.readdirSync(backupDir);
}

export const importBackup = ({ file, folderName }: { file?: any, folderName?: string }): number => {
    let dockerContainerSrc;

    if (folderName) {
        dockerContainerSrc = `dump/${folderName}/archive.gz`;
    } else if (file) {
        //
        // //fixme: configure writeFileSync to make gzip from buffer
        // fs.mkdirSync(`${backupDir}/upload`);
        // fs.writeFileSync(`${backupDir}/upload`, file);
        //
        // const copyCommand = `docker cp ${backupDir}/upload/archive.gz mongodb:/dump/upload`;
        // execSync(copyCommand);
        //
        // dockerContainerSrc = `dump/upload/archive.gz`;
    }

    // const restoreBackupCommand: string = `docker exec mongodb sh -c "mongorestore ${config.MONGO_URI} --gzip --archive='${dockerContainerSrc}'"`;
    const restoreBackupCommand: string = `docker exec -i 08a9e87fbcd1 /usr/bin/mongorestore --username rengin --password BuildMeUp --drop --gzip --archive="/dump/${dockerContainerSrc}/archive.gz"`;
    execSync(restoreBackupCommand);

    return 0;
}
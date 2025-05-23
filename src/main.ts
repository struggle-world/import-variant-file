import * as path from 'path';
import { promises } from 'node:fs';
import { checkFile, findExports, getPackageJsonFiles } from './src/lib/node-modules-variant-identify';

interface optionDataType {
    name: string;
    path: string; // 类型为node_modules时、path 使用 packageName
    source: 'node_modules' | 'current_directory'; // // node_modules 或者 当前目录
    type: 'variable' | 'file';
}

// 主函数，接收项目路径作为参数
async function main(uriPath: string) {
    console.log(`\n当前项目路径: ${uriPath}`);
    const nodeModulesPath = path.join(uriPath, 'node_modules'); // 拼接 node_modules 的路径

    // 读取 node_modules 目录下的所有包名，过滤掉隐藏文件和 .bin 目录
    const packages = (await promises.readdir(nodeModulesPath))
        .filter((item: string) => !item.startsWith('.') && item !== '.bin');
    // console.log(`\nnode_modules 中的包: ${packages.join(', ')}`);

    const optionDatas: optionDataType[] = [];
    // 遍历每个包
    for (const packageName of packages) {
        const packagePath = path.join(nodeModulesPath, packageName); // 拼接包的路径
        // console.log(`\n包: ${packageName}`);
        // 判断 path.join(packagePath, 'package.json') 是否存在
        // console.log( 'packageJsonFiles==', packagePath)
        if (!await checkFile(packagePath + '/package.json')) {
            // !await checkFile(packagePath + '/package.json')
            // !await promises.stat(packagePath + '/package.json')
            console.log('=====');
            const packageJsonFiles = await getPackageJsonFiles(packagePath);
            packageJsonFiles.forEach((packageJsonFile: string) => {
                // 读取 package.json 文件
                promises.readFile(packageJsonFile, 'utf-8').then((data: string) => {
                    const jsonData = JSON.parse(data);
                    if (jsonData && jsonData.exports) {
                        optionDatas.push({
                            name: packageName,
                            path: uriPath,
                            source: 'node_modules',
                            type: 'variable'
                        });
                    }
                });
            });
        } else {
            const stats = await promises.stat(packagePath); // 获取包的文件状态
            if (stats.isDirectory()) { // 如果是目录
                console.log('+++++');
                
                // 调用 findExports 方法查找包的导出内容
                const exports: any = await findExports(packagePath) || [];
                if (exports.length > 0) { // 如果有导出内容
                    optionDatas.push({
                        name: packageName,
                        path: uriPath,
                        source: 'node_modules',
                        type: 'variable'
                    });
                    // console.log(`\n包: ${packageName}`);
                    // exports.forEach((exp: any) => console.log(`- ${exp}`)); // 打印每个导出内容
                }
            }
        }
    }
    return optionDatas; // 返回所有包的导出内容
    // 插入数据库 @TODO
}

// 调用主函数并处理可能的错误
main('/home/maolin/develop/vs-code/import-variant-file').catch(err => console.error(err));
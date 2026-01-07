const fs = require('fs');
const path = require('path');

/**
 * 디렉토리 생성 (재귀적)
 */
function createDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * JSON 파일 작성
 */
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Markdown 파일 작성
 */
function writeMarkdownFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * 템플릿 디렉토리에서 대상 디렉토리로 파일 복사
 */
function copyTemplates(templateDir, targetDir, files) {
    files.forEach((file) => {
        const sourcePath = path.join(templateDir, file);
        const targetPath = path.join(targetDir, file);

        if (fs.existsSync(sourcePath)) {
            const targetDirPath = path.dirname(targetPath);
            createDirectory(targetDirPath);
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

module.exports = {
    createDirectory,
    writeJsonFile,
    writeMarkdownFile,
    copyTemplates
};

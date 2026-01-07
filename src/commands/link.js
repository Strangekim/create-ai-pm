const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

const { createDirectory, writeJsonFile, writeMarkdownFile } = require('../utils/fileUtils');

async function linkCommand(hubUrl, options) {
    console.log('');
    console.log(chalk.cyan.bold('🔗 PM Hub에 연결합니다...'));
    console.log('');

    const targetDir = path.resolve(process.cwd(), '.ai-pm');

    // 이미 연결되어 있는지 확인
    if (fs.existsSync(targetDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: chalk.yellow('.ai-pm 폴더가 이미 존재합니다. 다시 연결하시겠습니까?'),
                default: false
            }
        ]);
        if (!overwrite) {
            console.log(chalk.red('연결이 취소되었습니다.'));
            process.exit(1);
        }
        // 기존 폴더 백업
        const backupDir = `.ai-pm.backup.${Date.now()}`;
        fs.renameSync(targetDir, path.resolve(process.cwd(), backupDir));
        console.log(chalk.gray(`기존 폴더를 ${backupDir}로 백업했습니다.`));
    }

    console.log('');
    const spinner = ora('PM Hub 정보를 가져오는 중...').start();

    let hubConfig;
    let selectedMember;

    try {
        // 1. Hub 클론
        execSync(`git clone ${hubUrl} .ai-pm`, {
            cwd: process.cwd(),
            stdio: 'pipe'
        });

        spinner.succeed('PM Hub 클론 완료!');

        // 2. hub-config.json 읽기
        const hubConfigPath = path.join(targetDir, 'hub-config.json');
        if (!fs.existsSync(hubConfigPath)) {
            throw new Error('hub-config.json을 찾을 수 없습니다. 올바른 PM Hub인지 확인하세요.');
        }

        hubConfig = JSON.parse(fs.readFileSync(hubConfigPath, 'utf8'));

        console.log('');
        console.log(chalk.cyan(`📋 프로젝트: ${hubConfig.name}`));
        console.log(chalk.gray(`   ${hubConfig.description}`));
        console.log('');

        // 3. 팀원 목록에서 본인 선택 (팀장 제외)
        const nonLeaderMembers = hubConfig.members.filter(m => !m.isLeader);

        if (nonLeaderMembers.length === 0) {
            throw new Error('연결 가능한 팀원이 없습니다. 팀장은 init으로 Hub를 관리하세요.');
        }

        const memberChoices = nonLeaderMembers.map(m => ({
            name: `${m.nickname} (${m.role})`,
            value: m
        }));

        const { member } = await inquirer.prompt([
            {
                type: 'list',
                name: 'member',
                message: '👤 본인을 선택하세요:',
                choices: memberChoices
            }
        ]);

        selectedMember = member;

    } catch (error) {
        spinner.fail(chalk.red('연결 실패: ' + error.message));
        console.log('');
        console.log(chalk.yellow('확인사항:'));
        console.log('  - Hub URL이 올바른지 확인하세요');
        console.log('  - Git이 설치되어 있는지 확인하세요');
        console.log('  - 저장소 접근 권한이 있는지 확인하세요');
        process.exit(1);
    }

    const spinnerConfig = ora('설정 파일 생성 중...').start();

    try {
        // 4. 로컬 설정 파일 생성
        const localConfig = {
            hubUrl: hubUrl,
            nickname: selectedMember.nickname,
            isLeader: selectedMember.isLeader || false,
            role: selectedMember.role,
            linkedAt: new Date().toISOString()
        };
        writeJsonFile(path.join(targetDir, '.local-config.json'), localConfig);

        // 5. .gitignore에 .ai-pm 추가 (메인 레포에 포함되지 않도록)
        const gitignorePath = path.resolve(process.cwd(), '.gitignore');
        let gitignoreContent = '';
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        if (!gitignoreContent.includes('.ai-pm')) {
            gitignoreContent += '\n# AI-PM Hub (별도 레포로 관리)\n.ai-pm/\n';
            fs.writeFileSync(gitignorePath, gitignoreContent);
        }

        // 6. AGENTS.md 생성 (범용 AI IDE 지침)
        const agentsMd = generateAgentsMd(hubConfig.name, selectedMember);
        writeMarkdownFile(path.resolve(process.cwd(), 'AGENTS.md'), agentsMd);

        spinnerConfig.succeed(chalk.green('설정 완료!'));

    } catch (error) {
        spinnerConfig.fail(chalk.red('설정 실패: ' + error.message));
        process.exit(1);
    }

    // 완료 메시지
    console.log('');
    console.log(chalk.green('╔════════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║') + chalk.bold.white('         ✅ PM Hub 연결이 완료되었습니다!               ') + chalk.green('║'));
    console.log(chalk.green('╚════════════════════════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.cyan('📁 생성된 파일:'));
    console.log(`   ├── .ai-pm/                  ${chalk.gray('← PM Hub (별도 레포)')}`);
    console.log(`   ├── AGENTS.md                ${chalk.green('← AI IDE 지침 (자동 생성)')}`);
    console.log(`   └── .gitignore               ${chalk.gray('← .ai-pm/ 제외됨')}`);
    console.log('');
    console.log(chalk.yellow('👤 연결 정보:'));
    console.log(`   닉네임: ${chalk.white(selectedMember.nickname)}`);
    console.log(`   역할: ${chalk.white(selectedMember.role)}`);
    console.log(`   권한: ${selectedMember.isLeader ? chalk.yellow('👑 팀장') : chalk.gray('팀원')}`);
    console.log('');
    console.log(chalk.yellow('🚀 시작하기:'));
    console.log(chalk.white('   "내 할 일 뭐야?"'));
    console.log(chalk.white('   "작업 완료했어. 기록해줘"'));
    console.log('');
}

/**
 * AGENTS.md 파일 내용 생성
 */
function generateAgentsMd(projectName, member) {
    return `# 🤖 AI Agent Instructions

> 이 프로젝트는 **AI-PM Protocol Kit**을 사용합니다.

## 필수 지침

**모든 작업 전에** 다음 파일을 먼저 읽으세요:
\`\`\`
.ai-pm/instructions/SYSTEM_PROMPT.md
\`\`\`

## 현재 사용자

- **닉네임**: ${member.nickname}
- **역할**: ${member.role}
- **권한**: ${member.isLeader ? '팀장 (PM)' : '팀원'}

## 프로젝트 정보

- **프로젝트**: ${projectName}
- **PM Hub**: \`.ai-pm/\` 폴더

## 주요 명령어

| 명령 | 동작 |
|------|------|
| "기록해줘" | 작업 로그 생성 + Hub 동기화 |
| "상태 알려줘" | 프로젝트 현황 브리핑 |
| "내 할 일?" | 담당 작업 확인 |
${member.isLeader ? '| "업무 분배해줘" | 작업 할당 제안 |\n| "일정 조율해줘" | 리스크 분석 |' : ''}

## 중요

⚠️ **Hub 동기화 필수**
- 작업 전: \`cd .ai-pm && git pull\`
- 작업 후: \`cd .ai-pm && git push\`

---
*Generated by AI-PM Protocol Kit*
`;
}

module.exports = linkCommand;

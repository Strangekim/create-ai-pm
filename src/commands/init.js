const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

const { copyTemplates, createDirectory, writeJsonFile, writeMarkdownFile } = require('../utils/fileUtils');
const { generateProjectMeta, generateTeamRoster, generateRoadmap, generateIndexJson } = require('../utils/templateGenerators');

async function initCommand(projectName, options) {
    console.log('');
    console.log(chalk.cyan.bold(`🚀 PM Hub "${projectName}" 생성을 시작합니다!`));
    console.log('');

    const targetDir = path.resolve(process.cwd(), projectName);

    // 디렉토리 존재 확인
    if (fs.existsSync(targetDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: chalk.yellow(`"${projectName}" 폴더가 이미 존재합니다. 덮어쓰시겠습니까?`),
                default: false
            }
        ]);
        if (!overwrite) {
            console.log(chalk.red('설치가 취소되었습니다.'));
            process.exit(1);
        }
    }

    let answers;

    if (options.yes) {
        // 기본값으로 빠르게 생성
        answers = {
            leader: '@leader',
            description: '새로운 프로젝트',
            members: [
                { nickname: '@leader', role: 'PM/팀장', isLeader: true },
                { nickname: '@member1', role: '팀원 1', isLeader: false }
            ]
        };
    } else {
        // 인터랙티브 프롬프트
        console.log(chalk.yellow('👑 먼저 팀장(본인) 정보를 입력해주세요:'));
        console.log('');

        const leaderAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'leaderNickname',
                message: '팀장 닉네임 (예: @choi):',
                validate: (input) => input.trim() !== '' || '닉네임을 입력해주세요.',
                transformer: (input) => input.startsWith('@') ? input : `@${input}`
            },
            {
                type: 'input',
                name: 'leaderRole',
                message: '팀장 역할 설명 (예: PM/기획):',
                default: 'PM/팀장',
                validate: (input) => input.trim() !== '' || '역할을 입력해주세요.'
            }
        ]);

        // @ 붙이기
        let leaderNickname = leaderAnswers.leaderNickname;
        if (!leaderNickname.startsWith('@')) {
            leaderNickname = '@' + leaderNickname;
        }

        console.log('');
        const basicAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'description',
                message: '📝 프로젝트 개요를 간략하게 작성해주세요:',
                validate: (input) => input.trim() !== '' || '프로젝트 개요를 입력해주세요.'
            },
            {
                type: 'number',
                name: 'teamSize',
                message: '👥 팀원 수를 입력해주세요 (팀장 제외, 최소 1):',
                default: 2,
                validate: (input) => input >= 1 || '최소 1명 이상이어야 합니다.'
            }
        ]);

        // 팀원 정보 입력 (팀장은 이미 입력됨)
        const members = [
            { nickname: leaderNickname, role: leaderAnswers.leaderRole, isLeader: true }
        ];

        for (let i = 1; i <= basicAnswers.teamSize; i++) {
            console.log('');
            console.log(chalk.gray(`--- 팀원 ${i} ---`));

            const memberAnswers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nickname',
                    message: `팀원 ${i} 닉네임 (예: @kim):`,
                    validate: (input) => input.trim() !== '' || '닉네임을 입력해주세요.',
                    transformer: (input) => input.startsWith('@') ? input : `@${input}`
                },
                {
                    type: 'input',
                    name: 'role',
                    message: `팀원 ${i} 역할:`,
                    validate: (input) => input.trim() !== '' || '역할을 입력해주세요.'
                }
            ]);

            // @ 붙이기
            let nickname = memberAnswers.nickname;
            if (!nickname.startsWith('@')) {
                nickname = '@' + nickname;
            }

            members.push({ nickname, role: memberAnswers.role, isLeader: false });
        }

        answers = {
            leader: leaderNickname,
            description: basicAnswers.description,
            members
        };
    }

    console.log('');
    const spinner = ora('PM Hub 생성 중...').start();

    try {
        // 1. 디렉토리 구조 생성
        createDirectory(targetDir);
        createDirectory(path.join(targetDir, 'config'));
        createDirectory(path.join(targetDir, 'memory'));
        createDirectory(path.join(targetDir, 'memory', 'logs'));
        createDirectory(path.join(targetDir, 'instructions'));

        spinner.text = '템플릿 파일 생성 중...';

        // 2. 템플릿 파일 생성
        const templatesDir = path.join(__dirname, '..', '..', 'templates');

        // project_meta.md 생성
        const projectMeta = generateProjectMeta(projectName, answers.description);
        writeMarkdownFile(path.join(targetDir, 'config', 'project_meta.md'), projectMeta);

        // team_roster.md 생성
        const teamRoster = generateTeamRoster(answers.members);
        writeMarkdownFile(path.join(targetDir, 'config', 'team_roster.md'), teamRoster);

        // roadmap.md 생성
        const roadmap = generateRoadmap(answers.members);
        writeMarkdownFile(path.join(targetDir, 'memory', 'roadmap.md'), roadmap);

        // index.json 생성 (컨텍스트 최적화용 핵심 파일!)
        const indexJson = generateIndexJson(answers.members);
        writeJsonFile(path.join(targetDir, 'memory', 'index.json'), indexJson);

        // log_template.md 복사
        fs.copyFileSync(
            path.join(templatesDir, 'log_template.md'),
            path.join(targetDir, 'memory', 'log_template.md')
        );

        // SYSTEM_PROMPT.md 복사
        fs.copyFileSync(
            path.join(templatesDir, 'SYSTEM_PROMPT.md'),
            path.join(targetDir, 'instructions', 'SYSTEM_PROMPT.md')
        );

        // config_changelog.md 복사 (설정 변경 이력 추적용)
        fs.copyFileSync(
            path.join(templatesDir, 'config_changelog.md'),
            path.join(targetDir, 'config', 'config_changelog.md')
        );

        // logs/.gitignore 생성
        fs.writeFileSync(
            path.join(targetDir, 'memory', 'logs', '.gitignore'),
            '# 로그 파일은 git에서 추적\n# 필요시 수정하세요\n'
        );

        // hub-config.json 생성
        const hubConfig = {
            name: projectName,
            description: answers.description,
            leader: answers.leader,
            createdAt: new Date().toISOString(),
            members: answers.members
        };
        writeJsonFile(path.join(targetDir, 'hub-config.json'), hubConfig);

        spinner.text = 'Git 초기화 중...';

        // 3. Git 초기화
        try {
            execSync('git init', { cwd: targetDir, stdio: 'pipe' });
            execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
            execSync('git commit -m "🎉 Initial commit: AI-PM Hub 생성"', { cwd: targetDir, stdio: 'pipe' });
        } catch (gitError) {
            // Git이 없어도 계속 진행
            spinner.warn('Git 초기화 실패 (Git이 설치되어 있지 않을 수 있습니다)');
        }

        spinner.succeed(chalk.green('PM Hub 생성 완료!'));

    } catch (error) {
        spinner.fail(chalk.red('생성 실패: ' + error.message));
        process.exit(1);
    }

    // 완료 메시지
    console.log('');
    console.log(chalk.green('╔════════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║') + chalk.bold.white('         ✅ PM Hub가 성공적으로 생성되었습니다!         ') + chalk.green('║'));
    console.log(chalk.green('╚════════════════════════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.cyan('📁 생성된 구조:'));
    console.log(`   ${projectName}/`);
    console.log(`   ├── config/`);
    console.log(`   │   ├── project_meta.md       ${chalk.gray('← 프로젝트 정보')}`);
    console.log(`   │   ├── team_roster.md        ${chalk.gray('← 팀원 정보')}`);
    console.log(`   │   └── config_changelog.md   ${chalk.yellow('← 설정 변경 이력')}`);
    console.log(`   ├── memory/`);
    console.log(`   │   ├── index.json            ${chalk.green('← AI 빠른 조회용 (핵심!)')}`);
    console.log(`   │   ├── roadmap.md            ${chalk.gray('← 로드맵')}`);
    console.log(`   │   ├── log_template.md       ${chalk.gray('← 로그 양식')}`);
    console.log(`   │   └── logs/                 ${chalk.gray('← 작업 로그 (무한 누적)')}`);
    console.log(`   ├── instructions/`);
    console.log(`   │   └── SYSTEM_PROMPT.md      ${chalk.gray('← AI 지침서')}`);
    console.log(`   └── hub-config.json           ${chalk.gray('← Hub 설정')}`);
    console.log('');
    console.log(chalk.yellow('👉 다음 단계:'));
    console.log(`   1. ${chalk.white(`cd ${projectName}`)}`);
    console.log(`   2. ${chalk.white('git remote add origin <your-github-repo>')}`);
    console.log(`   3. ${chalk.white('git push -u origin main')}`);
    console.log('');
    console.log(chalk.gray('팀원들에게 Hub URL을 공유하세요:'));
    console.log(chalk.white('   npx create-ai-pm link <hub-url>'));
    console.log('');
}

module.exports = initCommand;

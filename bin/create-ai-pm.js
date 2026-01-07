#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

const initCommand = require('../src/commands/init');
const linkCommand = require('../src/commands/link');

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('🤖 AI-PM Protocol Kit')}                              ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('AI 기반 자율 프로젝트 관리 시스템')}                   ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════╝')}
`;

program
  .name('create-ai-pm')
  .description('AI 기반 자율 프로젝트 관리 시스템 스캐폴딩 도구')
  .version(pkg.version)
  .addHelpText('before', banner);

// init command: PM Hub 생성 (팀장용)
program
  .command('init <project-name>')
  .description('새로운 PM Hub를 생성합니다 (팀장용)')
  .option('-y, --yes', '기본값으로 빠르게 생성')
  .action(initCommand);

// link command: PM Hub 연결 (팀원용)
program
  .command('link <hub-url>')
  .description('기존 PM Hub에 연결합니다 (팀원용)')
  .option('-n, --nickname <nickname>', '팀원 닉네임')
  .action(linkCommand);

// 인자 없이 실행 시 도움말 표시
if (process.argv.length <= 2) {
  console.log(banner);
  console.log(chalk.yellow('사용법:'));
  console.log(`  ${chalk.green('npx create-ai-pm init <project-name>')}  - PM Hub 생성 (팀장)`);
  console.log(`  ${chalk.green('npx create-ai-pm link <hub-url>')}       - PM Hub 연결 (팀원)`);
  console.log('');
  console.log(chalk.gray('자세한 도움말: create-ai-pm --help'));
  process.exit(0);
}

program.parse(process.argv);

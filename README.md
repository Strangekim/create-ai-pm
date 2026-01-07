# 🤖 create-ai-pm

> AI 기반 자율 프로젝트 관리 시스템을 위한 스캐폴딩 도구

[![npm version](https://badge.fury.io/js/create-ai-pm.svg)](https://www.npmjs.com/package/create-ai-pm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 소개

**create-ai-pm**은 팀 프로젝트에 AI 기반 자율 관리 시스템을 쉽게 설치하고 적용할 수 있도록 도와주는 CLI 도구입니다.

### 특징
- 🏠 **Hub & Spoke 구조**: 프론트/백엔드 등 멀티 레포 환경 지원
- 🤖 **AI 자동 관리**: 로그 작성, 로드맵 갱신을 AI가 자동 처리
- 👥 **팀 협업**: 팀원 간 작업 현황 실시간 공유
- 💬 **자연어 명령**: "기록해줘", "상태 알려줘" 등 자연어로 소통

---

## 🚀 빠른 시작

### 1단계: PM Hub 생성 (팀장)

```bash
npx create-ai-pm init my-project-pm

# 인터랙티브 프롬프트:
# - 프로젝트 개요 입력
# - 팀원 수 입력
# - 각 팀원 닉네임/역할 입력
```

GitHub에 푸시:
```bash
cd my-project-pm
git remote add origin https://github.com/your-team/my-project-pm
git push -u origin main
```

### 2단계: Hub 연결 (팀원)

각자의 작업 레포에서:
```bash
cd my-frontend-repo  # 또는 backend-repo
npx create-ai-pm link https://github.com/your-team/my-project-pm
```

---

## 📁 생성되는 구조

### PM Hub (팀장이 생성)
```
my-project-pm/
├── config/
│   ├── project_meta.md    # 프로젝트 정보
│   └── team_roster.md     # 팀원 정보
├── memory/
│   ├── roadmap.md         # 로드맵 (To Do/In Progress/Done)
│   ├── log_template.md    # 로그 양식
│   └── logs/              # 작업 로그
├── instructions/
│   └── SYSTEM_PROMPT.md   # AI 지침서
└── hub-config.json        # Hub 설정
```

### 팀원 레포 (link 후)
```
my-frontend-repo/
├── .ai-pm/                # PM Hub (clone됨)
│   └── ...
├── .gitignore             # .ai-pm/ 자동 추가
└── (your project files)
```

---

## 💬 사용 방법

AI IDE (Cursor, Windsurf 등)에서 자연어로 명령:

| 명령 | 동작 |
|------|------|
| "로그인 기능 완성했어. 기록해줘" | 로그 생성 + 로드맵 갱신 |
| "현재 프로젝트 상태 알려줘" | 전체 현황 브리핑 |
| "@kim 작업 어디까지 했어?" | 특정 팀원 현황 |
| "나 오늘 뭐 해야 해?" | 내 담당 작업 조회 |

---

## 📋 명령어 레퍼런스

### `create-ai-pm init <project-name>`
새로운 PM Hub를 생성합니다.

**옵션:**
- `-y, --yes`: 기본값으로 빠르게 생성

### `create-ai-pm link <hub-url>`
기존 PM Hub에 연결합니다.

**옵션:**
- `-n, --nickname <nickname>`: 팀원 닉네임 지정

---

## 🔧 AI IDE 설정

### Cursor
`.cursorrules`에 추가:
```
Always read and follow .ai-pm/instructions/SYSTEM_PROMPT.md
```

### Windsurf
`.windsurfrules`에 추가:
```
Reference .ai-pm/instructions/SYSTEM_PROMPT.md for project management tasks
```

---

## 📜 라이선스

MIT License

---

Made with ❤️ for AI-powered team collaboration

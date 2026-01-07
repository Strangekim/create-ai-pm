/**
 * 프로젝트 메타 정보 Markdown 생성
 */
function generateProjectMeta(projectName, description) {
    return `# 📋 프로젝트 메타 정보

> AI가 프로젝트의 맥락을 이해할 수 있도록 작성된 정보입니다.

---

## 🎯 프로젝트 개요

### 프로젝트 이름
\`\`\`
${projectName}
\`\`\`

### 설명
${description}

---

## 🛠️ 기술 스택

<!-- 사용하는 기술을 추가해주세요 -->

| 영역 | 기술 |
|------|------|
| Frontend | |
| Backend | |
| Database | |
| 기타 | |

---

## ⚠️ 제약 조건 & 규칙

### 코딩 컨벤션
<!-- 팀에서 따르는 코딩 규칙 -->

### 금지 사항
<!-- AI가 하지 말아야 할 것들 -->

### 필수 사항
<!-- AI가 반드시 지켜야 할 것들 -->

---

## 📝 추가 메모

<!-- AI에게 알려주고 싶은 추가 정보 -->
`;
}

/**
 * 팀 명부 Markdown 생성
 */
function generateTeamRoster(members) {
    const memberRows = members.map((member, index) => {
        return `### 팀원 ${index + 1}: ${member.nickname}
| 항목 | 내용 |
|------|------|
| **닉네임** | ${member.nickname} |
| **역할** | ${member.role} |
| **담당 영역** | |
`;
    }).join('\n');

    return `# 👥 팀 구성원 명부

> 팀원들의 역할과 담당 영역 정보입니다.

---

## 📊 팀 개요

| 항목 | 내용 |
|------|------|
| **팀 규모** | ${members.length}명 |
| **생성일** | ${new Date().toISOString().split('T')[0]} |

---

## 🧑‍💻 팀원 목록

${memberRows}

---

## 🔄 워크플로우

### 커밋 컨벤션
\`\`\`
<type>(<scope>): <subject>

예: feat(auth): 로그인 기능 추가
\`\`\`

**Type 종류:**
- \`feat\`: 새로운 기능
- \`fix\`: 버그 수정
- \`docs\`: 문서 수정
- \`style\`: 코드 포맷팅
- \`refactor\`: 리팩토링
- \`test\`: 테스트 추가
- \`chore\`: 빌드, 설정 변경
`;
}

/**
 * 로드맵 Markdown 생성
 */
function generateRoadmap(members) {
    const memberList = members.map(m => m.nickname).join(', ');
    const memberSections = members.map(member => {
        return `### ${member.nickname}
- [ ] 초기 작업 설정`;
    }).join('\n\n');

    return `# 🗺️ 프로젝트 로드맵

> 이 문서는 AI가 자동으로 관리합니다.  
> 마지막 갱신: ${new Date().toISOString()}

---

## 📊 전체 진행률

\`\`\`
[░░░░░░░░░░░░░░░░░░░░] 0%
완료: 0 / 진행중: 0 / 대기: 0
\`\`\`

**팀원**: ${memberList}

---

## ✅ Done (완료)

<!-- 완료된 작업들 -->

| 완료일 | 작업 | 담당자 | 관련 커밋 |
|--------|------|--------|-----------|
| | | | |

---

## 🔄 In Progress (진행 중)

<!-- 현재 진행 중인 작업들 -->

| 시작일 | 작업 | 담당자 | 진행률 |
|--------|------|--------|--------|
| | | | |

---

## 📋 To Do (대기)

<!-- 예정된 작업들 -->

| 작업 | 예상 소요 | 담당자 | 우선순위 |
|------|----------|--------|----------|
| | | | 🔴/🟡/🟢 |

---

## 👤 팀원별 현황

${memberSections}

---

## 📈 변경 이력

| 날짜 | 변경 내용 | 변경자 |
|------|----------|--------|
| ${new Date().toISOString().split('T')[0]} | 로드맵 초기화 | 시스템 |
`;
}

/**
 * index.json 생성 (컨텍스트 최적화용 핵심 파일)
 */
function generateIndexJson(members) {
    const memberIndex = {};
    members.forEach(member => {
        memberIndex[member.nickname] = {
            role: member.role,
            currentTask: null,
            progress: 0,
            lastActivity: null,
            recentLog: null,
            totalLogs: 0  // 해당 팀원의 총 로그 수 (히스토리 추적용)
        };
    });

    return {
        lastUpdated: new Date().toISOString(),
        summary: {
            total: 0,
            done: 0,
            inProgress: 0,
            todo: 0,
            progressPercent: 0
        },
        members: memberIndex
    };
}

/**
 * 로그 파일 내용 생성
 */
function generateLogContent(nickname, completedWork, nextWork, relatedFiles) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    return `# ${nickname} | ${dateStr} ${timeStr}

## 완료
${completedWork.map(w => `- ${w}`).join('\n')}

## 다음
${nextWork.map(w => `- ${w}`).join('\n')}

## 관련파일
${relatedFiles.length > 0 ? relatedFiles.join(', ') : '없음'}
`;
}

module.exports = {
    generateProjectMeta,
    generateTeamRoster,
    generateRoadmap,
    generateIndexJson,
    generateLogContent
};

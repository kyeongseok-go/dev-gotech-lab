"""테스트 공통: lib/ 와 스크립트 디렉터리를 import 경로에 올리고, 원문·카드 예시를 제공한다."""
from __future__ import annotations

import copy
import sys
from pathlib import Path

import pytest

SCRIPT_DIR = Path(__file__).resolve().parents[1]
for p in (SCRIPT_DIR, SCRIPT_DIR / "lib"):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

SOURCE = (
    "제목: Acme launches Widget 2\n\n"
    "Acme today announced Widget 2, a developer toolkit for building AI agents. "
    "The toolkit cuts build times by 35% compared with the previous version. "
    "More than 1,200 teams joined the beta, and Acme said 100,000 developers signed up in the first week. "
    "Widget 2 is available now for Python and TypeScript. "
    "The company raised $300 million in funding last year."
)


def make_card() -> dict:
    return {
        "title_ko": "Acme, AI 에이전트용 Widget 2 공개",
        "hook": ["에이전트 개발 도구", "Widget 2 출시"],
        "facts": [
            {"text": "Acme가 AI 에이전트 개발용 도구 Widget 2를 내놨다.",
             "evidence": "Acme today announced Widget 2, a developer toolkit for building AI agents."},
            {"text": "이전 버전보다 빌드 시간이 35% 줄었다.",
             "evidence": "The toolkit cuts build times by 35% compared with the previous version."},
            {"text": "베타에 1,200곳 넘는 팀이 참여했다.",
             "evidence": "More than 1,200 teams joined the beta"},
        ],
        "why_it_matters": ["빌드 대기 시간이 줄면 에이전트 실험 주기가 짧아진다.",
                           "Python과 TypeScript를 함께 지원해 도입 장벽이 낮다."],
        "numbers": [{"value": "35%", "label": "빌드 시간 단축", "evidence": "cuts build times by 35%"}],
        "tags": ["Acme", "에이전트", "개발도구"],
        "category": "dev",
        "source_name": "Acme Blog",
    }


@pytest.fixture
def source() -> str:
    return SOURCE


@pytest.fixture
def card() -> dict:
    return copy.deepcopy(make_card())


@pytest.fixture
def cfg() -> dict:
    from caption.config import DEFAULTS

    return copy.deepcopy(DEFAULTS)

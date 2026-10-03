// 정적 이미지 import(*.webp 등) 타입 — next-env.d.ts 는 빌드가 만들고 .gitignore 대상이라
// CI 처럼 빌드 전에 tsc 를 돌리면 없다. 같은 참조를 커밋된 파일에 둬 빌드 순서와 무관하게 한다.
/// <reference types="next/image-types/global" />

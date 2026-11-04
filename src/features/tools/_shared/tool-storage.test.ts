import { describe, expect, it } from "vitest";
import { HISTORY_LIMIT, STORAGE_PREFIX, clearAllToolData, historyKey, parseHistory, pushHistory, type HistoryEntry } from "./tool-storage";

const entry = (id: string): HistoryEntry<string> => ({ id, at: "2026-11-04T00:00:00.000Z", label: id, value: id });

class MemoryStorage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

describe("pushHistory", () => {
  it("최신을 앞에 두고 원본 배열은 바꾸지 않는다", () => {
    const before = [entry("a")];
    const after = pushHistory(before, entry("b"));
    expect(after.map((e) => e.id)).toEqual(["b", "a"]);
    expect(before.map((e) => e.id)).toEqual(["a"]);
  });

  it(`최대 ${HISTORY_LIMIT}건만 남긴다`, () => {
    let list: HistoryEntry<string>[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) list = pushHistory(list, entry(String(i)));
    expect(list).toHaveLength(HISTORY_LIMIT);
    expect(list[0].id).toBe(String(HISTORY_LIMIT + 4));
  });

  it("같은 값이 다시 들어오면 중복 대신 맨 앞으로 올린다", () => {
    const list = pushHistory([entry("a"), entry("b")], { ...entry("b2"), value: "b" });
    expect(list.map((e) => e.value)).toEqual(["b", "a"]);
  });
});

describe("parseHistory", () => {
  it("깨진 JSON·배열 아님·형식 틀린 항목은 버린다", () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory("{")).toEqual([]);
    expect(parseHistory('{"a":1}')).toEqual([]);
    expect(parseHistory(JSON.stringify([entry("a"), { id: 1 }]))).toEqual([entry("a")]);
  });
});

describe("clearAllToolData", () => {
  it("도구 접두사 키만 지우고 지운 개수를 돌려준다", () => {
    const storage = new MemoryStorage();
    storage.setItem(historyKey("x"), "[]");
    storage.setItem(`${STORAGE_PREFIX}y:key`, "k");
    storage.setItem("theme", "dark");
    expect(clearAllToolData(storage)).toBe(2);
    expect(storage.getItem("theme")).toBe("dark");
    expect(storage.length).toBe(1);
  });
});

export type AllKeys<T> = T extends unknown ? keyof T : never;

/**
 * 주어진 객체(base)에서 특정 키들(keys)을 선택하여 새로운 객체를 생성합니다.
 * @param base 추출할 속성을 가진 객체입니다.
 * @param keys 추출하고자 하는 속성들의 키 배열입니다.
 * @returns base 객체에서 keys에 포함된 속성만을 가진 새로운 객체를 반환합니다.
 *
 * interface User {
 *     id: number;
 *     name: string;
 *     email: string;
 * }
 *
 * const user: User = {
 *     id: 1,
 *     name: "Alice",
 *     email: "alice@example.com"
 * };
 *
 * const pickedUser = pick(user, ["id", "email"]);
 * pickedUser의 타입은 { id: number; email: string }
 * pickedUser는 { id: 1, email: "alice@example.com" }
 */
export function pick<O, K extends AllKeys<O>>(
  base: O,
  keys: readonly K[]
): Pick<O, K> {
  const entries = keys.map((key) => [key, base?.[key]]);
  return Object.fromEntries(entries);
}

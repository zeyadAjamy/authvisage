interface DiffResult<T> {
  added: T[];
  removed: T[];
}

export const diffArrays = <T>(
  oldArray?: T[] | null,
  newArray?: T[] | null,
): DiffResult<T> => {
  const oldArr = oldArray ?? [];
  const newArr = newArray ?? [];

  const oldSet = new Set(oldArr);
  const newSet = new Set(newArr);

  const added = newArr.filter((item) => !oldSet.has(item));
  const removed = oldArr.filter((item) => !newSet.has(item));

  return { added, removed };
};

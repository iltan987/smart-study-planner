export type OmitTyped<Obj extends object, Keys extends keyof Obj> = Pick<
  Obj,
  Exclude<keyof Obj, Keys>
>;

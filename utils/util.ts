export default class Util {
  // sorry for anyone who sees this
  // taken from an old project of mine

  public static parseEnum<E, K extends string>(
    enumDef: { [key in K]: E },
    str: string | undefined
  ): E | undefined {
    if (str && str in enumDef) {
      return enumDef[str as K] as E;
    }
    return undefined;
  }

  public static hasProperty = <Obj, Prop extends PropertyKey>(
    obj: Obj,
    prop: Prop
  ): obj is Obj & Record<Prop, unknown> => Object.prototype.hasOwnProperty.call(obj, prop);
}

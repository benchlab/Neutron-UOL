interface KeplerUUID {
    /*  making  */
    make(version: number, ...params: any[]): KeplerUUID;

    /*  parsing  */
    parse(str: string): KeplerUUID;

    /*  scheming  */
    scheme(type?: string): string;

    /*  formatting (alias)  */
    toString(type?: string): string;

    /*  importing  */
    import(arr: number[]): KeplerUUID;

    /*  exporting  */
    export(): number[];

    /*  byte-wise comparison  */
    compare(other: KeplerUUID): boolean;

    /*  fold 1-4 times  */
    fold(k: number): number[];
}

export interface NeutronUOLConstructor {
  /*  default construction  */
  new(): KeplerUUID;

  /*  parsing construction  */
  new(uuid: string): KeplerUUID;

  /*  making construction  */
  new(version: number): KeplerUUID;
  new(version: number, ns: string, data: string): KeplerUUID;
}

declare var KeplerUUID: NeutronUOLConstructor;
export default KeplerUUID;
